// frontend/src/lib/api/chat-report.ts
import { apiPost } from '@/lib/api/api';
import type { ChatReportPayload } from '@/types/chat-report';

/**
 * POST /chat/:chatId/report
 * - Cookie-based auth (HttpOnly)
 * - Backend is authority
 */
export async function reportChat(
  chatId: string,
  payload: ChatReportPayload,
): Promise<void> {
  await apiPost(`/chat/${chatId}/report`, payload, {
    withCredentials: true,
  });
}

