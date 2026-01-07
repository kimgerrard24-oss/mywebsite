import Head from "next/head";
import type { GetServerSideProps } from "next";
import { sessionCheckServerSide } from "@/lib/api/api";
import type { MyReportDetail as MyReportDetailType } from "@/lib/api/reports";
import MyReportDetail from "@/components/report/MyReportDetail";

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
        {/* ===== Report detail (includes Withdraw UX guard) ===== */}
        <MyReportDetail report={report} />
      </main>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie ?? "";

  // 🔐 AuthN only — backend is authority
  const session = await sessionCheckServerSide(
    cookieHeader,
  );

  if (!session.valid) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const reportId = String(ctx.params?.id ?? "");

  try {
    const base =
      process.env.INTERNAL_BACKEND_URL ??
      process.env.NEXT_PUBLIC_BACKEND_URL ??
      "https://api.phlyphant.com";

    const res = await fetch(
      `${base}/reports/me/${reportId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(cookieHeader
            ? { Cookie: cookieHeader }
            : {}),
        },
        credentials: "include",
        cache: "no-store",
      },
    );

    if (res.status === 403) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    if (!res.ok) {
      return {
        props: {
          report: null,
        },
      };
    }

    const report =
      (await res.json()) as MyReportDetailType;

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
