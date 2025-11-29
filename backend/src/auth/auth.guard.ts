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
    // 1) Allow @Public() properly
    // ---------------------------------------
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    // ---------------------------------------
    // 2) Normal authenticated routes:
    //    FirebaseAuthGuard จะใส่ req.user ให้อยู่แล้ว
    // ---------------------------------------
    const req = context.switchToHttp().getRequest();

    if (req.user) return true;

    return false;
  }
}
