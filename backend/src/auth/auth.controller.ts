// ==============================
// file: src/auth/auth.controller.ts
// ==============================
import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Post,
  Body,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import * as cookie from 'cookie';
import axios from 'axios';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly auth: AuthService) {}

  // =======================================
  // GOOGLE OAuth Start (FIXED state support)
  // =======================================
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    try {
      // read state from frontend
      const state = req.query.state as string;
      if (!state) {
        this.logger.warn('[googleAuth] missing state from frontend');
      } else {
        (req as any).oauthState = state;
      }

      const qOrigin = (req.query?.origin as string) || '';
      const referer = (req.headers?.referer as string) || '';
      const envFallback =
        process.env.GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN || '';

      const oauthOrigin = (qOrigin || referer || envFallback).toString();
      if (oauthOrigin) (req as any).oauthOrigin = oauthOrigin;

      this.logger.log(
        `[googleAuth] origin=${oauthOrigin} state=${state}`,
      );
    } catch (e: any) {
      this.logger.warn(
        `[googleAuth] failed to preserve origin: ${e?.message}`,
      );
    }
  }

  // =======================================
  // GOOGLE OAuth Callback (FIXED state check)
  // =======================================
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      // 1) Read state from query (Google returns this)
      const returnedState = req.query.state as string;

      // 2) Read state from cookie
      const raw = req.headers.cookie || '';
      const parsed = cookie.parse(raw);
      const storedState = parsed['oauth_state'];

      if (!returnedState || !storedState || returnedState !== storedState) {
        this.logger.warn(
          `[googleCallback] state mismatch returned=${returnedState} stored=${storedState}`,
        );
        return res.status(400).send('Invalid or expired state');
      }

      const user = req.user as any;

      if (!user?.firebaseUid) {
        this.logger.warn('[googleCallback] user missing firebaseUid');
        return res.status(500).send('Authentication failed');
      }

      const customToken = await this.auth.createFirebaseCustomToken(
        user.firebaseUid,
        user,
      );

      if (!customToken) {
        this.logger.warn('[googleCallback] failed to create custom token');
        return res.status(500).send('Authentication failed');
      }

      let origin =
        (req as any).resolvedOrigin ||
        (req as any).oauthOrigin ||
        process.env.GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN ||
        'https://phlyphant.com';

      try {
        const parsed = new URL(origin);
        origin = parsed.origin;
      } catch (e: any) {
        origin = origin.replace(/\/.*$/, '');
      }

      origin = origin.replace(/\/+$/, '');

      const redirectTo = `${origin}/auth/complete?customToken=${encodeURIComponent(
        customToken,
      )}`;

      this.logger.log(`[googleCallback] redirect=${redirectTo}`);
      return res.redirect(302, redirectTo);
    } catch (err: any) {
      this.logger.error(
        `[googleCallback] error: ${err?.message || String(err)}`,
      );
      return res.status(500).send('Authentication error');
    }
  }

  // =======================================
  // FACEBOOK OAuth Start (FIXED state support)
  // =======================================
  @Get('facebook')
  async facebookAuth(@Req() req: Request, @Res() res: Response) {
    try {
      const clientId = process.env.FACEBOOK_CLIENT_ID || '';
      const redirectUri: string = process.env.FACEBOOK_CALLBACK_URL || '';

      // read state from frontend
      const state = (req.query.state as string) || '';
      if (!state) {
        this.logger.warn('[facebookAuth] missing state from frontend');
      }
      (req as any).oauthState = state;

      const qOrigin = (req.query?.origin as string) || '';
      const referer = (req.headers?.referer as string) || '';
      const fallback =
        process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN ||
        'https://phlyphant.com';

      const oauthOrigin = (qOrigin || referer || fallback).toString();
      (req as any).oauthOrigin = oauthOrigin;

      const authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&response_type=code&scope=email,public_profile&state=${encodeURIComponent(
        state,
      )}`;

      this.logger.log(
        `[facebookAuth] redirecting to: ${authUrl} origin=${oauthOrigin} state=${state}`,
      );
      return res.redirect(authUrl);
    } catch (e: any) {
      this.logger.error(`[facebookAuth] error: ${e.message}`);
      return res.status(500).send('Facebook auth start error');
    }
  }

  // =======================================
  // FACEBOOK OAuth Callback (FIXED state check)
  // =======================================
  @Get('facebook/callback')
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const { code, state: returnedState } = req.query;

      if (!code) {
        this.logger.warn('[facebookCallback] missing code');
        return res.status(400).send('Missing code');
      }

      // 1) Read state from cookie
      const raw = req.headers.cookie || '';
      const parsed = cookie.parse(raw);
      const storedState = parsed['oauth_state'];

      if (!returnedState || !storedState || returnedState !== storedState) {
        this.logger.warn(
          `[facebookCallback] state mismatch returned=${returnedState} stored=${storedState}`,
        );
        return res.status(400).send('Invalid or expired state');
      }

      const clientId = process.env.FACEBOOK_CLIENT_ID || '';
      const clientSecret = process.env.FACEBOOK_CLIENT_SECRET || '';
      const redirectUri: string = process.env.FACEBOOK_CALLBACK_URL || '';

      // 1) แลก code -> access_token
      const tokenRes = await axios.get(
        'https://graph.facebook.com/v12.0/oauth/access_token',
        {
          params: {
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            code,
          },
        },
      );

      const accessToken = tokenRes.data.access_token;

      // 2) ข้อมูลผู้ใช้
      const profileRes = await axios.get(
        'https://graph.facebook.com/me',
        {
          params: {
            access_token: accessToken,
            fields: 'id,name,email,picture',
          },
        },
      );

      const profile = profileRes.data;

      // 3) หา Firebase UID
      const firebaseUid = await this.auth.getOrCreateOAuthUser(
        'facebook',
        profile.id,
        profile.email,
        profile.name,
        profile.picture?.data?.url,
      );

      // 4) สร้าง custom token
      const customToken = await this.auth.createFirebaseCustomToken(
        firebaseUid,
        profile,
      );

      let origin =
        (req as any).oauthOrigin ||
        process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN ||
        'https://phlyphant.com';

      try {
        const parsed = new URL(origin);
        origin = parsed.origin;
      } catch (e: any) {
        origin = origin.replace(/\/.*$/, '');
      }
      origin = origin.replace(/\/+$/, '');

      const redirectTo = `${origin}/auth/complete?customToken=${encodeURIComponent(
        customToken,
      )}`;

      this.logger.log(`[facebookCallback] redirect=${redirectTo}`);
      return res.redirect(302, redirectTo);
    } catch (err: any) {
      this.logger.error(
        `[facebookCallback] error: ${err?.message || err}`,
      );
      return res.status(500).send('Facebook callback error');
    }
  }
}
