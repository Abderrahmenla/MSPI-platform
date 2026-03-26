import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { StaffRepository } from './staff.repository';
import { StaffService } from './staff.service';
import { AdminStaffController } from './admin-staff.controller';

@Module({
  imports: [DatabaseModule],
  providers: [StaffRepository, StaffService],
  controllers: [AdminStaffController],
})
export class StaffModule {}
