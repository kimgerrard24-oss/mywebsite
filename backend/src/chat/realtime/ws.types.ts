// backend/src/chat/realtime/ws.types.ts
import { ChatMessageDto } from '../dto/chat-message.dto';

export const WS_EVENTS = {
  CHAT_NEW_MESSAGE: 'chat:new-message',
} as const;

export type ChatNewMessageEvent = {
  chatId: string;
  message: ChatMessageDto;
};
