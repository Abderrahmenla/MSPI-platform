import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { ProductsModule } from '../products/products.module';
import { CartRepository } from './cart.repository';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

@Module({
  imports: [DatabaseModule, ProductsModule],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService, CartRepository],
})
export class CartModule {}
