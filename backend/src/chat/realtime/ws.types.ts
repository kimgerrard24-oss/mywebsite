// backend/src/chat/realtime/ws.types.ts

import { ChatMessageDto } from '../dto/chat-message.dto';

export const WS_EVENTS = {
  CHAT_NEW_MESSAGE: 'chat:new-message',
  CHAT_MESSAGE_DELETED: 'chat:message-deleted',

  // ============================
  // Typing (ephemeral)
  // ============================
  CHAT_TYPING: 'chat:typing',
} as const;

export type ChatNewMessageEvent = {
  chatId: string;
  message: ChatMessageDto;
};

export type ChatMessageDeletedEvent = {
  chatId: string;
  messageId: string;
};

/**
 * ============================
 * Typing event
 * - Realtime only
 * - Not persisted
 * ============================
 */
export type ChatTypingEvent = {
  chatId: string;
  userId: string;
  isTyping: boolean;
  at: number;
};
