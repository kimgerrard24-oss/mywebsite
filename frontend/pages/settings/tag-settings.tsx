// frontend/pages/settings/tag-settings.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import Link from "next/link";

import TagSettingsForm from "@/components/settings/TagSettingsForm";
import type { MyTagSettings } from "@/types/tag-settings";

type Props = {
  settings: MyTagSettings;
};

export default function TagSettingsPage({
  settings,
}: Props) {
  return (
    <>
      <Head>
        <title>Tag settings | PhlyPhant</title>
        <meta
          name="description"
          content="Control who can tag you in posts"
        />
      </Head>

      <main className="mx-auto max-w-xl px-4 py-8">
        {/* Back */}
        <div className="mb-6">
          <Link
            href="/settings/profile"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to profile
          </Link>
        </div>

        <TagSettingsForm initial={settings} />
      </main>
    </>
  );
}

/* ================================
   SSR AUTH CHECK (STANDARD)
   ================================ */
export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
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

  // ---- session check ----
  const sessionRes = await fetch(
    `${base}/auth/session-check`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
      credentials: "include",
      cache: "no-store",
    },
  );

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

  // ---- load tag settings ----
  try {
    const res = await fetch(
      `${base}/users/me/tag-settings`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: cookieHeader,
        },
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error();

    const settings =
      (await res.json()) as MyTagSettings;

    return {
      props: {
        settings,
      },
    };
  } catch {
    // production-safe fallback
    return {
      props: {
        settings: {
          allowTagFrom: "ANYONE",
          requireApproval: false,
        },
      },
    };
  }
};
