// frontend/src/components/comments/CommentComposer.tsx

import { FormEvent, useState } from "react";
import { createPostComment } from "@/lib/api/comments";
import type { Comment } from "@/types/comment";

type Props = {
  postId: string;

  /**
   * แจ้ง parent เมื่อสร้าง comment สำเร็จ
   * (ใช้ sync state แบบ fail-soft)
   */
  onCreated?: (comment: Comment) => void;
};

export default function CommentComposer({
  postId,
  onCreated,
}: Props) {
  /**
   * =========================
   * Local state (UI only)
   * =========================
   */
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * =========================
   * Submit comment
   * =========================
   */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;

    try {
      setLoading(true);
      setError(null);

      const comment = await createPostComment(postId, {
        content: content.trim(),
      });

      // reset input
      setContent("");

      // 🔔 notify parent (fail-soft)
      onCreated?.(comment);
    } catch (err) {
      console.error("Create comment failed:", err);
      setError("ไม่สามารถส่งคอมเมนต์ได้");
    } finally {
      setLoading(false);
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
        disabled={loading}
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
          disabled:opacity-60
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
        {loading ? "Posting..." : "Post"}
      </button>

      {error && (
        <p
          className="mt-1 text-xs text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </form>
  );
}
