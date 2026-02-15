// frontend/pages/settings/profile.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import ProfileForm from "@/components/profile/ProfileForm";
import type { UserProfile } from "@/types/user-profile";
import Link from "next/link";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { CoverUploader } from "@/components/profile/CoverUploader";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";
import { DeleteProfileMediaButton } from "@/components/profile/DeleteProfileMediaButton";

type Props = {
  user: UserProfile | null;
};

export default function ProfileSettingsPage({ user }: Props) {
  if (!user) return null;

 const currentMedia = useCurrentProfileMedia(user.id);

const avatarUrl = currentMedia.data?.avatar?.url ?? null;
const coverUrl = currentMedia.data?.cover?.url ?? null;
const mediaLoading = currentMedia.loading;


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

  <div className="mt-4 flex flex-col gap-4">
    <CoverUploader currentMedia={currentMedia} />

    {currentMedia.data?.cover?.mediaId && (
  <DeleteProfileMediaButton
    mediaId={currentMedia.data.cover.mediaId}
    onDeleted={() => {
      currentMedia.refetch();
    }}
  />
)}

  </div>
</section>



        {/* ==============================
           AVATAR SECTION (NEW SYSTEM)
           ============================== */}
        <section className="mt-10">
          <h2 className="text-lg font-medium">Profile Avatar</h2>

          <div className="mt-4 flex items-start gap-6">
            {/* Avatar Preview */}
         <div className="relative h-24 w-24">
  {mediaLoading ? (
    <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse" />
  ) : avatarUrl ? (
    <div className="h-24 w-24 rounded-full overflow-hidden border">
      <img
        src={avatarUrl}
        alt="Current avatar"
        className="h-full w-full object-cover"
      />
    </div>
  ) : (
    <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-semibold border">
      {user.displayName?.charAt(0)?.toUpperCase() ?? "U"}
    </div>
  )}
</div>


            {/* Upload Button */}
            <div className="flex flex-col gap-3">
  <AvatarUploader currentMedia={currentMedia} />

  {currentMedia.data?.avatar?.mediaId && (
  <DeleteProfileMediaButton
    mediaId={currentMedia.data.avatar.mediaId}
    onDeleted={() => {
      currentMedia.refetch();
    }}
  />
)}

</div>


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
