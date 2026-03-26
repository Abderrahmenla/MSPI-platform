import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';

// Only allow same-origin relative paths to prevent open redirect attacks.
function safeRedirect(url: string | undefined, fallback: string): string {
  if (url && url.startsWith('/') && !url.startsWith('//')) {
    return `${fallback}${url}`;
  }
  return fallback;
}

@Controller('auth/facebook')
export class FacebookAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(FacebookAuthGuard)
  facebookLogin() {
    // Guard redirects to Facebook
  }

  @Get('callback')
  @UseGuards(FacebookAuthGuard)
  facebookCallback(
    @Req() req: { user: { uuid: string } },
    @Res() res: Response,
    @Query('state') returnUrl?: string,
  ) {
    const token = this.authService.generateCustomerJwt(req.user.uuid);
    const webUrl = this.configService.get<string>(
      'WEB_URL',
      'http://localhost:3000',
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24h
      path: '/',
    });

    res.redirect(safeRedirect(returnUrl, webUrl));
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', { path: '/' });
    return { message: 'Logged out' };
  }
}
