// frontend/src/components/admin/AdminActionFilters.tsx

type Props = {
  actionType?: string;
  targetType?: string;
};

export default function AdminActionFilters(_: Props) {
  return (
    <div className="border-b px-4 py-3 text-sm text-gray-600">
      Filters (static placeholder – SSR safe)
    </div>
  );
}
