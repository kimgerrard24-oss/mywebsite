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

export const getServerSideProps: GetServerSideProps<Props> =
  async (ctx) => {
    const session = await sessionCheckServerSide(
      ctx.req.headers.cookie,
    );

    if (!session.valid || session.role !== "ADMIN") {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const id = ctx.params?.id as string;

    const report = await fetchAdminReportById(id, {
      cookieHeader: ctx.req.headers.cookie ?? "",
    });

    return {
      props: { report },
    };
  };
