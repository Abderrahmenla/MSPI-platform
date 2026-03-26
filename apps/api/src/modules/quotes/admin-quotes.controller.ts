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
import { QuotesService } from './quotes.service';
import { ListQuotesDto } from './dto/list-quotes.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';

@Controller('admin/quotes')
@UseGuards(AdminAuthGuard)
export class AdminQuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  list(@Query() query: ListQuotesDto) {
    return this.quotesService.adminList(query);
  }

  @Get(':uuid')
  getOne(@Param('uuid') uuid: string) {
    return this.quotesService.getByUuid(uuid);
  }

  @Patch(':uuid/status')
  updateStatus(
    @Request() req: { user: { id: bigint } },
    @Param('uuid') uuid: string,
    @Body() dto: UpdateQuoteStatusDto,
  ) {
    return this.quotesService.transition(uuid, dto, req.user.id);
  }
}
