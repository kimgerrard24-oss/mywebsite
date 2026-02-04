// frontend/src/components/follows/CancelFollowRequestButton.tsx

'use client';

import { useCancelFollowRequest } from '@/hooks/useCancelFollowRequest';

type Props = {
  userId: string;
  disabled?: boolean;
  onCanceled?: () => void;
};

export default function CancelFollowRequestButton({
  userId,
  disabled = false,
  onCanceled,
}: Props) {
  const {
    cancel,
    loading,
  } = useCancelFollowRequest();

  async function handleClick() {
    if (loading || disabled) return;

    const ok = await cancel(userId);
    if (ok) {
      onCanceled?.();
    }
  }

 return (
  <button
    type="button"
    onClick={handleClick}
    disabled={disabled || loading}
    aria-label="Cancel follow request"
    aria-busy={loading}
    aria-disabled={disabled || loading}
    aria-live="polite"
    className="inline-flex items-center justify-center rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium leading-none whitespace-nowrap select-none border border-zinc-300 text-zinc-700 transition-colors duration-150 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transition-none disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span aria-hidden={loading}>
      {loading ? "Canceling…" : "Requested"}
    </span>
  </button>
);

}
