import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { QuoteStatus } from '@prisma/client';
import { QuotesRepository } from './quotes.repository';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { ListQuotesDto } from './dto/list-quotes.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';

const VALID_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  [QuoteStatus.NEW]: [
    QuoteStatus.CONTACTED,
    QuoteStatus.LOST,
    QuoteStatus.EXPIRED,
  ],
  [QuoteStatus.CONTACTED]: [
    QuoteStatus.OFFER_SENT,
    QuoteStatus.LOST,
    QuoteStatus.EXPIRED,
  ],
  [QuoteStatus.OFFER_SENT]: [
    QuoteStatus.WON,
    QuoteStatus.LOST,
    QuoteStatus.EXPIRED,
  ],
  [QuoteStatus.WON]: [],
  [QuoteStatus.LOST]: [],
  [QuoteStatus.EXPIRED]: [],
};

function generateRef(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `DEV-${date}-${rand}`;
}

@Injectable()
export class QuotesService {
  constructor(private readonly quotesRepo: QuotesRepository) {}

  async create(userId: bigint, dto: CreateQuoteDto) {
    const ref = generateRef();

    const quote = await this.quotesRepo.create({
      ref,
      user: { connect: { id: userId } },
      status: QuoteStatus.NEW,
      serviceType: dto.serviceType,
      propertyType: dto.propertyType,
      surfaceOrRooms: dto.surfaceOrRooms,
      hasElectrical: dto.hasElectrical,
      freeText: dto.freeText,
      phone: dto.phone,
      city: dto.city,
      statusHistory: {
        create: {
          fromStatus: null,
          toStatus: QuoteStatus.NEW,
        },
      },
    });

    return { data: quote };
  }

  async listByUser(userId: bigint, dto: ListQuotesDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const { quotes, total } = await this.quotesRepo.findByUser(
      userId,
      page,
      limit,
      dto.status,
    );
    return { data: quotes, meta: { total, page, limit } };
  }

  async getByUuid(uuid: string, userId?: bigint) {
    const quote = await this.quotesRepo.findByUuid(uuid);
    if (!quote) throw new NotFoundException('Quote not found');
    if (userId && quote.userId !== userId) {
      throw new NotFoundException('Quote not found');
    }
    return { data: quote };
  }

  async adminList(dto: ListQuotesDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const { quotes, total } = await this.quotesRepo.findAll(
      page,
      limit,
      dto.status,
    );
    return { data: quotes, meta: { total, page, limit } };
  }

  async transition(uuid: string, dto: UpdateQuoteStatusDto, adminId: bigint) {
    const quote = await this.quotesRepo.findByUuid(uuid);
    if (!quote) throw new NotFoundException('Quote not found');

    const allowed = VALID_TRANSITIONS[quote.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${quote.status} to ${dto.status}`,
      );
    }

    const updated = await this.quotesRepo.updateStatus(
      uuid,
      dto.status,
      adminId,
      quote.status,
      dto.note,
    );

    return { data: updated };
  }
}
