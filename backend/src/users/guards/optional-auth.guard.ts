// backend/src/users/guards/optional-auth.guard.ts

import {
  Injectable,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';

@Injectable()
export class OptionalAuthGuard extends AccessTokenCookieAuthGuard {
  private readonly logger = new Logger(OptionalAuthGuard.name);

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    try {
      return await super.canActivate(context);
    } catch (err) {
      /**
       * Fail-open by design:
       * - Optional auth endpoints must still work
       * - Do NOT leak auth failure to client
       */

      // 🔍 internal visibility only (no throw)
      this.logger.debug(
        'Optional auth failed, continuing as guest',
      );

      return true;
    }
  }
}
