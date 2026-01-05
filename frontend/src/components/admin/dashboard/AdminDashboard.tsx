// frontend/src/components/admin/dashboard/AdminDashboard.tsx

import type { AdminDashboardData } from "@/types/admin-dashboard";
import AdminStatCard from "./AdminStatCard";
import AdminModerationSummary from "./AdminModerationSummary";

type Props = {
  data: AdminDashboardData;
};

export default function AdminDashboard({
  data,
}: Props) {
  return (
    <section className="space-y-6">
      <section
        aria-label="System statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <AdminStatCard
          label="Users"
          value={data.system.userCount}
        />
        <AdminStatCard
          label="Posts"
          value={data.system.postCount}
        />
        <AdminStatCard
          label="Comments"
          value={data.system.commentCount}
        />
      </section>

      <AdminModerationSummary
        moderation={data.moderation}
      />
    </section>
  );
}
