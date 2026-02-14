// ==============================
// frontend/pages/profile.tsx
// ==============================

import React, { useEffect, useState } from "react";
import Head from "next/head";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";

import type { UserProfile } from "@/types/user-profile";
import { ProfileCard } from "@/components/profile/profile-ProfileCard";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import ProfilePosts from "@/components/profile/ProfilePosts";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";
import ProfileUpdateModal from "@/components/profile/ProfileUpdateModal";
import CoverUpdateModal from "@/components/profile/CoverUpdateModal";
import { ProfileUpdateStoreProvider } from "@/stores/profile-update.store";
import { CoverUpdateStoreProvider } from "@/stores/cover-update.store";

interface ProfilePageProps {
  initialProfile: UserProfile | null;
  // IMPORTANT: this now means "session valid", not "profile exists"
  isAuthenticated: boolean;
}

export const getServerSideProps: GetServerSideProps<ProfilePageProps> = async (
  ctx
) => {
  const cookieHeader = ctx.req.headers.cookie ?? undefined;

  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://api.phlyphant.com";

  const apiBase = baseUrl.replace(/\/+$/, "");

  // 1) Check session validity (ONLY auth decision)
  const sessionRes = await fetch(`${apiBase}/auth/session-check`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!sessionRes.ok) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const sessionJson = await sessionRes.json().catch(() => null);

  if (!sessionJson || sessionJson.valid !== true) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // 2) Session valid → try fetch profile (FAIL-SOFT)
  let profile: UserProfile | null = null;

  try {
    const userRes = await fetch(`${apiBase}/users/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      credentials: "include",
      cache: "no-store",
    });

    if (userRes.ok) {
      const json = await userRes.json().catch(() => null);

      if (json?.data && typeof json.data === "object") {
        profile = json.data;
      } else if (json?.id) {
        profile = json;
      }
    }
  } catch {
    // ignore → CSR will load profile later
  }

  return {
    props: {
      initialProfile: profile,
      // session already verified
      isAuthenticated: true,
    },
  };
};

const ProfilePage: NextPage<ProfilePageProps> = ({
  initialProfile,
  isAuthenticated,
}) => {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [loading, setLoading] = useState<boolean>(
    isAuthenticated && !initialProfile
  );
  const [error, setError] = useState<string | null>(null);
  const currentMedia = useCurrentProfileMedia(profile?.id ?? null);

  useEffect(() => {
    if (initialProfile || !isAuthenticated) return;

    let isMounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);

        const API_BASE =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          process.env.NEXT_PUBLIC_API_BASE ||
          "https://api.phlyphant.com";

        const data = await fetch(
          `${API_BASE.replace(/\/+$/, "")}/users/me`,
          {
            method: "GET",
            credentials: "include",
          }
        )
          .then((r) => (r.ok ? r.json() : null))
          .then((j) => {
            if (j?.data) return j.data;
            if (j?.id) return j;
            return null;
          });

        if (isMounted) {
          setProfile(data);
          setError(null);
        }
      } catch {
        if (!isMounted) return;
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์ กรุณาลองใหม่อีกครั้ง");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [initialProfile, isAuthenticated]);

  // Redirect ONLY when:
  // - session invalid (SSR already handles this normally)
  // - CSR profile loading finished
  useEffect(() => {
    if (!isAuthenticated) {
      void router.replace("/");
      return;
    }

    if (!loading && !profile) {
      // session valid แต่ profile โหลดไม่ได้จริง ๆ
      void router.replace("/");
    }
  }, [isAuthenticated, loading, profile, router]);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.phlyphant.com";

return (
  <ProfileUpdateStoreProvider>
    <CoverUpdateStoreProvider>
    <>
      <Head>
        <title>โปรไฟล์ของฉัน | Phlyphant</title>
        <meta
          name="description"
          content="ดูและจัดการข้อมูลโปรไฟล์ของคุณบน Phlyphant โซเชียลมีเดียสำหรับทุกคน"
        />
        <link rel="canonical" href={`${siteUrl}/profile`} />
        <meta property="og:title" content="โปรไฟล์ของฉัน | Phlyphant" />
        <meta
          property="og:description"
          content="ดูและจัดการข้อมูลโปรไฟล์ของคุณบน Phlyphant"
        />
        <meta property="og:url" content={`${siteUrl}/profile`} />
        <meta property="og:type" content="profile" />
      </Head>

      <main
        className="
          min-h-screen
          bg-gray-50
          text-gray-900
          flex
          flex-col
        "
      >
        {/* ================= Header ================= */}
        <header
          className="
            w-full
            bg-white
            shadow-sm
            sticky
            top-0
            z-20
          "
        >
          <nav
            className="
              max-w-5xl
              mx-auto
              px-3
              sm:px-4
              md:px-6
              py-3
              sm:py-4
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <Link
              href="/feed"
              prefetch={false}
              className="
                text-xl
                sm:text-2xl
                font-semibold
                tracking-tight
                text-blue-600
                shrink-0
              "
            >
              PhlyPhant
            </Link>
          </nav>
        </header>

        {/* ================= Content ================= */}
        <div
          className="
            mx-auto
            w-full
            max-w-5xl
            px-3
            sm:px-6
            lg:px-8
            pb-10
            sm:pb-12
            pt-1 sm:pt-2
          "
        >
          {loading && <ProfileSkeleton />}
          {!loading && error && (
            <ProfileSkeleton errorMessage={error} />
          )}

          {!loading && !error && profile && (
            <>
              <ProfileCard profile={profile} />

              <div className="mt-6 sm:mt-8">
                <ProfilePosts userId={profile.id} />
              </div>

              <ProfileUpdateModal />
              <CoverUpdateModal />
            </>
          )}
        </div>
      </main>
    </>
    </CoverUpdateStoreProvider>
  </ProfileUpdateStoreProvider>
);


 };

export default ProfilePage;
