// frontend/src/components/report/ReportFollowRequestModal.tsx

'use client';

import { useState } from 'react';
import {
  useReportFollowRequest,
} from '@/hooks/useReportFollowRequest';
import type {
  FollowRequestReportReason,
} from '@/lib/api/followRequestReports';

type Props = {
  followRequestId: string;
  onClose: () => void;
  onSuccess?: () => void;
};

const REASONS: {
  value: FollowRequestReportReason;
  label: string;
}[] = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'SCAM', label: 'Scam' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate' },
  { value: 'OTHER', label: 'Other' },
];

export default function ReportFollowRequestModal({
  followRequestId,
  onClose,
  onSuccess,
}: Props) {
  const { submit, loading, error } =
    useReportFollowRequest();

  const [reason, setReason] =
    useState<FollowRequestReportReason>('SPAM');
  const [note, setNote] = useState('');

  async function handleSubmit() {
    const ok = await submit({
      followRequestId,
      reason,
      note: note.trim() || undefined,
    });

    if (ok) {
      onSuccess?.();
      onClose();
    }
  }

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/40
      "
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold">
          Report Follow Request
        </h3>

        <div className="space-y-2">
          {REASONS.map((r) => (
            <label
              key={r.value}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
              />
              {r.label}
            </label>
          ))}
        </div>

        <textarea
          placeholder="Optional note"
          value={note}
          onChange={(e) =>
            setNote(e.target.value)
          }
          className="
            mt-3 w-full rounded-md border p-2 text-sm
          "
          rows={3}
        />

        {error && (
          <p className="mt-2 text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-1.5 text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="
              rounded-lg bg-black px-3 py-1.5
              text-xs text-white disabled:opacity-50
            "
          >
            {loading ? 'Sending…' : 'Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
