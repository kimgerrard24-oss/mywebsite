// frontend/src/components/comments/CommentComposer.tsx

import { FormEvent, useRef, useState } from "react";
import { createPostComment } from "@/lib/api/comments";
import type { Comment } from "@/types/comment";

// 🔹 mention
import { useMentionSearch } from "@/hooks/useMentionSearch";
import MentionDropdown from "@/components/mention/MentionDropdown";
import type { MentionUser } from "@/lib/api/mention-search";

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

  // 🔹 mention state (NEW)
  const [mentions, setMentions] = useState<string[]>([]);

  // caret position (สำหรับ mention)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [caretPos, setCaretPos] = useState<number | null>(null);

  /**
   * =========================
   * Mention detection
   * =========================
   */
  const mentionQuery = getCurrentMentionQuery(
    content,
    caretPos ?? content.length
  );

  const { items: mentionItems, loading: mentionLoading } =
    useMentionSearch(mentionQuery ?? "");

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
        mentions, // 🔹 ส่ง mentions ไป backend (NEW)
      });

      // reset input
      setContent("");
      setCaretPos(null);
      setMentions([]); // 🔹 reset mentions (NEW)

      // 🔔 notify parent (fail-soft)
      onCreated?.(comment);
    } catch (err) {
      console.error("Create comment failed:", err);
      setError("ไม่สามารถส่งคอมเมนต์ได้");
    } finally {
      setLoading(false);
    }
  }

  /**
   * =========================
   * Insert mention
   * =========================
   */
  function insertMention(user: MentionUser) {
    if (caretPos === null) return;

    const before = content.slice(0, caretPos);
    const after = content.slice(caretPos);

    const match = before.match(/@[\w\d_]*$/);
    if (!match) return;

    const start = caretPos - match[0].length;
    const mentionText = `@${user.displayName ?? user.username} `;

    const nextContent =
      content.slice(0, start) +
      mentionText +
      after;

    setContent(nextContent);

    // 🔹 เก็บ userId ของ mention (NEW)
    setMentions((prev) =>
      prev.includes(user.id) ? prev : [...prev, user.id]
    );

    // restore caret
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;

      const nextPos = start + mentionText.length;
      el.focus();
      el.setSelectionRange(nextPos, nextPos);
      setCaretPos(nextPos);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 flex gap-1.5 relative"
      aria-label="Add a comment"
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setCaretPos(e.target.selectionStart);
        }}
        onClick={(e) =>
          setCaretPos(
            (e.target as HTMLTextAreaElement).selectionStart
          )
        }
        onKeyUp={(e) =>
          setCaretPos(
            (e.target as HTMLTextAreaElement).selectionStart
          )
        }

         onKeyDown={(e) => {
    // 🔒 block implicit submit ขณะพิมพ์ mention
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  }}
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

      {/* 🔹 Mention dropdown (fail-soft) */}
      {mentionQuery && mentionItems.length > 0 && (
        <div className="absolute left-0 top-full z-10 mt-1 w-full">
          <MentionDropdown
            items={mentionItems}
            loading={mentionLoading}
            onSelect={insertMention}
          />
        </div>
      )}

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

/**
 * =========================
 * Helpers
 * =========================
 */

/**
 * ดึง query หลัง @ ที่ caret อยู่
 * - ถ้าไม่อยู่ใน mention → null
 */
function getCurrentMentionQuery(
  text: string,
  caretPos: number
): string | null {
  const before = text.slice(0, caretPos);
  const match = before.match(/@([\w\d_]*)$/);
  if (!match) return null;

  return match[1];
}
