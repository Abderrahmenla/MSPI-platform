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
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { ListQuotesDto } from './dto/list-quotes.dto';

@Controller('customer/quotes')
@UseGuards(CustomerAuthGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  create(
    @Request() req: { user: { id: bigint } },
    @Body() dto: CreateQuoteDto,
  ) {
    return this.quotesService.create(req.user.id, dto);
  }

  @Get()
  list(
    @Request() req: { user: { id: bigint } },
    @Query() query: ListQuotesDto,
  ) {
    return this.quotesService.listByUser(req.user.id, query);
  }

  @Get(':uuid')
  getOne(
    @Request() req: { user: { id: bigint } },
    @Param('uuid') uuid: string,
  ) {
    return this.quotesService.getByUuid(uuid, req.user.id);
  }
}
