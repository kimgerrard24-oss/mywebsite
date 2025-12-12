// frontend/pages/account.tsx
import React from 'react';
import { GetServerSideProps } from 'next';

import { sessionCheckServerSide } from "@/lib/api/api";
import LogoutButton from '@/components/auth/LogoutButton';

type Props = {
  user?: any;
  valid: boolean;
};

export default function AccountPage({ user, valid }: Props) {
  if (!valid) {
    return (
      <div style={{ padding: 24 }}>
        <h1>ต้องเข้าสู่ระบบ</h1>
        <p>คุณจะต้องเข้าสู่ระบบก่อนเข้าถึงหน้านี้</p>
        <a href="/login">ไปที่หน้าเข้าสู่ระบบ</a>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>บัญชีของคุณ</h1>

      {/* FIX: name / email ตาม Hybrid OAuth structure */}
      <p>ยินดีต้อนรับ, {user?.name || user?.email || 'ผู้ใช้'}</p>

      <pre>{JSON.stringify(user, null, 2)}</pre>

      <LogoutButton />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie;

  try {
const result = await sessionCheckServerSide(cookieHeader);

    if (!result || !result.valid) {
      return {
        redirect: {
          destination: '/login',
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
        destination: '/login',
        permanent: false,
      },
    };
  }
};
