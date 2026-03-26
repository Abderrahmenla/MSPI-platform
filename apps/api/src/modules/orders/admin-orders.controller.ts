import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { OrdersService } from './orders.service';
import { ListOrdersDto } from './dto/list-orders.dto';

@Controller('admin/orders')
@UseGuards(AdminAuthGuard)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@Query() query: ListOrdersDto) {
    return this.ordersService.adminList(query);
  }

  @Get(':uuid')
  getOne(@Param('uuid') uuid: string) {
    return this.ordersService.getByUuid(uuid);
  }
}
