// frontend/pages/admin/reports/index.tsx

import type { GetServerSideProps } from "next";
import Head from "next/head";
import { sessionCheckServerSide } from "@/lib/api/api";
import { fetchAdminReports } from "@/lib/api/admin-reports";
import AdminReportList from "@/components/admin/report/AdminReportList";
import type { AdminReportListResponse } from "@/types/admin-report";

type Props = {
  data: AdminReportListResponse;
};

export default function AdminReportsPage({ data }: Props) {
  return (
    <>
      <Head>
        <title>Admin Reports | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="mx-auto max-w-5xl p-6">
        <h1 className="mb-4 text-xl font-semibold">
          Reports
        </h1>

        <AdminReportList initialData={data} />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> =
  async (ctx) => {
    const cookieHeader = ctx.req.headers.cookie ?? "";

    const session = await sessionCheckServerSide(
      cookieHeader,
    );

    // 🔒 AuthN only — backend is ADMIN authority
    if (!session.valid) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    try {
      // 🔒 SSR must forward cookie to backend
      const data = await fetchAdminReports({
        cookieHeader,
      });

      return {
        props: { data },
      };
    } catch (err: any) {
      // ❌ backend denies admin
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
