// src/auth/strategies/local.strategy.ts
// Lightweight "strategy" class — not depending on Passport so it's easy to call in service.
// You can adapt to @nestjs/passport if you prefer.

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy {
  constructor(private readonly authService: AuthService) {}

  // Returns user object (without sensitive fields) on success, or throws UnauthorizedException
  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
