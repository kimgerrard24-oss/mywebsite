// src/auth/dto/refresh-token-response.dto.ts

import { SessionPayload } from '../session/session.types';

export class RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
  user: SessionPayload;

  // Constructor to initialize the object
  constructor(accessToken: string, refreshToken: string, user: SessionPayload) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
  }
}



