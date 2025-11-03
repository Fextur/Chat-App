import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body('idToken') idToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!idToken) {
      throw new UnauthorizedException('ID token is required');
    }

    const decodedToken = await this.authService.verifyIdToken(idToken);
    const { accessToken, user } =
      await this.authService.createAccessTokenAndUser(decodedToken.uid);

    const isHTTPS =
      req.protocol === 'https' || req.get('x-forwarded-proto') === 'https';
    const userAgent = req.get('user-agent') || '';
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isHTTPS,
      sameSite: (isHTTPS ? 'none' : 'lax') as 'none' | 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      user: {
        email: user.email,
        name: user.name,
      },
      ...(isSafari && { accessToken }),
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: Request) {
    const user = req['user'];
    return {
      user: {
        email: user.email,
        name: user.name || user.email?.split('@')[0] || 'User',
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const isHTTPS =
      req.protocol === 'https' || req.get('x-forwarded-proto') === 'https';
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isHTTPS,
      sameSite: (isHTTPS ? 'none' : 'lax') as 'none' | 'lax',
      path: '/',
    });
    return { message: 'Logged out successfully' };
  }
}
