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
import { DashboardModule } from '../src/modules/dashboard/dashboard.module';
import { CustomersModule } from '../src/modules/customers/customers.module';
import { StaffModule } from '../src/modules/staff/staff.module';
import { PrismaService } from '../src/database/prisma.service';
import { CustomersRepository } from '../src/modules/customers/customers.repository';
import { StaffRepository } from '../src/modules/staff/staff.repository';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockAdmin = {
  id: 10,
  uuid: 'admin-uuid-1',
  email: 'admin@mspi.tn',
  name: 'Super Admin',
  role: 'SUPER_ADMIN',
  active: true,
  passwordHash: 'irrelevant',
  lastLoginAt: null,
  createdAt: new Date(),
  failedAttempts: 0,
  lockedUntil: null,
};

const mockStaffMember = {
  id: 20,
  email: 'viewer@mspi.tn',
  name: 'Viewer Staff',
  role: 'VIEWER',
  active: true,
  lastLoginAt: null,
  createdAt: new Date(),
};

const mockCustomer = {
  id: 1,
  uuid: 'cust-uuid-1',
  facebookId: 'fb-123',
  name: 'Alice',
  email: 'alice@example.com',
  phone: null,
  langPref: 'AR',
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { orders: 2, quotes: 1 },
};

const mockDashboardStats = {
  orders: {
    total: 10,
    pending: 3,
    confirmed: 2,
    shipped: 1,
    delivered: 2,
    cancelled: 2,
    todayCount: 1,
  },
  quotes: {
    total: 5,
    new: 2,
    contacted: 1,
    offerSent: 1,
    won: 1,
    lost: 0,
  },
  customers: { total: 50, newThisMonth: 8 },
  revenue: { total: 350.5, thisMonth: 120.0 },
};

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

const buildPrismaMock = () => ({
  user: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  admin: { findUnique: jest.fn(), update: jest.fn() },
  order: {
    count: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockResolvedValue({ _sum: { total: null } }),
  },
  quote: { count: jest.fn().mockResolvedValue(0) },
  $transaction: jest
    .fn()
    .mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops)),
});

const buildCustomersRepoMock = () => ({
  findAll: jest.fn(),
  findByUuid: jest.fn(),
});

const buildStaffRepoMock = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  updateActive: jest.fn(),
});

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let app: INestApplication;
let prisma: ReturnType<typeof buildPrismaMock>;
let customersRepo: ReturnType<typeof buildCustomersRepoMock>;
let staffRepo: ReturnType<typeof buildStaffRepoMock>;
let adminToken: string;

beforeAll(async () => {
  prisma = buildPrismaMock();
  customersRepo = buildCustomersRepoMock();
  staffRepo = buildStaffRepoMock();

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
      ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1000 }]),
      AuthModule,
      DashboardModule,
      CustomersModule,
      StaffModule,
    ],
  })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .overrideProvider(CustomersRepository)
    .useValue(customersRepo)
    .overrideProvider(StaffRepository)
    .useValue(staffRepo)
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

  adminToken = jwtService.sign(
    { sub: String(mockAdmin.id), role: mockAdmin.role, type: 'admin' },
    { secret: configService.getOrThrow('JWT_ADMIN_SECRET') },
  );

  prisma.admin.findUnique.mockResolvedValue(mockAdmin);
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  jest.clearAllMocks();
  // Restore auth guard defaults between tests
  prisma.admin.findUnique.mockResolvedValue(mockAdmin);
  // Restore sub-model defaults so $transaction(Promise.all) works for dashboard
  prisma.order.count.mockResolvedValue(0);
  prisma.order.aggregate.mockResolvedValue({ _sum: { total: null } });
  prisma.quote.count.mockResolvedValue(0);
  prisma.user.count.mockResolvedValue(0);
  prisma.$transaction.mockImplementation((ops: unknown) =>
    Array.isArray(ops) ? Promise.all(ops) : Promise.resolve(null),
  );
});

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

