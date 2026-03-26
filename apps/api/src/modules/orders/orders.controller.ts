import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersDto } from './dto/list-orders.dto';

@Controller('customer/orders')
@UseGuards(CustomerAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Request() req: { user: { id: bigint } },
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createFromCart(req.user.id, dto);
  }

  @Get()
  list(
    @Request() req: { user: { id: bigint } },
    @Query() query: ListOrdersDto,
  ) {
    return this.ordersService.listByUser(req.user.id, query);
  }

  @Get(':uuid')
  getOne(
    @Request() req: { user: { id: bigint } },
    @Param('uuid') uuid: string,
  ) {
    return this.ordersService.getByUuid(uuid, req.user.id);
  }
}
