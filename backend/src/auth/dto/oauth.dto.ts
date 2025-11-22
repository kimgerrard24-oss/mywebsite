// src/auth/dto/oauth.dto.ts
import { IsIn, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class OAuthDto {
  @IsString()
  @IsIn(['google', 'facebook'])
  provider!: 'google' | 'facebook';

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  redirectUri!: string;

  // optional state, pkce_verifier etc if required
  @IsString()
  state?: string;
}
