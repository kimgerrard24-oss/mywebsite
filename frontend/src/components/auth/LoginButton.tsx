// frontend/components/Auth/LoginButton.tsx
import React from 'react';


type Props = {
  provider: 'google' | 'facebook';
  label?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.phlyphant.com';

export default function LoginButton({ provider, label }: Props) {
  const onClick = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${API_BASE}/auth/local/${provider}?origin=${encodeURIComponent(origin)}`;
    window.location.href = url;
  };

  return (
    <button onClick={onClick} style={{ padding: '8px 12px', cursor: 'pointer' }}>
      {label ?? (provider === 'google' ? 'Sign in with Google' : 'Sign in with Facebook')}
    </button>
  );
}
