import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockUser = {
  uuid: 'user-uuid-1',
  facebookId: 'fb-123',
  name: 'Alice Dupont',
  email: 'alice@example.com',
};

const mockAdmin = {
  id: 42,
  uuid: 'admin-uuid-1',
  email: 'admin@mspi.tn',
  name: 'Super Admin',
  role: 'SUPER_ADMIN',
  active: true,
  passwordHash: '',
  lastLoginAt: null,
  failedAttempts: 0,
  lockedUntil: null,
};

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

const buildPrismaMock = () => ({
  user: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
  admin: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
});

const buildJwtMock = () => ({
  sign: jest.fn().mockReturnValue('signed.jwt.token'),
});

const buildConfigMock = () => ({
  getOrThrow: jest.fn((key: string) => {
    const map: Record<string, string> = {
      JWT_SECRET: 'test-customer-secret',
      JWT_ADMIN_SECRET: 'test-admin-secret',
    };
    if (!(key in map)) throw new Error(`Missing env: ${key}`);
    return map[key];
  }),
  get: jest.fn((key: string) => {
    const map: Record<string, string> = {
      JWT_CUSTOMER_EXPIRY: '24h',
      JWT_ADMIN_EXPIRY: '60m',
    };
    return map[key] ?? undefined;
  }),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof buildPrismaMock>;
  let jwtService: ReturnType<typeof buildJwtMock>;
  let configService: ReturnType<typeof buildConfigMock>;

  beforeEach(async () => {
    prisma = buildPrismaMock();
    jwtService = buildJwtMock();
    configService = buildConfigMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // -------------------------------------------------------------------------
  // validateFacebookUser
  // -------------------------------------------------------------------------

  describe('validateFacebookUser', () => {
    it('creates a new user on first Facebook login', async () => {
      prisma.user.upsert.mockResolvedValue(mockUser);

      const profile = {
        id: 'fb-123',
        displayName: 'Alice Dupont',
        emails: [{ value: 'alice@example.com' }],
      };

      const result = await service.validateFacebookUser(profile);

      expect(prisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { facebookId: 'fb-123' },
          create: expect.objectContaining({
            facebookId: 'fb-123',
            name: 'Alice Dupont',
            email: 'alice@example.com',
          }),
        }),
      );
      expect(result).toEqual(mockUser);
    });

    it('updates the name for a returning user', async () => {
      const updatedUser = { ...mockUser, name: 'Alice Updated' };
      prisma.user.upsert.mockResolvedValue(updatedUser);

      const profile = {
        id: 'fb-123',
        displayName: 'Alice Updated',
        emails: [{ value: 'alice@example.com' }],
      };

      const result = await service.validateFacebookUser(profile);

      expect(prisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({ name: 'Alice Updated' }),
        }),
      );
      expect(result.name).toBe('Alice Updated');
    });

    it('handles missing email from Facebook gracefully', async () => {
      const noEmailUser = { ...mockUser, email: null };
      prisma.user.upsert.mockResolvedValue(noEmailUser);

      const profile = {
        id: 'fb-123',
        displayName: 'Alice Dupont',
        // no emails field
      };

      const result = await service.validateFacebookUser(profile);

      expect(prisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ email: null }),
          update: expect.not.objectContaining({ email: expect.anything() }),
        }),
      );
      expect(result.email).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // generateCustomerJwt
  // -------------------------------------------------------------------------

  describe('generateCustomerJwt', () => {
    it('signs with correct customer payload', () => {
      const token = service.generateCustomerJwt('user-uuid-1');

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'user-uuid-1', type: 'customer' },
        expect.objectContaining({
          secret: 'test-customer-secret',
          expiresIn: '24h',
        }),
      );
      expect(token).toBe('signed.jwt.token');
    });

    it('falls back to 24h expiry when JWT_CUSTOMER_EXPIRY is not set', () => {
      configService.get.mockReturnValue(null as unknown as string);

      service.generateCustomerJwt('user-uuid-1');

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ expiresIn: '24h' }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // generateAdminJwt
  // -------------------------------------------------------------------------

  describe('generateAdminJwt', () => {
    it('signs with correct admin payload including role', () => {
      const token = service.generateAdminJwt('42', 'SUPER_ADMIN');

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: '42', type: 'admin', role: 'SUPER_ADMIN' },
        expect.objectContaining({
          secret: 'test-admin-secret',
          expiresIn: '60m',
        }),
      );
      expect(token).toBe('signed.jwt.token');
    });

    it('falls back to 60m expiry when JWT_ADMIN_EXPIRY is not set', () => {
      configService.get.mockReturnValue(null as unknown as string);

      service.generateAdminJwt('42', 'ADMIN');

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ expiresIn: '60m' }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // validateAdmin
  // -------------------------------------------------------------------------

  describe('validateAdmin', () => {
    let adminWithHash: typeof mockAdmin;

    beforeEach(async () => {
      adminWithHash = {
        ...mockAdmin,
        passwordHash: await bcrypt.hash('correct-password', 10),
      };
    });

    it('returns admin data on valid credentials', async () => {
      prisma.admin.findUnique.mockResolvedValue(adminWithHash);
      prisma.admin.update.mockResolvedValue(adminWithHash);

      const result = await service.validateAdmin(
        'admin@mspi.tn',
        'correct-password',
      );

      expect(result).toEqual({
        uuid: '42',
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
      });
      expect(prisma.admin.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 42 },
          data: expect.objectContaining({
            lastLoginAt: expect.any(Date),
            failedAttempts: 0,
            lockedUntil: null,
          }),
        }),
      );
    });

    it('throws UnauthorizedException for wrong password', async () => {
      prisma.admin.findUnique.mockResolvedValue(adminWithHash);
      prisma.admin.update.mockResolvedValue(adminWithHash);

      await expect(
        service.validateAdmin('admin@mspi.tn', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for non-existent email', async () => {
      prisma.admin.findUnique.mockResolvedValue(null);

      await expect(
        service.validateAdmin('ghost@mspi.tn', 'any-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for inactive account', async () => {
      prisma.admin.findUnique.mockResolvedValue({
        ...adminWithHash,
        active: false,
      });

      await expect(
        service.validateAdmin('admin@mspi.tn', 'correct-password'),
      ).rejects.toThrow(new UnauthorizedException('Account is deactivated'));
    });

    it('throws lockout error when admin.lockedUntil is in the future', async () => {
      prisma.admin.findUnique.mockResolvedValue({
        ...adminWithHash,
        lockedUntil: new Date(Date.now() + 10 * 60 * 1000), // 10 min from now
      });

      await expect(
        service.validateAdmin('admin@mspi.tn', 'correct-password'),
      ).rejects.toThrow(/Account locked/);
    });

    it('allows login when lockedUntil is in the past (expired lockout)', async () => {
      prisma.admin.findUnique.mockResolvedValue({
        ...adminWithHash,
        lockedUntil: new Date(Date.now() - 60_000), // 1 min ago
      });
      prisma.admin.update.mockResolvedValue(adminWithHash);

      const result = await service.validateAdmin(
        'admin@mspi.tn',
        'correct-password',
      );
      expect(result).toMatchObject({ name: 'Super Admin' });
    });

    it('sets lockedUntil when failedAttempts reaches threshold', async () => {
      prisma.admin.findUnique.mockResolvedValue({
        ...adminWithHash,
        failedAttempts: 4, // one more triggers lockout
      });
      prisma.admin.update.mockResolvedValue(adminWithHash);

      await expect(
        service.validateAdmin('admin@mspi.tn', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(prisma.admin.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedAttempts: 5,
            lockedUntil: expect.any(Date),
          }),
        }),
      );
    });

    it('increments failedAttempts without lockout below threshold', async () => {
      prisma.admin.findUnique.mockResolvedValue({
        ...adminWithHash,
        failedAttempts: 2,
      });
      prisma.admin.update.mockResolvedValue(adminWithHash);

      await expect(
        service.validateAdmin('admin@mspi.tn', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(prisma.admin.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedAttempts: 3,
            lockedUntil: null,
          }),
        }),
      );
    });
  });
});
