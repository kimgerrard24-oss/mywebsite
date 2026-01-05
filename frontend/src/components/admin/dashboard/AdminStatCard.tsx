// frontend/src/components/admin/dashboard/AdminStatCard.tsx

type Props = {
  label: string;
  value: number;
};

export default function AdminStatCard({
  label,
  value,
}: Props) {
  return (
    <article className="rounded border p-4">
      <div className="text-sm text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">
        {value.toLocaleString()}
      </div>
    </article>
  );
}
