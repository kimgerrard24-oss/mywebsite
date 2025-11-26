// ==============================
// file: src/auth/auth.service.ts
// ==============================
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAdminService } from '../firebase/firebase.service';
import { SecretsService } from '../secrets/secrets.service';

import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { sign, verify } from 'jsonwebtoken';

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

  // -------------------------------------------------------
  // Utility สำหรับ Local Auth
  // -------------------------------------------------------
  private async hash(data: string) {
    return bcrypt.hash(data, 12); // cost 12 สำหรับ production
  }

  private async compareHash(data: string, hash: string) {
    return bcrypt.compare(data, hash);
  }

  private signAccessToken(payload: any) {
    const secret = process.env.JWT_ACCESS_SECRET!;
    return sign(payload, secret, { expiresIn: '15m' });
  }

  private signRefreshToken(payload: any) {
    const secret = process.env.JWT_REFRESH_SECRET!;
    return sign(payload, secret, { expiresIn: '30d' });
  }

  // -------------------------------------------------------
  // Local Register
  // -------------------------------------------------------
  async registerLocal(email: string, password: string, name?: string) {
    const normalizedEmail = email.toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw new BadRequestException('Email already registered');

    const passwordHash = await this.hash(password);

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        hashedPassword: passwordHash,
        name: name || null,
        provider: 'local',
        providerId: normalizedEmail,
      },
    });

    const token = randomBytes(32).toString('hex');
    const tokenHash = await this.hash(token);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ชั่วโมง

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyTokenHash: tokenHash,
        emailVerifyTokenExpires: expires,
      },
    });

    const verifyLink =
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email?token=${token}&uid=${user.id}`;

    this.logger.debug(`Email verification link: ${verifyLink}`);

    return { ok: true, userId: user.id };
  }

  // -------------------------------------------------------
  // Local Login
  // -------------------------------------------------------
  async loginLocal(email: string, password: string) {
    const normalized = email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: normalized } });

    if (!user || !user.hashedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await this.compareHash(password, user.hashedPassword);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.signAccessToken({
      sub: user.id,
      email: user.email,
      provider: 'local',
    });

    const refreshToken = this.signRefreshToken({ sub: user.id });
    const refreshHash = await this.hash(refreshToken);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { currentRefreshTokenHash: refreshHash },
    });

    return {
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken,
    };
  }

  // -------------------------------------------------------
  // Refresh Token (Local)
  // -------------------------------------------------------
  async refreshLocalToken(refreshToken: string) {
    let payload: any;

    try {
      const secret = process.env.JWT_REFRESH_SECRET!;
      payload = verify(refreshToken, secret);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.currentRefreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const ok = await this.compareHash(refreshToken, user.currentRefreshTokenHash);
    if (!ok) {
      // token reuse attack — revoke user token
      await this.prisma.user.update({
        where: { id: user.id },
        data: { currentRefreshTokenHash: null },
      });
      throw new ForbiddenException('Refresh token reuse detected');
    }

    const newAccess = this.signAccessToken({
      sub: user.id,
      email: user.email,
      provider: 'local',
    });

    const newRefresh = this.signRefreshToken({ sub: user.id });
    const newRefreshHash = await this.hash(newRefresh);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { currentRefreshTokenHash: newRefreshHash },
    });

    return {
      accessToken: newAccess,
      refreshToken: newRefresh,
      user: { id: user.id, email: user.email },
    };
  }

  // -------------------------------------------------------
  // Request Password Reset (Local)
  // -------------------------------------------------------
  async requestPasswordResetLocal(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) return { ok: true }; // ไม่บอกว่ามี user หรือไม่

    const token = randomBytes(32).toString('hex');
    const tokenHash = await this.hash(token);

    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 ชั่วโมง

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetTokenExpires: expires,
      },
    });

    const resetLink =
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${token}&uid=${user.id}`;

    this.logger.debug(`Password reset link: ${resetLink}`);

    return { ok: true };
  }

  // -------------------------------------------------------
  // Reset Password (Local)
  // -------------------------------------------------------
  async resetPasswordLocal(uid: string, token: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: uid } });

    if (
      !user ||
      !user.passwordResetTokenHash ||
      !user.passwordResetTokenExpires
    ) {
      throw new BadRequestException('Invalid token');
    }

    if (user.passwordResetTokenExpires < new Date()) {
      throw new BadRequestException('Token expired');
    }

    const ok = await this.compareHash(token, user.passwordResetTokenHash);
    if (!ok) throw new BadRequestException('Invalid token');

    const newHash = await this.hash(newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword: newHash,
        passwordResetTokenHash: null,
        passwordResetTokenExpires: null,
      },
    });

    // revoke refresh token
    await this.prisma.user.update({
      where: { id: user.id },
      data: { currentRefreshTokenHash: null },
    });

    return { ok: true };
  }

  // -------------------------------------------------------
  // Verify Email (Local)
  // -------------------------------------------------------
  async verifyEmailLocal(uid: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: uid } });

    if (!user || !user.emailVerifyTokenHash || !user.emailVerifyTokenExpires) {
      throw new BadRequestException('Invalid token');
    }

    if (user.emailVerifyTokenExpires < new Date()) {
      throw new BadRequestException('Token expired');
    }

    const ok = await this.compareHash(token, user.emailVerifyTokenHash);
    if (!ok) throw new BadRequestException('Invalid token');

    await this.prisma.user.update({
      where: { id: uid },
      data: {
        isEmailVerified: true,
        emailVerifyTokenHash: null,
        emailVerifyTokenExpires: null,
      },
    });

    return { ok: true };
  }

  // -------------------------------------------------------
  // ส่วนเดิมของคุณ (ไม่แก้)
  // -------------------------------------------------------
  private normalizeRedirectUri(raw: string): string {
    if (!raw) return raw;
    let v = raw.trim();
    v = v.replace(/\?{2,}/g, '');
    v = v.replace(/([^:]\/)\/+/g, '$1');
    return v;
  }

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
  // GOOGLE
  // ==========================================
  async findOrCreateUserFromGoogle(profile: any) {
    const email = profile.emails?.[0]?.value || null;
    const providerId = profile.sub || profile.id;

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ provider: 'google', providerId }, { email }],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: email ?? `no-email-google-${providerId}@placeholder.local`,
          name: profile.displayName ?? null,
          provider: 'google',
          providerId,
          firebaseUid: null,
        },
      });
    }

    if (!user.firebaseUid) {
      try {
        const  firebaseUid = String(user.id);

        await this.prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid },
        });

        user.firebaseUid = firebaseUid;
      } catch (err) {
        this.logger.error('Failed to set firebaseUid for Google user');
        throw new Error('Failed to set firebase�uid');
      }
    }

    return user;
  }

  // ==========================================
  // FACEBOOK
  // ==========================================
  async findOrCreateUserFromFacebook(profile: any) {
    const email = profile.emails?.[0]?.value || profile._json?.email || null;

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ provider: 'facebook', providerId: profile.id }, { email }],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: email ?? `no-email-facebook-${profile.id}@placeholder.local`,
          name: profile.displayName ?? null,
          provider: 'facebook',
          providerId: profile.id,
          firebaseUid: null,
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

  // ==========================================
  // Hybrid OAuth
  // ==========================================
  async getOrCreateOAuthUser(
    provider: 'facebook' | 'google',
    providerId: string,
    email?: string,
    name?: string,
    picture?: string,
  ): Promise<string> {
    const safeEmail =
      email && email.trim().length > 0
        ? email
        : `${provider}-${providerId}@placeholder.local`;

    let user = await this.prisma.user.findFirst({
      where: { provider, providerId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: safeEmail,
          name: name || '',
          provider,
          providerId,
          avatarUrl: picture || null,
          firebaseUid: null,
        },
      });
    }

    const firebaseUid = user.firebaseUid || `oauth_${provider}_${user.id}`;

    if (!user.firebaseUid) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid },
      });
    }

    return firebaseUid;
  }

  // ==========================================
  // ADDED FUNCTION (ตามคำขอ)
  // ==========================================
  async getUserByFirebaseUid(firebaseUid: string) {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
    });
  }

  // ==========================================
  // Firebase
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

  // ==========================================
  // NEW: Normalize / decode OAuth state helper
  // - Facebook may encode/escape state in different ways.
  // - Call this before comparing state with Redis or cookie.
  // ==========================================
  normalizeOAuthState(raw?: string | null): string {
    if (!raw) return '';
    // Try decodeURIComponent safely (may throw if malformed)
    let s = String(raw).trim();

    try {
      s = decodeURIComponent(s);
    } catch {
      // if decodeURIComponent fails, fall back to replace common encodings
      s = s.replace(/\+/g, ' ');
      s = s.replace(/%2B/gi, '+');
      s = s.replace(/%3D/gi, '=');
      s = s.replace(/%2F/gi, '/');
    }

    // final normalization: remove surrounding quotes, trim, collapse multiple slashes
    s = s.replace(/^["']|["']$/g, '').trim();
    s = s.replace(/([^:]\/)\/+/g, '$1');

    return s;
  }
}
