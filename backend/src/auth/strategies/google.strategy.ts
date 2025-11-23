// ==========================================
// file: src/auth/strategies/google.strategy.ts
// ==========================================
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  Profile,
  StrategyOptionsWithRequest,
} from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    const clientID = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const callbackURL =
      process.env.GOOGLE_CALLBACK_URL ||
      process.env.GOOGLE_REDIRECT_URL ||
      '';

    // ถ้า callback URL ว่างหรือไม่ถูกต้อง → แจ้ง error ชัดเจน
    if (!clientID || !clientSecret) {
      throw new Error('Missing Google OAuth client ID or secret');
    }
    if (!callbackURL || !callbackURL.startsWith('https://')) {
      throw new Error(
        `Invalid GOOGLE_CALLBACK_URL. Received: "${callbackURL}"`
      );
    }

    const options: StrategyOptionsWithRequest = {
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    };

    super(options);
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    // เก็บ origin เพื่อใช้ redirect หลังสำเร็จ
    const requestedOrigin = (req as any).oauthOrigin;
    if (requestedOrigin) {
      (req as any).resolvedOrigin = requestedOrigin;
    }

    // Google บาง region ไม่ส่ง email ต้องรองรับ
    const email =
      profile.emails?.[0]?.value ||
      `${profile.id}@google-oauth.phlyphant.local`;

    const user = await this.authService.validateGoogleUser({
      provider: 'google',
      providerId: profile.id,
      email,
      profile,
      accessToken,
      refreshToken,
    });

    return {
      id: user.id,
      firebaseUid: String(user.firebaseUid),
      provider: 'google',
      providerId: profile.id,
      email: user.email,
      name: user.name,
      profile,
      origin: requestedOrigin || null,
    };
  }
}
