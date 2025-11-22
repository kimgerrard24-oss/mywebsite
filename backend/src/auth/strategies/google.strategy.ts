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
    const normalizeUrl = (url: string): string => {
      if (!url) return '';
      let u = url.trim();
      u = u.replace(/\?{2,}/g, '');
      u = u.replace(/([^:]\/)\/+/g, '$1');
      return u;
    };

    const clientID = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    let rawCallback =
      process.env.GOOGLE_CALLBACK_URL ||
      process.env.GOOGLE_REDIRECT_URL ||
      '';

    rawCallback = normalizeUrl(rawCallback);

    // Production rule:
    // Keep domain (including api.<domain>) safe.
    // Only replace path prefix "/api/auth" → "/auth"
    rawCallback = rawCallback.replace('/api/auth/', '/auth/');
    rawCallback = rawCallback.replace('/api/auth', '/auth');

    const callbackURL = rawCallback;

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Missing Google OAuth configuration');
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
    const requestedOrigin = (req as any).oauthOrigin;
    if (requestedOrigin) {
      (req as any).resolvedOrigin = requestedOrigin;
    }

    const email =
      profile.emails && profile.emails.length > 0
        ? profile.emails[0].value
        : null;

    if (!email) {
      throw new Error('Google profile has no email');
    }

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
