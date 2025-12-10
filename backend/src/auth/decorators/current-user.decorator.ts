// src/auth/decorators/current-user.decorator.ts

import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import type { SessionUser } from '../services/validate-session.service';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionUser | null => {
    const request = ctx.switchToHttp().getRequest();

    // ดึงจากที่ guard แนบไว้
    const sessionUser = request.sessionUser as SessionUser | undefined;

    return sessionUser ?? null;
  },
);
