// frontend/src/components/report/ReportButton.tsx

"use client";

import { useState } from "react";
import ReportDialog from "./ReportDialog";

type Props = {
  targetType: "POST" | "COMMENT" | "USER";
  targetId: string;
};

export default function ReportButton({
  targetType,
  targetId,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-red-600 hover:underline"
      >
        Report
      </button>

      {open && (
        <ReportDialog
          targetType={targetType}
          targetId={targetId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
