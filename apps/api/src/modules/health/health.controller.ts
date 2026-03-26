import { Controller, Get } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const timestamp = new Date().toISOString();

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp,
        db: 'connected',
      };
    } catch {
      return {
        status: 'error',
        timestamp,
        db: 'disconnected',
      };
    }
  }
}
