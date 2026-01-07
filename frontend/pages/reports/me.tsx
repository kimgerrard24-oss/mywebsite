// frontend/pages/reports/me.tsx

import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { sessionCheckServerSide } from "@/lib/api/api";
import type { MyReportItem } from "@/lib/api/reports";

type Props = {
  items: MyReportItem[];
  nextCursor: string | null;
};

export default function MyReportsPage({
  items,
}: Props) {
  return (
    <>
      <Head>
        <title>My Reports | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-4 text-xl font-semibold">
          My Reports
        </h1>

        {items.length === 0 ? (
          <p className="text-sm text-gray-600">
            You haven’t submitted any reports yet.
          </p>
        ) : (
          <ul className="divide-y rounded-md border">
            {items.map((report) => (
              <li
                key={report.id}
                className="p-4"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">
                      {report.targetType}
                    </p>

                    <p className="text-xs text-gray-500">
                      Reason: {report.reason}
                    </p>

                    <p className="text-xs text-gray-400">
                      {new Date(
                        report.createdAt,
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                      {report.status}
                    </span>

                    <Link
                      href={`/reports/${report.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View detail
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const cookieHeader =
    ctx.req.headers.cookie ?? "";

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

  try {
    const base =
      process.env.INTERNAL_BACKEND_URL ??
      process.env.NEXT_PUBLIC_BACKEND_URL ??
      "https://api.phlyphant.com";

    const res = await fetch(
      `${base}/reports/me?limit=20`,
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

    if (!res.ok) {
      throw new Error("Failed to load reports");
    }

    const data = (await res.json()) as {
      items: MyReportItem[];
      nextCursor: string | null;
    };

    return {
      props: {
        items: data.items ?? [],
        nextCursor: data.nextCursor ?? null,
      },
    };
  } catch {
    // production-safe fallback
    return {
      props: {
        items: [],
        nextCursor: null,
      },
    };
  }
};
