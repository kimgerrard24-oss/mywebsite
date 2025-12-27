// backend/src/feed/realtime/feed-realtime.service.ts

import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  WS_FEED_EVENTS,
  FeedNewPostEvent,
} from './ws.types';

@Injectable()
export class FeedRealtimeService {
  private server: Server | null = null;

  bindServer(server: Server) {
    this.server = server;
  }

  emitNewPost(
    userId: string,
    payload: FeedNewPostEvent,
  ) {
    if (!this.server) return;

    this.server
      .to(`user:${userId}`)
      .emit(
        WS_FEED_EVENTS.NEW_POST,
        payload,
      );
  }

  emitInvalidate(
    userId: string,
  ) {
    if (!this.server) return;

    this.server
      .to(`user:${userId}`)
      .emit(
        WS_FEED_EVENTS.INVALIDATE,
        {
          reason: 'new-post',
        },
      );
  }
}
