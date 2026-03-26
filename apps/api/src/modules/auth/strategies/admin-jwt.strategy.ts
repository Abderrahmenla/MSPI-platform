import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import type { Admin } from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';

// Cache TTL: 15s — a deactivated admin remains authorized for at most this
// duration after deactivation. Accepted MVP tradeoff (see TODOS.md TODO-009).
const CACHE_TTL_MS = 15_000;

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  // Keyed by admin ID string; entries expire after CACHE_TTL_MS.
  private readonly cache = new Map<
    string,
    { admin: Admin; expiresAt: number }
  >();

  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.admin_token ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ADMIN_SECRET'),
    });
  }

  async validate(payload: { sub: string; type: string; role: string }) {
    if (payload.type !== 'admin') {
      throw new UnauthorizedException('Invalid token type');
    }

    let adminId: bigint;
    try {
      adminId = BigInt(payload.sub);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const cached = this.cache.get(payload.sub);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.admin;
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    if (!admin.active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    this.cache.set(payload.sub, {
      admin,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return admin;
  }
}
