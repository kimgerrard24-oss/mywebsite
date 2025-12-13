// src/auth/guards/access-token-cookie.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ValidateSessionService } from '../services/validate-session.service';

@Injectable()
export class AccessTokenCookieAuthGuard implements CanActivate {
  constructor(
    private readonly validateSessionService: ValidateSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    try {
      // 1) ตรวจ access token จาก cookie (คงเดิม)
      const cookieToken = req.cookies?.['phl_access'];

      if (!cookieToken) {
        throw new UnauthorizedException('Access token cookie is missing');
      }

      // 2) validate JWT + Redis session (คงเดิม)
      const sessionUser =
        await this.validateSessionService.validateAccessTokenFromRequest(req);

      // 3) แนบ user เข้า request (คงเดิม)
      (req as any).user = sessionUser;

      // 4) 🔐 อัปเดต lastSeenAt ของ session นี้ (NEW)
      //     ไม่ throw error ถ้า update ไม่สำเร็จ (ไม่ให้ request พัง)
      try {
        if (sessionUser?.jti) {
          await this.validateSessionService.touchSession(sessionUser.jti);
        }
      } catch {
        // intentionally ignored
      }

      return true;
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
