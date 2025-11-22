// frontend/pages/account.tsx
// Example protected page using getServerSideProps to validate session cookie
import React from 'react';
import { GetServerSideProps } from 'next';

// ⭐ แก้ path ให้ถูกต้องตามโครงสร้างโปรเจกจริงของคุณ
import { validateSessionOnServer } from '@/lib/auth';
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
      <p>ยินดีต้อนรับ, {user?.displayName ?? user?.email ?? 'ผู้ใช้'}</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <LogoutButton />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie;
  try {
    const result = await validateSessionOnServer(cookieHeader);
    if (!result || !result.valid) {
      return { props: { valid: false } };
    }

    const user = result.user ?? null;
    return {
      props: {
        valid: true,
        user,
      },
    };
  } catch (err) {
    return { props: { valid: false } };
  }
};
