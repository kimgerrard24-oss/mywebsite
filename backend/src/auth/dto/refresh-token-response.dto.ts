// src/auth/dto/refresh-token-response.dto.ts

import { SessionPayload } from '../session/session.types';

export class RefreshTokenResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: SessionPayload;
}

