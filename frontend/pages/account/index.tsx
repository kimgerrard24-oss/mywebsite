// frontend/pages/account/index.tsx
import Head from "next/head";
import type { GetServerSideProps } from "next";
import AccountLayout from "@/components/account/AccountLayout";

/* =====================================================
   PAGE
   ===================================================== */
export default function AccountPage() {
  return (
    <>
      <Head>
        <title>Account | PhlyPhant</title>
        <meta
          name="description"
          content="Manage your account settings on PhlyPhant"
        />
      </Head>

      <AccountLayout>
        <h1 className="text-xl font-semibold">Account</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your basic account information.
        </p>

        <div className="mt-6 space-y-4 text-sm">
          <div className="rounded border p-4">
            <p className="font-medium">Profile</p>
            <p className="text-gray-600">
              Edit your display name, bio, and avatar.
            </p>
          </div>

          <div className="rounded border p-4">
            <p className="font-medium">Email</p>
            <p className="text-gray-600">
              Change and verify your email address.
            </p>
          </div>

          <div className="rounded border p-4">
            <p className="font-medium">Password</p>
            <p className="text-gray-600">
              Update your login password.
            </p>
          </div>
        </div>
      </AccountLayout>
    </>
  );
}

/* =====================================================
   SSR AUTH (PATTERN FROM YOUR PROFILE PAGE)
   ===================================================== */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie;

  if (!cookieHeader) {
    return {
      redirect: { destination: "/feed", permanent: false },
    };
  }

  const base =
    process.env.INTERNAL_BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "https://api.phlyphant.com";

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
      redirect: { destination: "/feed", permanent: false },
    };
  }

  const session = await sessionRes.json().catch(() => null);

  if (!session || session.valid !== true) {
    return {
      redirect: { destination: "/feed", permanent: false },
    };
  }

  return { props: {} };
};
