// frontend/src/components/chat/ChatComposer.tsx
import { FormEvent } from "react";
import { useChatComposer } from "@/hooks/useChatComposer";
import ChatComposerError from "./ChatComposerError";

type Props = {
  chatId: string;
  onMessageSent?: (msg: any) => void;
};

export default function ChatComposer({
  chatId,
  onMessageSent,
}: Props) {
  const {
    content,
    setContent,
    submit,
    loading,
    error,
  } = useChatComposer({
    chatId,
    onSent: onMessageSent,
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t px-3 py-2"
      aria-label="Send message"
    >
      {error && <ChatComposerError message={error} />}

      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={1}
          placeholder="Type a message…"
          className="flex-1 resize-none rounded-md border px-3 py-2 text-sm"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </form>
  );
}
