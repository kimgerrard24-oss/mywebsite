// frontend/components/posts/PostComposer.tsx
import { useState, useCallback } from "react";
import { createPost } from "@/lib/api/posts";

type Props = {
  onPostCreated?: () => void;
};

const MAX_LENGTH = 500;

export default function PostComposer({ onPostCreated }: Props) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX_LENGTH - content.length;

  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    if (!content.trim()) {
      setError("กรุณาเขียนข้อความก่อนโพสต์");
      return;
    }

    if (content.length > MAX_LENGTH) {
      setError("ข้อความยาวเกินกำหนด");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await createPost({ content });

      setContent("");
      onPostCreated?.(); // refresh feed (SSR-safe / simple)
    } catch (err) {
      console.error("Create post failed:", err);
      setError("ไม่สามารถโพสต์ได้ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }, [content, submitting, onPostCreated]);

  return (
    <section
      aria-label="Create post"
      className="bg-white border rounded-2xl p-4 shadow-sm"
    >
      <textarea
        className="w-full resize-none border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        placeholder="คุณกำลังคิดอะไรอยู่?"
        value={content}
        maxLength={MAX_LENGTH}
        onChange={(e) => setContent(e.target.value)}
        disabled={submitting}
      />

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          เหลืออีก {remaining} ตัวอักษร
        </span>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !content.trim()}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
        >
          {submitting ? "กำลังโพสต์..." : "โพสต์"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
