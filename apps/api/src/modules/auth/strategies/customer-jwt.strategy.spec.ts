import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CustomerJwtStrategy } from './customer-jwt.strategy';
import { PrismaService } from '../../../database/prisma.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockUser = {
  id: BigInt(1),
  uuid: 'user-uuid-1',
  facebookId: 'fb-123',
  name: 'Alice Dupont',
  email: 'alice@example.com',
  phone: null,
  langPref: 'AR',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const buildPrismaMock = () => ({
  user: { findUnique: jest.fn() },
});

const buildConfigMock = () => ({
  getOrThrow: jest.fn().mockReturnValue('test-customer-secret'),
  get: jest.fn(),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CustomerJwtStrategy', () => {
  let strategy: CustomerJwtStrategy;
  let prisma: ReturnType<typeof buildPrismaMock>;

  beforeEach(() => {
    prisma = buildPrismaMock();
    strategy = new CustomerJwtStrategy(
      buildConfigMock() as unknown as ConfigService,
      prisma as unknown as PrismaService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the user for a valid customer token', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await strategy.validate({
      sub: 'user-uuid-1',
      type: 'customer',
    });

    expect(result).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { uuid: 'user-uuid-1' },
    });
  });

  it('throws UnauthorizedException for wrong token type', async () => {
    await expect(
      strategy.validate({ sub: 'user-uuid-1', type: 'admin' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid token type'));
  });

  it('throws UnauthorizedException when user is not in DB', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: 'ghost-uuid', type: 'customer' }),
    ).rejects.toThrow(new UnauthorizedException('User not found'));
  });

  it('returns cached user without hitting DB on repeated calls', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    // First call hits DB
    await strategy.validate({ sub: 'user-uuid-1', type: 'customer' });
    // Second call served from cache
    await strategy.validate({ sub: 'user-uuid-1', type: 'customer' });

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
  });

  it('hits DB again after cache TTL expires', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    jest.useFakeTimers();

    await strategy.validate({ sub: 'user-uuid-1', type: 'customer' });
    jest.advanceTimersByTime(20_000); // past 15s TTL
    await strategy.validate({ sub: 'user-uuid-1', type: 'customer' });

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });
});
