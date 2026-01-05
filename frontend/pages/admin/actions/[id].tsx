import type { GetServerSideProps } from "next";
import { sessionCheckServerSide } from "@/lib/api/api";
import { getAdminActionById } from "@/lib/api/admin-actions";
import type { AdminAction } from "@/types/admin-action";
import AdminActionDetail from "@/components/admin/AdminActionDetail";

type Props = {
  action: AdminAction;
};

export default function AdminActionPage({
  action,
}: Props) {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">
        Admin Action Detail
      </h1>

      <AdminActionDetail action={action} />
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<Props> =
  async (ctx) => {
    const cookieHeader = ctx.req.headers.cookie ?? "";

    const session = await sessionCheckServerSide(
      cookieHeader,
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
      // 🔒 SSR must forward cookie
      const action = await getAdminActionById(id, {
        cookieHeader,
      });

      return {
        props: { action },
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
