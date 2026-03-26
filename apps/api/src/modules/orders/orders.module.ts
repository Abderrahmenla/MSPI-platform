import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CartModule } from '../cart/cart.module';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AdminOrdersController } from './admin-orders.controller';

@Module({
  imports: [DatabaseModule, CartModule],
  providers: [OrdersRepository, OrdersService],
  controllers: [OrdersController, AdminOrdersController],
  exports: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
