import type { PublicUserProfile } from '@/types/user-profile';

type Props = {
  profile: PublicUserProfile;
};

export default function UserProfileHeader({ profile }: Props) {
  return (
    <header>
      <figure>
        <img
          src={profile.avatarUrl || '/avatar-placeholder.png'}
          alt={profile.displayName ?? 'User avatar'}
          width={128}
          height={128}
        />
      </figure>

      <h1>
        {profile.displayName ?? 'Unknown User'}
      </h1>

      {profile.bio && (
        <p>{profile.bio}</p>
      )}
    </header>
  );
}
