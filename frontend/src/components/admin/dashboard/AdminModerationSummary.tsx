// frontend/src/components/admin/dashboard/AdminModerationSummary.tsx

type Props = {
  moderation: {
    pendingReports: number;
    disabledUsers: number;
  };
};

export default function AdminModerationSummary({
  moderation,
}: Props) {
  return (
    <section className="rounded border p-4">
      <h2 className="mb-2 text-lg font-medium">
        Moderation
      </h2>

      <ul className="space-y-1 text-sm">
        <li>
          Pending reports:{" "}
          <strong>
            {moderation.pendingReports}
          </strong>
        </li>
        <li>
          Disabled users:{" "}
          <strong>
            {moderation.disabledUsers}
          </strong>
        </li>
      </ul>
    </section>
  );
}
