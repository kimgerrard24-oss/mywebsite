// frontend/pages/login.tsx
import React from 'react';
import { useRouter } from 'next/router';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.phlyphant.com';

export default function LoginPage() {
  const router = useRouter();

  function startOAuth(provider: 'google' | 'facebook') {
    // Backend will start OAuth flow and redirect to provider
    // We include origin so backend can redirect back to correct frontend after provider
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${API_BASE}/auth/${provider}?origin=${encodeURIComponent(origin)}`;
    // For best UX, use window.location.href
    window.location.href = url;
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h1>เข้าสู่ระบบ</h1>
      <p>เลือกวิธีการเข้าสู่ระบบด้วยบัญชีผู้ให้บริการ:</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => startOAuth('google')}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Sign in with Google
        </button>
        <button
          onClick={() => startOAuth('facebook')}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Sign in with Facebook
        </button>
      </div>
    </div>
  );
}
