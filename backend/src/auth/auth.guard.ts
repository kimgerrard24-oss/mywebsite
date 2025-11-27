// ==============================
// file: src/auth/auth.guard.ts
// ==============================
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ---------------------------------------
    // 1) FIX — allow @Public() properly
    // ---------------------------------------
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    // ---------------------------------------
    // 2) FIX — normal authenticated routes
    // ---------------------------------------
    const req = context.switchToHttp().getRequest();

    // dynamic session cookie name
    const cookieName = process.env.SESSION_COOKIE_NAME || '__session';

    const hasUser = Boolean(req.user);
    const hasCookie =
      Boolean(req.cookies?.[cookieName]) ||
      Boolean(req.headers.cookie?.includes(`${cookieName}=`));

    if (!hasUser && !hasCookie) {
      return false; // will become 403 Forbidden
    }

    return true;
  }
}
