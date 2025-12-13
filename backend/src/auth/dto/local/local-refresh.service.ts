// backend/src/auth/dto/local/local-refresh.service.ts

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SessionService } from '../../session/session.service';
import { SessionPayload } from '../../session/session.types';
import { RefreshTokenResponseDto } from '../refresh-token-response.dto';
import { AuthService } from '../../auth.service';

@Injectable()
export class LocalRefreshService {
  private readonly logger = new Logger(LocalRefreshService.name);

  constructor(
    private readonly sessionService: SessionService,
    private readonly authService: AuthService,
  ) {}

  async refreshTokens(
    refreshToken: string,
    meta?: { ip?: string | null; userAgent?: string | null },
  ): Promise<RefreshTokenResponseDto> {

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const stored = await this.sessionService.getSessionByRefreshToken(refreshToken);
    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await this.sessionService.verifyRefreshToken(refreshToken, stored);
    if (!isValid) {
      this.logger.warn('Refresh token hash verification failed');
      await this.sessionService.revokeByRefreshToken(refreshToken);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload: SessionPayload = stored.payload;

    const newSession = await this.authService.createSessionToken(payload.userId);

    await this.sessionService.revokeByRefreshToken(refreshToken);

    return new RefreshTokenResponseDto(
      newSession.accessToken,
      newSession.refreshToken,
      payload,
    );
  }
}
