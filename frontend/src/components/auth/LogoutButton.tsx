// frontend/components/Auth/LogoutButton.tsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function LogoutButton() {
  const { signOut } = useAuth();

  return (
    <button
      onClick={() => {
        void signOut();
      }}
      style={{ padding: '8px 12px', cursor: 'pointer' }}
    >
      Logout
    </button>
  );
}
