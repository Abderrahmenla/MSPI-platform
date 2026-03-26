import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';

const withImages = {
  images: { orderBy: { position: 'asc' as const } },
};

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Public ─────────────────────────────────────────

  async findActiveProducts(opts: {
    page: number;
    limit: number;
    category?: string;
    search?: string;
  }) {
    const where = this.buildWhere({ ...opts, activeOnly: true });
    const skip = (opts.page - 1) * opts.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: opts.limit,
        include: withImages,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  async findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: withImages,
    });
  }

  async findById(id: bigint) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  // ─── Admin ──────────────────────────────────────────

  async findAllProducts(opts: {
    page: number;
    limit: number;
    category?: string;
    search?: string;
  }) {
    const where = this.buildWhere(opts);
    const skip = (opts.page - 1) * opts.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: opts.limit,
        include: withImages,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  async findByUuid(uuid: string) {
    return this.prisma.product.findUnique({
      where: { uuid },
      include: withImages,
    });
  }

  async create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data });
  }

  async update(uuid: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({ where: { uuid }, data });
  }

  async deactivate(uuid: string) {
    return this.prisma.product.update({
      where: { uuid },
      data: { active: false },
    });
  }

  // ─── Private ─────────────────────────────────────────

  private buildWhere(opts: {
    activeOnly?: boolean;
    category?: string;
    search?: string;
  }): Prisma.ProductWhereInput {
    return {
      ...(opts.activeOnly ? { active: true } : {}),
      ...(opts.category ? { category: opts.category } : {}),
      ...(opts.search
        ? {
            OR: [
              {
                nameAr: {
                  contains: opts.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                nameFr: {
                  contains: opts.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                nameEn: {
                  contains: opts.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    };
  }
}
