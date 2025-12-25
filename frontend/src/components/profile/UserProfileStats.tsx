import Link from "next/link";
import type { PublicUserProfile } from "@/types/user-profile";

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
          flex-wrap
          items-center
          gap-3
          sm:gap-4
          text-xs
          sm:text-sm
          text-gray-600
        "
      >
        {/* Followers */}
        <li>
          <Link
            href={`/users/${profile.id}/followers`}
            className="hover:underline"
          >
            <strong className="font-medium text-gray-900">
              {profile.stats.followers}
            </strong>{" "}
            <span>Followers</span>
          </Link>
        </li>

        {/* Following */}
        <li>
          <Link
            href={`/users/${profile.id}/following`}
            className="hover:underline"
          >
            <strong className="font-medium text-gray-900">
              {profile.stats.following}
            </strong>{" "}
            <span>Following</span>
          </Link>
        </li>

        {/* Joined */}
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
