// frontend/src/components/appeals/AppealStatusBadge.tsx

type Props = {
  status:
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'WITHDRAWN';
};

const COLOR: Record<
  Props['status'],
  string
> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-700',
};

export default function AppealStatusBadge({
  status,
}: Props) {
  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-xs font-medium ${COLOR[status]}`}
    >
      {status}
    </span>
  );
}
