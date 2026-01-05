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

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const session = await sessionCheckServerSide(
    ctx.req.headers.cookie,
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
    // ✅ helper ถูกเรียกตาม signature เดิม
    const data = await fetchAdminReports();

    return {
      props: { data },
    };
  } catch (err: any) {
    // ❌ ไม่ใช่ admin → backend ตัดสิน
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
