// frontend/pages/admin/follows/[id].tsx

import type { GetServerSideProps } from "next";
import Head from "next/head";
import { sessionCheckServerSide } from "@/lib/api/api";
import ForceRemoveFollowPanel from "@/components/admin/follow/ForceRemoveFollowPanel";

type Props = {
  followId: string;
};

export default function AdminForceRemoveFollowPage({
  followId,
}: Props) {
  return (
    <>
      <Head>
        <title>Force Remove Follow | Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="mx-auto max-w-xl p-6">
        <h1 className="mb-4 text-lg font-semibold">
          Force Remove Follow
        </h1>

        <ForceRemoveFollowPanel followId={followId} />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie ?? "";

  const session = await sessionCheckServerSide(
    cookieHeader,
  );

  // 🔒 AuthN only — backend checks admin permission
  if (!session.valid) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const followId = ctx.params?.id as string;

  if (!followId) {
    return { notFound: true };
  }

  return {
    props: { followId },
  };
};
