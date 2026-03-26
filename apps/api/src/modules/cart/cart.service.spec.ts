import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

import { CartService } from './cart.service';
import { CartRepository } from './cart.repository';
import { ProductsRepository } from '../products/products.repository';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockUser = {
  id: BigInt(1),
  uuid: 'user-uuid-1',
  facebookId: 'fb-123',
  name: 'Alice',
  phone: null,
  email: null,
  langPref: 'AR',
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as User;

const mockProduct = {
  id: BigInt(10),
  uuid: 'prod-uuid-1',
  sku: 'EXT-CO2-2KG',
  slug: 'extincteur-co2-2kg',
  nameAr: 'طفاية حريق',
  nameFr: 'Extincteur CO2',
  nameEn: 'CO2 Extinguisher',
  price: 89.9,
  stock: 50,
  threshold: 5,
  active: true,
};

const mockCart = {
  id: BigInt(100),
  userId: BigInt(1),
  updatedAt: new Date(),
  items: [],
};

const mockCartWithItem = {
  ...mockCart,
  items: [
    {
      id: BigInt(200),
      cartId: BigInt(100),
      productId: BigInt(10),
      qty: 2,
      addedAt: new Date(),
      product: mockProduct,
    },
  ],
};

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

const buildCartRepoMock = () => ({
  findOrCreateCart: jest.fn(),
  findCart: jest.fn(),
  findCartItem: jest.fn(),
  findCartItemByProduct: jest.fn(),
  addItem: jest.fn(),
  updateItemQty: jest.fn(),
  deleteItem: jest.fn(),
  getCartWithItems: jest.fn(),
});

const buildProductsRepoMock = () => ({
  findById: jest.fn(),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CartService', () => {
  let service: CartService;
  let cartRepo: ReturnType<typeof buildCartRepoMock>;
  let productsRepo: ReturnType<typeof buildProductsRepoMock>;

  beforeEach(async () => {
    cartRepo = buildCartRepoMock();
    productsRepo = buildProductsRepoMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: CartRepository, useValue: cartRepo },
        { provide: ProductsRepository, useValue: productsRepo },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  // ─── getCart ────────────────────────────────────────

  describe('getCart', () => {
    it('returns existing or newly created cart', async () => {
      cartRepo.findOrCreateCart.mockResolvedValue(mockCart);

      const result = await service.getCart(mockUser);

      expect(cartRepo.findOrCreateCart).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({ data: mockCart });
    });
  });

  // ─── addItem ────────────────────────────────────────

  describe('addItem', () => {
    it('adds a new item to the cart', async () => {
      productsRepo.findById.mockResolvedValue(mockProduct);
      cartRepo.findOrCreateCart.mockResolvedValue(mockCart);
      cartRepo.findCartItemByProduct.mockResolvedValue(null);
      cartRepo.getCartWithItems.mockResolvedValue(mockCartWithItem);

      const result = await service.addItem(mockUser, {
        productId: 10,
        qty: 2,
      });

      expect(cartRepo.addItem).toHaveBeenCalledWith(mockCart.id, BigInt(10), 2);
      expect(result.data).toEqual(mockCartWithItem);
    });

    it('increments qty when item already in cart', async () => {
      productsRepo.findById.mockResolvedValue(mockProduct);
      cartRepo.findOrCreateCart.mockResolvedValue(mockCart);
      cartRepo.findCartItemByProduct.mockResolvedValue({
        id: BigInt(200),
        qty: 3,
      });
      cartRepo.getCartWithItems.mockResolvedValue(mockCartWithItem);

      await service.addItem(mockUser, { productId: 10, qty: 2 });

      expect(cartRepo.updateItemQty).toHaveBeenCalledWith(BigInt(200), 5);
      expect(cartRepo.addItem).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when product not found', async () => {
      productsRepo.findById.mockResolvedValue(null);

      await expect(
        service.addItem(mockUser, { productId: 10, qty: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when product is inactive', async () => {
      productsRepo.findById.mockResolvedValue({
        ...mockProduct,
        active: false,
      });

      await expect(
        service.addItem(mockUser, { productId: 10, qty: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when qty exceeds stock', async () => {
      productsRepo.findById.mockResolvedValue({ ...mockProduct, stock: 3 });

      await expect(
        service.addItem(mockUser, { productId: 10, qty: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when combined qty exceeds stock for existing item', async () => {
      productsRepo.findById.mockResolvedValue({ ...mockProduct, stock: 4 });
      cartRepo.findOrCreateCart.mockResolvedValue(mockCart);
      cartRepo.findCartItemByProduct.mockResolvedValue({
        id: BigInt(200),
        qty: 3,
      });

      await expect(
        service.addItem(mockUser, { productId: 10, qty: 2 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── updateItem ─────────────────────────────────────

  describe('updateItem', () => {
    it('updates cart item quantity', async () => {
      cartRepo.findOrCreateCart.mockResolvedValue(mockCart);
      cartRepo.findCartItem.mockResolvedValue({
        id: BigInt(200),
        productId: BigInt(10),
        qty: 2,
      });
      productsRepo.findById.mockResolvedValue(mockProduct);
      cartRepo.getCartWithItems.mockResolvedValue(mockCartWithItem);

      const result = await service.updateItem(mockUser, BigInt(200), {
        qty: 4,
      });

      expect(cartRepo.updateItemQty).toHaveBeenCalledWith(BigInt(200), 4);
      expect(result.data).toEqual(mockCartWithItem);
    });

    it('throws NotFoundException when item not in cart', async () => {
      cartRepo.findOrCreateCart.mockResolvedValue(mockCart);
      cartRepo.findCartItem.mockResolvedValue(null);

      await expect(
        service.updateItem(mockUser, BigInt(999), { qty: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when new qty exceeds stock', async () => {
      cartRepo.findOrCreateCart.mockResolvedValue(mockCart);
      cartRepo.findCartItem.mockResolvedValue({
        id: BigInt(200),
        productId: BigInt(10),
        qty: 2,
      });
      productsRepo.findById.mockResolvedValue({ ...mockProduct, stock: 3 });

      await expect(
        service.updateItem(mockUser, BigInt(200), { qty: 10 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── removeItem ─────────────────────────────────────

  describe('removeItem', () => {
    it('removes item from cart', async () => {
      cartRepo.findOrCreateCart.mockResolvedValue(mockCart);
      cartRepo.findCartItem.mockResolvedValue({ id: BigInt(200) });
      cartRepo.getCartWithItems.mockResolvedValue(mockCart);

      const result = await service.removeItem(mockUser, BigInt(200));

      expect(cartRepo.deleteItem).toHaveBeenCalledWith(BigInt(200));
      expect(result.data).toEqual(mockCart);
    });

    it('throws NotFoundException when item not found', async () => {
      cartRepo.findOrCreateCart.mockResolvedValue(mockCart);
      cartRepo.findCartItem.mockResolvedValue(null);

      await expect(service.removeItem(mockUser, BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── mergeCart ──────────────────────────────────────

  describe('mergeCart', () => {
    it('adds local items not in server cart', async () => {
      cartRepo.findOrCreateCart.mockResolvedValue(mockCart);
      productsRepo.findById.mockResolvedValue(mockProduct);
      cartRepo.findCartItemByProduct.mockResolvedValue(null);
      cartRepo.getCartWithItems.mockResolvedValue(mockCartWithItem);

      const result = await service.mergeCart(mockUser, {
        items: [{ productId: 10, qty: 2 }],
      });

      expect(cartRepo.addItem).toHaveBeenCalledWith(mockCart.id, BigInt(10), 2);
      expect(result.skipped).toHaveLength(0);
    });

    it('server cart wins when item already exists', async () => {
      cartRepo.findOrCreateCart.mockResolvedValue(mockCart);
      productsRepo.findById.mockResolvedValue(mockProduct);
      cartRepo.findCartItemByProduct.mockResolvedValue({
        id: BigInt(200),
        qty: 3,
      });
      cartRepo.getCartWithItems.mockResolvedValue(mockCartWithItem);

      await service.mergeCart(mockUser, {
        items: [{ productId: 10, qty: 5 }],
      });

      expect(cartRepo.addItem).not.toHaveBeenCalled();
      expect(cartRepo.updateItemQty).not.toHaveBeenCalled();
    });

    it('skips unavailable products', async () => {
      cartRepo.findOrCreateCart.mockResolvedValue(mockCart);
      productsRepo.findById.mockResolvedValue({
        ...mockProduct,
        active: false,
      });
      cartRepo.getCartWithItems.mockResolvedValue(mockCart);

      const result = await service.mergeCart(mockUser, {
        items: [{ productId: 10, qty: 1 }],
      });

      expect(result.skipped).toEqual([
        { productId: 10, reason: 'unavailable' },
      ]);
      expect(cartRepo.addItem).not.toHaveBeenCalled();
    });

    it('skips out-of-stock products', async () => {
      cartRepo.findOrCreateCart.mockResolvedValue(mockCart);
      productsRepo.findById.mockResolvedValue({ ...mockProduct, stock: 0 });
      cartRepo.getCartWithItems.mockResolvedValue(mockCart);

      const result = await service.mergeCart(mockUser, {
        items: [{ productId: 10, qty: 1 }],
      });

      expect(result.skipped).toEqual([
        { productId: 10, reason: 'out_of_stock' },
      ]);
    });

    it('caps qty to available stock', async () => {
      cartRepo.findOrCreateCart.mockResolvedValue(mockCart);
      productsRepo.findById.mockResolvedValue({ ...mockProduct, stock: 3 });
      cartRepo.findCartItemByProduct.mockResolvedValue(null);
      cartRepo.getCartWithItems.mockResolvedValue(mockCart);

      await service.mergeCart(mockUser, {
        items: [{ productId: 10, qty: 10 }],
      });

      expect(cartRepo.addItem).toHaveBeenCalledWith(mockCart.id, BigInt(10), 3);
    });

    it('skips non-existent products', async () => {
      cartRepo.findOrCreateCart.mockResolvedValue(mockCart);
      productsRepo.findById.mockResolvedValue(null);
      cartRepo.getCartWithItems.mockResolvedValue(mockCart);

      const result = await service.mergeCart(mockUser, {
        items: [{ productId: 99, qty: 1 }],
      });

      expect(result.skipped).toEqual([
        { productId: 99, reason: 'unavailable' },
      ]);
    });
  });
});
