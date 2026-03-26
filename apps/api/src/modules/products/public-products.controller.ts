import { Controller, Get, Param, Query } from '@nestjs/common';

import { ProductsService } from './products.service';
import { ListProductsDto } from './dto/list-products.dto';

@Controller('products')
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Query() dto: ListProductsDto) {
    return this.productsService.listPublic(dto);
  }

  // stock route before :slug to avoid route shadowing
  @Get(':slug/stock')
  getStock(@Param('slug') slug: string) {
    return this.productsService.getStock(slug);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.productsService.getBySlug(slug);
  }
}
