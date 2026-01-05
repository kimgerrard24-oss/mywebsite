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
  stats: AdminReportStats | null;
  allowed: boolean;
};

export default function AdminReportStatsPage({
  stats,
  allowed,
}: Props) {
  return (
    <>
      <Head>
        <title>
          Report Statistics | PhlyPhant
        </title>
        <meta
          name="robots"
          content="noindex,nofollow"
        />
      </Head>

      <main className="p-6">
        <h1 className="mb-4 text-xl font-semibold">
          Report Statistics
        </h1>

        <AdminPageGuard allowed={allowed}>
          {stats && (
            <AdminReportStatsView
              stats={stats}
            />
          )}
        </AdminPageGuard>
      </main>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const cookie = ctx.req.headers.cookie ?? "";

  // 🔐 Backend is authority
  const session = await sessionCheckServerSide(
    cookie,
  );

  if (!session.valid) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  try {
    const stats = await getAdminReportStats(
      ctx,
    );

    return {
      props: {
        stats,
        allowed: true,
      },
    };
  } catch (err: any) {
    if (err?.status === 403) {
      return {
        props: {
          stats: null,
          allowed: false,
        },
      };
    }

    return {
      props: {
        stats: null,
        allowed: false,
      },
    };
  }
};
