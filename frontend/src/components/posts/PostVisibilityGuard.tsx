// frontend/src/components/posts/PostVisibilityGuard.tsx

import { ReactNode } from 'react';
import { usePostVisibilityValidate } from '@/hooks/usePostVisibilityValidate';

type Props = {
  postId: string;
  children: ReactNode;
};

export default function PostVisibilityGuard({
  postId,
  children,
}: Props) {
  const { loading, decision, error } =
    usePostVisibilityValidate(postId);

  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">
        Loading post…
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="py-10 text-center text-sm text-red-600">
        Unable to load post.
      </div>
    );
  }

  if (!decision.canView) {
    return (
      <div className="py-10 text-center text-sm text-gray-600">
        {renderReason(decision.reason)}
      </div>
    );
  }

  return <>{children}</>;
}

function renderReason(reason: string) {
  switch (reason) {
    case 'NOT_FOUND':
      return 'Post not found.';
    case 'POST_DELETED':
      return 'This post has been deleted.';
    case 'POST_HIDDEN':
      return 'This post is not available.';
    case 'BLOCKED':
      return 'You cannot view this post.';
    case 'NOT_FOLLOWER':
      return 'Follow this user to view the post.';
    case 'PRIVATE_ACCOUNT':
      return 'This account is private.';
    default:
      return 'You cannot view this post.';
  }
}
