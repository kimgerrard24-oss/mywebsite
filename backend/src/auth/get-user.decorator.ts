// backend/src/auth/get-user.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    // รองรับทั้ง HTTP และ WebSocket
    const req =
      ctx.switchToHttp().getRequest() ||
      (ctx.switchToWs && ctx.switchToWs().getClient && ctx.switchToWs().getClient()) ||
      null;

    if (!req || typeof req !== 'object') {
      return null;
    }

    const user = (req as any).user || null;

    if (!user || typeof user !== 'object') {
      return null;
    }

    // หาก user มี แต่ requester ขอ field เช่น uid, email
    if (data) {
      return user[data] ?? null;
    }

    return user;
  },
);
