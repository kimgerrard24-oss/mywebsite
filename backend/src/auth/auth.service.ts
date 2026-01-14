// ==============================
// file: src/auth/auth.service.ts
// ==============================
import {
  BadRequestException,
  Injectable,
  Logger,
  Inject,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAdminService } from '../firebase/firebase.service';
import { SecretsService } from '../secrets/secrets.service';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import { sign, verify } from 'jsonwebtoken';
import { AuthLoggerService } from '../common/logging/auth-logger.service';
import { AuthRepository } from './auth.repository';
import { RegisterDto } from './dto/register.dto';
import { hashPassword } from './utils/password.util';
import { randomUUID } from 'crypto';
import { MailService } from '../mail/mail.service';
import { comparePassword } from './utils/password.util';
import { AuditService } from './audit.service';
import { Redis } from 'ioredis';
import { RedisService } from '../redis/redis.service';
import { UserProfileDto } from './dto/user-profile.dto';
import * as jwt from 'jsonwebtoken';
import { SessionService } from './session/session.service';
import { SecurityEventService } from '../common/security/security-event.service';
import { createHash } from 'crypto';
import { VerificationType } from '@prisma/client';
import { CredentialVerificationService } from '../auth/credential-verification.service';


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

interface AccessTokenPayload {
  sub: string;
  jti: string;
  iat?: number;
  exp?: number;
}

type SessionMeta = {
  ip?: string | null;
  userAgent?: string | null;
  deviceId?: string | null;
};

const ACCESS_TOKEN_TTL = Number(process.env.ACCESS_TOKEN_TTL_SECONDS) || 60 * 15;
const REFRESH_TOKEN_TTL = Number(process.env.REFRESH_TOKEN_TTL_SECONDS) || 60 * 60 * 24 * 30;
const ACCESS_TOKEN_COOKIE_NAME = process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

