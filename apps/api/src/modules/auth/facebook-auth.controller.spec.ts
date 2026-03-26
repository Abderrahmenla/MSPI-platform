import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { FacebookAuthController } from './facebook-auth.controller';
import { AuthService } from './auth.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const buildAuthServiceMock = () => ({
  generateCustomerJwt: jest.fn().mockReturnValue('signed.customer.token'),
});

const buildConfigMock = (
  webUrl = 'http://localhost:3000',
  nodeEnv = 'test',
) => ({
  get: jest.fn((key: string, defaultVal?: unknown) => {
    if (key === 'WEB_URL') return webUrl;
    if (key === 'NODE_ENV') return nodeEnv;
    return defaultVal;
  }),
});

const buildResMock = () =>
  ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    redirect: jest.fn(),
  }) as unknown as Response;

const buildReq = (uuid = 'user-uuid-1') => ({ user: { uuid } });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FacebookAuthController', () => {
  let controller: FacebookAuthController;
  let authService: ReturnType<typeof buildAuthServiceMock>;

  const buildModule = async (
    webUrl = 'http://localhost:3000',
    nodeEnv = 'test',
  ): Promise<TestingModule> => {
    authService = buildAuthServiceMock();
    return Test.createTestingModule({
      controllers: [FacebookAuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: buildConfigMock(webUrl, nodeEnv) },
      ],
    }).compile();
  };

  beforeEach(async () => {
    const module = await buildModule();
    controller = module.get<FacebookAuthController>(FacebookAuthController);
  });

  // -------------------------------------------------------------------------
  // facebookCallback
  // -------------------------------------------------------------------------

  describe('facebookCallback', () => {
    it('sets httpOnly token cookie with correct options', () => {
      const res = buildResMock();

      controller.facebookCallback(buildReq() as never, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'signed.customer.token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000,
          path: '/',
        }),
      );
    });

    it('redirects to webUrl when no returnUrl is provided', () => {
      const res = buildResMock();

      controller.facebookCallback(buildReq() as never, res);

      expect(res.redirect).toHaveBeenCalledWith('http://localhost:3000');
    });

    it('redirects to webUrl + safe relative returnUrl', () => {
      const res = buildResMock();

      controller.facebookCallback(buildReq() as never, res, '/panier');

      expect(res.redirect).toHaveBeenCalledWith('http://localhost:3000/panier');
    });

    it('ignores returnUrl starting with // (protocol-relative attack)', () => {
      const res = buildResMock();

      controller.facebookCallback(buildReq() as never, res, '//evil.com/steal');

      expect(res.redirect).toHaveBeenCalledWith('http://localhost:3000');
    });

    it('ignores absolute https returnUrl (open redirect prevention)', () => {
      const res = buildResMock();

      controller.facebookCallback(buildReq() as never, res, 'https://evil.com');

      expect(res.redirect).toHaveBeenCalledWith('http://localhost:3000');
    });

    it('ignores absolute http returnUrl', () => {
      const res = buildResMock();

      controller.facebookCallback(
        buildReq() as never,
        res,
        'http://evil.com/path',
      );

      expect(res.redirect).toHaveBeenCalledWith('http://localhost:3000');
    });

    it('sets secure=false in local environment', async () => {
      const module = await buildModule('http://localhost:3000', 'local');
      const localController = module.get<FacebookAuthController>(
        FacebookAuthController,
      );
      const res = buildResMock();

      localController.facebookCallback(buildReq() as never, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        expect.any(String),
        expect.objectContaining({ secure: false }),
      );
    });

    it('sets secure=true in production environment', async () => {
      const module = await buildModule('https://mspi.tn', 'production');
      const prodController = module.get<FacebookAuthController>(
        FacebookAuthController,
      );
      const res = buildResMock();

      prodController.facebookCallback(buildReq() as never, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        expect.any(String),
        expect.objectContaining({ secure: true }),
      );
    });

    it('calls generateCustomerJwt with user uuid', () => {
      const res = buildResMock();

      controller.facebookCallback(buildReq('abc-uuid') as never, res);

      expect(authService.generateCustomerJwt).toHaveBeenCalledWith('abc-uuid');
    });
  });

  // -------------------------------------------------------------------------
  // logout
  // -------------------------------------------------------------------------

  describe('logout', () => {
    it('clears token cookie and returns logout message', () => {
      const res = buildResMock();

      const result = controller.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith(
        'token',
        expect.objectContaining({ path: '/', httpOnly: true, sameSite: 'lax' }),
      );
      expect(result).toEqual({ message: 'Logged out' });
    });
  });
});
