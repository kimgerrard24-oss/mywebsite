// frontend/pages/requests.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";

import IncomingFollowRequestList from "@/components/follows/IncomingFollowRequestList";
import { useNotificationSocket } from "@/lib/notification.socket";

/* ============================
   PAGE
   ============================ */
export default function FollowRequestsPage() {
  // ✅ socket connect only after SSR auth passed
  useNotificationSocket();

  return (
    <>
      <Head>
        <title>Follow Requests – PhlyPhant</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="mx-auto max-w-xl">
        <IncomingFollowRequestList />
      </main>
    </>
  );
}

/* ============================
   SSR AUTH (BACKEND AUTHORITY)
   ============================ */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie;

  if (!cookieHeader) {
    return {
      redirect: {
        destination: "/feed",
        permanent: false,
      },
    };
  }

  const base =
    process.env.INTERNAL_BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "https://api.phlyphant.com";

  // 🔐 session-check (authority)
  const sessionRes = await fetch(`${base}/auth/session-check`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!sessionRes.ok) {
    return {
      redirect: {
        destination: "/feed",
        permanent: false,
      },
    };
  }

  const session = await sessionRes.json().catch(() => null);

  if (!session || session.valid !== true) {
    return {
      redirect: {
        destination: "/feed",
        permanent: false,
      },
    };
  }

  // ✅ allow render
  return { props: {} };
};
