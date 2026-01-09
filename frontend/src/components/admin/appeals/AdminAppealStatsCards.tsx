// frontend/src/components/admin/appeals/AdminAppealStatsCards.tsx

import type { AdminAppealStats } from "@/types/admin-appeal-stats";

type Props = {
  stats: AdminAppealStats;
};

function msToMinutes(ms: number) {
  return Math.round(ms / 60000);
}

export default function AdminAppealStatsCards({
  stats,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <StatCard
        label="Total"
        value={stats.total}
      />
      <StatCard
        label="Pending"
        value={stats.byStatus.PENDING}
      />
      <StatCard
        label="Resolved"
        value={stats.byStatus.RESOLVED}
      />
      <StatCard
        label="Avg Resolve (min)"
        value={msToMinutes(
          stats.avgResolveMs,
        )}
      />
    </div>
  );
}

function StatCard(props: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-md border bg-white p-4">
      <p className="text-xs text-gray-500">
        {props.label}
      </p>
      <p className="mt-1 text-xl font-semibold">
        {props.value}
      </p>
    </div>
  );
}
