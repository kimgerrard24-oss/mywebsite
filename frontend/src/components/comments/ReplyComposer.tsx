import {
  FormEvent,
  useRef,
  useState,
} from "react";

// mention
import { useMentionSearch } from "@/hooks/useMentionSearch";
import MentionDropdown from "@/components/mention/MentionDropdown";
import type { MentionUser } from "@/lib/api/mention-search";
import type { CreateReplyPayload } from "@/types/comment";

type SubmitPayload =
  | string
  | {
      content: string;
      mentions: string[];
    };

type Props = {
  /**
   * รองรับทั้งแบบเดิม (string)
   * และแบบใหม่ ({ content, mentions })
   */
  onSubmit: (payload: CreateReplyPayload) => Promise<boolean>;
  loading: boolean;
  error: string | null;
};

export default function ReplyComposer({
  onSubmit,
  loading,
  error,
}: Props) {
  /**
   * =========================
   * Local state
   * =========================
   */
  const [content, setContent] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);

  // caret / textarea ref
  const textareaRef =
    useRef<HTMLTextAreaElement | null>(null);
  const [caretPos, setCaretPos] =
    useState<number | null>(null);

  /**
   * =========================
   * Mention detection
   * =========================
   */
  const mentionQuery = getCurrentMentionQuery(
    content,
    caretPos ?? content.length,
  );

  const {
    items: mentionItems,
    loading: mentionLoading,
  } = useMentionSearch(mentionQuery ?? "");

  /**
   * =========================
   * Submit
   * =========================
   */
  async function handleSubmit(e: FormEvent) {
  e.preventDefault();

  const trimmed = content.trim();
  if (!trimmed || loading) return;

  const ok = await onSubmit({
    content: trimmed,
    mentions,
  });

  if (ok) {
    setContent("");
    setMentions([]);
    setCaretPos(null);
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
    const mentionText = `@${user.username} `;

    const nextContent =
      content.slice(0, start) +
      mentionText +
      after;

    setContent(nextContent);

    // collect mention userId (dedupe)
    setMentions((prev) =>
      prev.includes(user.id)
        ? prev
        : [...prev, user.id],
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
      className="relative flex gap-1.5 mt-2"
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
            (e.target as HTMLTextAreaElement)
              .selectionStart,
          )
        }
        onKeyUp={(e) =>
          setCaretPos(
            (e.target as HTMLTextAreaElement)
              .selectionStart,
          )
        }

        onKeyDown={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  }}
        rows={1}
        disabled={loading}
        placeholder="Write a reply…"
        className="
          flex-1
          resize-none
          rounded
          border
          px-2
          py-1
          text-xs
          focus:outline-none
          focus:ring
        "
      />

      <button
        type="submit"
        disabled={loading}
        className="
          rounded
          bg-black
          px-2
          py-1
          text-xs
          text-white
          disabled:opacity-50
        "
      >
        Reply
      </button>

      {/* Mention dropdown (fail-soft) */}
      {mentionQuery &&
        mentionItems.length > 0 && (
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
function getCurrentMentionQuery(
  text: string,
  caretPos: number,
): string | null {
  const before = text.slice(0, caretPos);
  const match = before.match(/@([\w\d_]*)$/);
  if (!match) return null;

  return match[1];
}
