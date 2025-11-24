// ==============================
// file: src/auth/auth.controller.ts
// ==============================
import {
  Controller,
  Get,
  Req,
  Res,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import * as cookie from 'cookie';
import crypto from 'crypto';
import axios from 'axios';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly auth: AuthService) {}

  // =======================================
  // GOOGLE OAuth Start (no passport)
  // =======================================
  @Get('google')
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    try {
      const state = crypto.randomBytes(16).toString('hex');

      res.cookie('oauth_state', state, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain: process.env.COOKIE_DOMAIN || '.phlyphant.com',
        path: '/',
      });

      const clientId = process.env.GOOGLE_CLIENT_ID || '';
      const redirectUri =
        process.env.GOOGLE_CALLBACK_URL ||
        process.env.GOOGLE_REDIRECT_URL ||
        '';

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        prompt: 'select_account',
      });

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      this.logger.log(`[googleAuth] redirect=${authUrl}`);
      return res.redirect(authUrl);
    } catch (e: any) {
      this.logger.error('[googleAuth] error: ' + e.message);
      return res.status(500).send('Google auth error');
    }
  }

  // =======================================
  // GOOGLE OAuth Callback (no passport)
  // =======================================
  @Get('google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const code = req.query.code as string;
      const returnedState = req.query.state as string;

      if (!code || !returnedState) {
        return res.status(400).send('Missing code or state');
      }

      const raw = req.headers.cookie || '';
      const parsed = cookie.parse(raw);
      const storedState = parsed['oauth_state'];

      if (!storedState || returnedState !== storedState) {
        this.logger.warn(
          `[googleCallback] state mismatch returned=${returnedState} stored=${storedState}`,
        );
        return res.status(400).send('Invalid or expired state');
      }

      const tokenRes = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri:
            process.env.GOOGLE_CALLBACK_URL ||
            process.env.GOOGLE_REDIRECT_URL ||
            '',
          grant_type: 'authorization_code',
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const accessToken = tokenRes.data.access_token;

      const infoRes = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const profile = infoRes.data;

      const firebaseUid =
        profile.sub ||
        profile.id ||
        `google:${profile.email || crypto.randomUUID()}`;

      const customToken = await this.auth.createFirebaseCustomToken(
        firebaseUid,
        profile,
      );

      const redirectBase =
        process.env.GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN ||
        'https://www.phlyphant.com';

      const finalUrl =
        `${redirectBase}/auth/complete?customToken=${encodeURIComponent(
          customToken,
        )}`;

      this.logger.log(`[googleCallback] redirect=${finalUrl}`);
      return res.redirect(finalUrl);
    } catch (err: any) {
      this.logger.error('[googleCallback] error: ' + err.message);
      return res.status(500).send('Authentication error');
    }
  }

  // =======================================
  // FACEBOOK OAuth Start
  // =======================================
  @Get('facebook')
  async facebookAuth(@Req() req: Request, @Res() res: Response) {
    try {
      const state = crypto.randomBytes(16).toString('hex');

      res.cookie('oauth_state', state, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain: process.env.COOKIE_DOMAIN || '.phlyphant.com',
        path: '/',
      });

      const clientId = process.env.FACEBOOK_CLIENT_ID || '';
      const redirectUri = process.env.FACEBOOK_CALLBACK_URL || '';

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'email,public_profile',
        state,
      });

      const authUrl =
        `https://www.facebook.com/v12.0/dialog/oauth?${params.toString()}`;

      this.logger.log(`[facebookAuth] redirect=${authUrl}`);
      return res.redirect(authUrl);
    } catch (e: any) {
      this.logger.error('[facebookAuth] error: ' + e.message);
      return res.status(500).send('Facebook auth error');
    }
  }

  // =======================================
  // FACEBOOK Callback
  // =======================================
  @Get('facebook/callback')
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const code = req.query.code as string;
      const returnedState = req.query.state as string;

      if (!code || !returnedState) {
        return res.status(400).send('Missing code or state');
      }

      const raw = req.headers.cookie || '';
      const parsed = cookie.parse(raw);
      const storedState = parsed['oauth_state'];

      if (!storedState || returnedState !== storedState) {
        return res.status(400).send('Invalid or expired state');
      }

      const clientId = process.env.FACEBOOK_CLIENT_ID || '';
      const clientSecret = process.env.FACEBOOK_CLIENT_SECRET || '';
      const redirectUri = process.env.FACEBOOK_CALLBACK_URL || '';

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

      const firebaseUid = await this.auth.getOrCreateOAuthUser(
        'facebook',
        profile.id,
        profile.email,
        profile.name,
        profile.picture?.data?.url,
      );

      const customToken = await this.auth.createFirebaseCustomToken(
        firebaseUid,
        profile,
      );

      const redirectBase =
        process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN ||
        'https://www.phlyphant.com';

      const finalUrl =
        `${redirectBase}/auth/complete?customToken=${encodeURIComponent(
          customToken,
        )}`;

      this.logger.log(`[facebookCallback] redirect=${finalUrl}`);
      return res.redirect(finalUrl);
    } catch (err: any) {
      this.logger.error('[facebookCallback] error: ' + err.message);
      return res.status(500).send('Facebook callback error');
    }
  }
}
