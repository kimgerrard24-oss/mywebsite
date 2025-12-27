// backend/src/chat/dto/chat-message-list.dto.ts
import { ChatMessageDto } from './chat-message.dto';

export class ChatMessageListDto {
  items!: ChatMessageDto[];
  nextCursor!: string | null;

  static fromRows(
    rows: any[],
    options: { limit: number },
  ): ChatMessageListDto {
    const hasMore = rows.length > options.limit;
    const sliced = hasMore
      ? rows.slice(0, options.limit)
      : rows;

    return {
      items: sliced.map(ChatMessageDto.fromRow),
      nextCursor: hasMore
        ? sliced[sliced.length - 1].id
        : null,
    };
  }
}