constructor(
  private readonly prisma: PrismaService,
  private readonly firebase: FirebaseAdminService,
  private readonly secretsService: SecretsService,
  private readonly authLogger: AuthLoggerService, 
  private readonly repo: AuthRepository,
  private readonly _mailService: MailService,
  private readonly audit: AuditService,
  private readonly redisService: RedisService,
  private readonly sessionService: SessionService,
  private readonly securityEvent: SecurityEventService,
  private readonly credentialVerify: CredentialVerificationService,
) {}


  // -------------------------------------------------------
  // Local Register
  // -------------------------------------------------------

 async register(dto: RegisterDto) {
  const existing = await this.repo.findByEmailOrUsername(
    dto.email,
    dto.username,
  );

  if (existing) {
    throw new ConflictException('Email or username already exists');
  }

  const hashed = await hashPassword(dto.password);

  // ===============================
  // 1) Create user (unchanged)
  // ===============================
  const user = await this.repo.createUser({
    email: dto.email,
    username: dto.username,
    hashedPassword: hashed,
    provider: 'local',
    providerId: dto.email,
  });

  // ===============================
  // 2) Generate verification token (UNIFIED SYSTEM)
  // ===============================
  const token = this.credentialVerify.generateToken();
  const expiresAt = this.credentialVerify.getExpiry(30); // minutes

  // ===============================
  // 3) Revoke previous + create new EMAIL_VERIFY token (atomic)
  // ===============================
  try {
    await this.prisma.$transaction(async (tx) => {
      await tx.identityVerificationToken.updateMany({
        where: {
          userId: user.id,
          type: VerificationType.EMAIL_VERIFY,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: {
          usedAt: new Date(),
        },
      });

      await tx.identityVerificationToken.create({
        data: {
          userId: user.id,
          type: VerificationType.EMAIL_VERIFY,
          tokenHash: token.hash, // 🔒 store hash only
          expiresAt,
        },
      });
    });
  } catch (err) {
    // token infra failure must not break register
    this.logger.error(
      '[REGISTER_EMAIL_VERIFY_TOKEN_TX_FAILED]',
      err,
    );
    return user;
  }

  // ===============================
  // 4) Send verification email
  // ===============================
  const publicSiteUrl = process.env.PUBLIC_SITE_URL;

  if (!publicSiteUrl) {
    this.logger.error(
      '[REGISTER] PUBLIC_SITE_URL not configured',
    );
    // user already created → do not fail register
    return user;
  }

  const verifyUrl =
  `${publicSiteUrl}/auth/verify-email?token=${encodeURIComponent(token.raw)}`;


  try {
    await this._mailService.sendEmailVerification(
      user.email,
      verifyUrl,
    );
  } catch (err) {
    // IMPORTANT: do NOT fail register because of email infra
    this.logger.error(
      '[REGISTER_EMAIL_SEND_FAILED]',
      err,
    );
  }

  return user;
}



// -------------------------------------------------------
// Local Login (Validate Credentials Only)
// -------------------------------------------------------
async validateUser(email: string, password: string) {
  // 1) Normalize email (single source of truth)
  const normalizedEmail = email.trim().toLowerCase();

  // 2) Find user by email
  const user = await this.repo.findUserByEmail(normalizedEmail);
  if (!user) {
    // ---- Security Event: login fail (user not found) ----
    this.securityEvent.log({
      type: 'auth.login.fail',
      severity: 'warning',
      emailHash: this.securityEvent.hash(normalizedEmail),
      reason: 'user_not_found',
    });

    // invalid credential (controller decides rate-limit & audit)
    return null;
  }

  // 3) Disabled account = hard stop
  if (user.isDisabled) {
    // ---- Security Event: suspicious login (disabled account) ----
    this.securityEvent.log({
      type: 'auth.login.suspicious',
      severity: 'warning',
      userId: user.id,
      reason: 'account_disabled',
    });

    // business rule → exception is correct
    throw new ForbiddenException('Account disabled');
  }

  // 4) Local login requires password hash
  if (!user.hashedPassword || typeof user.hashedPassword !== 'string') {
    // ---- Security Event: system misconfiguration / invalid user state ----
    this.securityEvent.log({
      type: 'system.misconfiguration',
      severity: 'error',
      userId: user.id,
      reason: 'missing_password_hash',
    });

    return null;
  }

  // 5) Verify password (argon2)
  let passwordMatched = false;
  try {
    passwordMatched = await argon2.verify(
      user.hashedPassword,
      password,
    );
  } catch {
    // ---- Security Event: crypto verify failure (system) ----
    this.securityEvent.log({
      type: 'system.misconfiguration',
      severity: 'error',
      userId: user.id,
      reason: 'argon2_verify_error',
    });

    // treat argon2 error as invalid credential
    return null;
  }

  if (!passwordMatched) {
    // ---- Security Event: login fail (password mismatch) ----
    this.securityEvent.log({
      type: 'auth.login.fail',
      severity: 'warning',
      userId: user.id,
      reason: 'password_mismatch',
    });

    return null;
  }

  // 6) Success → update last login
  await this.repo.updateLastLogin(user.id);

  // ---- Security Event: login success ----
  this.securityEvent.log({
    type: 'auth.login.success',
    severity: 'info',
    userId: user.id,
  });

  // 7) Return safe user object (remove password hash)
  const safeUser: any = { ...user };
  delete safeUser.hashedPassword;

  return safeUser;
}


// -------------------------------------------------------
// Create Session Token (NEW SYSTEM: use SessionService for Redis)
// -------------------------------------------------------
async createSessionToken(userId: string, meta?: SessionMeta) {
  const accessTTL =
    Number(process.env.ACCESS_TOKEN_TTL_SECONDS) > 0
      ? Number(process.env.ACCESS_TOKEN_TTL_SECONDS)
      : 60 * 15; // fallback ชัดเจน

  const jti = randomUUID();

  const payload: AccessTokenPayload = {
    sub: userId,
    jti,
  };

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    // ---- Security Event: system misconfiguration ----
    this.securityEvent.log({
      type: 'system.misconfiguration',
      severity: 'error',
      userId,
      reason: 'JWT_ACCESS_SECRET missing',
    });

    throw new Error('JWT_ACCESS_SECRET not configured');
  }

  const accessToken = jwt.sign(payload, secret, {
    expiresIn: accessTTL,
    algorithm: 'HS256',
  });

  const refreshToken = randomBytes(48).toString('hex');

  // --------------------------------------------------
  // Redis = authority (DO NOT change session rules)
  // --------------------------------------------------
  await this.sessionService.createSession(
    { userId },
    jti,
    refreshToken,
    {
      ip: meta?.ip ?? null,
      userAgent: meta?.userAgent ?? null,
      deviceId: meta?.deviceId ?? null,
    },
  );

  // ---- Security Event: login success (session issued) ----
  this.securityEvent.log({
    type: 'auth.login.success',
    severity: 'info',
    userId,
    meta: {
      hasIp: Boolean(meta?.ip),
      hasUserAgent: Boolean(meta?.userAgent),
      hasDeviceId: Boolean(meta?.deviceId),
    },
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: accessTTL,
  };
}




// -------------------------------------------------------
// Verify Access Token (JWT)
// -------------------------------------------------------
async verifyAccessToken(
  token: string,
): Promise<{ sub: string; jti: string }> {

  // =================================================
  // 1) Missing token
  // =================================================
  if (!token || typeof token !== 'string') {
    this.securityEvent.log({
      type: 'auth.session.missing',
      severity: 'warning',
      reason: 'access_token_missing',
    });

    throw new UnauthorizedException('Missing access token');
  }

  // =================================================
  // 2) Server misconfiguration
  // =================================================
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    this.securityEvent.log({
      type: 'system.misconfiguration',
      severity: 'error',
      reason: 'JWT_ACCESS_SECRET missing',
    });

    // misconfiguration = server error (แต่ไม่ leak detail)
    throw new UnauthorizedException('JWT secret not configured');
  }

  try {
    // =================================================
    // 3) Verify JWT (signature + exp)
    // =================================================
    const payload = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    }) as AccessTokenPayload;

    // =================================================
    // 4) Strict payload validation
    // =================================================
    if (
      !payload ||
      typeof payload.sub !== 'string' ||
      typeof payload.jti !== 'string'
    ) {
      this.securityEvent.log({
        type: 'auth.jwt.invalid',
        severity: 'warning',
        reason: 'payload_shape_invalid',
      });

      throw new UnauthorizedException('Invalid JWT payload');
    }

    return {
      sub: payload.sub,
      jti: payload.jti,
    };
  } catch (err: any) {
    // =================================================
    // 5) Verify failed (expired / forged / malformed)
    // =================================================
    let reason = 'unknown';

    if (err?.name === 'TokenExpiredError') {
      reason = 'expired';
    } else if (err?.name === 'JsonWebTokenError') {
      reason = 'invalid_signature_or_format';
    } else if (err?.name === 'NotBeforeError') {
      reason = 'not_active_yet';
    }

    this.securityEvent.log({
      type: 'auth.jwt.invalid',
      severity: 'warning',
      meta: { reason },
    });

    // keep error generic for security
    throw new UnauthorizedException(
      'Invalid or expired access token',
    );
  }
}


