// frontend/src/lib/auth/require-session.ts
import type { GetServerSideProps } from 'next';
import { api } from '@/lib/api/api';

export function requireSession(): GetServerSideProps {
  return async ({ req }) => {
    try {
      await api.get('/auth/session-check', {
        headers: {
          cookie: req.headers.cookie || '',
        },
        withCredentials: true,
      });

      return { props: {} };
    } catch {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
  };
}
