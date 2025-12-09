// frontend/pages/auth/forgot-password.tsx
import React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.phlyphant.com';

const ForgotPasswordPage: NextPage = () => {
  const pageTitle = 'Forgot Password | Phlyphant';
  const pageDescription =
    'Reset your Phlyphant account password securely. Enter your email address and we will send you a password reset link.';

  const canonicalUrl = `${SITE_URL.replace(
    /\/$/,
    '',
  )}/auth/forgot-password`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />

        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Phlyphant" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-10">
          <section className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                Reset your password
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                We&apos;ll send a secure link to your email so you can create a
                new password.
              </p>
            </div>

            <ForgotPasswordForm />
          </section>
        </div>
      </main>
    </>
  );
};

export default ForgotPasswordPage;
