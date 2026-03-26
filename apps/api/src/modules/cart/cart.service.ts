import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { ProductsRepository } from '../products/products.repository';
import { CartRepository } from './cart.repository';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async getCart(user: User) {
    const cart = await this.cartRepository.findOrCreateCart(user.id);
    return { data: cart };
  }

  async addItem(user: User, dto: AddCartItemDto) {
    const productId = BigInt(dto.productId);
    const product = await this.productsRepository.findById(productId);

    if (!product || !product.active) {
      throw new NotFoundException('Product not found or unavailable');
    }

    if (product.stock < dto.qty) {
      throw new BadRequestException('Insufficient stock');
    }

    const cart = await this.cartRepository.findOrCreateCart(user.id);
    const existing = await this.cartRepository.findCartItemByProduct(
      cart.id,
      productId,
    );

    if (existing) {
      const newQty = existing.qty + dto.qty;

      if (product.stock < newQty) {
        throw new BadRequestException('Insufficient stock');
      }

      await this.cartRepository.updateItemQty(existing.id, newQty);
    } else {
      await this.cartRepository.addItem(cart.id, productId, dto.qty);
    }

    const updated = await this.cartRepository.getCartWithItems(user.id);
    return { data: updated };
  }

  async updateItem(user: User, itemId: bigint, dto: UpdateCartItemDto) {
    const cart = await this.cartRepository.findOrCreateCart(user.id);
    const item = await this.cartRepository.findCartItem(cart.id, itemId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    const product = await this.productsRepository.findById(item.productId);

    if (!product || !product.active) {
      throw new NotFoundException('Product no longer available');
    }

    if (product.stock < dto.qty) {
      throw new BadRequestException('Insufficient stock');
    }

    await this.cartRepository.updateItemQty(itemId, dto.qty);

    const updated = await this.cartRepository.getCartWithItems(user.id);
    return { data: updated };
  }

  async removeItem(user: User, itemId: bigint) {
    const cart = await this.cartRepository.findOrCreateCart(user.id);
    const item = await this.cartRepository.findCartItem(cart.id, itemId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.deleteItem(itemId);

    const updated = await this.cartRepository.getCartWithItems(user.id);
    return { data: updated };
  }

  async mergeCart(user: User, dto: MergeCartDto) {
    const cart = await this.cartRepository.findOrCreateCart(user.id);
    const skipped: Array<{ productId: number; reason: string }> = [];

    for (const localItem of dto.items) {
      const productId = BigInt(localItem.productId);
      const product = await this.productsRepository.findById(productId);

      if (!product || !product.active) {
        skipped.push({ productId: localItem.productId, reason: 'unavailable' });
        continue;
      }

      if (product.stock < 1) {
        skipped.push({
          productId: localItem.productId,
          reason: 'out_of_stock',
        });
        continue;
      }

      const existing = await this.cartRepository.findCartItemByProduct(
        cart.id,
        productId,
      );

      if (existing) {
        // Server wins — keep existing qty
        continue;
      }

      const safeQty = Math.min(localItem.qty, product.stock);
      await this.cartRepository.addItem(cart.id, productId, safeQty);
    }

    const updated = await this.cartRepository.getCartWithItems(user.id);
    return { cart: updated, skipped };
  }
}