describe('GET /api/v1/admin/dashboard/stats', () => {
  it('returns 401 without admin token', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/dashboard/stats')
      .expect(401);
  });

  it('returns stats with expected shape when authenticated', async () => {
    // $transaction is used directly by DashboardService — mock returns array
    prisma.$transaction.mockResolvedValue([
      10,
      3,
      2,
      1,
      2,
      2,
      1, // order counts
      5,
      2,
      1,
      1,
      1,
      0, // quote counts
      50,
      8, // customer counts
      { _sum: { total: 350.5 } },
      { _sum: { total: 120.0 } },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/dashboard/stats')
      .set('Cookie', [`admin_token=${adminToken}`])
      .expect(200);

    expect(res.body).toHaveProperty('orders');
    expect(res.body).toHaveProperty('quotes');
    expect(res.body).toHaveProperty('customers');
    expect(res.body).toHaveProperty('revenue');
    expect(res.body.orders.total).toBe(mockDashboardStats.orders.total);
    expect(res.body.customers.total).toBe(mockDashboardStats.customers.total);
    expect(res.body.revenue.total).toBe(mockDashboardStats.revenue.total);
  });
});

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

describe('GET /api/v1/admin/customers', () => {
  it('returns 401 without admin token', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/customers')
      .expect(401);
  });

  it('returns paginated customer list when authenticated', async () => {
    customersRepo.findAll.mockResolvedValue({
      data: [mockCustomer],
      meta: { total: 1, page: 1, limit: 20 },
    });

    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/customers')
      .set('Cookie', [`admin_token=${adminToken}`])
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toMatchObject({ total: 1, page: 1, limit: 20 });
  });

  it('returns empty list when no customers exist', async () => {
    customersRepo.findAll.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 20 },
    });

    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/customers')
      .set('Cookie', [`admin_token=${adminToken}`])
      .expect(200);

    expect(res.body.data).toHaveLength(0);
  });
});

describe('GET /api/v1/admin/customers/:uuid', () => {
  it('returns 401 without admin token', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/customers/some-uuid')
      .expect(401);
  });

  it('returns 404 for unknown uuid', async () => {
    customersRepo.findByUuid.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get('/api/v1/admin/customers/nonexistent-uuid')
      .set('Cookie', [`admin_token=${adminToken}`])
      .expect(404);
  });

  it('returns 200 with customer data for known uuid', async () => {
    customersRepo.findByUuid.mockResolvedValue(mockCustomer);

    const res = await request(app.getHttpServer())
      .get(`/api/v1/admin/customers/${mockCustomer.uuid}`)
      .set('Cookie', [`admin_token=${adminToken}`])
      .expect(200);

    expect(res.body.data.uuid).toBe(mockCustomer.uuid);
    expect(res.body.data.name).toBe(mockCustomer.name);
  });
});

// ---------------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------------

describe('GET /api/v1/admin/staff', () => {
  it('returns 401 without admin token', async () => {
    await request(app.getHttpServer()).get('/api/v1/admin/staff').expect(401);
  });

  it('returns staff list when authenticated', async () => {
    staffRepo.findAll.mockResolvedValue([mockStaffMember]);

    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/staff')
      .set('Cookie', [`admin_token=${adminToken}`])
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].email).toBe(mockStaffMember.email);
  });
});

describe('POST /api/v1/admin/staff', () => {
  const validBody = {
    name: 'New Viewer',
    email: 'newviewer@mspi.tn',
    password: 'Str0ngPass!',
    role: 'VIEWER',
  };

  it('returns 401 without admin token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/admin/staff')
      .send(validBody)
      .expect(401);
  });

  it('returns 400 for missing required fields', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/admin/staff')
      .set('Cookie', [`admin_token=${adminToken}`])
      .send({ name: 'No Email' })
      .expect(400);
  });

  it('returns 409 when email already exists', async () => {
    staffRepo.findByEmail.mockResolvedValue(mockStaffMember);

    await request(app.getHttpServer())
      .post('/api/v1/admin/staff')
      .set('Cookie', [`admin_token=${adminToken}`])
      .send(validBody)
      .expect(409);
  });

  it('creates staff member and returns 201 with staff data', async () => {
    staffRepo.findByEmail.mockResolvedValue(null);
    staffRepo.create.mockResolvedValue({
      ...mockStaffMember,
      email: validBody.email,
      name: validBody.name,
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/admin/staff')
      .set('Cookie', [`admin_token=${adminToken}`])
      .send(validBody)
      .expect(201);

    expect(res.body.data.email).toBe(validBody.email);
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });
});

describe('PATCH /api/v1/admin/staff/:id/deactivate', () => {
  it('returns 401 without admin token', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/staff/${mockStaffMember.id}/deactivate`)
      .expect(401);
  });

  it('returns 404 when staff member not found', async () => {
    staffRepo.findById.mockResolvedValue(null);

    await request(app.getHttpServer())
      .patch('/api/v1/admin/staff/99999/deactivate')
      .set('Cookie', [`admin_token=${adminToken}`])
      .expect(404);
  });

  it('deactivates staff member and returns updated data', async () => {
    staffRepo.findById.mockResolvedValue(mockStaffMember);
    staffRepo.updateActive.mockResolvedValue({
      ...mockStaffMember,
      active: false,
    });

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/admin/staff/${mockStaffMember.id}/deactivate`)
      .set('Cookie', [`admin_token=${adminToken}`])
      .expect(200);

    expect(res.body.data.active).toBe(false);
  });
});
