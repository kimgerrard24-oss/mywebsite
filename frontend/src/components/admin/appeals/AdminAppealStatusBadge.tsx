// frontend/src/components/admin/appeals/AdminAppealStatusBadge.tsx

type Props = {
  status: string;
};

const MAP: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-gray-100 text-gray-700",
};

export default function AdminAppealStatusBadge({
  status,
}: Props) {
  const cls =
    MAP[status] ??
    "bg-gray-100 text-gray-700";

  return (
    <span
      className={`rounded px-2 py-1 text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  );
}
