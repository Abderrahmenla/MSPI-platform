import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CustomersService } from './customers.service';
import { ListCustomersDto } from './dto/list-customers.dto';

@Controller('admin/customers')
@UseGuards(AdminAuthGuard)
export class AdminCustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  list(@Query() query: ListCustomersDto) {
    return this.customersService.list(query);
  }

  @Get(':uuid')
  getByUuid(@Param('uuid') uuid: string) {
    return this.customersService.getByUuid(uuid);
  }
}
