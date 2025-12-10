// src/auth/decorators/current-user.decorator.ts

import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import type { SessionUser } from '../services/validate-session.service';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SessionUser | null => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as SessionUser | undefined;
    return user ?? null;
  },
);
