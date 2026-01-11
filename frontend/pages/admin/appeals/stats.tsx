// frontend/pages/admin/appeals/stats.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";

import { sessionCheckServerSide } from "@/lib/api/api";
import { getAdminAppealStats } from "@/lib/api/admin-appeal-stats";

import AdminAppealStatsView from "@/components/admin/appeals/AdminAppealStats";
import AdminPageGuard from "@/components/admin/AdminPageGuard";

import type { AdminAppealStats } from "@/types/admin-appeal-stats";

type Props = {
  stats: AdminAppealStats | null;
  allowed: boolean;
};

export default function AdminAppealStatsPage({
  stats,
  allowed,
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

        <AdminPageGuard allowed={allowed}>
          {stats && (
            <AdminAppealStatsView stats={stats} />
          )}
        </AdminPageGuard>
      </main>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<Props> =
  async (ctx) => {
    const cookie =
      ctx.req.headers.cookie ?? "";

    // 🔐 Session check only (backend authority)
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
      const stats = await getAdminAppealStats(
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
