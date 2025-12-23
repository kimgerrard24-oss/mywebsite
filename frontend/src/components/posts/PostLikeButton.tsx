// frontend/src/components/posts/PostLikeButton.tsx
import { memo } from 'react';

type Props = {
  liked: boolean;
  likeCount: number;
  loading?: boolean;
  onClick: () => void;
};

function PostLikeButton({
  liked,
  likeCount,
  loading,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-pressed={liked}
      aria-label={liked ? 'Unlike post' : 'Like post'}
      className="
        inline-flex items-center gap-2
        text-sm font-medium
        text-gray-600 hover:text-red-600
        disabled:opacity-50
      "
    >
      <span aria-hidden>
        {liked ? '❤️' : '🤍'}
      </span>
      <span>{likeCount}</span>
    </button>
  );
}

export default memo(PostLikeButton);
