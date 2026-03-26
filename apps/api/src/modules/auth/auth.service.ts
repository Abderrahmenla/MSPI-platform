import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../database/prisma.service';

interface FacebookProfile {
  id: string;
  displayName: string;
  emails?: Array<{ value: string }>;
}

interface CustomerJwtPayload {
  sub: string;
  type: 'customer';
}

interface AdminJwtPayload {
  sub: string;
  type: 'admin';
  role: string;
}

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateFacebookUser(profile: FacebookProfile) {
    const email = profile.emails?.[0]?.value ?? null;

    const user = await this.prisma.user.upsert({
      where: { facebookId: profile.id },
      update: {
        name: profile.displayName,
        ...(email ? { email } : {}),
      },
      create: {
        facebookId: profile.id,
        name: profile.displayName,
        email,
      },
    });

    this.logger.log(`Facebook user authenticated: ${user.uuid} (${user.name})`);

    return user;
  }

  generateCustomerJwt(userUuid: string): string {
    const payload: CustomerJwtPayload = {
      sub: userUuid,
      type: 'customer',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_CUSTOMER_EXPIRY') ??
        '24h') as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });
  }

  async validateAdmin(
    email: string,
    password: string,
  ): Promise<{ uuid: string; name: string; role: string }> {
    const admin = await this.prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      // No lockout tracking for non-existent accounts; rely on throttler.
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check DB-persisted lockout (survives restarts and multiple instances).
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const remainingMs = admin.lockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      throw new UnauthorizedException(
        `Account locked. Try again in ${remainingMin} minute(s)`,
      );
    }

    if (!admin.active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      // Atomic read-then-write in a transaction to prevent race-condition
      // brute-force bypass when concurrent requests increment the counter.
      await this.prisma.$transaction(async (tx) => {
        const fresh = await tx.admin.findUnique({
          where: { id: admin.id },
          select: { failedAttempts: true },
        });
        const newCount = (fresh?.failedAttempts ?? 0) + 1;
        await tx.admin.update({
          where: { id: admin.id },
          data: {
            failedAttempts: newCount,
            lockedUntil:
              newCount >= LOCKOUT_THRESHOLD
                ? new Date(Date.now() + LOCKOUT_WINDOW_MS)
                : null,
          },
        });
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    this.logger.log(`Admin authenticated: id=${admin.id} role=${admin.role}`);

    return {
      uuid: `${admin.id}`,
      name: admin.name,
      role: admin.role,
    };
  }

  generateAdminJwt(adminId: string, role: string): string {
    const payload: AdminJwtPayload = {
      sub: adminId,
      type: 'admin',
      role,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ADMIN_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_ADMIN_EXPIRY') ??
        '60m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });
  }
}
