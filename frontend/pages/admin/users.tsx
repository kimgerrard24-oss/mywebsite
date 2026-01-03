// frontend/pages/admin/users.tsx

import { useState } from "react";
import Head from "next/head";
import type { GetServerSideProps } from "next";
import { getAdminUsers } from "@/lib/api/admin-users";
import { sessionCheckServerSide } from "@/lib/api/api";
import AdminUserList from "@/components/admin/AdminUserList";
import AdminPageGuard from "@/components/admin/AdminPageGuard";
import type { AdminUsersResponse } from "@/types/admin-user";

type Props = {
  data: AdminUsersResponse | null;
  allowed: boolean;
};

export default function AdminUsersPage({
  data,
  allowed,
}: Props) {
  /**
   * 🔒 Backend is authority
   * Initial state from SSR only
   */
  const [users, setUsers] = useState(
    data?.items ?? [],
  );

  /**
   * Re-fetch users after admin action
   * (ban / unban)
   */
  async function reloadUsers() {
    try {
      const res = await getAdminUsers({
        page: 1,
        limit: 20,
      });
      setUsers(res.items);
    } catch {
      // production-safe: ignore silently
    }
  }

  return (
    <>
      <Head>
        <title>Admin Users | PhlyPhant</title>
        <meta
          name="robots"
          content="noindex,nofollow"
        />
      </Head>

      <main className="p-6">
        <h1 className="mb-4 text-xl font-semibold">
          Users
        </h1>

        <AdminPageGuard allowed={allowed}>
          <AdminUserList
            users={users}
            onChanged={reloadUsers}
          />
        </AdminPageGuard>
      </main>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<Props> =
  async (ctx) => {
    const cookie = ctx.req.headers.cookie ?? "";

    // 🔐 Session check (backend authority)
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

    try {
      const data = await getAdminUsers(
        { page: 1, limit: 20 },
        ctx,
      );

      return {
        props: {
          data,
          allowed: true,
        },
      };
    } catch (err: any) {
      if (err?.status === 403) {
        return {
          props: {
            data: null,
            allowed: false,
          },
        };
      }

      return {
        props: {
          data: null,
          allowed: false,
        },
      };
    }
  };
