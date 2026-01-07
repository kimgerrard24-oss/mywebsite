// frontend/src/components/comments/CommentLikeButton.tsx

type Props = {
  liked: boolean;
  likeCount: number;
  loading?: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

export default function CommentLikeButton({
  liked,
  likeCount,
  loading,
  disabled = false,
  onToggle,
}: Props) {
  const isDisabled = loading || disabled;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled}
      aria-pressed={liked}
      aria-disabled={disabled}
      aria-busy={loading}
      aria-label={
        liked
          ? "Unlike this comment"
          : "Like this comment"
      }
      className={`
        flex items-center gap-1 text-sm
        transition-colors
        ${
          liked
            ? "text-red-500"
            : "text-gray-500 hover:text-gray-700"
        }
        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <span aria-hidden="true">
        {liked ? "❤️" : "🤍"}
      </span>
      <span>{likeCount}</span>
    </button>
  );
}

