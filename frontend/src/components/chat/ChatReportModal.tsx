// frontend/src/components/chat/ChatReportModal.tsx
import { useState } from 'react';
import {
  ChatReportReason,
} from '@/types/chat-report';
import { reportChat } from '@/lib/api/chat-report';

type Props = {
  chatId: string;
  onClose: () => void;
};

export default function ChatReportModal({
  chatId,
  onClose,
}: Props) {
  const [reason, setReason] =
    useState<ChatReportReason>(
      ChatReportReason.SPAM,
    );
  const [description, setDescription] =
    useState('');
  const [loading, setLoading] =
    useState(false);

  async function handleSubmit() {
    if (loading) return;

    setLoading(true);
    try {
      await reportChat(chatId, {
        reason,
        description:
          description.trim() || undefined,
      });
      onClose();
    } catch {
      alert('Failed to report chat');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">
          Report chat
        </h2>

        <label className="block text-sm font-medium">
          Reason
        </label>
        <select
          className="mt-1 w-full rounded border px-2 py-1"
          value={reason}
          onChange={(e) =>
            setReason(
              e.target.value as ChatReportReason,
            )
          }
        >
          {Object.values(ChatReportReason).map(
            (r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ),
          )}
        </select>

        <label className="mt-3 block text-sm font-medium">
          Description (optional)
        </label>
        <textarea
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
          rows={3}
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm text-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded bg-red-600 px-3 py-1 text-sm text-white"
          >
            Report
          </button>
        </div>
      </div>
    </div>
  );
}
