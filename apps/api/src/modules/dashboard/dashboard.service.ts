import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrderStatus, QuoteStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const [
      orderTotal,
      orderPending,
      orderConfirmed,
      orderShipped,
      orderDelivered,
      orderCancelled,
      orderTodayCount,
      quoteTotal,
      quoteNew,
      quoteContacted,
      quoteOfferSent,
      quoteWon,
      quoteLost,
      customerTotal,
      customerNewThisMonth,
      revenueTotal,
      revenueThisMonth,
    ] = await this.prisma.$transaction([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { status: OrderStatus.CONFIRMED } }),
      this.prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
      this.prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      this.prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
      this.prisma.order.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      this.prisma.quote.count(),
      this.prisma.quote.count({ where: { status: QuoteStatus.NEW } }),
      this.prisma.quote.count({ where: { status: QuoteStatus.CONTACTED } }),
      this.prisma.quote.count({ where: { status: QuoteStatus.OFFER_SENT } }),
      this.prisma.quote.count({ where: { status: QuoteStatus.WON } }),
      this.prisma.quote.count({ where: { status: QuoteStatus.LOST } }),
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: OrderStatus.DELIVERED },
      }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: OrderStatus.DELIVERED,
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    return {
      orders: {
        total: orderTotal,
        pending: orderPending,
        confirmed: orderConfirmed,
        shipped: orderShipped,
        delivered: orderDelivered,
        cancelled: orderCancelled,
        todayCount: orderTodayCount,
      },
      quotes: {
        total: quoteTotal,
        new: quoteNew,
        contacted: quoteContacted,
        offerSent: quoteOfferSent,
        won: quoteWon,
        lost: quoteLost,
      },
      customers: {
        total: customerTotal,
        newThisMonth: customerNewThisMonth,
      },
      revenue: {
        total: Number(revenueTotal._sum.total ?? 0),
        thisMonth: Number(revenueThisMonth._sum.total ?? 0),
      },
    };
  }
}
