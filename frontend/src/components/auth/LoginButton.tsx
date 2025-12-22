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
  <button
    type="button"
    onClick={onClick}
    aria-label={
      label ??
      (provider === 'google'
        ? 'Sign in with Google'
        : 'Sign in with Facebook')
    }
    className="
      inline-flex
      w-full
      sm:w-auto
      items-center
      justify-center
      gap-2
      rounded-md
      sm:rounded-lg
      border
      border-slate-300
      bg-white
      px-4
      sm:px-5
      py-2
      sm:py-2.5
      text-sm
      sm:text-base
      font-medium
      text-slate-800
      shadow-sm
      transition-colors
      hover:bg-slate-50
      focus:outline-none
      focus-visible:ring-2
      focus-visible:ring-slate-400
      focus-visible:ring-offset-2
      disabled:cursor-not-allowed
    "
  >
    {label ??
      (provider === 'google'
        ? 'Sign in with Google'
        : 'Sign in with Facebook')}
  </button>
);

}
