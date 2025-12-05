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
    // ========================================
    // 1) Allow @Public() routes
    // ========================================
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic === true) {
      return true;
    }

    // ========================================
    // 2) Safely extract request
    // ========================================
    const http = context.switchToHttp();
    const ws = context.switchToWs();

    const httpReq = http.getRequest && http.getRequest();
    const wsClient = ws.getClient && ws.getClient();

    const req: any = httpReq || wsClient;

    if (!req) {
      // non-HTTP/non-WS context, reject
      throw new UnauthorizedException('Authentication required');
    }

    // ========================================
    // 3) Accept both Firebase/JWT session
    // ========================================
    if (req.user) {
      return true;
    }

    // ========================================
    // 4) Accept access-token cookie
    // ========================================
    // access token is stored in cookie
    // req.cookies['phl_access'] (default)
    const cookies = req.cookies || {};

    const accessToken =
      cookies[process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access'];

    if (accessToken) {
      // token exists, allow; validation is done in downstream guards
      return true;
    }

    throw new UnauthorizedException('Authentication required');
  }
}
