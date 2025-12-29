// frontend/src/components/chat/ChatMessageComposer.tsx

import { useState } from 'react';
import { useChatTyping } from '@/hooks/useChatTyping';

type Props = {
  chatId: string;
  onSend?: (text: string) => void | Promise<void>;
};

export default function ChatMessageComposer({
  chatId,
  onSend,
}: Props) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { notifyTyping } = useChatTyping(chatId);

  function handleChange(
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) {
    setText(e.target.value);
    notifyTyping();
  }

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (isSending) return;

    const value = text.trim();
    if (!value) return;

    try {
      setIsSending(true);
      await onSend?.(value);
      setText('');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t p-3"
    >
      <textarea
        value={text}
        onChange={handleChange}
        rows={2}
        placeholder="Type a message…"
        className="w-full resize-none rounded-md border px-3 py-2 text-sm focus:outline-none"
        disabled={isSending}
      />
    </form>
  );
}
