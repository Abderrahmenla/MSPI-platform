import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';

@Controller('admin/notes')
@UseGuards(AdminAuthGuard)
export class AdminNotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Request() req: { user: { id: bigint } }, @Body() dto: CreateNoteDto) {
    return this.notesService.create(req.user.id, dto);
  }

  @Get('by-order/:uuid')
  listByOrder(@Param('uuid') uuid: string) {
    return this.notesService.listByOrder(uuid);
  }

  @Get('by-quote/:uuid')
  listByQuote(@Param('uuid') uuid: string) {
    return this.notesService.listByQuote(uuid);
  }

  @Get('by-customer/:uuid')
  listByCustomer(@Param('uuid') uuid: string) {
    return this.notesService.listByCustomer(uuid);
  }
}
