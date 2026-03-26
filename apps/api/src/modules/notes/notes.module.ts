import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { NotesRepository } from './notes.repository';
import { NotesService } from './notes.service';
import { AdminNotesController } from './admin-notes.controller';

@Module({
  imports: [DatabaseModule],
  providers: [NotesRepository, NotesService],
  controllers: [AdminNotesController],
  exports: [NotesService],
})
export class NotesModule {}
