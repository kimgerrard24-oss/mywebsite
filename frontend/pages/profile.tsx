// frontend/pages/profile.tsx

import React, { useEffect, useState } from "react";
import Head from "next/head";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";

import {
  fetchMyProfileClient,
  fetchMyProfileServer,
  type UserProfile,
} from "@/lib/api/user";

import { ProfileCard } from "@/components/profile/profile-ProfileCard";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";

interface ProfilePageProps {
  initialProfile: UserProfile | null;
  isAuthenticated: boolean;
}

export const getServerSideProps: GetServerSideProps<ProfilePageProps> = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie ?? undefined;

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://api.phlyphant.com";

  const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/users/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {})
    },
    credentials: "include",
    cache: "no-store"
  });

  if (res.status === 401 || res.status === 403) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const json = await res.json().catch(() => null);
  const profile = json?.data ?? null;

  return {
    props: {
      initialProfile: profile,
      isAuthenticated: Boolean(profile),
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
    !initialProfile && isAuthenticated
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || initialProfile) return;

    let isMounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchMyProfileClient();
        if (isMounted) {
          setProfile(data);
          setError(null);
        }
      } catch (err) {
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
  }, [isAuthenticated, initialProfile]);

  useEffect(() => {
    if (!isAuthenticated && !profile && !loading) {
      void router.replace("/");
    }
  }, [isAuthenticated, profile, loading, router]);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.phlyphant.com";

  return (
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

      <main className="min-h-screen bg-gray-50 text-gray-900">
        <header className="w-full bg-white shadow-sm sticky top-0 z-20">
          <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href="/feed"
              prefetch={false} 
              className="text-2xl font-semibold tracking-tight text-blue-600"
            >
              PhlyPhant
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/feed" prefetch={false} className="text-sm hover:text-blue-600">
                Feed
              </Link>
              <Link href="/dashboard" prefetch={false} className="text-sm hover:text-blue-600">
                Dashboard
              </Link>
            </div>
          </nav>
        </header>

        <div className="max-w-5xl mx-auto px-4 pt-4">
          <Link href="/feed" prefetch={false} className="text-sm text-blue-600 hover:underline">
            ← Back to feed
          </Link>
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
          {loading && <ProfileSkeleton />}
          {!loading && error && <ProfileSkeleton errorMessage={error} />}
          {!loading && !error && profile && <ProfileCard profile={profile} />}
        </div>
      </main>
    </>
  );
};

export default ProfilePage;
