import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CustomersRepository } from './customers.repository';
import { CustomersService } from './customers.service';
import { AdminCustomersController } from './admin-customers.controller';

@Module({
  imports: [DatabaseModule],
  providers: [CustomersRepository, CustomersService],
  controllers: [AdminCustomersController],
})
export class CustomersModule {}
