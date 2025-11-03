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
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!idToken) {
      throw new UnauthorizedException('ID token is required');
    }

    const decodedToken = await this.authService.verifyIdToken(idToken);
    const { accessToken, user } =
      await this.authService.createAccessTokenAndUser(decodedToken.uid);

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    };

    console.log('Setting cookie with options:', cookieOptions);
    res.cookie('accessToken', accessToken, cookieOptions);

    return {
      user: {
        email: user.email,
        name: user.name,
      },
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
  logout(@Res({ passthrough: true }) res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });
    return { message: 'Logged out successfully' };
  }
}
