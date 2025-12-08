// src/auth/local/local-refresh.service.ts

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SessionService } from '../../session/session.service';
import { SessionPayload, StoredSessionData } from '../../session/session.types';
import { generateSecureToken } from '../../../common/crypto/token-generator.util';
import { RefreshTokenResponseDto } from '../refresh-token-response.dto';

@Injectable()
export class LocalRefreshService {
  private readonly logger = new Logger(LocalRefreshService.name);

  constructor(private readonly sessionService: SessionService) {}

  /**
   * Logic หลักสำหรับ refresh access token
   */
  async refreshTokens(
    refreshToken: string,
    meta?: { ip?: string | null; userAgent?: string | null },
  ): Promise<RefreshTokenResponseDto> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const stored = await this.sessionService.getSessionByRefreshToken(refreshToken);

    if (!stored) {
      // ไม่พบ session → token หมดอายุ หรือถูกลบแล้ว
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await this.sessionService.verifyRefreshToken(refreshToken, stored);
    if (!isValid) {
      // ถ้าตรวจ hash ไม่ผ่าน อาจโดนปลอมแปลง
      this.logger.warn('Refresh token hash verification failed');
      await this.sessionService.revokeByRefreshToken(refreshToken);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload: SessionPayload = stored.payload;

    // TODO: ในอนาคตสามารถเช็ค user ถูก disable / ban จาก DB ได้ที่นี่

    // Generate token ใหม่
    const newAccessToken = generateSecureToken(32);
    const newRefreshToken = generateSecureToken(32);

    // สร้าง session ใหม่ แล้วลบของเก่าออก
    await this.sessionService.createSession(payload, newAccessToken, newRefreshToken, {
      ip: meta?.ip ?? stored.ip,
      userAgent: meta?.userAgent ?? stored.userAgent,
    });

    await this.sessionService.revokeByRefreshToken(refreshToken);
    // ถ้าคุณมี accessToken เก่าใน stored payload จะสามารถ revokeByAccessToken() ได้ด้วย

    const response = new RefreshTokenResponseDto();
    response.accessToken = newAccessToken;
    response.refreshToken = newRefreshToken;
    response.user = payload;

    return response;
  }
}
