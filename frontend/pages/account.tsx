// frontend/pages/account.tsx
import React from 'react';
import { GetServerSideProps } from 'next';

import { sessionCheckServerSide } from "@/lib/api/api";
import LogoutButton from '@/components/auth/LogoutButton';

type Props = {
  user?: any;
  valid: boolean;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie || "";

  try {
    const result = await sessionCheckServerSide(cookieHeader);

    if (!result || !result.valid) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    const data = result as Record<string, any>;
    const user = data.user ?? null;

    return {
      props: {
        valid: true,
        user,
      },
    };
  } catch {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
};

