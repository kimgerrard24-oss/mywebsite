// backend/src/users/guards/optional-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';

@Injectable()
export class OptionalAuthGuard extends AccessTokenCookieAuthGuard {
  async canActivate(context: any): Promise<boolean> {
    try {
      return await super.canActivate(context);
    } catch {
      return true;
    }
  }
  
}
