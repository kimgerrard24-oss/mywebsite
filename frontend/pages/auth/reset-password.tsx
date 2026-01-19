// pages/auth/reset-password.tsx

import React from "react";
import Head from "next/head";
import type { GetServerSideProps, NextPage } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

interface ResetPasswordPageProps {
  token: string | null;
}

const ResetPasswordPage: NextPage<ResetPasswordPageProps> = ({ token }) => {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.phlyphant.com";

  const canonicalUrl = `${siteUrl.replace(/\/+$/, "")}/reset-password`;

  return (
    <>
      <Head>
        <title>Reset Password – PhlyPhant</title>
        <meta
          name="description"
          content="Set a new password for your PhlyPhant account using your secure reset link."
        />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Reset Password – PhlyPhant" />
        <meta
          property="og:description"
          content="Set a new password for your PhlyPhant account."
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
      </Head>

      <main className="min-h-screen flex flex-col bg-gray-50">
        {/* HEADER */}
        <header className="w-full border-b bg-white/80 backdrop-blur">
          <nav
            className="
              mx-auto
              flex
              max-w-7xl
              items-center
              justify-between
              px-4
              py-4
              sm:px-6
              lg:px-8
            "
            aria-label="Primary navigation"
          >
            <a
              href="/"
              className="
                text-xl
                sm:text-2xl
                font-bold
                text-blue-600
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500
                rounded
              "
              aria-label="PhlyPhant Home"
            >
              PhlyPhant
            </a>

            <a
              href="/"
              className="
                text-xs
                sm:text-sm
                font-medium
                text-gray-700
                hover:text-blue-600
                transition-colors
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500
                rounded
              "
            >
              Back to login
            </a>
          </nav>
        </header>

        {/* CONTENT */}
        <section
          className="
            flex
            flex-1
            items-center
            justify-center
            px-4
            py-8
            sm:py-10
          "
          aria-label="Reset password content"
        >
          <ResetPasswordForm token={token} />
        </section>

        {/* FOOTER */}
        <footer className="py-4 sm:py-6 text-center text-[11px] sm:text-xs text-gray-500">
          © {new Date().getFullYear()} PhlyPhant — All rights reserved.
        </footer>
      </main>
    </>
  );
};

export default ResetPasswordPage; // ✅ สำคัญมาก

export const getServerSideProps: GetServerSideProps<
  ResetPasswordPageProps
> = async (context) => {
  const { token } = context.query;

  const tokenValue =
    typeof token === "string" && token.trim().length > 0 ? token : null;

  return {
    props: {
      token: tokenValue,
    },
  };
};


