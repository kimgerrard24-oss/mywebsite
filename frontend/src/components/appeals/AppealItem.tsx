// frontend/src/components/appeals/AppealItem.tsx

import type { Appeal } from "@/types/appeal";

type Props = {
  appeal: Appeal;
};

function statusLabel(status: Appeal["status"]) {
  switch (status) {
    case "PENDING":
      return "Pending review";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "WITHDRAWN":
      return "Withdrawn";
    default:
      return status;
  }
}

export default function AppealItem({ appeal }: Props) {
  return (
    <article
      className="
        rounded border bg-white p-4
        space-y-2
      "
    >
      <header className="flex justify-between">
        <div className="text-sm font-medium">
          Target: {appeal.targetType}
        </div>
        <span
          className="
            text-xs rounded px-2 py-0.5
            bg-gray-100 text-gray-700
          "
        >
          {statusLabel(appeal.status)}
        </span>
      </header>

      <p className="text-sm text-gray-800">
        {appeal.reason}
      </p>

      {appeal.resolutionNote && (
        <div className="text-sm text-gray-600">
          <strong>Admin note:</strong>{" "}
          {appeal.resolutionNote}
        </div>
      )}

      <footer className="text-xs text-gray-500">
        Submitted:{" "}
        {new Date(appeal.createdAt).toLocaleString()}
      </footer>
    </article>
  );
}
