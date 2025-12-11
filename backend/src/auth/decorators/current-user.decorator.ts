// src/auth/decorators/current-user.decorator.ts

import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import type { SessionUser } from '../services/validate-session.service';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionUser | null => {
    const request = ctx.switchToHttp().getRequest();

    // ตรวจสอบการตั้งค่า session user ที่ request.user
    const sessionUser = request.user as SessionUser | undefined;

    return sessionUser ?? null;  // ถ้าไม่มี user, คืนค่าเป็น null
  },
);

