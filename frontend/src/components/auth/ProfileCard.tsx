// frontend/components/auth/ProfileCard.tsx

import React from "react";
import { useAuthContext } from "@/context/AuthContext";

const ProfileCard: React.FC = () => {
  const { user } = useAuthContext();

  if (!user) return null;

  return (
    <article className="max-w-lg mx-auto p-4 border rounded-xl shadow-sm">
      <header className="flex items-center space-x-3">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName || user.name || "User Avatar"}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-300" />
        )}

        <div>
          <h1 className="text-xl font-semibold">
            {user.displayName || user.name || "Unnamed User"}
          </h1>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
      </header>

      <footer className="mt-4 text-sm text-gray-500">
        <p>Joined on: {new Date(user.createdAt).toLocaleDateString()}</p>
      </footer>
    </article>
  );
};

export default ProfileCard;
