// frontend/src/components/report/ReportFollowRequestButton.tsx

'use client';

import { useState } from 'react';
import ReportFollowRequestModal from './ReportFollowRequestModal';

type Props = {
  followRequestId: string;
};

export default function ReportFollowRequestButton({
  followRequestId,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          text-xs text-zinc-500 underline
          hover:text-zinc-800
        "
      >
        Report
      </button>

      {open && (
        <ReportFollowRequestModal
          followRequestId={followRequestId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
