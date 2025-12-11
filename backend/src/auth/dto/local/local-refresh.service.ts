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

    // Validate refresh token directly
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

    // Generate new session with access token and refresh token
    const newSession = await this.authService.createSessionToken(payload.userId);

    // Revoke old refresh token
    await this.sessionService.revokeByRefreshToken(refreshToken);

    // Build response with new tokens and user details
    // Fix: Pass arguments to the constructor
    const response = new RefreshTokenResponseDto(
      newSession.accessToken,
      newSession.refreshToken,
      payload,
    );

    return response;
  }

  private decodeBase64Url(encoded: string): string {
    try {
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      return Buffer.from(padded, 'base64').toString('utf8');
    } catch (error) {
      throw new UnauthorizedException('Invalid token format');
    }
  }
}
