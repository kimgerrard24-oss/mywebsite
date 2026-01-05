// frontend/pages/admin/dashboard.tsx

import type { GetServerSideProps } from "next";
import Head from "next/head";
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

      <main className="mx-auto max-w-6xl p-6">
        <h1 className="mb-6 text-2xl font-semibold">
          Admin Dashboard
        </h1>

        <AdminDashboard data={data} />
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
