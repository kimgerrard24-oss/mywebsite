// backend/src/chat/realtime/ws-auth.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import type { Request } from 'express';
import { ValidateSessionService } from '../../auth/services/validate-session.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(
    private readonly validateSession: ValidateSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket =
      context.switchToWs().getClient();

    const req = client.request as Request;

    try {
      const user =
        await this.validateSession.validateAccessTokenFromRequest(
          req,
        );

      (client as any).user = user;

      return true;
    } catch {
      this.logger.warn(
        `[WS AUTH] Unauthorized socket=${client.id}`,
      );
      return false;
    }
  }
}
