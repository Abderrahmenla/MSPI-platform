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
import { OrdersModule } from '../src/modules/orders/orders.module';
import { PrismaService } from '../src/database/prisma.service';
import { OrdersRepository } from '../src/modules/orders/orders.repository';
import { CartRepository } from '../src/modules/cart/cart.repository';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockUser = {
  id: 1,
  uuid: 'user-uuid-orders-1',
  facebookId: 'fb-orders-123',
  name: 'Bob',
  phone: null,
  email: null,
  langPref: 'AR',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAdmin = {
  id: 10,
  uuid: 'admin-uuid-orders-1',
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

const mockProduct = {
  id: 20,
  uuid: 'prod-uuid-orders-1',
  sku: 'EXT-CO2-2KG',
  slug: 'extincteur-co2-2kg',
  nameAr: 'طفاية',
  nameFr: 'Extincteur',
  nameEn: 'Extinguisher',
  price: 89.9,
  stock: 50,
  threshold: 5,
  active: true,
  category: 'extincteurs',
  createdAt: new Date(),
  updatedAt: new Date(),
  images: [],
};

const mockCartWithItems = {
  id: 200,
  userId: 1,
  updatedAt: new Date(),
  items: [
    {
      id: 1,
      cartId: 200,
      productId: 20,
      qty: 2,
      product: mockProduct,
    },
  ],
};

const mockOrder = {
  id: 50,
  uuid: 'order-uuid-1',
  ref: 'ORD-20260326-ABC12',
  userId: 1,
  status: 'PENDING',
  phone: '+21612345678',
  addressSnapshot: { address: '123 Rue Habib', city: 'Tunis' },
  total: 179.8,
  idempotencyKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  trackingNumber: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [
    {
      id: 1,
      orderId: 50,
      productId: 20,
      qty: 2,
      price: 89.9,
      product: {
        uuid: mockProduct.uuid,
        slug: mockProduct.slug,
        nameAr: mockProduct.nameAr,
        nameFr: mockProduct.nameFr,
        nameEn: mockProduct.nameEn,
        images: [],
      },
    },
  ],
  statusHistory: [
    {
      id: 1,
      orderId: 50,
      fromStatus: null,
      toStatus: 'PENDING',
      adminId: null,
      note: null,
      createdAt: new Date(),
    },
  ],
};

const mockConfirmedOrder = { ...mockOrder, status: 'CONFIRMED' };

// ---------------------------------------------------------------------------
// Repository mocks
// ---------------------------------------------------------------------------

const buildOrdersRepoMock = () => ({
  findByIdempotencyKey: jest.fn(),
  findByUser: jest.fn(),
  findByUuid: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  updateStatus: jest.fn(),
  updateTracking: jest.fn(),
});

const buildCartRepoMock = () => ({
  getCartWithItems: jest.fn(),
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
let ordersRepo: ReturnType<typeof buildOrdersRepoMock>;
let cartRepo: ReturnType<typeof buildCartRepoMock>;
let customerToken: string;
let adminToken: string;

beforeAll(async () => {
  prisma = buildPrismaMock();
  ordersRepo = buildOrdersRepoMock();
  cartRepo = buildCartRepoMock();

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
      ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1000 }]),
      AuthModule,
      OrdersModule,
    ],
  })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .overrideProvider(OrdersRepository)
    .useValue(ordersRepo)
    .overrideProvider(CartRepository)
    .useValue(cartRepo)
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

  // Default: JWT validation always finds the user/admin
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
  prisma.$transaction.mockImplementation((ops: unknown) =>
    Array.isArray(ops) ? Promise.all(ops) : Promise.resolve(null),
  );
  ordersRepo.findByIdempotencyKey.mockResolvedValue(null);
  ordersRepo.findByUser.mockResolvedValue({ orders: [], total: 0 });
  ordersRepo.findByUuid.mockResolvedValue(null);
  ordersRepo.findAll.mockResolvedValue({ orders: [], total: 0 });
  cartRepo.getCartWithItems.mockResolvedValue(null);
});

// ---------------------------------------------------------------------------
// Auth guard
// ---------------------------------------------------------------------------

describe('Orders endpoints — auth guard', () => {
  it('POST /api/v1/customer/orders returns 401 without token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/customer/orders')
      .send({})
      .expect(401);
  });

  it('GET /api/v1/customer/orders returns 401 without token', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/customer/orders')
      .expect(401);
  });

  it('GET /api/v1/admin/orders returns 401 without token', async () => {
    await request(app.getHttpServer()).get('/api/v1/admin/orders').expect(401);
  });
});

// ---------------------------------------------------------------------------
// POST /customer/orders
// ---------------------------------------------------------------------------

