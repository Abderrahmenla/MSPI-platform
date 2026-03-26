import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(opts: { page: number; limit: number; search?: string }) {
    const where: Prisma.UserWhereInput = opts.search
      ? {
          OR: [
            {
              name: {
                contains: opts.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              email: {
                contains: opts.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    const skip = (opts.page - 1) * opts.limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: opts.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { orders: true, quotes: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { total, page: opts.page, limit: opts.limit } };
  }

  async findByUuid(uuid: string) {
    return this.prisma.user.findUnique({
      where: { uuid },
      include: {
        _count: { select: { orders: true, quotes: true } },
      },
    });
  }
}
