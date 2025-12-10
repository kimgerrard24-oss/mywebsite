// frontend/pages/profile.tsx

import Head from "next/head";
import { GetServerSideProps } from "next";
import axios from "axios";
import Link from "next/link";
import { validateSessionOnServer } from "@/lib/auth";

type ProfileProps = {
  user: any;
};

export default function ProfilePage({ user }: ProfileProps) {
  return (
    <>
      <Head>
        <title>Profile - PhlyPhant</title>
      </Head>

      <main className="min-h-screen bg-gray-50 text-gray-900">
        <header className="w-full bg-white shadow-sm sticky top-0 z-20">
          <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href="/feed"
              className="text-2xl font-semibold tracking-tight text-blue-600"
            >
              PhlyPhant
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/feed" className="text-sm hover:text-blue-600">
                Feed
              </Link>
              <Link href="/dashboard" className="text-sm hover:text-blue-600">
                Dashboard
              </Link>
            </div>
          </nav>
        </header>

        <section className="max-w-2xl mx-auto p-6">
          <div className="bg-white border shadow p-6 rounded-2xl">
            <h1 className="text-2xl font-semibold mb-4">Your Profile</h1>

            <div className="flex items-center gap-4">
              <img
                src={user?.avatarUrl || "/images/default-avatar.png"}
                className="w-16 h-16 rounded-full border object-cover"
                alt="Avatar"
              />

              <div>
                <p className="text-lg font-medium">{user?.name || "-"}</p>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <p className="text-gray-600 mt-4">
              Account created:{" "}
              {new Date(user?.createdAt).toLocaleString("th-TH")}
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie;

  // Validate cookie/session
  const result = await validateSessionOnServer(cookieHeader);

  if (!result || !result.valid) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const API =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://api.phlyphant.com";

  // Query backend for profile data
  const response = await axios.get(`${API}/auth/local/profile`, {
    headers: {
      cookie: cookieHeader || "",
    },
    withCredentials: true,
  });

  return {
    props: {
      user: response.data.data,
    },
  };
};
