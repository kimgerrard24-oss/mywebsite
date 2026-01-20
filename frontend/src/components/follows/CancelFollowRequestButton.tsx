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
      className="
        inline-flex items-center justify-center
        rounded-xl px-4 py-2
        text-sm font-medium
        border border-zinc-300
        hover:bg-zinc-100
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
    >
      {loading ? 'Canceling…' : 'Requested'}
    </button>
  );
}
