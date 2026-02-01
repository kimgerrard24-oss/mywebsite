// frontend/pages/account/privacy.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";

import { sessionCheckServerSide } from "@/lib/api/api";
import AccountLayout from "@/components/account/AccountLayout";
import PrivacySettingToggle from "@/components/account/PrivacySettingToggle";

type Props = {
  isPrivate: boolean;
};

export default function AccountPrivacyPage({ isPrivate }: Props) {
 return (
  <>
    <Head>
      <title>Privacy Settings | PhlyPhant</title>
      <meta name="description" content="Manage your account privacy settings on PhlyPhant" />
    </Head>

    <AccountLayout>
      <main
        className="flex flex-col gap-6 sm:gap-8"
        role="main"
        aria-labelledby="privacy-heading"
        aria-describedby="privacy-description"
      >
        <header className="flex flex-col gap-1" role="banner">
          <h1
            id="privacy-heading"
            className="text-lg font-semibold text-gray-900 sm:text-xl"
          >
            Privacy
          </h1>

          <p
            id="privacy-description"
            className="text-sm text-gray-600"
          >
            Control who can follow and view your profile.
          </p>
        </header>

        <section
          className="flex flex-col gap-4 text-sm"
          role="region"
          aria-label="Privacy settings"
        >
          <PrivacySettingToggle initialIsPrivate={isPrivate} />
        </section>
      </main>
    </AccountLayout>
  </>
);

}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const cookie = ctx.req.headers.cookie ?? "";

  // 🔐 Session check (backend authority)
  const session = await sessionCheckServerSide(cookie);

  if (!session.valid) {
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

  try {
    const res = await fetch(`${base}/users/me`, {
  method: "GET",
  headers: {
    Accept: "application/json",
    ...(cookie ? { Cookie: cookie } : {}),
    // 🔥 force bypass CDN / proxy cache
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
  },
  credentials: "include",
  cache: "no-store",
});


    if (!res.ok) {
      return {
        props: { isPrivate: false }, // fail-soft
      };
    }

    const json = await res.json().catch(() => null);
    const profile =
      json?.data && typeof json.data === "object" ? json.data : json;

    return {
      props: {
        isPrivate: Boolean(profile?.isPrivate),
      },
    };
  } catch {
    return {
      props: { isPrivate: false },
    };
  }
};
