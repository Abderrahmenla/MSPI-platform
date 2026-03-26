import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AdminJwtStrategy } from './admin-jwt.strategy';
import { PrismaService } from '../../../database/prisma.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockAdmin = {
  id: BigInt(42),
  email: 'admin@mspi.tn',
  name: 'Super Admin',
  role: 'SUPER_ADMIN',
  active: true,
  passwordHash: 'hashed',
  lastLoginAt: null,
  failedAttempts: 0,
  lockedUntil: null,
  createdAt: new Date(),
};

const buildPrismaMock = () => ({
  admin: { findUnique: jest.fn() },
});

const buildConfigMock = () => ({
  getOrThrow: jest.fn().mockReturnValue('test-admin-secret'),
  get: jest.fn(),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AdminJwtStrategy', () => {
  let strategy: AdminJwtStrategy;
  let prisma: ReturnType<typeof buildPrismaMock>;

  beforeEach(() => {
    prisma = buildPrismaMock();
    strategy = new AdminJwtStrategy(
      buildConfigMock() as unknown as ConfigService,
      prisma as unknown as PrismaService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the admin for a valid admin token', async () => {
    prisma.admin.findUnique.mockResolvedValue(mockAdmin);

    const result = await strategy.validate({
      sub: '42',
      type: 'admin',
      role: 'SUPER_ADMIN',
    });

    expect(result).toEqual(mockAdmin);
    expect(prisma.admin.findUnique).toHaveBeenCalledWith({
      where: { id: BigInt(42) },
    });
  });

  it('throws UnauthorizedException for wrong token type', async () => {
    await expect(
      strategy.validate({ sub: '42', type: 'customer', role: 'SUPER_ADMIN' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid token type'));
  });

  it('throws UnauthorizedException when sub cannot be parsed as BigInt', async () => {
    await expect(
      strategy.validate({
        sub: 'not-a-number',
        type: 'admin',
        role: 'SUPER_ADMIN',
      }),
    ).rejects.toThrow(new UnauthorizedException('Invalid token'));
  });

  it('throws UnauthorizedException when admin is not in DB', async () => {
    prisma.admin.findUnique.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: '99', type: 'admin', role: 'SUPER_ADMIN' }),
    ).rejects.toThrow(new UnauthorizedException('Admin not found'));
  });

  it('throws UnauthorizedException when admin account is deactivated', async () => {
    prisma.admin.findUnique.mockResolvedValue({ ...mockAdmin, active: false });

    await expect(
      strategy.validate({ sub: '42', type: 'admin', role: 'SUPER_ADMIN' }),
    ).rejects.toThrow(new UnauthorizedException('Account is deactivated'));
  });

  it('returns cached admin without hitting DB on repeated calls', async () => {
    prisma.admin.findUnique.mockResolvedValue(mockAdmin);

    // First call hits DB
    await strategy.validate({ sub: '42', type: 'admin', role: 'SUPER_ADMIN' });
    // Second call served from cache
    await strategy.validate({ sub: '42', type: 'admin', role: 'SUPER_ADMIN' });

    expect(prisma.admin.findUnique).toHaveBeenCalledTimes(1);
  });

  it('hits DB again after cache TTL expires', async () => {
    prisma.admin.findUnique.mockResolvedValue(mockAdmin);
    jest.useFakeTimers();

    await strategy.validate({ sub: '42', type: 'admin', role: 'SUPER_ADMIN' });
    jest.advanceTimersByTime(20_000); // past 15s TTL
    await strategy.validate({ sub: '42', type: 'admin', role: 'SUPER_ADMIN' });

    expect(prisma.admin.findUnique).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });
});
