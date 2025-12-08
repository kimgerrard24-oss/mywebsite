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
import { hashPassword } from './untils/password.util';
import { randomUUID } from 'crypto';
import { MailService } from '../mail/mail.service';
import { comparePassword } from './untils/password.util';
import { AuditService } from './audit.service';
import { Redis } from 'ioredis';
import { RedisService } from '../redis/redis.service';


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

    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
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

  return this.repo.createUser({
    email: dto.email,
    username: dto.username,
    hashedPassword: hashed,
    provider: 'local',
    providerId: dto.email,  
  });
}

// -------------------------------------------------------
// Local Login
// -------------------------------------------------------
async validateUser(email: string, password: string) {
  const user = await this.repo.findUserByEmail(email);
  if (!user) {
    await this.audit.logLoginAttempt({ email, success: false, reason: 'user_not_found' });
    return null;
  }

  if (user.isDisabled) {
    await this.audit.logLoginAttempt({
      userId: user.id,
      email,
      success: false,
      reason: 'account_disabled',
    });
    throw new ForbiddenException('Account disabled');
  }

  // Prevent crash if DB has no hash
  if (!user.hashedPassword || typeof user.hashedPassword !== 'string') {
    await this.audit.logLoginAttempt({
      userId: user.id,
      email,
      success: false,
      reason: 'missing_password_hash',
    });
    return null;
  }

  // Argon2 verify
  let ok = false;
  try {
    ok = await argon2.verify(user.hashedPassword, password);
  } catch (err) {
    await this.audit.logLoginAttempt({
      userId: user.id,
      email,
      success: false,
      reason: 'password_verify_error',
    });
    return null;
  }

  if (!ok) {
    await this.audit.logLoginAttempt({
      userId: user.id,
      email,
      success: false,
      reason: 'invalid_password',
    });
    return null;
  }

  await this.repo.updateLastLogin(user.id);
  await this.audit.logLoginAttempt({
    userId: user.id,
    email,
    success: true,
  });

  const safe: any = { ...user };
  delete safe.hashedPassword;

  return safe;
}

async createSessionToken(userId: string) {
  // 1) create access token
  const accessToken = randomBytes(32).toString('hex');
  const accessKey = `session:access:${accessToken}`;

  const payload = {
    userId,
    createdAt: Date.now(),
  };

  // TTL in seconds
  const accessTTL = Number(process.env.ACCESS_TOKEN_TTL_SECONDS) || 60 * 15;

  await this.redis.set(
    accessKey,
    JSON.stringify(payload),
    'EX',
    accessTTL,
  );

  // 2) create refresh token
  const refreshToken = randomBytes(48).toString('hex');
  const refreshKey = `session:refresh:${refreshToken}`;

  const refreshTTL =
    Number(process.env.REFRESH_TOKEN_TTL_SECONDS) || 60 * 60 * 24 * 30;

  await this.redis.set(
    refreshKey,
    JSON.stringify({ userId }),
    'EX',
    refreshTTL,
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: accessTTL,
  };
}

// Local Logout
async logout(res: any) {
  const cookieName = process.env.JWT_COOKIE_NAME || 'phlyphant_token';

  const token = res.req.cookies?.[cookieName];

  if (token) {
    const redisKey = `session:access:${token}`;
    await this.redis.del(redisKey);
  }

  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    domain: process.env.COOKIE_DOMAIN,
  });
}

  // -------------------------------------------------------
  // Refresh Token (Local)
  // -------------------------------------------------------


  // -------------------------------------------------------
  // Request Password Reset (Local)
  // -------------------------------------------------------


  // -------------------------------------------------------
  // Reset Password (Local)
  // -------------------------------------------------------
 

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

  const ok = await comparePassword(token, user.emailVerifyTokenHash);
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
  const safeEmail =
    email && email.trim().length > 0
      ? email
      : `${provider}-${providerId}@placeholder.local`;

  let user = await this.prisma.user.findFirst({
    where: { provider, providerId },
  });

  // ================================
  // Create new OAuth user (first login)
  // ================================
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
        email: safeEmail,
        name: name || '',
        username,
        hashedPassword: placeholderPassword,
        provider,
        providerId,
        avatarUrl: picture || null,
        firebaseUid: null,
      },
    });
  }

  // ====================================
  // Generate firebaseUid on first OAuth login
  // ====================================
  const firebaseUid = user.firebaseUid || `oauth_${provider}_${user.id}`;

  // Save firebaseUid only once
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
}
