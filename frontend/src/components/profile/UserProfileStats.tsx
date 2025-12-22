import type { PublicUserProfile } from '@/types/user-profile';

type Props = {
  profile: PublicUserProfile;
};

export default function UserProfileStats({ profile }: Props) {
  return (
  <section
    aria-label="Profile statistics"
    className="
      w-full
      mt-3
      sm:mt-4
    "
  >
    <ul
      className="
        flex
        flex-col
        gap-1.5
        sm:gap-2
        text-xs
        sm:text-sm
        text-gray-600
      "
    >
      <li className="flex flex-wrap items-center gap-1">
        <strong className="font-medium text-gray-700">
          Joined:
        </strong>
        <time
          dateTime={profile.createdAt}
          className="whitespace-nowrap"
        >
          {new Date(profile.createdAt).toLocaleDateString()}
        </time>
      </li>
    </ul>
  </section>
);

}
