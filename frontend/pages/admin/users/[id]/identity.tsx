// frontend/pages/admin/users/[id]/identity.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";

import AdminPageGuard from "@/components/admin/AdminPageGuard";
import AdminUpdateIdentityForm from "@/components/admin/AdminUpdateIdentityForm";
import { sessionCheckServerSide } from "@/lib/api/api";

type Props = {
  allowed: boolean;
  userId: string;
};

export default function AdminUserIdentityPage({
  allowed,
  userId,
}: Props) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Update Identity | Admin | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="mx-auto max-w-xl p-6">
        <Link
          href="/admin/users"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to users
        </Link>

        <h1 className="mt-4 text-xl font-semibold">
          Update User Identity
        </h1>

        <AdminPageGuard allowed={allowed}>
          <div className="mt-6">
            <AdminUpdateIdentityForm
              userId={userId}
              onSuccess={() =>
                router.push("/admin/users")
              }
            />
          </div>
        </AdminPageGuard>
      </main>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const cookie = ctx.req.headers.cookie ?? "";

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

  const userId = ctx.params?.id;

  if (!userId || typeof userId !== "string") {
    return { notFound: true };
  }

  return {
    props: {
      allowed: true, // backend will enforce real permission
      userId,
    },
  };
};
