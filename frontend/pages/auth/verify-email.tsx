// frontend/pages/auth/verify-email.tsx

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { verifyEmail } from '@/lib/api/auth';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { uid, token } = router.query;

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );

  useEffect(() => {
    if (!uid || !token) return;

    let cancelled = false;

    verifyEmail(uid as string, token as string)
      .then(() => {
        if (!cancelled) setStatus('success');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [uid, token]);

  return (
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
            Verifying your email...
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
              Email Verified 🎉
            </h1>

            <p
              className="
                text-sm
                sm:text-base
                text-gray-600
              "
            >
              Your email has been successfully confirmed.
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
              Please request a new verification email.
            </p>
          </>
        )}
      </article>
    </main>
  );
}
