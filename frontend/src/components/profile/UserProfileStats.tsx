// frontend/src/components/profile/UserProfileStats.tsx
import Link from "next/link";
import type { PublicUserProfile } from "@/types/user-profile";

type Props = {
  profile: PublicUserProfile;
};

export default function UserProfileStats({ profile }: Props) {
  const followers = profile.stats?.followers ?? 0;
  const following = profile.stats?.following ?? 0;

  // 🔒 UX guard only (backend is authority)
  const isInteractionBlocked =
    profile.isBlocked === true ||
    profile.hasBlockedViewer === true;

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
          {isInteractionBlocked ? (
            <span
              className="cursor-not-allowed opacity-60"
              aria-disabled="true"
            >
              <strong className="font-medium text-gray-900">
                {followers}
              </strong>{" "}
              <span>Followers</span>
            </span>
          ) : (
            <Link
              href={`/users/${profile.id}/followers`}
              className="hover:underline"
            >
              <strong className="font-medium text-gray-900">
                {followers}
              </strong>{" "}
              <span>Followers</span>
            </Link>
          )}
        </li>

        {/* Following */}
        <li>
          {isInteractionBlocked ? (
            <span
              className="cursor-not-allowed opacity-60"
              aria-disabled="true"
            >
              <strong className="font-medium text-gray-900">
                {following}
              </strong>{" "}
              <span>Following</span>
            </span>
          ) : (
            <Link
              href={`/users/${profile.id}/following`}
              className="hover:underline"
            >
              <strong className="font-medium text-gray-900">
                {following}
              </strong>{" "}
              <span>Following</span>
            </Link>
          )}
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
