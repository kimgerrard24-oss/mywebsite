// ==========================================
// file: backend/src/socket/socket.gateway.ts
// ==========================================

import { Logger, Injectable } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';
import { FirebaseAdminService } from '../firebase/firebase.service';

@Injectable()
@WebSocketGateway({
  namespace: '/',
  transports: ['websocket', 'polling'],

  // Production CORS (PhlyPhant)
  cors: {
    origin: [
      'https://phlyphant.com',
      'https://api.phlyphant.com',
      /\.phlyphant\.com$/,
    ],
    credentials: true,
  },
})
export class SocketGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SocketGateway.name);

  constructor(
    private readonly firebase: FirebaseAdminService,
  ) {}

  afterInit() {
    this.logger.log(
      'Socket.IO Gateway initialized successfully',
    );
  }

  // =====================================================
  // Token Authentication (Session Cookie + Bearer Fallback)
  // =====================================================
  async handleConnection(client: Socket) {
    try {
      // Disable authentication for specific mode (optional)
      if (process.env.DISABLE_SOCKET_AUTH === 'true') {
        this.logger.warn(
          `Socket connected without auth (DISABLE_SOCKET_AUTH=true) id=${client.id}`,
        );
        client.data.user = null;
        return;
      }

      const cookieName =
        process.env.SESSION_COOKIE_NAME || 'session';

      // Cookie parsing
      const raw =
        client.handshake.headers.cookie || '';
      const parsed = cookie.parse(raw);

      let session = parsed[cookieName];

      // Bearer fallback
      if (
        !session &&
        client.handshake.headers.authorization
      ) {
        const auth =
          client.handshake.headers.authorization;

        if (
          typeof auth === 'string' &&
          auth.startsWith('Bearer ')
        ) {
          session = auth.substring(7).trim();
        }
      }

      // No session token
      if (!session) {
        this.logger.warn(
          `Connection without valid session token id=${client.id}`,
        );
        client.data.user = null;
        return;
      }

      // Verify Firebase Session Cookie
      const decoded =
        await this.firebase
          .auth()
          .verifySessionCookie(session, false);

      client.data.user = decoded;

      this.logger.log(
        `Client connected id=${client.id}, uid=${decoded.uid}`,
      );
    } catch (err) {
      this.logger.warn(
        `Session verification failed id=${client.id}: ${
          err instanceof Error ? err.message : err
        }`,
      );
      client.data.user = null;
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      `Client disconnected id=${client.id}`,
    );
  }

  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    payload: any,
  ) {
    this.server.emit('message', payload);
  }
}
