import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersRepository } from './customers.repository';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockCustomer = {
  id: BigInt(1),
  uuid: 'cust-uuid-1',
  facebookId: 'fb-123',
  name: 'Alice',
  email: 'alice@example.com',
  phone: '+21699000001',
  langPref: 'FR',
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { orders: 2, quotes: 1 },
};

const mockPaginatedResult = {
  data: [mockCustomer],
  meta: { total: 1, page: 1, limit: 20 },
};

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------

const buildCustomersRepoMock = () => ({
  findAll: jest.fn(),
  findByUuid: jest.fn(),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CustomersService', () => {
  let service: CustomersService;
  let repo: ReturnType<typeof buildCustomersRepoMock>;

  beforeEach(async () => {
    repo = buildCustomersRepoMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: CustomersRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  // ─── list ────────────────────────────────────────────

  describe('list', () => {
    it('calls repo.findAll with correct params and returns result', async () => {
      repo.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await service.list({
        page: 2,
        limit: 10,
        search: 'alice',
      });

      expect(repo.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        search: 'alice',
      });
      expect(result).toEqual(mockPaginatedResult);
    });

    it('uses default page=1 and limit=20 when not provided', async () => {
      repo.findAll.mockResolvedValue(mockPaginatedResult);

      await service.list({});

      expect(repo.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: undefined,
      });
    });

    it('passes undefined search when not provided', async () => {
      repo.findAll.mockResolvedValue(mockPaginatedResult);

      await service.list({ page: 1, limit: 5 });

      expect(repo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: undefined }),
      );
    });
  });

  // ─── getByUuid ───────────────────────────────────────

  describe('getByUuid', () => {
    it('throws NotFoundException when repo returns null', async () => {
      repo.findByUuid.mockResolvedValue(null);

      await expect(service.getByUuid('nonexistent-uuid')).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.findByUuid).toHaveBeenCalledWith('nonexistent-uuid');
    });

    it('returns wrapped data when customer is found', async () => {
      repo.findByUuid.mockResolvedValue(mockCustomer);

      const result = await service.getByUuid(mockCustomer.uuid);

      expect(repo.findByUuid).toHaveBeenCalledWith(mockCustomer.uuid);
      expect(result).toEqual({ data: mockCustomer });
    });
  });
});
