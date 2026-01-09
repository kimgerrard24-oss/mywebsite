// frontend/pages/appeals/me.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useState } from "react";

import { sessionCheckServerSide } from "@/lib/api/api";
import { getMyAppeals } from "@/lib/api/appeals";
import MyAppealsList from "@/components/appeals/MyAppealsList";
import type { Appeal } from "@/types/appeal";

type Props = {
  items: Appeal[];
};

export default function MyAppealsPage({
  items,
}: Props) {
  /**
   * 🔒 Backend authority
   * Initial state from SSR only
   */
  const [appeals] = useState(items);

  return (
    <>
      <Head>
        <title>My Appeals | PhlyPhant</title>
        <meta
          name="description"
          content="View your submitted appeals"
        />
      </Head>

      <main
        className="
          mx-auto max-w-3xl
          p-4 space-y-4
        "
      >
        <h1 className="text-xl font-semibold">
          My Appeals
        </h1>

        <MyAppealsList appeals={appeals} />
      </main>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const cookie = ctx.req.headers.cookie ?? "";

  // 🔐 Session check (backend authority)
  const session = await sessionCheckServerSide(
    cookie
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
    const data = await getMyAppeals(
      { limit: 20 },
      ctx
    );

    return {
      props: {
        items: data.items,
      },
    };
  } catch {
    // production-safe: show empty state
    return {
      props: {
        items: [],
      },
    };
  }
};
