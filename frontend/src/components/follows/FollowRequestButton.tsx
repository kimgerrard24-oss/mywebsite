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
    aria-live="polite"
    className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium leading-none whitespace-nowrap select-none transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transition-none ${
      isBlocked
        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
        : isAlreadyRequested
        ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
        : loading
        ? "bg-blue-400 text-white"
        : "bg-blue-600 text-white hover:bg-blue-700"
    } disabled:opacity-60`}
  >
    <span aria-hidden={loading}>
      {isBlocked
        ? "Cannot follow"
        : isAlreadyRequested
        ? "Requested"
        : loading
        ? "Sending…"
        : "Request Follow"}
    </span>

    {error && (
      <span className="sr-only" role="alert">
        Follow request error: {error}
      </span>
    )}
  </button>
);

}
