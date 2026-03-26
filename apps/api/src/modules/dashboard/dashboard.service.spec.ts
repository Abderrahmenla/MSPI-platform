import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../database/prisma.service';

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------

const buildPrismaMock = () => ({
  $transaction: jest.fn(),
  order: {
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  quote: { count: jest.fn() },
  user: { count: jest.fn() },
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: ReturnType<typeof buildPrismaMock>;

  beforeEach(async () => {
    prisma = buildPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  // ─── getStats ────────────────────────────────────────

  describe('getStats', () => {
    it('returns the expected shape with orders, quotes, customers, revenue keys', async () => {
      // The service issues 17 items via $transaction. We mock the resolved array
      // in the same order as the source file.
      prisma.$transaction.mockResolvedValue([
        10, // orderTotal
        3, // orderPending
        2, // orderConfirmed
        1, // orderShipped
        2, // orderDelivered
        2, // orderCancelled
        1, // orderTodayCount
        5, // quoteTotal
        2, // quoteNew
        1, // quoteContacted
        1, // quoteOfferSent
        1, // quoteWon
        0, // quoteLost
        50, // customerTotal
        8, // customerNewThisMonth
        { _sum: { total: 350.5 } }, // revenueTotal
        { _sum: { total: 120.0 } }, // revenueThisMonth
      ]);

      const result = await service.getStats();

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);

      // Shape assertions
      expect(result).toHaveProperty('orders');
      expect(result).toHaveProperty('quotes');
      expect(result).toHaveProperty('customers');
      expect(result).toHaveProperty('revenue');

      // orders sub-keys
      expect(result.orders).toMatchObject({
        total: 10,
        pending: 3,
        confirmed: 2,
        shipped: 1,
        delivered: 2,
        cancelled: 2,
        todayCount: 1,
      });

      // quotes sub-keys
      expect(result.quotes).toMatchObject({
        total: 5,
        new: 2,
        contacted: 1,
        offerSent: 1,
        won: 1,
        lost: 0,
      });

      // customers sub-keys
      expect(result.customers).toMatchObject({
        total: 50,
        newThisMonth: 8,
      });

      // revenue sub-keys (coerced to Number)
      expect(result.revenue).toMatchObject({
        total: 350.5,
        thisMonth: 120.0,
      });
    });

    it('returns zero revenue when _sum.total is null', async () => {
      prisma.$transaction.mockResolvedValue([
        0,
        0,
        0,
        0,
        0,
        0,
        0, // orders
        0,
        0,
        0,
        0,
        0,
        0, // quotes
        0,
        0, // customers
        { _sum: { total: null } }, // revenueTotal — null case
        { _sum: { total: null } }, // revenueThisMonth — null case
      ]);

      const result = await service.getStats();

      expect(result.revenue.total).toBe(0);
      expect(result.revenue.thisMonth).toBe(0);
    });
  });
});
