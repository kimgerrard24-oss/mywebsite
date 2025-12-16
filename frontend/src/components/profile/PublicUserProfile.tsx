// components/profile/PublicUserProfile.tsx
import UserProfileHeader from "./UserProfileHeader";
import UserProfileStats from "./UserProfileStats";
import PublicUserPosts from "./PublicUserPosts";
import type { PublicUserProfile } from "@/lib/api/user";

type Props = {
  profile: PublicUserProfile;
};

export default function PublicUserProfile({ profile }: Props) {
  return (
    <section
      className="mx-auto max-w-3xl px-4 py-6"
      aria-label="Public user profile"
    >
      {/* Header */}
      <UserProfileHeader profile={profile} />

      {/* Stats */}
      <div className="mt-6">
        <UserProfileStats profile={profile} />
      </div>

      {/* Posts / Empty state */}
      <div className="mt-8">
        <PublicUserPosts userId={profile.id} />
      </div>
    </section>
  );
}
