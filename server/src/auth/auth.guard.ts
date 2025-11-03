import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = request.cookies?.accessToken;
    
    console.log('Auth guard check:', {
      hasCookies: !!request.cookies,
      cookieKeys: request.cookies ? Object.keys(request.cookies) : [],
      hasAccessToken: !!accessToken,
      headers: {
        cookie: request.headers.cookie,
        origin: request.headers.origin,
      },
    });

    if (!accessToken) {
      throw new UnauthorizedException('No access token provided');
    }

    try {
      const user = await this.authService.verifyAccessToken(accessToken);
      request['user'] = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}

