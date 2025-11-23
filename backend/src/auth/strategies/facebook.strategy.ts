// ==========================================
// file: src/auth/strategies/facebook.strategy.ts
// ==========================================
import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  private readonly logger = new Logger(FacebookStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,

      // สำคัญที่สุด: รองรับ state + origin
      passReqToCallback: true,
      state: true,
      enableProof: true,

      scope: ['public_profile', 'email'],

      profileFields: [
        'id',
        'displayName',
        'name',
        'emails',
        'photos',
      ],
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    try {
      const email =
        profile.emails && profile.emails.length > 0
          ? profile.emails[0].value
          : null;

      if (!email) {
        return done(new Error('Facebook profile has no email'), null);
      }

      // validate user ด้วย service (ให้สร้าง firebaseUid)
      const user = await this.authService.validateFacebookUser({
        provider: 'facebook',
        providerId: profile.id,
        email,
        profile,
        accessToken,
        refreshToken,
      });

      // เก็บ origin สำหรับ callback
      const requestedOrigin = (req as any).oauthOrigin;
      if (requestedOrigin) {
        (req as any).resolvedOrigin = requestedOrigin;
      }

      return done(null, {
        id: user.id,
        firebaseUid: String(user.firebaseUid),
        provider: 'facebook',
        providerId: profile.id,
        email: user.email,
        name: user.name,
        profile,
        origin: requestedOrigin || null,
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Facebook validate error: ${err.message}`);
      return done(err, null);
    }
  }
}
