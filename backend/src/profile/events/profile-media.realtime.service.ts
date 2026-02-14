// backend/src/profile/events/profile-media.realtime.service.ts

import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { Inject } from '@nestjs/common';

@Injectable()
export class ProfileMediaRealtimeService {
  constructor(@Inject('IO_SERVER') private readonly io: Server) {}

  emitProfileMediaDeleted(userId: string, mediaId: string) {
    this.io.to(`user:${userId}`).emit('profile:media-deleted', {
      mediaId,
    });
  }
}
