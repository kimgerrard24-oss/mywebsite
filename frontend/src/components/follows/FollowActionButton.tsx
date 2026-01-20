// frontend/src/components/follows/FollowActionButton.tsx

'use client';

import FollowButton from './FollowButton';
import FollowRequestButton from './FollowRequestButton';

type Props = {
  userId: string;

  // backend authority state
  isFollowing: boolean;
  isPrivate: boolean;
  isBlocked?: boolean;
  isFollowRequested?: boolean;

  onFollowed?: (v: boolean) => void;
  onRequested?: () => void;
};

export default function FollowActionButton({
  userId,
  isFollowing,
  isPrivate,
  isBlocked = false,
  isFollowRequested = false,
  onFollowed,
  onRequested,
}: Props) {
  // already following → show normal follow button (disabled)
  if (isFollowing) {
    return (
      <FollowButton
        userId={userId}
        isFollowing={true}
        isBlocked={isBlocked}
        onFollowed={onFollowed}
      />
    );
  }

  // private account → must send request
  if (isPrivate) {
    return (
      <FollowRequestButton
        userId={userId}
        isPrivate={true}
        isBlocked={isBlocked}
        isAlreadyRequested={isFollowRequested}
        onRequested={onRequested}
      />
    );
  }

  // public → follow directly
  return (
    <FollowButton
      userId={userId}
      isFollowing={false}
      isBlocked={isBlocked}
      onFollowed={onFollowed}
    />
  );
}
