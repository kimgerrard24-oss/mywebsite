// frontend/pages/admin/appeals/appeals.tsx

import { useState } from "react";
import Head from "next/head";
import type { GetServerSideProps } from "next";

import { sessionCheckServerSide } from "@/lib/api/api";
import { getAdminAppeals } from "@/lib/api/admin-appeals";

import type {
  AdminAppealsResponse,
} from "@/types/admin-appeal";

import AdminAppealList from "@/components/admin/appeals/AdminAppealList";
import AdminPageGuard from "@/components/admin/AdminPageGuard";

type Props = {
  data: AdminAppealsResponse | null;
  allowed: boolean;
};

export default function AdminAppealsPage({
  data,
  allowed,
}: Props) {
  const [items] = useState(
    data?.items ?? [],
  );

  return (
    <>
      <Head>
        <title>Admin Appeals | PhlyPhant</title>
        <meta
          name="robots"
          content="noindex,nofollow"
        />
      </Head>

      <main className="p-6">
        <h1 className="mb-4 text-xl font-semibold">
          Appeals
        </h1>

        <AdminPageGuard allowed={allowed}>
          <AdminAppealList items={items} />
        </AdminPageGuard>
      </main>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const cookie =
    ctx.req.headers.cookie ?? "";

  // 🔐 Session check only (backend authority)
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
    const data = await getAdminAppeals(
      { limit: 20 },
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