// Local Logout
async logout(req: any, res: any) {
  const accessCookie =
    process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access';
  const refreshCookie =
    process.env.REFRESH_TOKEN_COOKIE_NAME || 'phl_refresh';

  const accessToken = req.cookies?.[accessCookie];
  const refreshToken = req.cookies?.[refreshCookie];

  let accessSessionRevoked = false;
  let refreshSessionRevoked = false;
  let jwtVerifyFailed = false;

  // ============================================
// Revoke access session (by jti)
// ============================================
if (accessToken) {
  try {
    const secret = process.env.JWT_ACCESS_SECRET as string;

    const payload = jwt.verify(accessToken, secret) as AccessTokenPayload;

    if (payload?.jti) {
      await this.sessionService.revokeByJTI(payload.jti);
      accessSessionRevoked = true;
    }
  } catch (err: any) {
    jwtVerifyFailed = true;

    try {
      this.securityEvent.log({
        type: 'auth.jwt.invalid',
        severity: 'warning',
        meta: {
          phase: 'logout_access_revoke',
          reason: err?.name || 'verify_failed',
        },
      });
    } catch {}
  }
}


  // ============================================
  // Revoke refresh session
  // ============================================
  if (refreshToken) {
  try {
    await this.sessionService.revokeByRefreshToken(refreshToken);
    refreshSessionRevoked = true;

    try {
      this.securityEvent.log({
        type: 'auth.session.revoked',
        severity: 'info',
        meta: {
          phase: 'logout_refresh_revoke',
        },
      });
    } catch {}
  } catch {}
}


  // ============================================
  // Security Event: logout summary
  // ============================================
  try {
    this.securityEvent.log({
      type: 'auth.logout',
      severity: 'info',
      meta: {
        hadAccessCookie: Boolean(accessToken),
        hadRefreshCookie: Boolean(refreshToken),
        accessSessionRevoked,
        refreshSessionRevoked,
        jwtVerifyFailed,
      },
    });
  } catch {
    // must never affect logout flow
  }

  // ============================================
  // Clear cookies (always)
  // ============================================
  res.clearCookie(accessCookie, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: process.env.COOKIE_DOMAIN,
    path: '/',
  });

  res.clearCookie(refreshCookie, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: process.env.COOKIE_DOMAIN,
    path: '/',
  });

  return { success: true };
}


 async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);  
  }