describe('POST /api/v1/customer/orders', () => {
  const validBody = {
    phone: '+21612345678',
    address: { address: '123 Rue Habib', city: 'Tunis' },
    idempotencyKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  };

  it('returns 400 when cart is empty', async () => {
    ordersRepo.findByIdempotencyKey.mockResolvedValue(null);
    cartRepo.getCartWithItems.mockResolvedValue({
      ...mockCartWithItems,
      items: [],
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/customer/orders')
      .set('Cookie', [`token=${customerToken}`])
      .send(validBody)
      .expect(400);

    const msg = Array.isArray(res.body.message)
      ? res.body.message.join(' ')
      : res.body.message;
    expect(msg).toMatch(/Cart is empty/);
  });

  it('returns 400 when cart does not exist', async () => {
    ordersRepo.findByIdempotencyKey.mockResolvedValue(null);
    cartRepo.getCartWithItems.mockResolvedValue(null);

    await request(app.getHttpServer())
      .post('/api/v1/customer/orders')
      .set('Cookie', [`token=${customerToken}`])
      .send(validBody)
      .expect(400);
  });

  it('returns 400 for missing required fields', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/customer/orders')
      .set('Cookie', [`token=${customerToken}`])
      .send({ phone: '+21612345678' })
      .expect(400);
  });

  it('returns 400 for invalid idempotencyKey (not a UUID)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/customer/orders')
      .set('Cookie', [`token=${customerToken}`])
      .send({ ...validBody, idempotencyKey: 'not-a-uuid' })
      .expect(400);
  });

  it('creates order and returns 201 with order data', async () => {
    ordersRepo.findByIdempotencyKey.mockResolvedValue(null);
    cartRepo.getCartWithItems.mockResolvedValue(mockCartWithItems);
    prisma.$transaction.mockImplementation(
      async (fn: (tx: unknown) => Promise<unknown>) => {
        if (typeof fn === 'function') {
          const fakeTx = {
            order: {
              create: jest.fn().mockResolvedValue(mockOrder),
            },
            product: {
              update: jest.fn().mockResolvedValue({}),
            },
            cartItem: {
              deleteMany: jest.fn().mockResolvedValue({}),
            },
          };
          return fn(fakeTx);
        }
        return Promise.all(fn as Promise<unknown>[]);
      },
    );

    const res = await request(app.getHttpServer())
      .post('/api/v1/customer/orders')
      .set('Cookie', [`token=${customerToken}`])
      .send(validBody)
      .expect(201);

    expect(res.body.uuid).toBe(mockOrder.uuid);
    expect(res.body.status).toBe('PENDING');
    expect(res.body.ref).toMatch(/^ORD-/);
  });

  it('returns same order when same idempotencyKey used twice (idempotency)', async () => {
    ordersRepo.findByIdempotencyKey.mockResolvedValue(mockOrder);

    const res = await request(app.getHttpServer())
      .post('/api/v1/customer/orders')
      .set('Cookie', [`token=${customerToken}`])
      .send(validBody)
      .expect(201);

    expect(res.body.uuid).toBe(mockOrder.uuid);
    // idempotencyKey lookup was called, no transaction created
    expect(ordersRepo.findByIdempotencyKey).toHaveBeenCalledTimes(1);
  });

  it('returns 422 when a cart item is out of stock', async () => {
    ordersRepo.findByIdempotencyKey.mockResolvedValue(null);
    cartRepo.getCartWithItems.mockResolvedValue({
      ...mockCartWithItems,
      items: [
        {
          ...mockCartWithItems.items[0],
          qty: 100,
          product: { ...mockProduct, stock: 1 },
        },
      ],
    });

    await request(app.getHttpServer())
      .post('/api/v1/customer/orders')
      .set('Cookie', [`token=${customerToken}`])
      .send(validBody)
      .expect(422);
  });
});

// ---------------------------------------------------------------------------
// GET /customer/orders
// ---------------------------------------------------------------------------

