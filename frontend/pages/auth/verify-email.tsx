// frontend/pages/auth/verify-email.tsx

import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { verifyEmail } from '@/lib/api/auth';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;

  const [status, setStatus] = useState<Status>('loading');

  const hasRequested = useRef(false);

  // =================================================
  // Verify token once router is ready
  // =================================================
  useEffect(() => {
    if (!router.isReady) return;
    if (hasRequested.current) return;

    hasRequested.current = true;

    if (!token || typeof token !== 'string') {
      setStatus('error');
      return;
    }

    // basic sanity check (prevent trash requests)
    if (token.length < 32) {
      setStatus('error');
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus('success');

        // UX: auto redirect to login / profile
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
      })
      .catch(() => {
        setStatus('error');
      });
  }, [router.isReady, token, router]);

  return (
    <>
      <Head>
        <title>Email Verification | PhlyPhant</title>
        <meta
          name="description"
          content="Verify your email to activate your account"
        />
        <meta name="robots" content="noindex" />
      </Head>

      <main
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-gray-50
          px-4
          py-8
          sm:px-6
        "
      >
        <article
          role="status"
          aria-live="polite"
          className="
            w-full
            max-w-sm
            sm:max-w-md
            text-center
          "
        >
          {/* Loading */}
          {status === 'loading' && (
            <h1
              className="
                text-lg
                sm:text-xl
                md:text-2xl
                font-semibold
                text-gray-800
              "
            >
              Verifying your email…
            </h1>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <h1
                className="
                  mb-2
                  text-xl
                  sm:text-2xl
                  md:text-3xl
                  font-bold
                  text-gray-900
                "
              >
                Email verified 🎉
              </h1>

              <p
                className="
                  text-sm
                  sm:text-base
                  text-gray-600
                "
              >
                Your account is now active. Redirecting…
              </p>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <h1
                className="
                  mb-2
                  text-xl
                  sm:text-2xl
                  font-semibold
                  text-gray-900
                "
              >
                Invalid or expired link
              </h1>

              <p
                className="
                  text-sm
                  sm:text-base
                  text-gray-600
                "
              >
                Please request a new verification email from
                your account settings.
              </p>
            </>
          )}
        </article>
      </main>
    </>
  );
}
