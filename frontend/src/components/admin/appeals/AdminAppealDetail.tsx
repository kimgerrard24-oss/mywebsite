// frontend/src/components/admin/appeals/AdminAppealDetail.tsx

import type { AdminAppealDetail } from "@/types/admin-appeal";
import AdminResolveAppealForm from "./AdminResolveAppealForm";

type Props = {
  appeal: AdminAppealDetail;
};

export default function AdminAppealDetailView({
  appeal,
}: Props) {
  const canResolve =
    appeal.status === "PENDING";

  return (
    <section className="space-y-4 rounded border p-4">
      <header className="flex justify-between">
        <div>
          <p className="text-sm font-medium">
            Target: {appeal.targetType}
          </p>
          <p className="text-xs text-gray-500">
            ID: {appeal.targetId}
          </p>
        </div>

        <span className="text-xs rounded bg-gray-100 px-2 py-1">
          {appeal.status}
        </span>
      </header>

      <div className="text-sm space-y-2">
        <div>
          <p className="font-medium">Reason</p>
          <p>{appeal.reason}</p>
        </div>

        {appeal.detail && (
          <div>
            <p className="font-medium">Detail</p>
            <p className="whitespace-pre-wrap">
              {appeal.detail}
            </p>
          </div>
        )}
      </div>

      {appeal.resolutionNote && (
        <div className="rounded bg-gray-50 p-2 text-sm">
          <strong>Admin note:</strong>{" "}
          {appeal.resolutionNote}
        </div>
      )}

      {canResolve && (
        <AdminResolveAppealForm
          appealId={appeal.id}
        />
      )}
    </section>
  );
}
