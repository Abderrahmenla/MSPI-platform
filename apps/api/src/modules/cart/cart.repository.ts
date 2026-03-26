import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

const cartWithItems = {
  items: {
    include: {
      product: {
        include: { images: { orderBy: { position: 'asc' as const } } },
      },
    },
  },
};

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateCart(userId: bigint) {
    const existing = await this.prisma.cart.findUnique({
      where: { userId },
      include: cartWithItems,
    });

    if (existing) return existing;

    return this.prisma.cart.create({
      data: { userId },
      include: cartWithItems,
    });
  }

  async findCart(userId: bigint) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: cartWithItems,
    });
  }

  async findCartItem(cartId: bigint, itemId: bigint) {
    return this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
    });
  }

  async findCartItemByProduct(cartId: bigint, productId: bigint) {
    return this.prisma.cartItem.findFirst({
      where: { cartId, productId },
    });
  }

  async addItem(cartId: bigint, productId: bigint, qty: number) {
    return this.prisma.cartItem.create({
      data: { cartId, productId, qty },
    });
  }

  async updateItemQty(itemId: bigint, qty: number) {
    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { qty },
    });
  }

  async deleteItem(itemId: bigint) {
    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  async getCartWithItems(userId: bigint) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: cartWithItems,
    });
  }
}
