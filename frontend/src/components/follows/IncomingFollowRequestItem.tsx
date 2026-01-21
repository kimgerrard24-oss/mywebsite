// frontend/src/components/follows/IncomingFollowRequestItem.tsx

'use client';

import Image from 'next/image';
import type {
  IncomingFollowRequest,
} from '@/lib/api/followRequests';
import { useApproveFollowRequest } from '@/hooks/useApproveFollowRequest';
import { useRejectFollowRequest } from '@/hooks/useRejectFollowRequest';
import Link from 'next/link';

type Props = {
  request: IncomingFollowRequest;
  onApproved?: (id: string) => void;
  onRejected?: (id: string) => void;
};

export default function IncomingFollowRequestItem({
  request,
  onApproved,
  onRejected,
}: Props) {
  const { approve, loading: approving } =
    useApproveFollowRequest();

  const { reject, loading: rejecting } =
    useRejectFollowRequest();

  const loading = approving || rejecting;

  async function handleApprove() {
    const ok = await approve(request.id);
    if (ok) {
      onApproved?.(request.id);
    }
  }

  async function handleReject() {
    const ok = await reject(request.id);
    if (ok) {
      onRejected?.(request.id);
    }
  }

  return (
    <article
      className="
        flex items-center justify-between
        rounded-xl border p-3
      "
    >
      <Link
  href={`/users/${request.requesterId}`}
  className="flex items-center gap-3"
>
  {request.avatarUrl ? (
    <Image
      src={request.avatarUrl}
      alt={`${request.username} avatar`}
      width={36}
      height={36}
      className="rounded-full"
    />
  ) : (
    <div className="h-9 w-9 rounded-full bg-zinc-300" />
  )}

  <div className="leading-tight">
    <div className="text-sm font-medium hover:underline">
      {request.displayName ?? request.username}
    </div>
    <div className="text-xs text-zinc-500">
      @{request.username}
    </div>
  </div>
</Link>


      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleApprove}
          disabled={loading}
          className="
            rounded-lg bg-black px-3 py-1.5
            text-xs text-white
            hover:bg-zinc-800
            disabled:opacity-50
          "
        >
          Approve
        </button>

        <button
          type="button"
          onClick={handleReject}
          disabled={loading}
          className="
            rounded-lg border px-3 py-1.5
            text-xs
            hover:bg-zinc-100
            disabled:opacity-50
          "
        >
          Reject
        </button>
      </div>
    </article>
  );
}


