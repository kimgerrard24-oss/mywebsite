// frontend/pages/settings/profile.tsx
import Head from "next/head";
import type { GetServerSideProps } from "next";
import ProfileForm from "@/components/profile/ProfileForm";
import type { UserProfile } from "@/types/user-profile";
import Link from "next/link";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { AvatarPreview } from "@/components/profile/AvatarPreview";

type Props = {
  user: UserProfile | null;
};

export default function ProfileSettingsPage({ user }: Props) {
  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Edit Profile | PhlyPhant</title>
        <meta
          name="description"
          content="Edit your public profile on PhlyPhant"
        />
      </Head>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Back to profile */}
       <div className="mb-6 relative z-10">
  <Link
    href="/profile"
    prefetch={false}
    className="text-sm text-blue-600 hover:underline"
  >
    ← Back to profile
  </Link>
</div>

        <section>
          <h1 className="text-2xl font-semibold">Edit profile</h1>
          <p className="mt-1 text-sm text-gray-600">
            Update your public information
          </p>
        </section>

    {/* ================================
    Avatar Section (NEW)
    ไม่กระทบ ProfileForm เดิม
   ================================ */}
<section className="mt-6 flex items-center gap-4">
  <AvatarPreview avatarUrl={user.avatarUrl} />
  <AvatarUploader />
</section>

{/* ================================
    Existing Profile Form
   ================================ */}
<section className="mt-8">
  <ProfileForm user={user} />
</section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
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

  // 1) Check session validity (AUTH ONLY)
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

  // 2) Fetch profile (FAIL-SOFT)
  let user: UserProfile | null = null;

  try {
    const userRes = await fetch(`${base}/users/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
      credentials: "include",
      cache: "no-store",
    });

    if (userRes.ok) {
      const json = await userRes.json().catch(() => null);
      user = json?.data ?? json ?? null;
    }
  } catch {
    user = null;
  }

  return {
    props: {
      user,
    },
  };
};
