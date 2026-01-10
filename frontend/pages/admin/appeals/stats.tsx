// frontend/pages/admin/appeals/stats.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";

import {
  getAdminAppealStats,
} from "@/lib/api/admin-appeal-stats";
import { sessionCheckServerSide } from "@/lib/api/api";

import AdminAppealStatsView from "@/components/admin/appeals/AdminAppealStats";
import type { AdminAppealStats } from "@/types/admin-appeal-stats";

type Props = {
  stats: AdminAppealStats;
};

export default function AdminAppealStatsPage({
  stats,
}: Props) {
  return (
    <>
      <Head>
        <title>Appeal Statistics | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="p-6">
        <h1 className="mb-4 text-xl font-semibold">
          Appeal Statistics
        </h1>

        {/* Backend already authorized */}
        <AdminAppealStatsView stats={stats} />
      </main>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const cookie =
    ctx.req.headers.cookie ?? "";

  // 🔐 AuthN only — backend is authority for ADMIN
  const session =
    await sessionCheckServerSide(cookie);

  if (!session.valid) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  try {
    // 🔒 AuthZ — backend decides admin permission
    const stats =
      await getAdminAppealStats({
        cookieHeader: cookie,
      });

    return {
      props: { stats },
    };
  } catch (err: any) {
    // ❌ Not admin or forbidden
    if (err?.status === 403) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    // production-safe fallback
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};