// -------------------------------------------------------
// Verify Email (Local) — IdentityVerificationToken
// -------------------------------------------------------
async verifyEmailLocal(token: string) {
  if (!token || typeof token !== 'string') {
    throw new BadRequestException('Invalid verification token');
  }

  // ===============================
  // 1) Hash incoming token (server authority)
  // ===============================
  const tokenHash = createHash('sha256')
    .update(token)
    .digest('hex');

  // ===============================
  // 2) Atomic confirm (token + user verified)
  // ===============================
  let confirmed: boolean | null = null;

  try {
    confirmed = await this.repo.confirmEmailVerifyAtomic({
      tokenHash,
    });
  } catch (err) {
    this.logger.error(
      '[EMAIL_VERIFY_TX_FAILED]',
      err,
    );

    throw new BadRequestException(
      'Unable to verify email',
    );
  }

  if (!confirmed) {
    // ---- Security Event: invalid / reused / expired token ----
    try {
      this.securityEvent.log({
        type: 'security.abuse.detected',
        severity: 'warning',
        reason: 'email_verify_invalid_or_expired',
      });
    } catch {}

    throw new BadRequestException(
      'Invalid or expired verification token',
    );
  }

  // ===============================
  // 3) Security Event (success)
  // ===============================
  try {
    this.securityEvent.log({
  type: 'auth.login.success',
  severity: 'info',
  meta: {
    flow: 'email_verify',
  },
});

  } catch {}

  return { success: true };
}


  // ==========================================
  // GOOGLE
  // ==========================================
