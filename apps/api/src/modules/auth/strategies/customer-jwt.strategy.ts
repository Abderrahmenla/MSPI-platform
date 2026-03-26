import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import type { User } from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';

// Cache TTL: 15s reduces DB load for repeat requests on the same session.
const CACHE_TTL_MS = 15_000;

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(
  Strategy,
  'customer-jwt',
) {
  // Keyed by user UUID; entries expire after CACHE_TTL_MS.
  private readonly cache = new Map<string, { user: User; expiresAt: number }>();

  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.token ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; type: string }) {
    if (payload.type !== 'customer') {
      throw new UnauthorizedException('Invalid token type');
    }

    const cached = this.cache.get(payload.sub);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.user;
    }

    const user = await this.prisma.user.findUnique({
      where: { uuid: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.cache.set(payload.sub, { user, expiresAt: Date.now() + CACHE_TTL_MS });
    return user;
  }
}
