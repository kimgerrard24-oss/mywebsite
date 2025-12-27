// frontend/src/components/chat/ChatMessageEditor.tsx

import { useState } from 'react';
import { useEditChatMessage } from '@/hooks/useEditChatMessage';

type Props = {
  chatId: string;
  messageId: string;
  initialContent: string;
  onSaved: (msg: any) => void;
  onCancel: () => void;
};

export default function ChatMessageEditor({
  chatId,
  messageId,
  initialContent,
  onSaved,
  onCancel,
}: Props) {
  const [content, setContent] = useState(initialContent);
  const { submitEdit, loading } = useEditChatMessage();

  async function handleSave() {
    const updated = await submitEdit({
      chatId,
      messageId,
      content,
    });

    if (updated) {
      onSaved(updated);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded border px-2 py-1 text-sm"
        rows={3}
      />

      <div className="flex gap-2 text-xs">
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded bg-blue-600 px-2 py-1 text-white"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="rounded px-2 py-1 text-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
