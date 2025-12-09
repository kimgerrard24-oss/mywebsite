// pages/auth/rest-password.tsx

import React from "react";
import Head from "next/head";
import type { GetServerSideProps, NextPage } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

interface ResetPasswordPageProps {
  token: string | null;
  email: string | null;
}

const ResetPasswordPage: NextPage<ResetPasswordPageProps> = ({
  token,
  email,
}) => {
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
          <nav className="container mx-auto flex items-center justify-between px-4 py-4">
            <a
              href="/"
              className="text-2xl font-bold text-blue-600"
              aria-label="PhlyPhant Home"
            >
              PhlyPhant
            </a>
            <a
              href="/"
              className="text-sm text-gray-700 hover:text-blue-600 transition"
            >
              Back to login
            </a>
          </nav>
        </header>

        {/* CONTENT */}
        <section className="flex-1 container mx-auto px-4 py-10 flex flex-col items-center justify-center">
          <ResetPasswordForm token={token} email={email} />
        </section>

        {/* FOOTER */}
        <footer className="py-6 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} PhlyPhant — All rights reserved.
        </footer>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<
  ResetPasswordPageProps
> = async (context) => {
  const { token, email } = context.query;

  const tokenValue =
    typeof token === "string" && token.trim().length > 0 ? token : null;
  const emailValue =
    typeof email === "string" && email.trim().length > 0 ? email : null;

  return {
    props: {
      token: tokenValue,
      email: emailValue,
    },
  };
};

export default ResetPasswordPage;
