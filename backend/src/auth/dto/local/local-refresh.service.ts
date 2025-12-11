// src/auth/local/local-refresh.service.ts

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SessionService } from '../../session/session.service';
import { SessionPayload, StoredSessionData } from '../../session/session.types';
import { AuthService } from '../../auth.service';
import { RefreshTokenResponseDto } from '../refresh-token-response.dto';

@Injectable()
export class LocalRefreshService {
  private readonly logger = new Logger(LocalRefreshService.name);

  constructor(
    private readonly sessionService: SessionService,
    private readonly authService: AuthService, // NEW
  ) {}

  /**
   * Refresh tokens using new JWT + jti-based session architecture
   */
  async refreshTokens(
    refreshToken: string,
    meta?: { ip?: string | null; userAgent?: string | null },
  ): Promise<RefreshTokenResponseDto> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    // Get stored session for this refresh token
    const stored = await this.sessionService.getSessionByRefreshToken(refreshToken);

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Validate refresh token hash
    const isValid = await this.sessionService.verifyRefreshToken(refreshToken, stored);
    if (!isValid) {
      this.logger.warn('Refresh token hash verification failed');
      await this.sessionService.revokeByRefreshToken(refreshToken);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload: SessionPayload = stored.payload;

    // Generate a full new session (JWT access token + refresh token)
    const newSession = await this.authService.createSessionToken(payload.userId);

    // Remove old refresh token session
    await this.sessionService.revokeByRefreshToken(refreshToken);

    const response = new RefreshTokenResponseDto();
    response.accessToken = newSession.accessToken;
    response.refreshToken = newSession.refreshToken;
    response.user = payload;

    return response;
  }
}
