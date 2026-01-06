// frontend/pages/admin/reports/stats.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import {
  getAdminReportStats,
  type AdminReportStats,
} from "@/lib/api/admin-report-stats";
import { sessionCheckServerSide } from "@/lib/api/api";
import AdminPageGuard from "@/components/admin/AdminPageGuard";
import AdminReportStatsView from "@/components/admin/report/AdminReportStats";

type Props = {
  /**
   * Stats data (only present when admin is allowed)
   */
  stats: AdminReportStats | null;

  /**
   * Permission flag (backend authority)
   */
  allowed: boolean;
};

export default function AdminReportStatsPage({
  stats,
  allowed,
}: Props) {
  return (
    <>
      <Head>
        <title>Report Statistics | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="p-6">
        <h1 className="mb-4 text-xl font-semibold">
          Report Statistics
        </h1>

        {/* 
          🔒 UI guard only
          - Backend already decided permission
        */}
        <AdminPageGuard allowed={allowed}>
          {allowed && stats && (
            <AdminReportStatsView stats={stats} />
          )}
        </AdminPageGuard>
      </main>
    </>
  );
}

/* =======================
   Server Side Rendering
   ======================= */

export const getServerSideProps: GetServerSideProps<Props> =
  async (ctx) => {
    const cookie =
      ctx.req.headers.cookie ?? "";

    /**
     * 🔐 Authentication check
     * Backend is authority
     */
    const session =
      await sessionCheckServerSide(cookie);

    // ❌ Not logged in
    if (!session.valid) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    try {
      /**
       * 🔒 Authorization check (ADMIN)
       * Backend decides
       */
      const stats =
        await getAdminReportStats(ctx);

      return {
        props: {
          stats,
          allowed: true,
        },
      };
    } catch (err: any) {
      // ❌ Logged in but NOT admin
      if (err?.status === 403) {
        return {
          props: {
            stats: null,
            allowed: false,
          },
        };
      }

      // ❌ Any other backend failure
      // production-safe fallback
      return {
        props: {
          stats: null,
          allowed: false,
        },
      };
    }
  };
