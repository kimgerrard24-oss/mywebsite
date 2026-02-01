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
      <meta name="description" content="Manage your account settings on PhlyPhant" />
    </Head>

    <AccountLayout>
      <header className="mb-6 flex flex-col gap-1 sm:mb-8" role="banner">
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl" id="account-heading">
          Account
        </h1>
        <p className="text-sm text-gray-600" id="account-description">
          Manage your basic account information.
        </p>
      </header>

      <section
        className="space-y-4 text-sm sm:space-y-5"
        role="region"
        aria-labelledby="account-heading"
        aria-describedby="account-description"
      >
        <article
          className="rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 sm:p-5"
          role="group"
          aria-labelledby="account-profile-title"
        >
          <p id="account-profile-title" className="font-medium text-gray-900">
            Profile
          </p>
          <p className="mt-1 text-gray-600">
            Edit your display name, bio, and avatar.
          </p>
        </article>

        <article
          className="rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 sm:p-5"
          role="group"
          aria-labelledby="account-email-title"
        >
          <p id="account-email-title" className="font-medium text-gray-900">
            Email
          </p>
          <p className="mt-1 text-gray-600">
            Change and verify your email address.
          </p>
        </article>

        <article
          className="rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 sm:p-5"
          role="group"
          aria-labelledby="account-password-title"
        >
          <p id="account-password-title" className="font-medium text-gray-900">
            Password
          </p>
          <p className="mt-1 text-gray-600">
            Update your login password.
          </p>
        </article>
      </section>
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
