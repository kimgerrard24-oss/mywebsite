// frontend/src/components/profile/profile-ProfileCard.tsx
import React from "react";
import Link from "next/link";
import type { UserProfile, PublicUserProfile } from "@/types/user-profile";
import UserProfileStats from "@/components/profile/UserProfileStats";
import BlockUserButton from "@/components/users/BlockUserButton";
import UnblockUserButton from "@/components/users/UnblockUserButton";
import FollowActionButton from "@/components/follows/FollowActionButton";
import FollowController from "@/components/follows/FollowController";
import { useRouter } from "next/router";
import CancelFollowRequestButton from "@/components/follows/CancelFollowRequestButton";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";
import { AvatarClickable } from "@/components/profile/AvatarClickable";
import { CoverClickable } from "@/components/profile/CoverClickable";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { CoverUploader } from "@/components/profile/CoverUploaderr";
import AvatarCoverPreviewModal from "@/components/profile/AvatarCoverPreviewModal";

export interface ProfileCardProps {
  profile: UserProfile | PublicUserProfile | null;
  isSelf?: boolean;
}

function isPublicUserProfile(
  profile: UserProfile | PublicUserProfile
): profile is PublicUserProfile {
  return "stats" in profile && "isSelf" in profile && "isFollowing" in profile;
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
  const { data: currentMedia, loading: mediaLoading } =
  useCurrentProfileMedia(profile.id);

  const router = useRouter();
  const displayName =
    profile.displayName && profile.displayName.trim().length > 0
      ? profile.displayName
      : "User";

  const isPublic = isPublicUserProfile(profile);
  const publicProfile = isPublic ? profile : null;

  const [isFollowing, setIsFollowing] = React.useState(
  publicProfile ? publicProfile.isFollowing : false
);

const [isFollowRequested, setIsFollowRequested] = React.useState<boolean>(
  Boolean(publicProfile?.isFollowRequested)
);

  const isBlocked = isPublic && profile.isBlocked === true;

  const hasBlockedViewer = isPublic && profile.hasBlockedViewer === true;
  React.useEffect(() => {
  if (!publicProfile) return;

  setIsFollowing(publicProfile.isFollowing);
  setIsFollowRequested(
    publicProfile.isFollowRequested === true
  );
}, [
  publicProfile?.isFollowing,
  publicProfile?.isFollowRequested,
]);
   
const isPrivateLocked =
  isPublic &&
  publicProfile?.isPrivate === true &&
  !isSelf &&
  !isFollowing;

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

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
<CoverClickable
  coverUrl={currentMedia?.cover?.url}
  onClick={() => {
    if (currentMedia?.cover?.url) {
      setPreviewUrl(currentMedia.cover.url);
    }
  }}
/>

{isSelf && (
  <div className="px-4 pt-2">
    <CoverUploader />
  </div>
)}


      <div
        className="
          px-4
          sm:px-6
          pb-5
          sm:pb-6
        "
      >
        {/* ===== Avatar + name + actions ===== */}
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
          {/* ===== Left: Avatar + name ===== */}
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
    flex
    flex-col
    items-start
    gap-2
  "
>
  <AvatarClickable
    avatarUrl={currentMedia?.avatar?.url}
    displayName={displayName}
    onClick={() => {
      if (currentMedia?.avatar?.url) {
        setPreviewUrl(currentMedia.avatar.url);
      }
    }}
  />

  {isSelf && (
    <AvatarUploader />
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

          {/* ===== Right-side actions ===== */}
<div className="flex items-center gap-2 sm:gap-3">
  {/* Edit (owner only) */}
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

  {isSelf && (
  <Link
    href="/media/me"
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
    My Media
  </Link>
)}


  {/* ===== FOLLOW / REQUEST FOLLOW ===== */}
  {publicProfile && !isSelf && !hasBlockedViewer && (
  isFollowing ? (
    <FollowController
      userId={publicProfile.id}
      isFollowing={true}
      isBlocked={isBlocked}
      onChange={(v) => {
        setIsFollowing(v);
        if (!v) setIsFollowRequested(false);
      }}
    />
  ) : isFollowRequested ? (
    <CancelFollowRequestButton
      userId={publicProfile.id}
      onCanceled={() => {
        setIsFollowRequested(false);
      }}
    />
  ) : (
    <FollowActionButton
      userId={publicProfile.id}
      isFollowing={false}
      isPrivate={publicProfile.isPrivate === true}
      isBlocked={isBlocked}
      isFollowRequested={false}
      onFollowed={() => {
        setIsFollowing(true);
        setIsFollowRequested(false);
      }}
      onRequested={() => {
        setIsFollowRequested(true);
      }}
    />
  )
)}



  {/* ===== Block / Unblock ===== */}
  {!isSelf && isPublic && !hasBlockedViewer && (
    <>
      {isBlocked ? (
        <UnblockUserButton
          targetUserId={profile.id}
          onUnblocked={() => window.location.reload()}
        />
      ) : (
        <BlockUserButton
  targetUserId={profile.id}
  onBlocked={() => {
    router.replace("/feed");
  }}
/>
      )}
    </>
  )}
</div>

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
            {isBlocked || hasBlockedViewer
              ? "ไม่สามารถดูข้อมูลของผู้ใช้นี้ได้"
              : profile.bio && profile.bio.trim().length > 0
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
{isPublicUserProfile(profile) &&
  !isBlocked &&
  !hasBlockedViewer &&
  !isPrivateLocked && (
    <UserProfileStats profile={profile} />
  )}

      </div>
      {previewUrl && (
  <AvatarCoverPreviewModal
    imageUrl={previewUrl}
    onClose={() => setPreviewUrl(null)}
  />
)}

    </section>
  );
};

