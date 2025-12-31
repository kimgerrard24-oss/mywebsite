// frontend/src/components/comments/ReplyComposer.tsx

import { FormEvent, useState } from "react";

type Props = {
  onSubmit: (content: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
};

export default function ReplyComposer({
  onSubmit,
  loading,
  error,
}: Props) {
  const [content, setContent] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmed = content.trim();
    if (!trimmed || loading) return;

    const ok = await onSubmit(trimmed);
    if (ok) {
      setContent("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-1.5 mt-2"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={1}
        disabled={loading}
        placeholder="Write a reply…"
        className="flex-1 resize-none rounded border px-2 py-1 text-xs"
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-black px-2 py-1 text-xs text-white"
      >
        Reply
      </button>

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
