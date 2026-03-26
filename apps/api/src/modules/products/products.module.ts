import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';
import { PublicProductsController } from './public-products.controller';
import { AdminProductsController } from './admin-products.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [PublicProductsController, AdminProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
