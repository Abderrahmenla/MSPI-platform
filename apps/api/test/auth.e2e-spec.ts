import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import * as bcrypt from 'bcrypt';

import { AuthModule } from '../src/modules/auth/auth.module';
import { PrismaService } from '../src/database/prisma.service';
import { FacebookAuthGuard } from '../src/modules/auth/guards/facebook-auth.guard';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const buildPrismaMock = () => ({
  user: { upsert: jest.fn(), findUnique: jest.fn() },
  admin: { findUnique: jest.fn(), update: jest.fn() },
});

const CONFIG_VALUES: Record<string, string | number> = {
  JWT_SECRET: 'e2e-test-customer-secret',
  JWT_ADMIN_SECRET: 'e2e-test-admin-secret',
  JWT_CUSTOMER_EXPIRY: '24h',
  JWT_ADMIN_EXPIRY: '60m',
  WEB_URL: 'http://localhost:3000',
  NODE_ENV: 'test',
  FACEBOOK_APP_ID: 'test-app-id',
  FACEBOOK_APP_SECRET: 'test-app-secret',
  FACEBOOK_CALLBACK_URL: 'http://localhost:4000/api/v1/auth/facebook/callback',
  PORT: 4000,
};

const mockConfigService = {
  get: jest.fn(
    (key: string, defaultVal?: unknown) => CONFIG_VALUES[key] ?? defaultVal,
  ),
  getOrThrow: jest.fn((key: string) => {
    if (!(key in CONFIG_VALUES)) throw new Error(`Missing env: ${key}`);
    return CONFIG_VALUES[key];
  }),
};

// Bypasses Passport Facebook flow by injecting a mock authenticated user.
class MockFacebookAuthGuard {
  canActivate(context: {
    switchToHttp: () => { getRequest: () => { user: { uuid: string } } };
  }) {
    context.switchToHttp().getRequest().user = { uuid: 'test-user-uuid' };
    return true;
  }
}

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

describe('Auth endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof buildPrismaMock>;

  beforeAll(async () => {
    prisma = buildPrismaMock();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        // Register ConfigService token globally so overrideProvider can replace it.
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        AuthModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideGuard(FacebookAuthGuard)
      .useClass(MockFacebookAuthGuard)
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Restore default mock implementations after each test
    mockConfigService.get.mockImplementation(
      (key: string, defaultVal?: unknown) => CONFIG_VALUES[key] ?? defaultVal,
    );
    mockConfigService.getOrThrow.mockImplementation((key: string) => {
      if (!(key in CONFIG_VALUES)) throw new Error(`Missing env: ${key}`);
      return CONFIG_VALUES[key];
    });
  });

  // -------------------------------------------------------------------------
  // Admin login
  // -------------------------------------------------------------------------

  describe('POST /api/v1/admin/auth/login', () => {
    it('sets admin_token cookie and returns name/role on valid credentials', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      prisma.admin.findUnique.mockResolvedValue({
        id: BigInt(1),
        email: 'admin@mspi.tn',
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        active: true,
        passwordHash: hash,
        lastLoginAt: null,
        createdAt: new Date(),
        failedAttempts: 0,
        lockedUntil: null,
      });
      prisma.admin.update.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/auth/login')
        .send({ email: 'admin@mspi.tn', password: 'correct-password' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ name: 'Super Admin', role: 'SUPER_ADMIN' });

      const cookies = ([] as string[]).concat(res.headers['set-cookie'] ?? []);
      const adminCookie = cookies.find((c) => c.startsWith('admin_token='));
      expect(adminCookie).toBeDefined();
      expect(adminCookie).toContain('HttpOnly');
      expect(adminCookie).toContain('SameSite=Strict');
    });

    it('returns 401 for wrong password', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      prisma.admin.findUnique.mockResolvedValue({
        id: BigInt(1),
        email: 'admin@mspi.tn',
        active: true,
        passwordHash: hash,
        failedAttempts: 0,
        lockedUntil: null,
      });
      prisma.admin.update.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/auth/login')
        .send({ email: 'admin@mspi.tn', password: 'wrong-password' });

      expect(res.status).toBe(401);
    });

    it('returns 401 and lockout message for locked account', async () => {
      prisma.admin.findUnique.mockResolvedValue({
        id: BigInt(1),
        email: 'admin@mspi.tn',
        active: true,
        passwordHash: 'irrelevant',
        failedAttempts: 5,
        lockedUntil: new Date(Date.now() + 5 * 60 * 1000),
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/auth/login')
        // password meets @MinLength(8); lockout triggers before bcrypt
        .send({ email: 'admin@mspi.tn', password: 'any-password' });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Account locked/);
    });
  });

  // -------------------------------------------------------------------------
  // Admin logout
  // -------------------------------------------------------------------------

  describe('POST /api/v1/admin/auth/logout', () => {
    it('clears admin_token cookie', async () => {
      const res = await request(app.getHttpServer()).post(
        '/api/v1/admin/auth/logout',
      );

      expect(res.status).toBe(201);
      const cookies = ([] as string[]).concat(res.headers['set-cookie'] ?? []);
      const cleared = cookies.find((c) => c.includes('admin_token'));
      expect(cleared).toBeDefined();
      // Express clearCookie sets Expires to epoch
      expect(cleared).toMatch(/Expires=Thu, 01 Jan 1970/);
    });
  });

  // -------------------------------------------------------------------------
  // Facebook OAuth callback
  // -------------------------------------------------------------------------

  describe('GET /api/v1/auth/facebook/callback', () => {
    it('sets token cookie and redirects to webUrl when no state provided', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/v1/auth/facebook/callback',
      );

      expect(res.status).toBe(302);
      expect(res.headers['location']).toBe('http://localhost:3000');

      const cookies = ([] as string[]).concat(res.headers['set-cookie'] ?? []);
      const tokenCookie = cookies.find((c) => c.startsWith('token='));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toContain('HttpOnly');
    });

    it('appends relative state path to webUrl', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/v1/auth/facebook/callback?state=/products/fire-extinguisher',
      );

      expect(res.status).toBe(302);
      expect(res.headers['location']).toBe(
        'http://localhost:3000/products/fire-extinguisher',
      );
    });

    it('blocks absolute external URL in state (open redirect prevented)', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/v1/auth/facebook/callback?state=https://evil.com/steal',
      );

      expect(res.status).toBe(302);
      expect(res.headers['location']).toBe('http://localhost:3000');
    });

    it('blocks protocol-relative URL in state (// bypass prevented)', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/v1/auth/facebook/callback?state=//evil.com',
      );

      expect(res.status).toBe(302);
      expect(res.headers['location']).toBe('http://localhost:3000');
    });
  });

  // -------------------------------------------------------------------------
  // Customer logout
  // -------------------------------------------------------------------------

  describe('POST /api/v1/auth/facebook/logout', () => {
    it('clears token cookie', async () => {
      const res = await request(app.getHttpServer()).post(
        '/api/v1/auth/facebook/logout',
      );

      expect(res.status).toBe(201);
      const cookies = ([] as string[]).concat(res.headers['set-cookie'] ?? []);
      const cleared = cookies.find((c) => c.includes('token='));
      expect(cleared).toBeDefined();
      expect(cleared).toMatch(/Expires=Thu, 01 Jan 1970/);
    });
  });
});
