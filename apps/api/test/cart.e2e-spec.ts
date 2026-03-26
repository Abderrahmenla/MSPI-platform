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
import { CartModule } from '../src/modules/cart/cart.module';
import { ProductsModule } from '../src/modules/products/products.module';
import { PrismaService } from '../src/database/prisma.service';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockUser = {
  id: 1,
  uuid: 'user-uuid-1',
  facebookId: 'fb-123',
  name: 'Alice',
  phone: null,
  email: null,
  langPref: 'AR',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProduct = {
  id: 10,
  uuid: 'prod-uuid-1',
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

const mockCart = {
  id: 100,
  userId: 1,
  updatedAt: new Date(),
  items: [],
};

// ---------------------------------------------------------------------------
// Prisma mock
// ---------------------------------------------------------------------------

const buildPrismaMock = () => ({
  user: { findUnique: jest.fn(), upsert: jest.fn() },
  product: { findUnique: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  cart: { findUnique: jest.fn(), create: jest.fn() },
  cartItem: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
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
let customerToken: string;

beforeAll(async () => {
  prisma = buildPrismaMock();

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
      ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1000 }]),
      AuthModule,
      ProductsModule,
      CartModule,
    ],
  })
    .overrideProvider(PrismaService)
    .useValue(prisma)
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

  // Generate a real customer JWT using the app's JwtService + ConfigService
  const jwtService = moduleRef.get(JwtService);
  const configService = moduleRef.get(ConfigService);
  customerToken = jwtService.sign(
    { sub: mockUser.uuid, type: 'customer' },
    { secret: configService.getOrThrow('JWT_SECRET') },
  );

  // Default: JWT validation always finds the user
  prisma.user.findUnique.mockResolvedValue(mockUser);
});

afterAll(async () => {
  await app.close();
});

// ---------------------------------------------------------------------------
// Auth guard
// ---------------------------------------------------------------------------

describe('Cart endpoints — auth guard', () => {
  it('GET /api/v1/customer/cart returns 401 without token', async () => {
    await request(app.getHttpServer()).get('/api/v1/customer/cart').expect(401);
  });

  it('POST /api/v1/customer/cart/items returns 401 without token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/customer/cart/items')
      .send({ productId: 10, qty: 1 })
      .expect(401);
  });
});

// ---------------------------------------------------------------------------
// GET /customer/cart
// ---------------------------------------------------------------------------

describe('GET /api/v1/customer/cart', () => {
  it('returns the cart for authenticated user', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.cart.findUnique.mockResolvedValue({ ...mockCart, items: [] });

    const res = await request(app.getHttpServer())
      .get('/api/v1/customer/cart')
      .set('Cookie', [`token=${customerToken}`])
      .expect(200);

    expect(res.body.data).toBeDefined();
  });

  it('creates a cart if none exists', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    // First call returns null (no cart), second returns created cart
    prisma.cart.findUnique.mockResolvedValueOnce(null);
    prisma.cart.create.mockResolvedValue({ ...mockCart, items: [] });

    const res = await request(app.getHttpServer())
      .get('/api/v1/customer/cart')
      .set('Cookie', [`token=${customerToken}`])
      .expect(200);

    expect(res.body.data).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// POST /customer/cart/items
// ---------------------------------------------------------------------------

describe('POST /api/v1/customer/cart/items', () => {
  it('returns 400 for invalid body (missing productId)', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    await request(app.getHttpServer())
      .post('/api/v1/customer/cart/items')
      .set('Cookie', [`token=${customerToken}`])
      .send({ qty: 1 })
      .expect(400);
  });

  it('returns 400 for negative qty', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    await request(app.getHttpServer())
      .post('/api/v1/customer/cart/items')
      .set('Cookie', [`token=${customerToken}`])
      .send({ productId: 10, qty: -1 })
      .expect(400);
  });

  it('returns 404 when product not found', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.product.findUnique.mockResolvedValue(null);

    await request(app.getHttpServer())
      .post('/api/v1/customer/cart/items')
      .set('Cookie', [`token=${customerToken}`])
      .send({ productId: 999, qty: 1 })
      .expect(404);
  });

  it('returns 400 when qty exceeds stock', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.product.findUnique.mockResolvedValue({ ...mockProduct, stock: 2 });

    await request(app.getHttpServer())
      .post('/api/v1/customer/cart/items')
      .set('Cookie', [`token=${customerToken}`])
      .send({ productId: 10, qty: 5 })
      .expect(400);
  });
});

// ---------------------------------------------------------------------------
// POST /customer/cart/merge
// ---------------------------------------------------------------------------

describe('POST /api/v1/customer/cart/merge', () => {
  it('returns 400 when items array is empty', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    await request(app.getHttpServer())
      .post('/api/v1/customer/cart/merge')
      .set('Cookie', [`token=${customerToken}`])
      .send({ items: [] })
      .expect(400);
  });

  it('returns 400 when items is missing', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    await request(app.getHttpServer())
      .post('/api/v1/customer/cart/merge')
      .set('Cookie', [`token=${customerToken}`])
      .send({})
      .expect(400);
  });

  it('skips unavailable products and returns skipped list', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.cart.findUnique.mockResolvedValue({ ...mockCart, items: [] });
    prisma.product.findUnique.mockResolvedValue({
      ...mockProduct,
      active: false,
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/customer/cart/merge')
      .set('Cookie', [`token=${customerToken}`])
      .send({ items: [{ productId: 10, qty: 1 }] })
      .expect(201);

    expect(res.body.skipped).toEqual([
      { productId: 10, reason: 'unavailable' },
    ]);
  });
});
