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
    // 1) Allow @Public() routes properly
    // ========================================
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // ========================================
    // 2) Support HTTP + WebSocket safely
    // ========================================
    const httpReq = context.switchToHttp().getRequest();
    const wsClient =
      context.switchToWs &&
      context.switchToWs().getClient &&
      context.switchToWs().getClient();

    const req: any = httpReq || wsClient || null;

    if (!req) {
      throw new UnauthorizedException('Authentication required');
    }

    // ========================================
    // 3) Accept both Firebase + Session cookie
    // ========================================
    if (req.user || (req.session && req.session.user)) {
      return true;
    }

    // ไม่มี user แต่ route ไม่ใช่ public = block
    throw new UnauthorizedException('Authentication required');
  }
}
