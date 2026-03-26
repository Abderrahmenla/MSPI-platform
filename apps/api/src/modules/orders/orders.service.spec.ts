import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { CartRepository } from '../cart/cart.repository';
import { PrismaService } from '../../database/prisma.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockUser = {
  id: BigInt(1),
  uuid: 'user-uuid-1',
};

const mockProduct = {
  id: BigInt(10),
  uuid: 'prod-uuid-1',
  price: 89.9,
  stock: 50,
  active: true,
};

const mockCartItem = {
  id: BigInt(200),
  cartId: BigInt(100),
  productId: BigInt(10),
  qty: 2,
  product: mockProduct,
};

const mockCart = {
  id: BigInt(100),
  userId: BigInt(1),
  updatedAt: new Date(),
  items: [mockCartItem],
};

const mockEmptyCart = {
  id: BigInt(100),
  userId: BigInt(1),
  updatedAt: new Date(),
  items: [],
};

const mockOrder = {
  id: BigInt(1),
  uuid: 'order-uuid-1',
  ref: 'ORD-20260326-ABCDE',
  userId: BigInt(1),
  status: OrderStatus.PENDING,
  total: 179.8,
  idempotencyKey: 'idem-key-1',
  items: [],
  statusHistory: [],
};

const mockCreateOrderDto = {
  idempotencyKey: 'idem-key-1',
  phone: '+21612345678',
  address: {
    address: '1 Rue de la Paix',
    city: 'Tunis',
  },
};

// ---------------------------------------------------------------------------
// Mock factories
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
  findOrCreateCart: jest.fn(),
});

