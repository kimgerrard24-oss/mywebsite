// frontend/pages/account/privacy.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import { sessionCheckServerSide } from "@/lib/api/api";
import AccountLayout from "@/components/account/AccountLayout";
import PrivacySettingToggle from "@/components/account/PrivacySettingToggle";

/* =====================================================
   PAGE
   ===================================================== */
type Props = {
  isPrivate: boolean;
};

export default function AccountPrivacyPage({ isPrivate }: Props) {
  return (
    <>
      <Head>
        <title>Privacy Settings | PhlyPhant</title>
        <meta
          name="description"
          content="Manage your account privacy settings on PhlyPhant"
        />
      </Head>

      <AccountLayout>
        <main>
          <header>
            <h1 className="text-xl font-semibold">Privacy</h1>
            <p className="mt-1 text-sm text-gray-600">
              Control who can follow and view your profile.
            </p>
          </header>

          <div className="mt-6 space-y-4 text-sm">
            <PrivacySettingToggle initialIsPrivate={isPrivate} />
          </div>
        </main>
      </AccountLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie ?? "";

  // 🔐 AuthN only — backend is authority
  const session = await sessionCheckServerSide(cookieHeader);

  if (!session.valid) {
    return {
      redirect: { destination: "/feed", permanent: false },
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
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        redirect: { destination: "/feed", permanent: false },
      };
    }

    const json = await res.json().catch(() => null);

    const profile =
      json?.data && typeof json.data === "object"
        ? json.data
        : json;

    if (!profile || typeof profile.isPrivate !== "boolean") {
      return {
        redirect: { destination: "/feed", permanent: false },
      };
    }

    return {
      props: {
        isPrivate: Boolean(profile.isPrivate),
      },
    };
  } catch {
    return {
      redirect: { destination: "/feed", permanent: false },
    };
  }
};

