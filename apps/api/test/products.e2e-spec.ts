// Set env vars before any NestJS modules are loaded
process.env.FACEBOOK_APP_ID = 'test-app-id';
process.env.FACEBOOK_APP_SECRET = 'test-app-secret';
process.env.FACEBOOK_CALLBACK_URL =
  'http://localhost:4000/api/v1/auth/facebook/callback';
process.env.JWT_SECRET = 'e2e-test-customer-secret';
process.env.JWT_ADMIN_SECRET = 'e2e-test-admin-secret';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';

import { ProductsModule } from '../src/modules/products/products.module';
import { AuthModule } from '../src/modules/auth/auth.module';
import { PrismaService } from '../src/database/prisma.service';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockProduct = {
  id: 1,
  uuid: 'prod-uuid-1',
  sku: 'EXT-CO2-2KG',
  slug: 'extincteur-co2-2kg',
  nameAr: 'طفاية حريق',
  nameFr: 'Extincteur CO2',
  nameEn: 'CO2 Extinguisher',
  descAr: null,
  descFr: null,
  descEn: null,
  category: 'extincteurs',
  price: 89.9,
  stock: 50,
  threshold: 5,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  images: [],
};

const buildPrismaMock = () => ({
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  admin: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest
    .fn()
    .mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops)),
});

// ---------------------------------------------------------------------------
// App setup
// ---------------------------------------------------------------------------

let app: INestApplication;
let prisma: ReturnType<typeof buildPrismaMock>;

beforeAll(async () => {
  prisma = buildPrismaMock();

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
      ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1000 }]),
      AuthModule,
      ProductsModule,
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
});

afterAll(async () => {
  await app.close();
});

// ---------------------------------------------------------------------------
// Public endpoints
// ---------------------------------------------------------------------------

describe('GET /api/v1/products', () => {
  it('returns paginated active products', async () => {
    prisma.product.findMany.mockResolvedValue([mockProduct]);
    prisma.product.count.mockResolvedValue(1);

    const res = await request(app.getHttpServer())
      .get('/api/v1/products')
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toMatchObject({ total: 1, page: 1, limit: 24 });
  });

  it('accepts page, limit, category, search query params', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    prisma.product.count.mockResolvedValue(0);

    await request(app.getHttpServer())
      .get('/api/v1/products?page=2&limit=12&category=extincteurs&search=CO2')
      .expect(200);

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 12, take: 12 }),
    );
  });

  it('rejects invalid page (non-integer)', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/products?page=abc')
      .expect(400);
  });
});

describe('GET /api/v1/products/:slug', () => {
  it('returns the product for a valid slug', async () => {
    prisma.product.findUnique.mockResolvedValue(mockProduct);

    const res = await request(app.getHttpServer())
      .get('/api/v1/products/extincteur-co2-2kg')
      .expect(200);

    expect(res.body.data.slug).toBe('extincteur-co2-2kg');
  });

  it('returns 404 for unknown slug', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get('/api/v1/products/unknown-slug')
      .expect(404);
  });

  it('returns 404 for inactive product', async () => {
    prisma.product.findUnique.mockResolvedValue({
      ...mockProduct,
      active: false,
    });

    await request(app.getHttpServer())
      .get('/api/v1/products/extincteur-co2-2kg')
      .expect(404);
  });
});

describe('GET /api/v1/products/:slug/stock', () => {
  it('returns stock and active status', async () => {
    prisma.product.findUnique.mockResolvedValue(mockProduct);

    const res = await request(app.getHttpServer())
      .get('/api/v1/products/extincteur-co2-2kg/stock')
      .expect(200);

    expect(res.body).toEqual({ stock: 50, active: true });
  });

  it('returns 404 for unknown product', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get('/api/v1/products/ghost/stock')
      .expect(404);
  });
});

// ---------------------------------------------------------------------------
// Admin endpoints — unauthenticated access
// ---------------------------------------------------------------------------

describe('Admin product endpoints — auth guard', () => {
  it('GET /api/v1/admin/products returns 401 without token', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/products')
      .expect(401);
  });

  it('POST /api/v1/admin/products returns 401 without token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/admin/products')
      .send({
        sku: 'X',
        slug: 'x',
        nameAr: 'a',
        nameFr: 'b',
        nameEn: 'c',
        price: 10,
      })
      .expect(401);
  });

  it('PATCH /api/v1/admin/products/:uuid returns 401 without token', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/admin/products/prod-uuid-1')
      .send({ price: 99 })
      .expect(401);
  });

  it('DELETE /api/v1/admin/products/:uuid returns 401 without token', async () => {
    await request(app.getHttpServer())
      .delete('/api/v1/admin/products/prod-uuid-1')
      .expect(401);
  });
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

describe('POST /api/v1/admin/products — validation', () => {
  it('returns 401 (guard runs before validation)', async () => {
    // Guard fires first — we just confirm the endpoint exists and is protected
    await request(app.getHttpServer())
      .post('/api/v1/admin/products')
      .send({})
      .expect(401);
  });
});