async findOrCreateUserFromGoogle(profile: any) {
  const email = profile.emails?.[0]?.value || null;
  const providerId = profile.sub || profile.id;

  // สร้าง OR เฉพาะ field ที่มีจริง เพื่อกัน undefined
  const orFilters: any[] = [
    { provider: 'google', providerId }
  ];

  if (email) {
    orFilters.push({ email });
  }

  let user = await this.prisma.user.findFirst({
    where: {
      OR: orFilters,
    },
  });

  
  if (!user) {
    const baseUsername = `google_${providerId}`.toLowerCase();
    let username = baseUsername;
    let counter = 1;

   
    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}_${counter++}`;
    }

    
    const placeholderPassword = await hashPassword(randomUUID());

    user = await this.prisma.user.create({
      data: {
        email: email ?? `no-email-google-${providerId}@placeholder.local`,
        name: profile.displayName ?? null,
        username,
        hashedPassword: placeholderPassword,
        provider: 'google',
        providerId,
        avatarUrl: profile.photos?.[0]?.value ?? null,
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
      this.logger.error('Failed to set firebaseUid for Google user');
      throw new Error('Failed to set firebaseUid');
    }
  }

  return user;
}

  // ==========================================
  // FACEBOOK
  // ==========================================
async findOrCreateUserFromFacebook(profile: any) {
  const email =
    profile.emails?.[0]?.value ||
    profile._json?.email ||
    null;

  const providerId = profile.id;

  const orFilters: any[] = [
    { provider: 'facebook', providerId }
  ];

  if (email) {
    orFilters.push({ email });
  }

  let user = await this.prisma.user.findFirst({
    where: {
      OR: orFilters,
    },
  });

  if (!user) {
    const baseUsername = `facebook_${providerId}`.toLowerCase();
    let username = baseUsername;
    let counter = 1;

    while (
      await this.prisma.user.findUnique({
        where: { username },
      })
    ) {
      username = `${baseUsername}_${counter++}`;
    }

    const placeholderPassword = await hashPassword(randomUUID());

    user = await this.prisma.user.create({
      data: {
        email: email ?? `no-email-facebook-${providerId}@placeholder.local`,
        name: profile.displayName ?? null,
        username,
        hashedPassword: placeholderPassword,
        provider: 'facebook',
        providerId,
        avatarUrl: profile.photos?.[0]?.value ?? null,
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
  const normalizedEmail =
    email && email.trim().length > 0
      ? email.toLowerCase()
      : null;

  // 1️⃣ หา user จาก provider + providerId
  let user = await this.prisma.user.findFirst({
    where: { provider, providerId },
  });

  // 2️⃣ Account linking ด้วย email
  if (!user && normalizedEmail) {
    const existingByEmail = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingByEmail) {
      user = await this.prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          provider,
          providerId,
        },
      });
    }
  }

  // 3️⃣ Create user ใหม่
  if (!user) {
    let baseUsername = `${provider}_${providerId}`.toLowerCase();
    let username = baseUsername;
    let counter = 1;

    while (
      await this.prisma.user.findUnique({
        where: { username },
      })
    ) {
      username = `${baseUsername}_${counter++}`;
    }

    const placeholderPassword = await hashPassword(randomUUID());

    user = await this.prisma.user.create({
      data: {
        email:
          normalizedEmail ??
          `oauth-${provider}-${randomUUID()}@placeholder.local`,
        name: name || null,
        username,
        hashedPassword: placeholderPassword,
        provider,
        providerId,
        avatarUrl: picture || null,
        firebaseUid: null,
      },
    });
  }

  // 4️⃣ Ensure firebaseUid (ครั้งเดียว)
  if (!user.firebaseUid) {
    const firebaseUid = `oauth_${provider}_${user.id}_${randomUUID()}`;

    user = await this.prisma.user.update({
      where: { id: user.id },
      data: { firebaseUid },
    });
  }

  if (!user.firebaseUid) {
    throw new Error('firebaseUid missing after OAuth linking');
  }

  return user.firebaseUid;
}

// ==========================================
// User lookup
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
  // ==========================================
  normalizeOAuthState(raw?: string | null): string {
    if (!raw) return '';
    let s = String(raw).trim();

    try {
      s = decodeURIComponent(s);
    } catch {
      s = s.replace(/\+/g, ' ');
      s = s.replace(/%2B/gi, '+');
      s = s.replace(/%3D/gi, '=');
      s = s.replace(/%2F/gi, '/');
    }

    s = s.replace(/^["']|["']$/g, '').trim();
    s = s.replace(/([^:]\/)\/+/g, '$1');

    return s;
  }

  async isUserBanned(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isBanned: true },
    });

    return user?.isBanned === true;
  }
}
