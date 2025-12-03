// frontend/pages/auth/verify-email.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { verifyEmail } from '@/lib/api/auth';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );

  useEffect(() => {
    if (!token) return;
    verifyEmail(token as string)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <article className="text-center max-w-md">
        {status === 'loading' && <h1>Verifying your email...</h1>}
        {status === 'success' && (
          <>
            <h1>Email Verified 🎉</h1>
            <p>Your email has been successfully confirmed.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h1>Invalid or expired link</h1>
            <p>Please request a new verification email.</p>
          </>
        )}
      </article>
    </main>
  );
}
