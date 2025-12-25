// frontend/src/components/profile/UserProfileHeader.tsx

import type { PublicUserProfile } from '@/types/user-profile';
import FollowButton from '@/components/follows/FollowButton';

type Props = {
  profile: PublicUserProfile;
};

export default function UserProfileHeader({ profile }: Props) {
  return (
    <header
      className="
        w-full
        flex
        flex-col
        items-center
        text-center
        gap-3
        sm:gap-4
      "
    >
      <figure
        className="
          flex
          items-center
          justify-center
        "
      >
        <img
          src={profile.avatarUrl || "/avatar-placeholder.png"}
          alt={profile.displayName ?? "User avatar"}
          width={128}
          height={128}
          loading="lazy"
          className="
            h-16
            w-16
            sm:h-24
            sm:w-24
            md:h-32
            md:w-32
            rounded-full
            object-cover
          "
        />
      </figure>

      <h1
        className="
          text-lg
          sm:text-xl
          md:text-2xl
          font-semibold
          text-gray-900
        "
      >
        {profile.displayName ?? "Unknown User"}
      </h1>

      {profile.bio && (
        <p
          className="
            max-w-xl
            text-sm
            sm:text-base
            text-gray-600
            leading-relaxed
          "
        >
          {profile.bio}
        </p>
      )}

      {/* ===== Follow button (public profile only) ===== */}
      {!profile.isSelf && (
        <div className="mt-2">
          <FollowButton
            userId={profile.id}
            isFollowing={profile.isFollowing}
          />
        </div>
      )}
    </header>
  );
}
