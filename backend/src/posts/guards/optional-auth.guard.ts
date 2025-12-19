// backend/src/posts/guards/optional-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import { ValidateSessionService } from '../../auth/services/validate-session.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private readonly validateSession: ValidateSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    try {
      const user =
        await this.validateSession.validateAccessTokenFromRequest(req);

      // attach user เมื่อ session valid
      if (user) {
        req.user = user; // { userId, jti }
      }
    } catch {

    }

    return true;
  }
}
