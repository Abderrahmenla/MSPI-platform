import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { QuoteStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

const withHistory = {
  statusHistory: {
    orderBy: { createdAt: 'desc' as const },
    take: 10,
  },
} satisfies Prisma.QuoteInclude;

@Injectable()
export class QuotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(
    userId: bigint,
    page: number,
    limit: number,
    status?: QuoteStatus,
  ) {
    const where: Prisma.QuoteWhereInput = { userId };
    if (status) where.status = status;

    const skip = (page - 1) * limit;
    const [quotes, total] = await this.prisma.$transaction([
      this.prisma.quote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: withHistory,
      }),
      this.prisma.quote.count({ where }),
    ]);

    return { quotes, total };
  }

  async findByUuid(uuid: string) {
    return this.prisma.quote.findUnique({
      where: { uuid },
      include: withHistory,
    });
  }

  async findAll(page: number, limit: number, status?: QuoteStatus) {
    const where: Prisma.QuoteWhereInput = {};
    if (status) where.status = status;

    const skip = (page - 1) * limit;
    const [quotes, total] = await this.prisma.$transaction([
      this.prisma.quote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          ...withHistory,
          user: { select: { uuid: true, name: true, phone: true } },
        },
      }),
      this.prisma.quote.count({ where }),
    ]);

    return { quotes, total };
  }

  async create(data: Prisma.QuoteCreateInput) {
    return this.prisma.quote.create({
      data,
      include: withHistory,
    });
  }

  async updateStatus(
    uuid: string,
    status: QuoteStatus,
    adminId: bigint,
    fromStatus?: QuoteStatus,
    note?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const quote = await tx.quote.update({
        where: { uuid },
        data: { status },
        include: withHistory,
      });

      await tx.quoteStatusHistory.create({
        data: {
          quoteId: quote.id,
          fromStatus: fromStatus ?? null,
          toStatus: status,
          adminId,
          note: note ?? null,
        },
      });

      return quote;
    });
  }
}
