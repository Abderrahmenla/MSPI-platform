import { Injectable, NotFoundException } from '@nestjs/common';

import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsDto } from './dto/list-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  // ─── Public ─────────────────────────────────────────

  async listPublic(dto: ListProductsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 24;

    const { items, total } = await this.productsRepository.findActiveProducts({
      page,
      limit,
      category: dto.category,
      search: dto.search,
    });

    return { data: items, meta: { total, page, limit } };
  }

  async getBySlug(slug: string) {
    const product = await this.productsRepository.findBySlug(slug);

    if (!product || !product.active) {
      throw new NotFoundException('Product not found');
    }

    return { data: product };
  }

  async getStock(slug: string) {
    const product = await this.productsRepository.findBySlug(slug);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return { stock: product.stock, active: product.active };
  }

  // ─── Admin ──────────────────────────────────────────

  async listAll(dto: ListProductsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 24;

    const { items, total } = await this.productsRepository.findAllProducts({
      page,
      limit,
      category: dto.category,
      search: dto.search,
    });

    return { data: items, meta: { total, page, limit } };
  }

  async getByUuid(uuid: string) {
    const product = await this.productsRepository.findByUuid(uuid);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return { data: product };
  }

  async create(dto: CreateProductDto) {
    const product = await this.productsRepository.create(dto);
    return { data: product };
  }

  async update(uuid: string, dto: UpdateProductDto) {
    const existing = await this.productsRepository.findByUuid(uuid);

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const updated = await this.productsRepository.update(uuid, dto);
    return { data: updated };
  }

  async deactivate(uuid: string) {
    const existing = await this.productsRepository.findByUuid(uuid);

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    await this.productsRepository.deactivate(uuid);
    return { deactivated: true };
  }
}
