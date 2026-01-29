// backend/src/shares/shares.service.ts

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { SharesRepository } from './shares.repository';
import { ShareCreatePolicy } from './policy/share-create.policy';
import { NotificationsService } from '../notifications/notifications.service';
import { ChatMessagesService } from '../chat/chat-messages.service';

@Injectable()
export class SharesService {
  constructor(
    private readonly repo: SharesRepository,
    private readonly notifications: NotificationsService,
    private readonly chatMessages: ChatMessagesService,
  ) {}

  /**
   * FINAL AUTHORITY:
   * Service → Repository(load) → Policy(decide)
   * → DB commit → Notification → Realtime
   */
async createShare(params: {
  actorUserId: string;
  postId: string;
  targetUserId: string | null;
  targetChatId: string | null;
}) {
  const ctx = await this.repo.loadContext(params);

  const decision = ShareCreatePolicy.decide({
    ...ctx,
    targetChatId: params.targetChatId,
  } as any);

  if (decision === 'NOT_FOUND') {
    throw new NotFoundException('Post not found');
  }

  if (decision !== 'OK') {
    throw new ForbiddenException(
      'Cannot share this post',
    );
  }

  /**
   * 1️⃣ DB = authority
   */
  const row = await this.repo.createShare({
    postId: params.postId,
    senderId: params.actorUserId,
    targetUserId: params.targetUserId,
    targetChatId: params.targetChatId,
  });

  /**
   * 1.5️⃣ Share to chat → create POST_SHARE message
   * - fail-soft
   * - BUT capture authoritative snapshot for sender
   */
  let chatMessage = null;

  if (params.targetChatId) {
    try {
      chatMessage =
        await this.chatMessages.createPostShareMessage({
          chatId: params.targetChatId,
          senderId: params.actorUserId,
          postId: params.postId,
        });

      // link message → share (authority)
      await this.repo.attachChatMessage({
        shareId: row.id,
        chatMessageId: chatMessage.id,
      });
    } catch {
      // must not break share flow
      // optional: log later
    }
  }

  /**
   * 2️⃣ Notification (only if share to user)
   */
  if (params.targetUserId) {
    try {
      await this.notifications.createNotification({
        userId: params.targetUserId,
        actorUserId: params.actorUserId,
        type: 'feed_repost',
        entityId: params.postId,
        payload: {
          postId: params.postId,
          actorUserId: params.actorUserId,
        },
      });
    } catch {}
  }

  /**
   * 3️⃣ Response (authoritative for sender)
   */
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),

    // ✅ IMPORTANT: allow sender to render immediately
    chatMessage,
  };
}

}
