import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CartRepository } from '../cart/cart.repository';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, type PrismaClient, Prisma } from '@prisma/client';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

function generateRef(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ORD-${date}-${rand}`;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepo: OrdersRepository,
    private readonly cartRepo: CartRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createFromCart(userId: bigint, dto: CreateOrderDto) {
    // Idempotency guard
    const existing = await this.ordersRepo.findByIdempotencyKey(
      dto.idempotencyKey,
    );
    if (existing) {
      return existing;
    }

    // Fetch cart
    const cart = await this.cartRepo.getCartWithItems(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate all items in stock
    const oosItems = cart.items.filter(
      (item) => !item.product.active || item.product.stock < item.qty,
    );
    if (oosItems.length > 0) {
      throw new UnprocessableEntityException(
        `Some items are unavailable or out of stock`,
      );
    }

    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.qty,
      0,
    );

    const ref = generateRef();

    // Create order in transaction
    type TxClient = Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >;
    const order = await this.prisma.$transaction(async (tx: TxClient) => {
      const created = await tx.order.create({
        data: {
          ref,
          userId,
          phone: dto.phone,
          addressSnapshot: dto.address as unknown as Prisma.InputJsonValue,
          total,
          idempotencyKey: dto.idempotencyKey,
          status: OrderStatus.PENDING,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              qty: item.qty,
              price: item.product.price,
            })),
          },
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: OrderStatus.PENDING,
            },
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  uuid: true,
                  slug: true,
                  nameAr: true,
                  nameFr: true,
                  nameEn: true,
                  images: { take: 1, orderBy: { position: 'asc' } },
                },
              },
            },
          },
        },
      });

      // Decrement stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    return order;
  }

  async listByUser(userId: bigint, dto: ListOrdersDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const { orders, total } = await this.ordersRepo.findByUser(
      userId,
      page,
      limit,
      dto.status,
    );

    return {
      data: orders,
      meta: { total, page, limit },
    };
  }

  async getByUuid(uuid: string, userId?: bigint) {
    const order = await this.ordersRepo.findByUuid(uuid);
    if (!order) throw new NotFoundException('Order not found');
    if (userId && order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }
    return { data: order };
  }

  async adminList(dto: ListOrdersDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const { orders, total } = await this.ordersRepo.findAll(
      page,
      limit,
      dto.status,
    );
    return { data: orders, meta: { total, page, limit } };
  }

  async transition(uuid: string, dto: UpdateOrderStatusDto, adminId: bigint) {
    const order = await this.ordersRepo.findByUuid(uuid);
    if (!order) throw new NotFoundException('Order not found');

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${dto.status}`,
      );
    }

    const updated = await this.ordersRepo.updateStatus(
      uuid,
      dto.status,
      adminId,
      order.status,
      dto.note,
    );

    if (dto.trackingNumber) {
      await this.ordersRepo.updateTracking(uuid, dto.trackingNumber);
    }

    return { data: updated };
  }
}
