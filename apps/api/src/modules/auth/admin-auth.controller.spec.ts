import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { AdminAuthController } from './admin-auth.controller';
import { AuthService } from './auth.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockAdmin = {
  uuid: 'admin-uuid-1',
  name: 'Super Admin',
  role: 'SUPER_ADMIN',
};

const buildAuthServiceMock = () => ({
  validateAdmin: jest.fn(),
  generateAdminJwt: jest.fn().mockReturnValue('signed.admin.token'),
});

const buildConfigMock = (nodeEnv = 'test') => ({
  get: jest.fn((key: string) => (key === 'NODE_ENV' ? nodeEnv : undefined)),
});

const buildResMock = () =>
  ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  }) as unknown as Response;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AdminAuthController', () => {
  let controller: AdminAuthController;
  let authService: ReturnType<typeof buildAuthServiceMock>;

  const buildModule = async (nodeEnv = 'test'): Promise<TestingModule> => {
    authService = buildAuthServiceMock();
    return Test.createTestingModule({
      controllers: [AdminAuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: buildConfigMock(nodeEnv) },
      ],
    }).compile();
  };

  beforeEach(async () => {
    const module = await buildModule();
    controller = module.get<AdminAuthController>(AdminAuthController);
  });

  // -------------------------------------------------------------------------
  // login
  // -------------------------------------------------------------------------

  describe('login', () => {
    it('returns name and role on successful login', async () => {
      authService.validateAdmin.mockResolvedValue(mockAdmin);
      const res = buildResMock();

      const result = await controller.login(
        { email: 'admin@mspi.tn', password: 'correct-password' },
        res,
      );

      expect(result).toEqual({ name: 'Super Admin', role: 'SUPER_ADMIN' });
    });

    it('calls generateAdminJwt with admin uuid and role', async () => {
      authService.validateAdmin.mockResolvedValue(mockAdmin);
      const res = buildResMock();

      await controller.login(
        { email: 'admin@mspi.tn', password: 'correct-password' },
        res,
      );

      expect(authService.generateAdminJwt).toHaveBeenCalledWith(
        'admin-uuid-1',
        'SUPER_ADMIN',
      );
    });

    it('sets httpOnly admin_token cookie with correct options', async () => {
      authService.validateAdmin.mockResolvedValue(mockAdmin);
      const res = buildResMock();

      await controller.login(
        { email: 'admin@mspi.tn', password: 'correct-password' },
        res,
      );

      expect(res.cookie).toHaveBeenCalledWith(
        'admin_token',
        'signed.admin.token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 1000,
          path: '/',
        }),
      );
    });

    it('sets secure=false in local environment', async () => {
      const module = await buildModule('local');
      const localController =
        module.get<AdminAuthController>(AdminAuthController);
      authService.validateAdmin.mockResolvedValue(mockAdmin);
      const res = buildResMock();

      await localController.login(
        { email: 'admin@mspi.tn', password: 'correct-password' },
        res,
      );

      expect(res.cookie).toHaveBeenCalledWith(
        'admin_token',
        expect.any(String),
        expect.objectContaining({ secure: false }),
      );
    });

    it('sets secure=true in production environment', async () => {
      const module = await buildModule('production');
      const prodController =
        module.get<AdminAuthController>(AdminAuthController);
      authService.validateAdmin.mockResolvedValue(mockAdmin);
      const res = buildResMock();

      await prodController.login(
        { email: 'admin@mspi.tn', password: 'correct-password' },
        res,
      );

      expect(res.cookie).toHaveBeenCalledWith(
        'admin_token',
        expect.any(String),
        expect.objectContaining({ secure: true }),
      );
    });

    it('propagates UnauthorizedException from validateAdmin', async () => {
      authService.validateAdmin.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );
      const res = buildResMock();

      await expect(
        controller.login({ email: 'admin@mspi.tn', password: 'wrong' }, res),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // -------------------------------------------------------------------------
  // logout
  // -------------------------------------------------------------------------

  describe('logout', () => {
    it('clears admin_token cookie and returns logout message', () => {
      const res = buildResMock();

      const result = controller.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith(
        'admin_token',
        expect.objectContaining({
          path: '/',
          httpOnly: true,
          sameSite: 'strict',
        }),
      );
      expect(result).toEqual({ message: 'Logged out' });
    });
  });
});
