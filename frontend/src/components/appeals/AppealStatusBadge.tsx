// frontend/src/components/appeals/AppealStatusBadge.tsx

type Props = {
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "WITHDRAWN";
};

const COLOR: Record<Props["status"], string> = {
  PENDING:
    "bg-yellow-200 text-yellow-900 border border-yellow-400",
  APPROVED:
    "bg-green-200 text-green-900 border border-green-400",
  REJECTED:
    "bg-red-200 text-red-900 border border-red-400",
  WITHDRAWN:
    "bg-gray-200 text-gray-800 border border-gray-400",
};

export default function AppealStatusBadge({
  status,
}: Props) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-1 text-xs font-semibold ${COLOR[status]}`}
    >
      {status}
    </span>
  );
}
