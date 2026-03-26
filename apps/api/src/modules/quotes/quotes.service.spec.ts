import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QuoteStatus } from '@prisma/client';

import { QuotesService } from './quotes.service';
import { QuotesRepository } from './quotes.repository';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockUser = {
  id: BigInt(1),
  uuid: 'user-uuid-1',
};

const mockQuote = {
  id: BigInt(1),
  uuid: 'quote-uuid-1',
  ref: 'DEV-20260326-ABCDE',
  userId: BigInt(1),
  status: QuoteStatus.NEW,
  serviceType: 'FIRE_EXTINGUISHER',
  propertyType: 'COMMERCIAL',
  surfaceOrRooms: '200m2',
  hasElectrical: true,
  freeText: 'Need installation for warehouse',
  phone: '+21612345678',
  city: 'Tunis',
  statusHistory: [],
};

const mockCreateQuoteDto = {
  serviceType: 'FIRE_EXTINGUISHER',
  propertyType: 'COMMERCIAL',
  surfaceOrRooms: '200m2',
  hasElectrical: true,
  freeText: 'Need installation for warehouse',
  phone: '+21612345678',
  city: 'Tunis',
};

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

const buildQuotesRepoMock = () => ({
  create: jest.fn(),
  findByUser: jest.fn(),
  findByUuid: jest.fn(),
  findAll: jest.fn(),
  updateStatus: jest.fn(),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('QuotesService', () => {
  let service: QuotesService;
  let quotesRepo: ReturnType<typeof buildQuotesRepoMock>;

  beforeEach(async () => {
    quotesRepo = buildQuotesRepoMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotesService,
        { provide: QuotesRepository, useValue: quotesRepo },
      ],
    }).compile();

    service = module.get<QuotesService>(QuotesService);
  });

  // ─── create ─────────────────────────────────────────

  describe('create', () => {
    it('creates a quote with correct DEV-YYYYMMDD-XXXXX ref format', async () => {
      quotesRepo.create.mockResolvedValue(mockQuote);

      const result = await service.create(mockUser.id, mockCreateQuoteDto);

      expect(quotesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ref: expect.stringMatching(/^DEV-\d{8}-[A-Z0-9]{5}$/),
          user: { connect: { id: mockUser.id } },
          status: QuoteStatus.NEW,
          serviceType: mockCreateQuoteDto.serviceType,
          propertyType: mockCreateQuoteDto.propertyType,
          phone: mockCreateQuoteDto.phone,
          city: mockCreateQuoteDto.city,
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: QuoteStatus.NEW,
            },
          },
        }),
      );
      expect(result).toEqual({ data: mockQuote });
    });

    it('passes all dto fields to repo', async () => {
      quotesRepo.create.mockResolvedValue(mockQuote);

      await service.create(mockUser.id, mockCreateQuoteDto);

      expect(quotesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          surfaceOrRooms: mockCreateQuoteDto.surfaceOrRooms,
          hasElectrical: mockCreateQuoteDto.hasElectrical,
          freeText: mockCreateQuoteDto.freeText,
        }),
      );
    });
  });

  // ─── listByUser ──────────────────────────────────────

  describe('listByUser', () => {
    it('returns paginated quotes from repo', async () => {
      const quotes = [mockQuote];
      quotesRepo.findByUser.mockResolvedValue({ quotes, total: 1 });

      const result = await service.listByUser(mockUser.id, {
        page: 1,
        limit: 20,
      });

      expect(quotesRepo.findByUser).toHaveBeenCalledWith(
        mockUser.id,
        1,
        20,
        undefined,
      );
      expect(result).toEqual({
        data: quotes,
        meta: { total: 1, page: 1, limit: 20 },
      });
    });

    it('applies default pagination when not provided', async () => {
      quotesRepo.findByUser.mockResolvedValue({ quotes: [], total: 0 });

      await service.listByUser(mockUser.id, {});

      expect(quotesRepo.findByUser).toHaveBeenCalledWith(
        mockUser.id,
        1,
        20,
        undefined,
      );
    });
  });

  // ─── getByUuid ───────────────────────────────────────

  describe('getByUuid', () => {
    it('throws NotFoundException when quote not found', async () => {
      quotesRepo.findByUuid.mockResolvedValue(null);

      await expect(service.getByUuid('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns quote when found', async () => {
      quotesRepo.findByUuid.mockResolvedValue(mockQuote);

      const result = await service.getByUuid(mockQuote.uuid);

      expect(result).toEqual({ data: mockQuote });
    });

    it('throws NotFoundException when quote belongs to different user', async () => {
      quotesRepo.findByUuid.mockResolvedValue(mockQuote);

      await expect(
        service.getByUuid(mockQuote.uuid, BigInt(999)),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns quote when userId matches', async () => {
      quotesRepo.findByUuid.mockResolvedValue(mockQuote);

      const result = await service.getByUuid(mockQuote.uuid, mockUser.id);

      expect(result).toEqual({ data: mockQuote });
    });
  });

  // ─── transition ──────────────────────────────────────

  describe('transition', () => {
    it('throws NotFoundException when quote not found', async () => {
      quotesRepo.findByUuid.mockResolvedValue(null);

      await expect(
        service.transition(
          'non-existent-uuid',
          { status: QuoteStatus.CONTACTED },
          BigInt(1),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException for invalid transition (NEW → WON)', async () => {
      quotesRepo.findByUuid.mockResolvedValue({
        ...mockQuote,
        status: QuoteStatus.NEW,
      });

      await expect(
        service.transition(
          mockQuote.uuid,
          { status: QuoteStatus.WON },
          BigInt(1),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid transition (WON → LOST)', async () => {
      quotesRepo.findByUuid.mockResolvedValue({
        ...mockQuote,
        status: QuoteStatus.WON,
      });

      await expect(
        service.transition(
          mockQuote.uuid,
          { status: QuoteStatus.LOST },
          BigInt(1),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('calls updateStatus for valid transition (NEW → CONTACTED)', async () => {
      quotesRepo.findByUuid.mockResolvedValue({
        ...mockQuote,
        status: QuoteStatus.NEW,
      });
      const updatedQuote = { ...mockQuote, status: QuoteStatus.CONTACTED };
      quotesRepo.updateStatus.mockResolvedValue(updatedQuote);

      const result = await service.transition(
        mockQuote.uuid,
        { status: QuoteStatus.CONTACTED },
        BigInt(1),
      );

      expect(quotesRepo.updateStatus).toHaveBeenCalledWith(
        mockQuote.uuid,
        QuoteStatus.CONTACTED,
        BigInt(1),
        QuoteStatus.NEW,
        undefined,
      );
      expect(result).toEqual({ data: updatedQuote });
    });

    it('calls updateStatus for valid transition (OFFER_SENT → WON)', async () => {
      quotesRepo.findByUuid.mockResolvedValue({
        ...mockQuote,
        status: QuoteStatus.OFFER_SENT,
      });
      const updatedQuote = { ...mockQuote, status: QuoteStatus.WON };
      quotesRepo.updateStatus.mockResolvedValue(updatedQuote);

      await service.transition(
        mockQuote.uuid,
        { status: QuoteStatus.WON },
        BigInt(1),
      );

      expect(quotesRepo.updateStatus).toHaveBeenCalledWith(
        mockQuote.uuid,
        QuoteStatus.WON,
        BigInt(1),
        QuoteStatus.OFFER_SENT,
        undefined,
      );
    });

    it('passes note to updateStatus when provided', async () => {
      quotesRepo.findByUuid.mockResolvedValue({
        ...mockQuote,
        status: QuoteStatus.NEW,
      });
      quotesRepo.updateStatus.mockResolvedValue({
        ...mockQuote,
        status: QuoteStatus.CONTACTED,
      });

      await service.transition(
        mockQuote.uuid,
        { status: QuoteStatus.CONTACTED, note: 'Called client' },
        BigInt(1),
      );

      expect(quotesRepo.updateStatus).toHaveBeenCalledWith(
        mockQuote.uuid,
        QuoteStatus.CONTACTED,
        BigInt(1),
        QuoteStatus.NEW,
        'Called client',
      );
    });
  });
});
