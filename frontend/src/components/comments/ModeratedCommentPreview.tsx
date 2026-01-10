// frontend/src/components/comments/ModeratedCommentPreview.tsx

type Props = {
  content: string;
  createdAt: string;
};

export default function ModeratedCommentPreview({
  content,
  createdAt,
}: Props) {
  return (
    <article
      aria-label="Comment preview"
      className="
        rounded
        border
        bg-white
        p-3
        text-sm
      "
    >
      <p className="whitespace-pre-wrap break-words">
        {content}
      </p>

      <time
        className="mt-1 block text-xs text-gray-500"
        dateTime={createdAt}
      >
        {new Date(createdAt).toLocaleString()}
      </time>
    </article>
  );
}
