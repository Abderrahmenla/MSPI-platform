// Set env vars before any NestJS modules are loaded
process.env.FACEBOOK_APP_ID = 'test-app-id';
process.env.FACEBOOK_APP_SECRET = 'test-app-secret';
process.env.FACEBOOK_CALLBACK_URL =
  'http://localhost:4000/api/v1/auth/facebook/callback';
process.env.JWT_SECRET = 'e2e-test-customer-secret';
process.env.JWT_ADMIN_SECRET = 'e2e-test-admin-secret';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';

import { AuthModule } from '../src/modules/auth/auth.module';
import { QuotesModule } from '../src/modules/quotes/quotes.module';
import { PrismaService } from '../src/database/prisma.service';
import { QuotesRepository } from '../src/modules/quotes/quotes.repository';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockUser = {
  id: 2,
  uuid: 'user-uuid-quotes-1',
  facebookId: 'fb-quotes-456',
  name: 'Carol',
  phone: null,
  email: null,
  langPref: 'FR',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAdmin = {
  id: 20,
  uuid: 'admin-uuid-quotes-1',
  email: 'admin@mspi.tn',
  name: 'Admin',
  role: 'SUPER_ADMIN',
  active: true,
  passwordHash: 'irrelevant',
  lastLoginAt: null,
  createdAt: new Date(),
  failedAttempts: 0,
  lockedUntil: null,
};

const mockQuote = {
  id: 100,
  uuid: 'quote-uuid-1',
  ref: 'DEV-20260326-XY123',
  userId: 2,
  status: 'NEW',
  serviceType: 'Installation extincteurs',
  propertyType: 'Commercial',
  surfaceOrRooms: '200m2',
  hasElectrical: true,
  freeText: 'Besoin urgent',
  phone: '+21698765432',
  city: 'Sfax',
  createdAt: new Date(),
  updatedAt: new Date(),
  statusHistory: [
    {
      id: 1,
      quoteId: 100,
      fromStatus: null,
      toStatus: 'NEW',
      adminId: null,
      note: null,
      createdAt: new Date(),
    },
  ],
};

const mockContactedQuote = { ...mockQuote, status: 'CONTACTED' };

// ---------------------------------------------------------------------------
// Repository mock
// ---------------------------------------------------------------------------

const buildQuotesRepoMock = () => ({
  create: jest.fn(),
  findByUser: jest.fn(),
  findByUuid: jest.fn(),
  findAll: jest.fn(),
  updateStatus: jest.fn(),
});

const buildPrismaMock = () => ({
  user: { findUnique: jest.fn(), upsert: jest.fn() },
  admin: { findUnique: jest.fn(), update: jest.fn() },
  $transaction: jest
    .fn()
    .mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops)),
});

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let app: INestApplication;
let prisma: ReturnType<typeof buildPrismaMock>;
let quotesRepo: ReturnType<typeof buildQuotesRepoMock>;
let customerToken: string;
let adminToken: string;

beforeAll(async () => {
  prisma = buildPrismaMock();
  quotesRepo = buildQuotesRepoMock();

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
      ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1000 }]),
      AuthModule,
      QuotesModule,
    ],
  })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .overrideProvider(QuotesRepository)
    .useValue(quotesRepo)
    .compile();

  app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  const jwtService = moduleRef.get(JwtService);
  const configService = moduleRef.get(ConfigService);

  customerToken = jwtService.sign(
    { sub: mockUser.uuid, type: 'customer' },
    { secret: configService.getOrThrow('JWT_SECRET') },
  );

  adminToken = jwtService.sign(
    { sub: String(mockAdmin.id), role: mockAdmin.role, type: 'admin' },
    { secret: configService.getOrThrow('JWT_ADMIN_SECRET') },
  );

  prisma.user.findUnique.mockResolvedValue(mockUser);
  prisma.admin.findUnique.mockResolvedValue(mockAdmin);
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  jest.clearAllMocks();
  // Restore defaults so auth guards always resolve successfully between tests
  prisma.user.findUnique.mockResolvedValue(mockUser);
  prisma.admin.findUnique.mockResolvedValue(mockAdmin);
  quotesRepo.findByUser.mockResolvedValue({ quotes: [], total: 0 });
  quotesRepo.findByUuid.mockResolvedValue(null);
  quotesRepo.findAll.mockResolvedValue({ quotes: [], total: 0 });
});

// ---------------------------------------------------------------------------
// Auth guard
// ---------------------------------------------------------------------------

