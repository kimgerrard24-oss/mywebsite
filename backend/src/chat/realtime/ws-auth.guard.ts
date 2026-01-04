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

  /**
   * NOTE:
   * - This guard is NOT used for socket handshake
   * - It only protects @SubscribeMessage handlers
   * - Do NOT rely on this for room join or realtime auth
   */
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const client: Socket =
      context.switchToWs().getClient();

    const req = client.request as Request | undefined;

    if (!req) {
      this.logger.error(
        `[WS AUTH] socket.request missing socket=${client.id}`,
      );
      return false;
    }

    try {
      const user =
        await this.validateSession.validateAccessTokenFromRequest(
          req,
        );

      (client as any).user = user;

      this.logger.debug(
        `[WS AUTH] validated socket=${client.id} userId=${user.userId}`,
      );

      return true;
    } catch {
      this.logger.warn(
        `[WS AUTH] unauthorized socket=${client.id}`,
      );
      return false;
    }
  }
}
