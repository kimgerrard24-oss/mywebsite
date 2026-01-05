// frontend/pages/admin/users/[id].tsx

import type { GetServerSideProps } from "next";
import Head from "next/head";
import { sessionCheckServerSide } from "@/lib/api/api";
import { fetchAdminUserById } from "@/lib/api/admin-users";
import AdminUserDetail from "@/components/admin/user/AdminUserDetail";
import type { AdminUserDetail as User } from "@/types/admin-user";

type Props = {
  user: User;
};

export default function AdminUserDetailPage({
  user,
}: Props) {
  return (
    <>
      <Head>
        <title>Admin User | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-xl font-semibold">
          User Evidence
        </h1>

        <AdminUserDetail user={user} />
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
    // 🔒 Backend is authority
    const user = await fetchAdminUserById(id);

    return {
      props: { user },
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

    // ❌ User not found
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
