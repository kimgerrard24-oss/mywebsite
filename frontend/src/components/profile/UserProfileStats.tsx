import type { PublicUserProfile } from '@/types/user-profile';

type Props = {
  profile: PublicUserProfile;
};

export default function UserProfileStats({ profile }: Props) {
  return (
    <section aria-label="Profile statistics">
      <ul>
        <li>
          <strong>Joined:</strong>{' '}
          <time dateTime={profile.createdAt}>
            {new Date(profile.createdAt).toLocaleDateString()}
          </time>
        </li>
      </ul>
    </section>
  );
}
