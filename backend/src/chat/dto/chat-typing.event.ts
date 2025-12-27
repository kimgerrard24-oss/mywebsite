// backend/src/chat/dto/chat-typing.event.ts

/**
 * =====================================================
 * ChatTypingEvent
 * - Realtime ephemeral event (Redis Pub/Sub)
 * - NOT persisted
 * - NOT part of HTTP response schema
 * =====================================================
 */
export class ChatTypingEvent {
  chatId!: string;
  userId!: string;
  isTyping!: boolean;
  at!: number;
}
