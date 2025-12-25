// frontend/src/components/profile/profile-ProfileCard.tsx
import React from "react";
import Link from "next/link";

import type {
  UserProfile,
  PublicUserProfile,
} from "@/lib/api/user";

import UserProfileStats from "@/components/profile/UserProfileStats";

export interface ProfileCardProps {
  profile: UserProfile | PublicUserProfile | null;

  /**
   * true  = owner profile
   * false = public profile
   */
  isSelf?: boolean;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isSelf = true,
}) => {
  if (!profile) return null;

  const displayName =
    profile.displayName && profile.displayName.trim().length > 0
      ? profile.displayName
      : "User";

  return (
    <section
      aria-labelledby="profile-heading"
      className="
        mx-auto
        mt-3
        sm:mt-4
        w-full
        max-w-3xl
        rounded-xl
        sm:rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-sm
      "
    >
      {/* ===== Cover ===== */}
      <div
        className="
          h-24
          sm:h-32
          md:h-40
          w-full
          rounded-t-xl
          sm:rounded-t-2xl
          bg-gray-200
        "
        style={{
          backgroundImage: profile.coverUrl
            ? `url(${profile.coverUrl})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        role="img"
        aria-label="Profile cover image"
      />

      <div
        className="
          px-4
          sm:px-6
          pb-5
          sm:pb-6
        "
      >
        {/* ===== Avatar + name ===== */}
        <div
          className="
            -mt-8
            sm:-mt-10
            flex
            flex-col
            sm:flex-row
            sm:items-end
            sm:justify-between
            gap-3
            sm:gap-4
          "
        >
          <div
            className="
              flex
              items-end
              gap-3
              sm:gap-4
            "
          >
            <div
              className="
                h-16
                w-16
                sm:h-20
                sm:w-20
                shrink-0
                overflow-hidden
                rounded-full
                border-4
                border-white
                bg-gray-100
              "
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={displayName}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    text-xl
                    sm:text-2xl
                    font-semibold
                    text-gray-500
                  "
                  aria-hidden="true"
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
              <h1
                id="profile-heading"
                className="
                  text-lg
                  sm:text-xl
                  font-semibold
                  text-gray-900
                  truncate
                "
              >
                {displayName}
              </h1>

              {/* email แสดงเฉพาะเจ้าของ */}
              {isSelf && "email" in profile && (
                <p
                  className="
                    text-xs
                    sm:text-sm
                    text-gray-500
                    truncate
                  "
                >
                  {profile.email}
                </p>
              )}
            </div>
          </div>

          {/* ===== Edit button (owner only) ===== */}
          {isSelf && (
            <Link
              href="/settings/profile"
              prefetch={false}
              className="
                inline-flex
                items-center
                justify-center
                rounded-md
                sm:rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                sm:px-4
                py-1.5
                sm:py-2
                text-xs
                sm:text-sm
                font-medium
                text-gray-700
                hover:bg-gray-50
                transition
              "
            >
              แก้ไขโปรไฟล์
            </Link>
          )}
        </div>

        {/* ===== Bio ===== */}
        <div className="mt-3 sm:mt-4">
          <h2
            className="
              text-xs
              sm:text-sm
              font-medium
              text-gray-700
            "
          >
            เกี่ยวกับฉัน
          </h2>
          <p
            className="
              mt-1
              text-xs
              sm:text-sm
              text-gray-600
              leading-relaxed
            "
          >
            {profile.bio && profile.bio.trim().length > 0
              ? profile.bio
              : "ยังไม่มีข้อมูลแนะนำตัว"}
          </p>
        </div>

        {/* ===== Meta ===== */}
        <dl
          className="
            mt-3
            sm:mt-4
            grid
            gap-3
            sm:gap-4
            text-xs
            sm:text-sm
            text-gray-600
            sm:grid-cols-2
          "
        >
          <div>
            <dt className="font-medium text-gray-700">
              เข้าร่วมเมื่อ
            </dt>
            <dd>
              <time dateTime={profile.createdAt}>
                {formatDate(profile.createdAt)}
              </time>
            </dd>
          </div>
        </dl>

        {/* ===== Followers / Following ===== */}
        {"stats" in profile && (
          <UserProfileStats profile={profile} />
        )}
      </div>
    </section>
  );
};
