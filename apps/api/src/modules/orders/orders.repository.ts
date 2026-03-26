import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrderStatus } from '@prisma/client';
import type { Prisma, PrismaClient } from '@prisma/client';

const withDetails = {
  items: {
    include: {
      product: {
        select: {
          uuid: true,
          slug: true,
          nameAr: true,
          nameFr: true,
          nameEn: true,
          images: { take: 1, orderBy: { position: 'asc' as const } },
        },
      },
    },
  },
  statusHistory: {
    orderBy: { createdAt: 'desc' as const },
    take: 5,
  },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(
    userId: bigint,
    page: number,
    limit: number,
    status?: OrderStatus,
  ) {
    const where: Prisma.OrderWhereInput = { userId };
    if (status) where.status = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: withDetails,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  async findByUuid(uuid: string) {
    return this.prisma.order.findUnique({
      where: { uuid },
      include: withDetails,
    });
  }

  async findAll(page: number, limit: number, status?: OrderStatus) {
    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          ...withDetails,
          user: { select: { uuid: true, name: true, phone: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  async findByIdempotencyKey(key: string) {
    return this.prisma.order.findUnique({
      where: { idempotencyKey: key },
    });
  }

  async create(data: Prisma.OrderCreateInput) {
    return this.prisma.order.create({
      data,
      include: withDetails,
    });
  }

  async updateStatus(
    uuid: string,
    status: OrderStatus,
    adminId?: bigint,
    fromStatus?: OrderStatus,
    note?: string,
  ) {
    return this.prisma.$transaction(
      async (
        tx: Omit<
          PrismaClient,
          | '$connect'
          | '$disconnect'
          | '$on'
          | '$transaction'
          | '$use'
          | '$extends'
        >,
      ) => {
        const order = await tx.order.update({
          where: { uuid },
          data: { status },
          include: withDetails,
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: fromStatus ?? null,
            toStatus: status,
            adminId: adminId ?? null,
            note: note ?? null,
          },
        });

        return order;
      },
    );
  }

  async updateTracking(uuid: string, trackingNumber: string) {
    return this.prisma.order.update({
      where: { uuid },
      data: { trackingNumber },
    });
  }
}
