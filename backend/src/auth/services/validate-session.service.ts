// src/auth/services/validate-session.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service'; // ใช้ service เดิมของคุณ

export interface SessionUser {
  userId: string;
}

const ACCESS_TOKEN_COOKIE_NAME =
  process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access';

@Injectable()
export class ValidateSessionService {
  constructor(private readonly authService: AuthService) {}

  /**
   * Validate access token from HTTP-only cookie and return SessionUser
   * Local Auth version — ไม่ใช้ Firebase
   */
  async validateAccessTokenFromRequest(req: Request): Promise<SessionUser> {
    const token = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException('Access token cookie is missing');
    }

    try {
      // ใช้ระบบ Local Auth ของคุณในการตรวจสอบ token
      const session = await this.authService.verifySessionCookie(token);


      if (!session || !session.userId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      return { userId: session.userId };
    } catch {
      // อย่าทำ console.log token ป้องกัน secret leak
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
