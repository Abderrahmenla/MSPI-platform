import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsDto } from './dto/list-products.dto';

@Controller('admin/products')
@UseGuards(AdminAuthGuard)
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  listAll(@Query() dto: ListProductsDto) {
    return this.productsService.listAll(dto);
  }

  @Get(':uuid')
  getByUuid(@Param('uuid') uuid: string) {
    return this.productsService.getByUuid(uuid);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(uuid, dto);
  }

  @Delete(':uuid')
  deactivate(@Param('uuid') uuid: string) {
    return this.productsService.deactivate(uuid);
  }
}
