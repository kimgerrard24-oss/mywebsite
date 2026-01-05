import type { GetServerSideProps } from "next";
import Head from "next/head";
import { sessionCheckServerSide } from "@/lib/api/api";
import { getAdminActions } from "@/lib/api/admin-actions";
import type { AdminAction } from "@/types/admin-action";
import AdminActionList from "@/components/admin/AdminActionList";
import AdminActionFilters from "@/components/admin/AdminActionFilters";

type Props = {
  items: AdminAction[];
  total: number;
};

export default function AdminActionsPage({
  items,
  total,
}: Props) {
  return (
    <>
      <Head>
        <title>Admin Actions | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="mx-auto max-w-3xl">
        <h1 className="px-4 py-4 text-xl font-semibold">
          Admin Actions ({total})
        </h1>

        <AdminActionFilters />
        <AdminActionList items={items} />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> =
  async (ctx) => {
    const cookieHeader = ctx.req.headers.cookie ?? "";

    const session = await sessionCheckServerSide(
      cookieHeader,
    );

    // 🔒 AuthN only — backend is authority
    if (!session.valid) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    try {
      const data = await getAdminActions(
        {
          page: 1,
          limit: 20,
        },
        {
          cookieHeader,
        },
      );

      return {
        props: {
          items: data.items,
          total: data.total,
        },
      };
    } catch (err: any) {
      if (err?.status === 403) {
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }

      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  };
