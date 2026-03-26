import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { Prisma } from '@prisma/client';

@Injectable()
export class NotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.NoteCreateInput) {
    return this.prisma.note.create({
      data,
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findByOrder(orderId: bigint) {
    return this.prisma.note.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async findByQuote(quoteId: bigint) {
    return this.prisma.note.findMany({
      where: { quoteId },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async findByCustomer(customerId: bigint) {
    return this.prisma.note.findMany({
      where: { customerId },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, name: true } } },
    });
  }
}
