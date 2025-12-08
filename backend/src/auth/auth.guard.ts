// ==============================
// file: src/auth/auth.guard.ts
// ==============================

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic === true) {
      return true;
    }

    const http = context.switchToHttp();
    const ws = context.switchToWs();

    const httpReq = http.getRequest && http.getRequest();
    const wsClient = ws.getClient && ws.getClient();

    const req: any = httpReq || wsClient;

    if (!req) {
      throw new UnauthorizedException('Authentication required');
    }

    if (req.user) {
      return true;
    }

    const cookies = req.cookies || {};
    const accessToken =
      cookies[process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access'];

    if (accessToken) {
      return true;
    }

    // --------------------------------------------------------------
    // Added for logout authentication checking via JWT cookie
    // --------------------------------------------------------------
    const logoutCookieName =
      process.env.JWT_COOKIE_NAME || 'phlyphant_token';
    const logoutToken = cookies[logoutCookieName];

    if (logoutToken) {
      return true;
    }
    // --------------------------------------------------------------

    throw new UnauthorizedException('Authentication required');
  }
}
