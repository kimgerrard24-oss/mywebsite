// frontend/src/components/comments/CommentLikeButton.tsx

type Props = {
  liked: boolean;
  likeCount: number;
  loading?: boolean;
  onToggle: () => void;
};

export default function CommentLikeButton({
  liked,
  likeCount,
  loading,
  onToggle,
}: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      aria-pressed={liked}
      aria-label={
        liked
          ? 'Unlike this comment'
          : 'Like this comment'
      }
      className={`
        flex items-center gap-1 text-sm
        transition-colors
        ${
          liked
            ? 'text-red-500'
            : 'text-gray-500 hover:text-gray-700'
        }
        ${loading ? 'opacity-50' : ''}
      `}
    >
      <span aria-hidden="true">
        {liked ? '❤️' : '🤍'}
      </span>
      <span>{likeCount}</span>
    </button>
  );
}
