// frontend/pages/reports/[id].tsx
import Head from "next/head";
import type { GetServerSideProps } from "next";
import { sessionCheckServerSide } from "@/lib/api/api";
import {
  getMyReportById,
  type MyReportDetail as MyReportDetailType,
} from "@/lib/api/reports";
import MyReportDetail from "@/components/report/MyReportDetail";
import WithdrawReportButton from "@/components/report/WithdrawReportButton";

type Props = {
  report: MyReportDetailType | null;
};

export default function MyReportDetailPage({
  report,
}: Props) {
  if (!report) {
    return (
      <main className="p-6">
        <p className="text-sm text-gray-600">
          Report not found
        </p>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>My Report | PhlyPhant</title>
        <meta
          name="robots"
          content="noindex,nofollow"
        />
      </Head>

      <main className="p-6 space-y-6">
        {/* ===== Report detail ===== */}
        <MyReportDetail report={report} />

        {/* ===== Withdraw action ===== */}
        <div className="pt-4 border-t">
          <WithdrawReportButton
            reportId={report.id}
            onWithdrawed={() => {
              // production-safe: reload page
              window.location.reload();
            }}
          />
        </div>
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

  const reportId = String(
    ctx.params?.id ?? "",
  );

  try {
    const report = await getMyReportById(
      reportId,
      ctx,
    );

    return {
      props: {
        report,
      },
    };
  } catch {
    return {
      props: {
        report: null,
      },
    };
  }
};
