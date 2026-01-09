// frontend/pages/admin/dashboard.tsx

import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { sessionCheckServerSide } from "@/lib/api/api";
import { fetchAdminDashboard } from "@/lib/api/admin-dashboard";
import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";
import type { AdminDashboardData } from "@/types/admin-dashboard";

type Props = {
  data: AdminDashboardData;
};

export default function AdminDashboardPage({
  data,
}: Props) {
  return (
    <>
      <Head>
        <title>Admin Dashboard | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="mx-auto max-w-6xl p-6 space-y-8">
        {/* ===== Page Title ===== */}
        <h1 className="text-2xl font-semibold">
          Admin Dashboard
        </h1>

        {/* ===== Admin Navigation Hub ===== */}
        <section
          aria-label="Admin navigation"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* Reports */}
          <div className="rounded border p-4">
            <h2 className="mb-2 font-medium">
              Reports
            </h2>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href="/admin/reports"
                  className="text-blue-600 hover:underline"
                >
                  View all reports
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/reports/stats"
                  className="text-blue-600 hover:underline"
                >
                  Report statistics
                </Link>
              </li>
            </ul>
          </div>
           {/* Appeals */}
<div className="rounded border p-4">
  <h2 className="mb-2 font-medium">
    Appeals
  </h2>
  <ul className="space-y-1 text-sm">
    <li>
      <Link
        href="/admin/appeals"
        className="text-blue-600 hover:underline"
      >
        View appeals
      </Link>
    </li>
    <li>
      <Link
        href="/admin/appeals/stats"
        className="text-blue-600 hover:underline"
      >
        Appeal statistics
      </Link>
    </li>
  </ul>
</div>

          {/* Content */}
          <div className="rounded border p-4">
            <h2 className="mb-2 font-medium">
              Content
            </h2>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href="/admin/posts"
                  className="text-blue-600 hover:underline"
                >
                  Manage posts
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/comments"
                  className="text-blue-600 hover:underline"
                >
                  Manage comments
                </Link>
              </li>
            </ul>
          </div>

          {/* Users */}
          <div className="rounded border p-4">
            <h2 className="mb-2 font-medium">
              Users
            </h2>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href="/admin/users"
                  className="text-blue-600 hover:underline"
                >
                  View users
                </Link>
              </li>
            </ul>
          </div>

          {/* Moderation */}
          <div className="rounded border p-4">
            <h2 className="mb-2 font-medium">
              Moderation
            </h2>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href="/admin/actions"
                  className="text-blue-600 hover:underline"
                >
                  Moderation actions
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {/* ===== Existing Dashboard Summary (unchanged) ===== */}
        <AdminDashboard data={data} />
      </main>
    </>
  );
}

/* ================= SSR ================= */

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

  try {
    // 🔒 Backend is authority
    const data = await fetchAdminDashboard({
      cookieHeader: ctx.req.headers.cookie ?? "",
    });

    return {
      props: { data },
    };
  } catch (err: any) {
    // ❌ Not admin → backend returns 403
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
