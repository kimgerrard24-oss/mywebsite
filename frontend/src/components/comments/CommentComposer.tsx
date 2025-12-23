// frontend/src/components/comments/CommentComposer.tsx
import { FormEvent, useState } from "react";
import { usePostComments } from "@/hooks/usePostComments";

type Props = {
  postId: string;
  onCreated?: () => void;
};

export default function CommentComposer({
  postId,
  onCreated,
}: Props) {
  const [content, setContent] = useState("");
  const { submitComment, loading } = usePostComments({ postId });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    const res = await submitComment(content.trim());
    if (res) {
      setContent("");
      onCreated?.();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 flex gap-2"
      aria-label="Add a comment"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        maxLength={1000}
        required
        className="flex-1 resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring"
        placeholder="Write a comment..."
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Post
      </button>
    </form>
  );
}
