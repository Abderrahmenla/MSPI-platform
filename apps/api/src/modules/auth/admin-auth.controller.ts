import { Body, Controller, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // Tighter per-route limit: 10 attempts per 60 s per IP.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  async login(
    @Body() dto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const admin = await this.authService.validateAdmin(dto.email, dto.password);

    const token = this.authService.generateAdminJwt(admin.uuid, admin.role);

    // secure: true everywhere except local dev to prevent cookie leakage in
    // staging/CI. NODE_ENV=local is the only explicit opt-out.
    const secure = this.configService.get('NODE_ENV') !== 'local';

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 60 min
      path: '/',
    });

    return {
      name: admin.name,
      role: admin.role,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const secure = this.configService.get('NODE_ENV') !== 'local';
    res.clearCookie('admin_token', {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/',
    });
    return { message: 'Logged out' };
  }
}
