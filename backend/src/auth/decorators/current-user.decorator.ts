// src/auth/decorators/current-user.decorator.ts

import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import type { SessionUser } from '../services/validate-session.service';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionUser | null => {
    const request = ctx.switchToHttp().getRequest();

    // FIX: Guard ใส่ session user ไว้ที่ request.user
    const sessionUser = request.user as SessionUser | undefined;

    return sessionUser ?? null;
  },
);
