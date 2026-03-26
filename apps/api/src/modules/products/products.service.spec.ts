import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockProduct = {
  id: BigInt(1),
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

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------

const buildRepoMock = () => ({
  findActiveProducts: jest.fn(),
  findBySlug: jest.fn(),
  findById: jest.fn(),
  findAllProducts: jest.fn(),
  findByUuid: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deactivate: jest.fn(),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: ReturnType<typeof buildRepoMock>;

  beforeEach(async () => {
    repo = buildRepoMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  // ─── listPublic ─────────────────────────────────────

  describe('listPublic', () => {
    it('returns paginated active products', async () => {
      repo.findActiveProducts.mockResolvedValue({
        items: [mockProduct],
        total: 1,
      });

      const result = await service.listPublic({ page: 1, limit: 24 });

      expect(repo.findActiveProducts).toHaveBeenCalledWith({
        page: 1,
        limit: 24,
        category: undefined,
        search: undefined,
      });
      expect(result).toEqual({
        data: [mockProduct],
        meta: { total: 1, page: 1, limit: 24 },
      });
    });

    it('uses default page=1 and limit=24 when not provided', async () => {
      repo.findActiveProducts.mockResolvedValue({ items: [], total: 0 });

      await service.listPublic({});

      expect(repo.findActiveProducts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 24 }),
      );
    });

    it('forwards category and search filters', async () => {
      repo.findActiveProducts.mockResolvedValue({ items: [], total: 0 });

      await service.listPublic({
        page: 2,
        limit: 12,
        category: 'extincteurs',
        search: 'CO2',
      });

      expect(repo.findActiveProducts).toHaveBeenCalledWith({
        page: 2,
        limit: 12,
        category: 'extincteurs',
        search: 'CO2',
      });
    });
  });

  // ─── getBySlug ──────────────────────────────────────

  describe('getBySlug', () => {
    it('returns active product by slug', async () => {
      repo.findBySlug.mockResolvedValue(mockProduct);

      const result = await service.getBySlug('extincteur-co2-2kg');

      expect(result).toEqual({ data: mockProduct });
    });

    it('throws NotFoundException when product does not exist', async () => {
      repo.findBySlug.mockResolvedValue(null);

      await expect(service.getBySlug('unknown-slug')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when product is inactive', async () => {
      repo.findBySlug.mockResolvedValue({ ...mockProduct, active: false });

      await expect(service.getBySlug('extincteur-co2-2kg')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── getStock ───────────────────────────────────────

  describe('getStock', () => {
    it('returns stock and active status', async () => {
      repo.findBySlug.mockResolvedValue(mockProduct);

      const result = await service.getStock('extincteur-co2-2kg');

      expect(result).toEqual({ stock: 50, active: true });
    });

    it('throws NotFoundException when product does not exist', async () => {
      repo.findBySlug.mockResolvedValue(null);

      await expect(service.getStock('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns stock info even for inactive products', async () => {
      repo.findBySlug.mockResolvedValue({ ...mockProduct, active: false });

      const result = await service.getStock('extincteur-co2-2kg');

      expect(result).toEqual({ stock: 50, active: false });
    });
  });

  // ─── listAll (admin) ─────────────────────────────────

  describe('listAll', () => {
    it('returns all products including inactive', async () => {
      const inactive = { ...mockProduct, active: false };
      repo.findAllProducts.mockResolvedValue({ items: [inactive], total: 1 });

      const result = await service.listAll({ page: 1, limit: 24 });

      expect(repo.findAllProducts).toHaveBeenCalled();
      expect(result.data).toContain(inactive);
    });
  });

  // ─── getByUuid (admin) ───────────────────────────────

  describe('getByUuid', () => {
    it('returns product by uuid', async () => {
      repo.findByUuid.mockResolvedValue(mockProduct);

      const result = await service.getByUuid('prod-uuid-1');

      expect(result).toEqual({ data: mockProduct });
    });

    it('throws NotFoundException when not found', async () => {
      repo.findByUuid.mockResolvedValue(null);

      await expect(service.getByUuid('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── create (admin) ──────────────────────────────────

  describe('create', () => {
    it('creates and returns the new product', async () => {
      repo.create.mockResolvedValue(mockProduct);

      const dto = {
        sku: 'EXT-CO2-2KG',
        slug: 'extincteur-co2-2kg',
        nameAr: 'طفاية حريق',
        nameFr: 'Extincteur CO2',
        nameEn: 'CO2 Extinguisher',
        price: 89.9,
      };

      const result = await service.create(dto as any);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ data: mockProduct });
    });
  });

  // ─── update (admin) ──────────────────────────────────

  describe('update', () => {
    it('updates and returns the product', async () => {
      const updated = { ...mockProduct, price: 99.9 };
      repo.findByUuid.mockResolvedValue(mockProduct);
      repo.update.mockResolvedValue(updated);

      const result = await service.update('prod-uuid-1', {
        price: 99.9,
      } as any);

      expect(repo.update).toHaveBeenCalledWith('prod-uuid-1', { price: 99.9 });
      expect(result).toEqual({ data: updated });
    });

    it('throws NotFoundException when product not found', async () => {
      repo.findByUuid.mockResolvedValue(null);

      await expect(
        service.update('missing', { price: 99.9 } as any),
      ).rejects.toThrow(NotFoundException);

      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  // ─── deactivate (admin) ──────────────────────────────

  describe('deactivate', () => {
    it('deactivates the product', async () => {
      repo.findByUuid.mockResolvedValue(mockProduct);
      repo.deactivate.mockResolvedValue({ ...mockProduct, active: false });

      const result = await service.deactivate('prod-uuid-1');

      expect(repo.deactivate).toHaveBeenCalledWith('prod-uuid-1');
      expect(result).toEqual({ deactivated: true });
    });

    it('throws NotFoundException when product not found', async () => {
      repo.findByUuid.mockResolvedValue(null);

      await expect(service.deactivate('missing')).rejects.toThrow(
        NotFoundException,
      );

      expect(repo.deactivate).not.toHaveBeenCalled();
    });
  });
});
