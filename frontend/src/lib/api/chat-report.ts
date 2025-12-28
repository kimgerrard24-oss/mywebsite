// frontend/src/lib/api/chat-report.ts
import { apiPost } from '@/lib/api/api';
import type { ChatReportPayload } from '@/types/chat-report';

/**
 * POST /chat/:chatId/report
 * - Cookie-based auth (HttpOnly)
 * - Backend is authority
 * - Handle duplicate report gracefully
 */
export async function reportChat(
  chatId: string,
  payload: ChatReportPayload,
): Promise<void> {
  try {
    await apiPost(`/chat/${chatId}/report`, payload, {
      withCredentials: true,
    });
  } catch (err: any) {
    /**
     * Backend: duplicate report
     * Prisma unique constraint (chatId, reporterId)
     * Expected status: 409 (or mapped from 500)
     */
    const status = err?.response?.status;

    if (status === 409 || status === 500) {
      const e = new Error('CHAT_ALREADY_REPORTED');
      (e as any).status = 409;
      throw e;
    }

    // Other unexpected errors
    throw err;
  }
}
