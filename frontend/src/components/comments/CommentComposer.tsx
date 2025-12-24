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
  className="mt-2 flex gap-1.5"
  aria-label="Add a comment"
>
  <textarea
    value={content}
    onChange={(e) => setContent(e.target.value)}
    rows={1}
    maxLength={1000}
    required
    className="
      flex-1
      resize-none
      rounded-md
      border
      px-2
      py-1
      text-xs
      leading-snug
      focus:outline-none
      focus:ring
    "
    placeholder="Write a comment..."
  />

  <button
    type="submit"
    disabled={loading}
    className="
      rounded-md
      bg-black
      px-2.5
      py-1
      text-xs
      font-medium
      text-white
      disabled:opacity-50
    "
  >
    Post
  </button>
</form>
  );
}
