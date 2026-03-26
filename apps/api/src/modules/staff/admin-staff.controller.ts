import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';

@Controller('admin/staff')
@UseGuards(AdminAuthGuard)
export class AdminStaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  list() {
    return this.staffService.list();
  }

  @Post()
  create(@Body() dto: CreateStaffDto) {
    return this.staffService.create(dto);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.staffService.deactivate(BigInt(id));
  }

  @Patch(':id/reactivate')
  reactivate(@Param('id') id: string) {
    return this.staffService.reactivate(BigInt(id));
  }
}
