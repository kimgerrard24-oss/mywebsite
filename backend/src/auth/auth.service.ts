// ==============================
// file: src/auth/auth.service.ts
// ==============================
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAdminService } from '../firebase/firebase.service';
import { SecretsService } from '../secrets/secrets.service';

interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface FacebookOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseAdminService,
    private readonly secretsService: SecretsService,
  ) {}

  // ==========================================
  // Normalize redirect URIs and remove corruption
  // (แก้: ไม่ replace /api/auth อีกต่อไป)
  // ==========================================
  private normalizeRedirectUri(raw: string): string {
    if (!raw) return raw;
    let v = raw.trim();

    // Remove accidental "???" or duplicated ?
    v = v.replace(/\?{2,}/g, '');

    // Remove duplicated slashes except protocol
    v = v.replace(/([^:]\/)\/+/g, '$1');

    return v;
  }

  // ==========================================
  // GOOGLE CONFIG (ENV-Priority)
  // ==========================================
  async getGoogleConfig(): Promise<GoogleOAuthConfig> {
    const raw = await this.secretsService.getOAuthSecrets();

    const envRedirect =
      process.env.GOOGLE_CALLBACK_URL ||
      process.env.GOOGLE_REDIRECT_URL ||
      process.env.GOOGLE_REDIRECT_URI ||
      '';

    const redirectUriRaw =
      envRedirect ||
      raw?.GOOGLE_CALLBACK_URL ||
      raw?.GOOGLE_REDIRECT_URL ||
      raw?.redirectUri ||
      '';

    const clientId =
      process.env.GOOGLE_CLIENT_ID ||
      raw?.GOOGLE_CLIENT_ID ||
      raw?.clientId ||
      '';

    const clientSecret =
      process.env.GOOGLE_CLIENT_SECRET ||
      raw?.GOOGLE_CLIENT_SECRET ||
      raw?.clientSecret ||
      '';

    const redirectUri = this.normalizeRedirectUri(redirectUriRaw);

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error(
        `Missing Google OAuth configuration. Check env or AWS secret "${process.env.AWS_OAUTH_SECRET_NAME}".`,
      );
    }

    return { clientId, clientSecret, redirectUri };
  }

  // ==========================================
  // FACEBOOK CONFIG (ENV-Priority)
  // ==========================================
  async getFacebookConfig(): Promise<FacebookOAuthConfig> {
    const raw = await this.secretsService.getOAuthSecrets();

    const envRedirect =
      process.env.FACEBOOK_CALLBACK_URL ||
      process.env.FACEBOOK_REDIRECT_URL ||
      '';

    const redirectUriRaw =
      envRedirect ||
      raw?.FACEBOOK_CALLBACK_URL ||
      raw?.FACEBOOK_REDIRECT_URL ||
      raw?.redirectUri ||
      '';

    const clientId =
      process.env.FACEBOOK_CLIENT_ID ||
      raw?.FACEBOOK_CLIENT_ID ||
      raw?.clientId ||
      '';

    const clientSecret =
      process.env.FACEBOOK_CLIENT_SECRET ||
      raw?.FACEBOOK_CLIENT_SECRET ||
      raw?.clientSecret ||
      '';

    const redirectUri = this.normalizeRedirectUri(redirectUriRaw);

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error(
        `Missing Facebook OAuth configuration. Check env or AWS secret "${process.env.AWS_OAUTH_SECRET_NAME}".`,
      );
    }

    return { clientId, clientSecret, redirectUri };
  }

  // ==========================================
  // GOOGLE — find or create
  // ==========================================
  async findOrCreateUserFromGoogle(profile: any) {
    const email = profile.emails?.[0]?.value || null;

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { provider: 'google', providerId: profile.id },
          { email },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: email ?? `no-email-google-${profile.id}@placeholder.local`,
          name: profile.displayName ?? null,
          provider: 'google',
          providerId: profile.id,
        },
      });
    }

    if (!user.firebaseUid) {
      try {
        const firebaseUid = String(user.id);

        await this.prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid },
        });

        user.firebaseUid = firebaseUid;
      } catch (err) {
        this.logger.error('Failed to set firebaseUid for Google user');
        throw new Error('Failed to set firebaseUid');
      }
    }

    return user;
  }

  // ==========================================
  // FACEBOOK — find or create
  // ==========================================
  async findOrCreateUserFromFacebook(profile: any) {
    const email =
      profile.emails?.[0]?.value ||
      profile._json?.email ||
      null;

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { provider: 'facebook', providerId: profile.id },
          { email },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: email ?? `no-email-facebook-${profile.id}@placeholder.local`,
          name: profile.displayName ?? null,
          provider: 'facebook',
          providerId: profile.id,
        },
      });
    }

    if (!user.firebaseUid) {
      try {
        const firebaseUid = String(user.id);

        await this.prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid },
        });

        user.firebaseUid = firebaseUid;
      } catch (err) {
        this.logger.error('Failed to set firebaseUid for Facebook user');
        throw new Error('Failed to set firebaseUid');
      }
    }

    return user;
  }

  // Google specific bridge
  async validateGoogleUser(data: {
    provider: string;
    providerId: string;
    email: string;
    profile: any;
    accessToken: string;
    refreshToken: string;
  }) {
    return this.findOrCreateUserFromGoogle(data.profile);
  }

  // Facebook specific bridge
  async validateFacebookUser(data: {
    provider: string;
    providerId: string;
    email: string;
    profile: any;
    accessToken: string;
    refreshToken: string;
  }) {
    return this.findOrCreateUserFromFacebook(data.profile);
  }

  // ==========================================
  // FIREBASE WRAPPERS (CUSTOM TOKEN + SESSION)
  // ==========================================
  createFirebaseCustomToken(uid: string, user: any) {
    if (!uid || typeof uid !== 'string') {
      throw new Error(`Invalid UID for Firebase custom token: "${uid}"`);
    }

    return this.firebase.auth().createCustomToken(uid, {
      email: user.email,
      provider: user.provider,
    });
  }

  verifyIdToken(idToken: string) {
    if (!idToken) {
      throw new BadRequestException('idToken missing');
    }
    return this.firebase.auth().verifyIdToken(idToken);
  }

  createSessionCookie(idToken: string, expiresIn: number) {
    return this.firebase.auth().createSessionCookie(idToken, { expiresIn });
  }

  verifySessionCookie(cookie: string) {
    return this.firebase.auth().verifySessionCookie(cookie, false);
  }

  revoke(uid: string) {
    return this.firebase.auth().revokeRefreshTokens(uid);
  }
}
