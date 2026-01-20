// frontend/src/components/follows/FollowRequestButton.tsx

'use client';

import type { MouseEvent } from 'react';
import { useFollowRequest } from '@/hooks/useFollowRequest';

type Props = {
  userId: string;

  // backend authority flags
  isPrivate: boolean;
  isBlocked?: boolean;
  isAlreadyRequested?: boolean;

  // optimistic UX update
  onRequested?: () => void;
};

export default function FollowRequestButton({
  userId,
  isPrivate,
  isBlocked = false,
  isAlreadyRequested = false,
  onRequested,
}: Props) {
  const { request, loading, error } =
    useFollowRequest(userId);

  async function handleClick(
    e: MouseEvent<HTMLButtonElement>,
  ) {
    e.preventDefault();
    e.stopPropagation();

    // 🔒 UX guard only — backend still authority
    if (
      loading ||
      isBlocked ||
      isAlreadyRequested ||
      !isPrivate
    ) {
      return;
    }

    try {
      await request();
      onRequested?.();
    } catch {
      // fail-soft
    }
  }

  const disabled =
    loading || isBlocked || isAlreadyRequested;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-busy={loading}
      aria-disabled={disabled}
      className={`
        inline-flex items-center justify-center
        rounded-full px-4 py-1.5 text-sm font-medium
        transition
        ${
          isBlocked
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : isAlreadyRequested
            ? 'bg-gray-200 text-gray-600'
            : loading
            ? 'bg-blue-400 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }
        disabled:opacity-60
      `}
    >
      {isBlocked
        ? 'Cannot follow'
        : isAlreadyRequested
        ? 'Requested'
        : loading
        ? 'Sending…'
        : 'Request Follow'}

      {error && (
        <span className="sr-only">
          Follow request error: {error}
        </span>
      )}
    </button>
  );
}
