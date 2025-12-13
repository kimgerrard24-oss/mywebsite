// src/auth/session.controller.ts

import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  Header,
} from '@nestjs/common';
import { Request } from 'express';

import { AccessTokenCookieAuthGuard } from './guards/access-token-cookie.guard';
import { SessionService } from './session/session.service';
import { RedisService } from '../redis/redis.service';

@Controller('auth/sessions')
@UseGuards(AccessTokenCookieAuthGuard)
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly redisService: RedisService,
  ) {}

  // =====================================================
  // GET /auth/sessions
  // List all active sessions (multi-device)
  // =====================================================
  // =====================================================
// GET /auth/sessions
// List all active sessions (multi-device)
// =====================================================
@Get()
@Header('Cache-Control', 'no-store')
async listSessions(
  @Req() req: Request,
): Promise<{
  success: true;
  data: Array<{
    jti: string;
    deviceId: string | null;
    userAgent: string | null;
    ip: string | null;
    createdAt: string | null;
    lastSeenAt: string | null;
  }>;
}> {
  const user = (req as any).user;

  if (!user?.userId) {
    throw new UnauthorizedException('Invalid session user');
  }

  const sessions =
    await this.sessionService.getSessionsByUser(user.userId);

  return {
    success: true,
    data: sessions.map(({ jti, data }) => ({
      jti,
      deviceId: data?.deviceId ?? null,
      userAgent: data?.userAgent ?? null,
      ip: data?.ip ?? null,
      createdAt: data?.createdAt ?? null,
      lastSeenAt: data?.lastSeenAt ?? null,
    })),
  };
}

  // =====================================================
// POST /auth/sessions/:jti/revoke
// Revoke a specific device/session
// =====================================================
@Post(':jti/revoke')
@HttpCode(HttpStatus.OK)
async revokeSession(
  @Req() req: Request,
  @Param('jti') jti: string,
): Promise<{
  success: true;
  message: string;
}> {
  const user = (req as any).user;

  if (!user?.userId || !user?.jti) {
    throw new UnauthorizedException('Invalid session user');
  }

  const normalizedJti = String(jti).trim();

  if (!normalizedJti) {
    throw new BadRequestException('Invalid session id');
  }

  if (normalizedJti === user.jti) {
    throw new BadRequestException(
      'You cannot revoke the current active session',
    );
  }

  const owned = await this.redisService.sismember(
    `session:user:${user.userId}`,
    normalizedJti,
  );

  if (!owned) {
    throw new ForbiddenException('You cannot revoke this session');
  }

  await this.sessionService.revokeByJTI(normalizedJti);

  return {
    success: true,
    message: 'Session revoked successfully',
  };
}
}