describe('Quotes endpoints — auth guard', () => {
  it('POST /api/v1/customer/quotes returns 401 without token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/customer/quotes')
      .send({})
      .expect(401);
  });

  it('GET /api/v1/customer/quotes returns 401 without token', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/customer/quotes')
      .expect(401);
  });

  it('GET /api/v1/admin/quotes returns 401 without token', async () => {
    await request(app.getHttpServer()).get('/api/v1/admin/quotes').expect(401);
  });
});

// ---------------------------------------------------------------------------
// POST /customer/quotes
// ---------------------------------------------------------------------------

describe('POST /api/v1/customer/quotes', () => {
  const validBody = {
    serviceType: 'Installation extincteurs',
    propertyType: 'Commercial',
    surfaceOrRooms: '200m2',
    hasElectrical: true,
    freeText: 'Besoin urgent',
    phone: '+21698765432',
    city: 'Sfax',
  };

  it('returns 400 for missing required fields', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/customer/quotes')
      .set('Cookie', [`token=${customerToken}`])
      .send({ serviceType: 'Installation extincteurs' })
      .expect(400);
  });

  it('returns 400 for missing hasElectrical field', async () => {
    const { hasElectrical: _omitted, ...bodyWithout } = validBody;
    await request(app.getHttpServer())
      .post('/api/v1/customer/quotes')
      .set('Cookie', [`token=${customerToken}`])
      .send(bodyWithout)
      .expect(400);
  });

  it('returns 400 for non-boolean hasElectrical', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/customer/quotes')
      .set('Cookie', [`token=${customerToken}`])
      .send({ ...validBody, hasElectrical: 'yes' })
      .expect(400);
  });

  it('creates quote and returns 201 with quote data', async () => {
    quotesRepo.create.mockResolvedValue(mockQuote);

    const res = await request(app.getHttpServer())
      .post('/api/v1/customer/quotes')
      .set('Cookie', [`token=${customerToken}`])
      .send(validBody)
      .expect(201);

    expect(res.body.data.uuid).toBe(mockQuote.uuid);
    expect(res.body.data.status).toBe('NEW');
    expect(res.body.data.ref).toMatch(/^DEV-/);
    expect(quotesRepo.create).toHaveBeenCalledTimes(1);
  });

  it('creates quote without optional fields', async () => {
    const minimalBody = {
      serviceType: 'Audit sécurité',
      propertyType: 'Résidentiel',
      hasElectrical: false,
      phone: '+21612345678',
      city: 'Tunis',
    };
    quotesRepo.create.mockResolvedValue({
      ...mockQuote,
      serviceType: 'Audit sécurité',
      propertyType: 'Résidentiel',
      hasElectrical: false,
      surfaceOrRooms: null,
      freeText: null,
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/customer/quotes')
      .set('Cookie', [`token=${customerToken}`])
      .send(minimalBody)
      .expect(201);

    expect(res.body.data).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// GET /customer/quotes
// ---------------------------------------------------------------------------

describe('GET /api/v1/customer/quotes', () => {
  it('returns paginated list of customer quotes', async () => {
    quotesRepo.findByUser.mockResolvedValue({ quotes: [mockQuote], total: 1 });

    const res = await request(app.getHttpServer())
      .get('/api/v1/customer/quotes')
      .set('Cookie', [`token=${customerToken}`])
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toMatchObject({ total: 1, page: 1, limit: 20 });
  });

  it('returns empty list when customer has no quotes', async () => {
    quotesRepo.findByUser.mockResolvedValue({ quotes: [], total: 0 });

    const res = await request(app.getHttpServer())
      .get('/api/v1/customer/quotes')
      .set('Cookie', [`token=${customerToken}`])
      .expect(200);

    expect(res.body.data).toHaveLength(0);
    expect(res.body.meta.total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// GET /customer/quotes/:uuid
// ---------------------------------------------------------------------------

describe('GET /api/v1/customer/quotes/:uuid', () => {
  it('returns 404 for unknown uuid', async () => {
    quotesRepo.findByUuid.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get('/api/v1/customer/quotes/unknown-uuid-xxxx')
      .set('Cookie', [`token=${customerToken}`])
      .expect(404);
  });

  it('returns 404 when quote belongs to another user', async () => {
    quotesRepo.findByUuid.mockResolvedValue({
      ...mockQuote,
      userId: BigInt(999),
    });

    await request(app.getHttpServer())
      .get(`/api/v1/customer/quotes/${mockQuote.uuid}`)
      .set('Cookie', [`token=${customerToken}`])
      .expect(404);
  });

  it('returns 200 with quote data for valid uuid', async () => {
    quotesRepo.findByUuid.mockResolvedValue(mockQuote);

    const res = await request(app.getHttpServer())
      .get(`/api/v1/customer/quotes/${mockQuote.uuid}`)
      .set('Cookie', [`token=${customerToken}`])
      .expect(200);

    expect(res.body.data.uuid).toBe(mockQuote.uuid);
    expect(res.body.data.status).toBe('NEW');
  });
});

// ---------------------------------------------------------------------------
// GET /admin/quotes
// ---------------------------------------------------------------------------

describe('GET /api/v1/admin/quotes', () => {
  it('returns 401 without admin token', async () => {
    await request(app.getHttpServer()).get('/api/v1/admin/quotes').expect(401);
  });

  it('returns paginated list of all quotes for admin', async () => {
    quotesRepo.findAll.mockResolvedValue({ quotes: [mockQuote], total: 1 });

    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/quotes')
      .set('Cookie', [`admin_token=${adminToken}`])
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toMatchObject({ total: 1, page: 1, limit: 20 });
  });

  it('returns empty list when no quotes exist', async () => {
    quotesRepo.findAll.mockResolvedValue({ quotes: [], total: 0 });

    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/quotes')
      .set('Cookie', [`admin_token=${adminToken}`])
      .expect(200);

    expect(res.body.data).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// PATCH /admin/quotes/:uuid/status
// ---------------------------------------------------------------------------

describe('PATCH /api/v1/admin/quotes/:uuid/status', () => {
  it('returns 401 without admin token', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/quotes/${mockQuote.uuid}/status`)
      .send({ status: 'CONTACTED' })
      .expect(401);
  });

  it('returns 404 for unknown quote uuid', async () => {
    quotesRepo.findByUuid.mockResolvedValue(null);

    await request(app.getHttpServer())
      .patch('/api/v1/admin/quotes/nonexistent-uuid/status')
      .set('Cookie', [`admin_token=${adminToken}`])
      .send({ status: 'CONTACTED' })
      .expect(404);
  });

  it('transitions NEW → CONTACTED successfully', async () => {
    quotesRepo.findByUuid.mockResolvedValue(mockQuote);
    quotesRepo.updateStatus.mockResolvedValue(mockContactedQuote);

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/admin/quotes/${mockQuote.uuid}/status`)
      .set('Cookie', [`admin_token=${adminToken}`])
      .send({ status: 'CONTACTED' })
      .expect(200);

    expect(res.body.data.status).toBe('CONTACTED');
    expect(quotesRepo.updateStatus).toHaveBeenCalledWith(
      mockQuote.uuid,
      'CONTACTED',
      expect.anything(),
      'NEW',
      undefined,
    );
  });

  it('transitions NEW → LOST successfully', async () => {
    quotesRepo.findByUuid.mockResolvedValue(mockQuote);
    quotesRepo.updateStatus.mockResolvedValue({ ...mockQuote, status: 'LOST' });

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/admin/quotes/${mockQuote.uuid}/status`)
      .set('Cookie', [`admin_token=${adminToken}`])
      .send({ status: 'LOST', note: 'Customer unresponsive' })
      .expect(200);

    expect(res.body.data.status).toBe('LOST');
  });

  it('returns 400 for invalid status transition (NEW → WON)', async () => {
    quotesRepo.findByUuid.mockResolvedValue(mockQuote);

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/admin/quotes/${mockQuote.uuid}/status`)
      .set('Cookie', [`admin_token=${adminToken}`])
      .send({ status: 'WON' })
      .expect(400);

    expect(res.body.message).toMatch(/Cannot transition from NEW to WON/);
  });

  it('returns 400 for invalid status transition (WON → LOST)', async () => {
    quotesRepo.findByUuid.mockResolvedValue({ ...mockQuote, status: 'WON' });

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/admin/quotes/${mockQuote.uuid}/status`)
      .set('Cookie', [`admin_token=${adminToken}`])
      .send({ status: 'LOST' })
      .expect(400);

    expect(res.body.message).toMatch(/Cannot transition/);
  });

  it('returns 400 for unknown status value', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/quotes/${mockQuote.uuid}/status`)
      .set('Cookie', [`admin_token=${adminToken}`])
      .send({ status: 'INVALID_STATUS' })
      .expect(400);
  });

  it('accepts optional note in status update', async () => {
    quotesRepo.findByUuid.mockResolvedValue(mockQuote);
    quotesRepo.updateStatus.mockResolvedValue(mockContactedQuote);

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/admin/quotes/${mockQuote.uuid}/status`)
      .set('Cookie', [`admin_token=${adminToken}`])
      .send({ status: 'CONTACTED', note: 'Called customer, interested' })
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(quotesRepo.updateStatus).toHaveBeenCalledWith(
      mockQuote.uuid,
      'CONTACTED',
      expect.anything(),
      'NEW',
      'Called customer, interested',
    );
  });
});