const buildPrismaMock = () => {
  const txMock = {
    order: { create: jest.fn() },
    product: { update: jest.fn() },
    cartItem: { deleteMany: jest.fn() },
  };

  return {
    $transaction: jest.fn().mockImplementation((cb) => cb(txMock)),
    _txMock: txMock,
  };
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepo: ReturnType<typeof buildOrdersRepoMock>;
  let cartRepo: ReturnType<typeof buildCartRepoMock>;
  let prisma: ReturnType<typeof buildPrismaMock>;

  beforeEach(async () => {
    ordersRepo = buildOrdersRepoMock();
    cartRepo = buildCartRepoMock();
    prisma = buildPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: ordersRepo },
        { provide: CartRepository, useValue: cartRepo },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  // ─── createFromCart ──────────────────────────────────

  describe('createFromCart', () => {
    it('returns existing order when idempotencyKey already used', async () => {
      ordersRepo.findByIdempotencyKey.mockResolvedValue(mockOrder);

      const result = await service.createFromCart(
        mockUser.id,
        mockCreateOrderDto,
      );

      expect(ordersRepo.findByIdempotencyKey).toHaveBeenCalledWith(
        mockCreateOrderDto.idempotencyKey,
      );
      expect(result).toEqual(mockOrder);
      expect(cartRepo.getCartWithItems).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when cart is empty', async () => {
      ordersRepo.findByIdempotencyKey.mockResolvedValue(null);
      cartRepo.getCartWithItems.mockResolvedValue(mockEmptyCart);

      await expect(
        service.createFromCart(mockUser.id, mockCreateOrderDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when cart is null', async () => {
      ordersRepo.findByIdempotencyKey.mockResolvedValue(null);
      cartRepo.getCartWithItems.mockResolvedValue(null);

      await expect(
        service.createFromCart(mockUser.id, mockCreateOrderDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws UnprocessableEntityException when any item is out of stock', async () => {
      ordersRepo.findByIdempotencyKey.mockResolvedValue(null);
      cartRepo.getCartWithItems.mockResolvedValue({
        ...mockCart,
        items: [
          {
            ...mockCartItem,
            qty: 100,
            product: { ...mockProduct, stock: 5 },
          },
        ],
      });

      await expect(
        service.createFromCart(mockUser.id, mockCreateOrderDto),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws UnprocessableEntityException when any item product is inactive', async () => {
      ordersRepo.findByIdempotencyKey.mockResolvedValue(null);
      cartRepo.getCartWithItems.mockResolvedValue({
        ...mockCart,
        items: [
          {
            ...mockCartItem,
            product: { ...mockProduct, active: false },
          },
        ],
      });

      await expect(
        service.createFromCart(mockUser.id, mockCreateOrderDto),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('creates order successfully in a transaction', async () => {
      ordersRepo.findByIdempotencyKey.mockResolvedValue(null);
      cartRepo.getCartWithItems.mockResolvedValue(mockCart);

      const createdOrder = { ...mockOrder };
      prisma._txMock.order.create.mockResolvedValue(createdOrder);
      prisma._txMock.product.update.mockResolvedValue({});
      prisma._txMock.cartItem.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.createFromCart(
        mockUser.id,
        mockCreateOrderDto,
      );

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma._txMock.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUser.id,
            phone: mockCreateOrderDto.phone,
            idempotencyKey: mockCreateOrderDto.idempotencyKey,
            status: OrderStatus.PENDING,
          }),
        }),
      );
      expect(prisma._txMock.product.update).toHaveBeenCalledWith({
        where: { id: mockCartItem.productId },
        data: { stock: { decrement: mockCartItem.qty } },
      });
      expect(prisma._txMock.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: mockCart.id },
      });
      expect(result).toEqual(createdOrder);
    });
  });

  // ─── listByUser ──────────────────────────────────────

  describe('listByUser', () => {
    it('returns paginated orders from repo', async () => {
      const orders = [mockOrder];
      ordersRepo.findByUser.mockResolvedValue({ orders, total: 1 });

      const result = await service.listByUser(mockUser.id, {
        page: 1,
        limit: 20,
      });

      expect(ordersRepo.findByUser).toHaveBeenCalledWith(
        mockUser.id,
        1,
        20,
        undefined,
      );
      expect(result).toEqual({
        data: orders,
        meta: { total: 1, page: 1, limit: 20 },
      });
    });

    it('applies default pagination when not provided', async () => {
      ordersRepo.findByUser.mockResolvedValue({ orders: [], total: 0 });

      await service.listByUser(mockUser.id, {});

      expect(ordersRepo.findByUser).toHaveBeenCalledWith(
        mockUser.id,
        1,
        20,
        undefined,
      );
    });
  });

  // ─── getByUuid ───────────────────────────────────────

  describe('getByUuid', () => {
    it('throws NotFoundException when order not found', async () => {
      ordersRepo.findByUuid.mockResolvedValue(null);

      await expect(service.getByUuid('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns order when found', async () => {
      ordersRepo.findByUuid.mockResolvedValue(mockOrder);

      const result = await service.getByUuid(mockOrder.uuid);

      expect(result).toEqual({ data: mockOrder });
    });

    it('throws NotFoundException when order belongs to different user', async () => {
      ordersRepo.findByUuid.mockResolvedValue(mockOrder);

      await expect(
        service.getByUuid(mockOrder.uuid, BigInt(999)),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns order when userId matches', async () => {
      ordersRepo.findByUuid.mockResolvedValue(mockOrder);

      const result = await service.getByUuid(mockOrder.uuid, mockUser.id);

      expect(result).toEqual({ data: mockOrder });
    });
  });

  // ─── transition ──────────────────────────────────────

  describe('transition', () => {
    it('throws NotFoundException when order not found', async () => {
      ordersRepo.findByUuid.mockResolvedValue(null);

      await expect(
        service.transition(
          'non-existent-uuid',
          { status: OrderStatus.CONFIRMED },
          BigInt(1),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException for invalid transition (PENDING → SHIPPED)', async () => {
      ordersRepo.findByUuid.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PENDING,
      });

      await expect(
        service.transition(
          mockOrder.uuid,
          { status: OrderStatus.SHIPPED },
          BigInt(1),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid transition (DELIVERED → CANCELLED)', async () => {
      ordersRepo.findByUuid.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.DELIVERED,
      });

      await expect(
        service.transition(
          mockOrder.uuid,
          { status: OrderStatus.CANCELLED },
          BigInt(1),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('calls updateStatus for valid transition (PENDING → CONFIRMED)', async () => {
      ordersRepo.findByUuid.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PENDING,
      });
      const updatedOrder = { ...mockOrder, status: OrderStatus.CONFIRMED };
      ordersRepo.updateStatus.mockResolvedValue(updatedOrder);

      const result = await service.transition(
        mockOrder.uuid,
        { status: OrderStatus.CONFIRMED },
        BigInt(1),
      );

      expect(ordersRepo.updateStatus).toHaveBeenCalledWith(
        mockOrder.uuid,
        OrderStatus.CONFIRMED,
        BigInt(1),
        OrderStatus.PENDING,
        undefined,
      );
      expect(result).toEqual({ data: updatedOrder });
    });

    it('calls updateStatus for valid transition (CONFIRMED → CANCELLED)', async () => {
      ordersRepo.findByUuid.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
      });
      const updatedOrder = { ...mockOrder, status: OrderStatus.CANCELLED };
      ordersRepo.updateStatus.mockResolvedValue(updatedOrder);

      await service.transition(
        mockOrder.uuid,
        { status: OrderStatus.CANCELLED },
        BigInt(1),
      );

      expect(ordersRepo.updateStatus).toHaveBeenCalledWith(
        mockOrder.uuid,
        OrderStatus.CANCELLED,
        BigInt(1),
        OrderStatus.CONFIRMED,
        undefined,
      );
    });

    it('calls updateTracking when trackingNumber is provided', async () => {
      ordersRepo.findByUuid.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
      });
      ordersRepo.updateStatus.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.SHIPPED,
      });

      await service.transition(
        mockOrder.uuid,
        { status: OrderStatus.SHIPPED, trackingNumber: 'TRACK-123' },
        BigInt(1),
      );

      expect(ordersRepo.updateTracking).toHaveBeenCalledWith(
        mockOrder.uuid,
        'TRACK-123',
      );
    });
  });
});
