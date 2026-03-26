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

// Only allow safe relative paths to prevent open redirect and path-traversal.
// Rejects: absolute URLs, protocol-relative (//), paths with .. segments,
// null bytes, and paths exceeding a reasonable length.
function safeRedirect(url: string | undefined, fallback: string): string {
  if (!url) return fallback;

  // Reject non-relative, protocol-relative, or suspiciously long paths.
  if (!url.startsWith('/') || url.startsWith('//') || url.length > 256) {
    return fallback;
  }

  // Decode percent-encoding before checking for traversal sequences.
  let decoded: string;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    return fallback;
  }

  // Reject null bytes and path-traversal segments.
  if (decoded.includes('\0') || decoded.split('/').includes('..')) {
    return fallback;
  }

  return `${fallback}${url}`;
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

    const secure = this.configService.get('NODE_ENV') !== 'local';

    res.cookie('token', token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24h
      path: '/',
    });

    res.redirect(safeRedirect(returnUrl, webUrl));
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const secure = this.configService.get('NODE_ENV') !== 'local';
    res.clearCookie('token', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
    });
    return { message: 'Logged out' };
  }
}
