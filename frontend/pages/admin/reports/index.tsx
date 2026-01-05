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

export const getServerSideProps: GetServerSideProps<Props> = async (
  ctx,
) => {
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

  const data = await fetchAdminReports({
    cookieHeader: ctx.req.headers.cookie ?? "",
  });

  return {
    props: { data },
  };
};
