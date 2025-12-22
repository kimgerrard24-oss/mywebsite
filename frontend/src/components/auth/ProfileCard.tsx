// frontend/components/auth/ProfileCard.tsx

import React from "react";
import { useAuthContext } from "@/context/AuthContext";

const ProfileCard: React.FC = () => {
  const { user } = useAuthContext();

  if (!user) return null;

 return (
  <article
    className="
      w-full
      max-w-lg
      mx-auto
      p-3
      sm:p-4
      md:p-5
      border
      border-gray-200
      rounded-lg
      sm:rounded-xl
      shadow-sm
      bg-white
    "
    aria-label="User profile summary"
  >
    <header
      className="
        flex
        items-center
        gap-3
        sm:gap-4
      "
    >
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.displayName || user.name || "User Avatar"}
          className="
            w-12
            h-12
            sm:w-14
            sm:h-14
            md:w-16
            md:h-16
            rounded-full
            object-cover
            flex-shrink-0
          "
          loading="lazy"
        />
      ) : (
        <div
          className="
            w-12
            h-12
            sm:w-14
            sm:h-14
            md:w-16
            md:h-16
            rounded-full
            bg-gray-300
            flex-shrink-0
          "
          aria-hidden="true"
        />
      )}

      <div className="min-w-0">
        <h1
          className="
            text-base
            sm:text-lg
            md:text-xl
            font-semibold
            leading-tight
            truncate
          "
        >
          {user.displayName || user.name || "Unnamed User"}
        </h1>

        <p
          className="
            mt-0.5
            text-xs
            sm:text-sm
            text-gray-600
            truncate
          "
        >
          {user.email}
        </p>
      </div>
    </header>

    <footer
      className="
        mt-3
        sm:mt-4
        text-xs
        sm:text-sm
        text-gray-500
      "
    >
      <time dateTime={new Date(user.createdAt).toISOString()}>
        Joined on: {new Date(user.createdAt).toLocaleDateString()}
      </time>
    </footer>
  </article>
);

};

export default ProfileCard;
