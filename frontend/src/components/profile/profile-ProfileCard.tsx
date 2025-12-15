// frontend/components/profile/ProfileCard.tsx
import React from "react";
import Link from "next/link";
import type { UserProfile } from "@/lib/api/user";

export interface ProfileCardProps {
  profile: UserProfile;
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

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const displayName =
    profile.displayName && profile.displayName.trim().length > 0
      ? profile.displayName
      : profile.email;

  return (
    <section
      aria-labelledby="profile-heading"
      className="mx-auto mt-8 max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-sm"
    >
      {/* Cover */}
      <div className="h-32 w-full rounded-t-2xl bg-gradient-to-r from-sky-500/70 to-indigo-500/80" />

      <div className="px-6 pb-6">
        {/* Avatar + name + edit button */}
        <div className="-mt-10 flex items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gray-100">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-gray-500">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <h1
                id="profile-heading"
                className="text-xl font-semibold text-gray-900"
              >
                {displayName}
              </h1>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>

          {/* Edit profile button */}
          <Link
            href="/settings/profile"
            prefetch={false}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            แก้ไขโปรไฟล์
          </Link>
        </div>

        {/* Bio */}
        <div className="mt-4">
          <h2 className="text-sm font-medium text-gray-700">เกี่ยวกับฉัน</h2>
          <p className="mt-1 text-sm text-gray-600">
            {profile.bio && profile.bio.trim().length > 0
              ? profile.bio
              : "ยังไม่มีข้อมูลแนะนำตัว"}
          </p>
        </div>

        {/* Meta info */}
        <dl className="mt-4 grid gap-4 text-sm text-gray-600 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-gray-700">เข้าร่วมเมื่อ</dt>
            <dd>{formatDate(profile.createdAt)}</dd>
          </div>
          {/* เผื่อใส่ข้อมูลอื่นในอนาคต เช่น จำนวนโพสต์, followers */}
        </dl>
      </div>
    </section>
  );
};