describe('GET /api/v1/customer/orders', () => {
  it('returns paginated list of customer orders', async () => {
    ordersRepo.findByUser.mockResolvedValue({ orders: [mockOrder], total: 1 });

    const res = await request(app.getHttpServer())
      .get('/api/v1/customer/orders')
      .set('Cookie', [`token=${customerToken}`])
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toMatchObject({ total: 1, page: 1, limit: 20 });
  });

  it('returns empty list when customer has no orders', async () => {
    ordersRepo.findByUser.mockResolvedValue({ orders: [], total: 0 });

    const res = await request(app.getHttpServer())
      .get('/api/v1/customer/orders')
      .set('Cookie', [`token=${customerToken}`])
      .expect(200);

    expect(res.body.data).toHaveLength(0);
    expect(res.body.meta.total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// GET /customer/orders/:uuid
// ---------------------------------------------------------------------------

describe('GET /api/v1/customer/orders/:uuid', () => {
  it('returns 404 for unknown uuid', async () => {
    ordersRepo.findByUuid.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get('/api/v1/customer/orders/unknown-uuid-xxxx')
      .set('Cookie', [`token=${customerToken}`])
      .expect(404);
  });

  it('returns 404 when order belongs to another user', async () => {
    ordersRepo.findByUuid.mockResolvedValue({
      ...mockOrder,
      userId: BigInt(999),
    });

    await request(app.getHttpServer())
      .get(`/api/v1/customer/orders/${mockOrder.uuid}`)
      .set('Cookie', [`token=${customerToken}`])
      .expect(404);
  });

  it('returns 200 with order data for valid uuid', async () => {
    ordersRepo.findByUuid.mockResolvedValue(mockOrder);

    const res = await request(app.getHttpServer())
      .get(`/api/v1/customer/orders/${mockOrder.uuid}`)
      .set('Cookie', [`token=${customerToken}`])
      .expect(200);

    expect(res.body.data.uuid).toBe(mockOrder.uuid);
    expect(res.body.data.status).toBe('PENDING');
  });
});

// ---------------------------------------------------------------------------
// GET /admin/orders
// ---------------------------------------------------------------------------

describe('GET /api/v1/admin/orders', () => {
  it('returns 401 without admin token', async () => {
    await request(app.getHttpServer()).get('/api/v1/admin/orders').expect(401);
  });

  it('returns paginated list of all orders for admin', async () => {
    ordersRepo.findAll.mockResolvedValue({ orders: [mockOrder], total: 1 });

    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/orders')
      .set('Cookie', [`admin_token=${adminToken}`])
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toMatchObject({ total: 1, page: 1, limit: 20 });
  });

  it('returns empty list when no orders exist', async () => {
    ordersRepo.findAll.mockResolvedValue({ orders: [], total: 0 });

    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/orders')
      .set('Cookie', [`admin_token=${adminToken}`])
      .expect(200);

    expect(res.body.data).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// PATCH /admin/orders/:uuid/status
// ---------------------------------------------------------------------------

describe('PATCH /api/v1/admin/orders/:uuid/status', () => {
  it('returns 401 without admin token', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/orders/${mockOrder.uuid}/status`)
      .send({ status: 'CONFIRMED' })
      .expect(401);
  });

  it('returns 404 for unknown order uuid', async () => {
    ordersRepo.findByUuid.mockResolvedValue(null);

    await request(app.getHttpServer())
      .patch('/api/v1/admin/orders/nonexistent-uuid/status')
      .set('Cookie', [`admin_token=${adminToken}`])
      .send({ status: 'CONFIRMED' })
      .expect(404);
  });

  it('transitions PENDING → CONFIRMED successfully', async () => {
    ordersRepo.findByUuid.mockResolvedValue(mockOrder);
    ordersRepo.updateStatus.mockResolvedValue(mockConfirmedOrder);

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/admin/orders/${mockOrder.uuid}/status`)
      .set('Cookie', [`admin_token=${adminToken}`])
      .send({ status: 'CONFIRMED' })
      .expect(200);

    expect(res.body.data.status).toBe('CONFIRMED');
    expect(ordersRepo.updateStatus).toHaveBeenCalledWith(
      mockOrder.uuid,
      'CONFIRMED',
      expect.anything(),
      'PENDING',
      undefined,
    );
  });

  it('returns 400 for invalid status transition (PENDING → DELIVERED)', async () => {
    ordersRepo.findByUuid.mockResolvedValue(mockOrder);

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/admin/orders/${mockOrder.uuid}/status`)
      .set('Cookie', [`admin_token=${adminToken}`])
      .send({ status: 'DELIVERED' })
      .expect(400);

    expect(res.body.message).toMatch(
      /Cannot transition from PENDING to DELIVERED/,
    );
  });

  it('returns 400 for invalid status transition (DELIVERED → CANCELLED)', async () => {
    ordersRepo.findByUuid.mockResolvedValue({
      ...mockOrder,
      status: 'DELIVERED',
    });

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/admin/orders/${mockOrder.uuid}/status`)
      .set('Cookie', [`admin_token=${adminToken}`])
      .send({ status: 'CANCELLED' })
      .expect(400);

    expect(res.body.message).toMatch(/Cannot transition/);
  });

  it('returns 400 for unknown status value', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/orders/${mockOrder.uuid}/status`)
      .set('Cookie', [`admin_token=${adminToken}`])
      .send({ status: 'INVALID_STATUS' })
      .expect(400);
  });

  it('accepts optional note and trackingNumber in status update', async () => {
    ordersRepo.findByUuid.mockResolvedValue(mockOrder);
    ordersRepo.updateStatus.mockResolvedValue(mockConfirmedOrder);
    ordersRepo.updateTracking.mockResolvedValue({});

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/admin/orders/${mockOrder.uuid}/status`)
      .set('Cookie', [`admin_token=${adminToken}`])
      .send({
        status: 'CONFIRMED',
        note: 'Confirmed by admin',
        trackingNumber: 'TN123456789',
      })
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(ordersRepo.updateTracking).toHaveBeenCalledWith(
      mockOrder.uuid,
      'TN123456789',
    );
  });
});
