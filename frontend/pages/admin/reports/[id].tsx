// frontend/pages/admin/reports/[id].tsx

import type { GetServerSideProps } from "next";
import Head from "next/head";
import { sessionCheckServerSide } from "@/lib/api/api";
import { fetchAdminReportById } from "@/lib/api/admin-reports";
import AdminReportDetail from "@/components/admin/report/AdminReportDetail";
import type { AdminReportDetail as Report } from "@/types/admin-report";

type Props = {
  report: Report;
};

export default function AdminReportDetailPage({
  report,
}: Props) {
  return (
    <>
      <Head>
        <title>Admin Report | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-xl font-semibold">
          Report Detail
        </h1>

        <AdminReportDetail report={report} />
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

  // 🔒 AuthN only — backend decides ADMIN permission
  if (!session.valid) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const id = ctx.params?.id as string;

  try {
    // ✅ helper รับ argument เดียวเท่านั้น
    const report = await fetchAdminReportById(id);

    return {
      props: { report },
    };
  } catch (err: any) {
    // ❌ ไม่ใช่ admin
    if (err?.status === 403) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    // ❌ report ไม่พบ
    if (err?.status === 404) {
      return { notFound: true };
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
