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
              text-sm
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
            Login
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
        aria-labelledby="password-updated-heading"
      >
        <article
          role="status"
          aria-live="polite"
          className="
            w-full
            max-w-sm
            sm:max-w-md
            rounded-lg
            sm:rounded-xl
            bg-white
            p-6
            sm:p-8
            text-center
            shadow-md
            sm:shadow-lg
          "
        >
          <h1
            id="password-updated-heading"
            className="
              mb-3
              text-xl
              sm:text-2xl
              md:text-3xl
              font-bold
              text-gray-900
            "
          >
            Password updated successfully
          </h1>

          <p
            className="
              mb-6
              text-xs
              sm:text-sm
              md:text-base
              text-gray-600
            "
          >
            Your password has been updated. You can now sign in with your new
            password.
          </p>

          <button
            type="button"
            onClick={handleGoToLogin}
            className="
              inline-flex
              w-full
              items-center
              justify-center
              rounded-md
              bg-blue-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-colors
              hover:bg-blue-700
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-blue-500
              focus-visible:ring-offset-2
            "
          >
            Go to login
          </button>
        </article>
      </section>

      {/* FOOTER */}
      <footer className="py-4 sm:py-6 text-center text-[11px] sm:text-xs text-gray-500">
        © {new Date().getFullYear()} PhlyPhant — All rights reserved.
      </footer>
    </main>
  </>
);

};

export default ResetPasswordSuccessPage;
