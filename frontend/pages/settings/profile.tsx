// frontend/pages/settings/profile.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import ProfileForm from "@/components/profile/ProfileForm";
import type { UserProfile } from "@/types/user-profile";
import Link from "next/link";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { CoverUploader } from "@/components/profile/CoverUploader";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";

type Props = {
  user: UserProfile | null;
};

export default function ProfileSettingsPage({ user }: Props) {
  if (!user) return null;

  const { data: currentMedia, loading: mediaLoading } =
    useCurrentProfileMedia(user.id);

  const avatarUrl = currentMedia?.avatar?.url ?? null;
  const coverUrl = currentMedia?.cover?.url ?? null;

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

        {/* Header */}
        <section>
          <h1 className="text-2xl font-semibold">Edit profile</h1>
          <p className="mt-1 text-sm text-gray-600">
            Update your public information
          </p>
        </section>

        {/* ==============================
           COVER SECTION (NEW SYSTEM)
           ============================== */}
        <section className="mt-8">
          <h2 className="text-lg font-medium">Profile Cover</h2>

          <div className="mt-4 space-y-4">
            {/* Cover Preview */}
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100">
              {mediaLoading ? (
                <div className="w-full h-full animate-pulse bg-gray-200" />
              ) : coverUrl ? (
                <img
                  src={coverUrl}
                  alt="Current cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-sm text-gray-400">
                  No cover photo
                </div>
              )}
            </div>

            {/* Upload Button */}
            <CoverUploader />
          </div>
        </section>

        {/* ==============================
           AVATAR SECTION (NEW SYSTEM)
           ============================== */}
        <section className="mt-10">
          <h2 className="text-lg font-medium">Profile Avatar</h2>

          <div className="mt-4 flex items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative">
              {mediaLoading ? (
                <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse" />
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Current avatar"
                  className="h-24 w-24 rounded-full object-cover border"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-semibold border">
                  {user.displayName?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
              )}
            </div>

            {/* Upload Button */}
            <AvatarUploader />
          </div>
        </section>

        {/* ==============================
           PROFILE FORM (UNCHANGED)
           ============================== */}
        <section className="mt-12">
          <ProfileForm user={user} />
        </section>
      </main>
    </>
  );
}

/* =====================================================
   SSR LOGIC (DO NOT TOUCH)
   ===================================================== */

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

  // 1) Check session validity
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

  // 2) Fetch profile
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
