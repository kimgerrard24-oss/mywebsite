// frontend/pages/reset-password-success.tsx

import React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';

const ResetPasswordSuccessPage: NextPage = () => {
  const router = useRouter();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.phlyphant.com';

  const canonicalUrl = `${siteUrl.replace(/\/+$/, '')}/reset-password-success`;

  const handleGoToLogin = () => {
    router.replace('/');
  };

  return (
    <>
      <Head>
        <title>Password Updated – PhlyPhant</title>
        <meta
          name="description"
          content="Your password has been successfully updated. You can now log in to PhlyPhant with your new password."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Password Updated – PhlyPhant" />
        <meta
          property="og:description"
          content="Your password has been successfully updated."
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
              Login
            </a>
          </nav>
        </header>

        {/* CONTENT */}
        <section className="flex-1 container mx-auto px-4 py-10 flex flex-col items-center justify-center">
          <article className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Password updated successfully
            </h1>
            <p className="text-gray-600 text-sm md:text-base mb-6">
              Your password has been updated. You can now sign in with your new
              password.
            </p>

            <button
              type="button"
              onClick={handleGoToLogin}
              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Go to login
            </button>
          </article>
        </section>

        {/* FOOTER */}
        <footer className="py-6 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} PhlyPhant — All rights reserved.
        </footer>
      </main>
    </>
  );
};

export default ResetPasswordSuccessPage;
