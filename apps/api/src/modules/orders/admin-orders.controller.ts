import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { OrdersService } from './orders.service';
import { ListOrdersDto } from './dto/list-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

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

  @Patch(':uuid/status')
  updateStatus(
    @Request() req: { user: { id: bigint } },
    @Param('uuid') uuid: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.transition(uuid, dto, req.user.id);
  }
}
