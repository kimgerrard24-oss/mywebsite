import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SessionService } from '../../session/session.service';
import { SessionPayload } from '../../session/session.types';
import { RefreshTokenResponseDto } from '../refresh-token-response.dto';
import { generateSecureToken } from '../../../common/crypto/token-generator.util';

@Injectable()
export class LocalRefreshService {
  private readonly logger = new Logger(LocalRefreshService.name);

  constructor(
    private readonly sessionService: SessionService,
  ) {}

  async refreshTokens(
    refreshToken: string,
    meta?: { ip?: string | null; userAgent?: string | null },
  ): Promise<RefreshTokenResponseDto> {

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    // Lookup refresh session
    const stored = await this.sessionService.getSessionByRefreshToken(refreshToken);

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verify refresh token hash
    const isValid = await this.sessionService.verifyRefreshToken(refreshToken, stored);
    if (!isValid) {
      this.logger.warn('Refresh token hash verification failed');
      await this.sessionService.revokeByRefreshToken(refreshToken);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload: SessionPayload = stored.payload;

    // Generate new session (hybrid JWT + Redis jti)
    const newAccessToken = generateSecureToken(32);
    const newRefreshToken = generateSecureToken(32);

    await this.sessionService.createSession(
      payload,
      newAccessToken,
      newRefreshToken,
      {
        ip: meta?.ip ?? stored.ip,
        userAgent: meta?.userAgent ?? stored.userAgent,
      }
    );

    // Revoke old refresh token
    await this.sessionService.revokeByRefreshToken(refreshToken);

    // Build response DTO
    const response = new RefreshTokenResponseDto();
    response.accessToken = newAccessToken;
    response.refreshToken = newRefreshToken;
    response.user = payload;

    return response;
  }
}
