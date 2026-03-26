import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { QuotesRepository } from './quotes.repository';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { AdminQuotesController } from './admin-quotes.controller';

@Module({
  imports: [DatabaseModule],
  providers: [QuotesRepository, QuotesService],
  controllers: [QuotesController, AdminQuotesController],
  exports: [QuotesService, QuotesRepository],
})
export class QuotesModule {}
