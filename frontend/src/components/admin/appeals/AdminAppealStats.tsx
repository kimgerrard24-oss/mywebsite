// frontend/src/components/admin/appeals/AdminAppealStats.tsx

import type { AdminAppealStats } from "@/types/admin-appeal-stats";
import AdminAppealStatsCards from "./AdminAppealStatsCards";

type Props = {
  stats: AdminAppealStats;
};

export default function AdminAppealStatsView({
  stats,
}: Props) {
  return (
    <section className="space-y-4">
      <AdminAppealStatsCards stats={stats} />

      <p className="text-xs text-gray-400">
        Generated at:{" "}
        {new Date(
          stats.generatedAt,
        ).toLocaleString()}
      </p>
    </section>
  );
}
