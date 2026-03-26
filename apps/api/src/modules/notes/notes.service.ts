import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotesRepository } from './notes.repository';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NotesService {
  constructor(
    private readonly notesRepo: NotesRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(adminId: bigint, dto: CreateNoteDto) {
    const { orderUuid, quoteUuid, customerUuid } = dto;
    const contextCount = [orderUuid, quoteUuid, customerUuid].filter(
      Boolean,
    ).length;

    if (contextCount === 0) {
      throw new BadRequestException(
        'Note must be attached to an order, quote, or customer',
      );
    }
    if (contextCount > 1) {
      throw new BadRequestException(
        'Note can only be attached to one context at a time',
      );
    }

    let orderId: bigint | undefined;
    let quoteId: bigint | undefined;
    let customerId: bigint | undefined;

    if (orderUuid) {
      const order = await this.prisma.order.findUnique({
        where: { uuid: orderUuid },
      });
      if (!order) throw new NotFoundException('Order not found');
      orderId = order.id;
    } else if (quoteUuid) {
      const quote = await this.prisma.quote.findUnique({
        where: { uuid: quoteUuid },
      });
      if (!quote) throw new NotFoundException('Quote not found');
      quoteId = quote.id;
    } else if (customerUuid) {
      const user = await this.prisma.user.findUnique({
        where: { uuid: customerUuid },
      });
      if (!user) throw new NotFoundException('Customer not found');
      customerId = user.id;
    }

    const note = await this.notesRepo.create({
      body: dto.body,
      author: { connect: { id: adminId } },
      ...(orderId && { order: { connect: { id: orderId } } }),
      ...(quoteId && { quote: { connect: { id: quoteId } } }),
      ...(customerId && { customer: { connect: { id: customerId } } }),
    });

    return { data: note };
  }

  async listByOrder(orderUuid: string) {
    const order = await this.prisma.order.findUnique({
      where: { uuid: orderUuid },
    });
    if (!order) throw new NotFoundException('Order not found');
    const notes = await this.notesRepo.findByOrder(order.id);
    return { data: notes };
  }

  async listByQuote(quoteUuid: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { uuid: quoteUuid },
    });
    if (!quote) throw new NotFoundException('Quote not found');
    const notes = await this.notesRepo.findByQuote(quote.id);
    return { data: notes };
  }

  async listByCustomer(customerUuid: string) {
    const user = await this.prisma.user.findUnique({
      where: { uuid: customerUuid },
    });
    if (!user) throw new NotFoundException('Customer not found');
    const notes = await this.notesRepo.findByCustomer(user.id);
    return { data: notes };
  }
}
