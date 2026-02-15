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
import { useProfileMedia } from "@/hooks/useProfileMedia";
import { ProfileMediaModal } from "@/components/profile/ProfileMediaModal";
import { useProfileUpdateStore } from "@/stores/profile-update.store";
import { useCoverUpdateStore } from "@/stores/cover-update.store";

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
  isSelf,
}) => {
  if (!profile) return null;
  const actualIsSelf =
  typeof isSelf === "boolean"
    ? isSelf
    : "isSelf" in profile
    ? profile.isSelf === true
    : false;

  const {
  data: currentMedia,
  loading: mediaLoading,
  refetch: refetchCurrentMedia,
} = useCurrentProfileMedia(profile.id);


const avatarMedia = useProfileMedia(profile.id, "AVATAR");
const coverMedia = useProfileMedia(profile.id, "COVER");
const { setDraft: setAvatarDraft } = useProfileUpdateStore();
const { setDraft: setCoverDraft } = useCoverUpdateStore();

const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);
const [viewerType, setViewerType] =
  React.useState<"AVATAR" | "COVER" | null>(null);

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
  !actualIsSelf &&
  !isFollowing;

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
<div className="relative">
  <CoverClickable
    coverUrl={currentMedia?.cover?.url}
    onClick={() => {
      setViewerType("COVER");
      setViewerIndex(0);

      if (coverMedia.items.length === 0) {
        coverMedia.loadMore();
      }
    }}
  />

  {actualIsSelf && (
    <button
      type="button"
      onClick={() => {
        const mediaId = currentMedia?.cover?.mediaId ?? "";


setCoverDraft({
  id: `temp-cover-${mediaId ?? "new"}`,
  type: "COVER",
  mediaId,
  visibility: "PUBLIC",
  content: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

      }}
      className="
        absolute
        top-2
        right-2
        bg-blue-600
        text-white
        text-xs
        px-2
        py-1
        rounded-md
        shadow
      "
    >
      อัปเดต
    </button>
  )}
</div>


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
<div className="relative">
  <AvatarClickable
    avatarUrl={currentMedia?.avatar?.url}
    displayName={displayName}
    onClick={() => {
      setViewerType("AVATAR");
      setViewerIndex(0);

      if (avatarMedia.items.length === 0) {
        avatarMedia.loadMore();
      }
    }}
  />

  {actualIsSelf && (
    <button
      type="button"
      onClick={() => {
   const mediaId = currentMedia?.avatar?.mediaId ?? "";


setAvatarDraft({
  id: `temp-avatar-${mediaId ?? "new"}`,
  type: "AVATAR",
  mediaId,
  visibility: "PUBLIC",
  content: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

      }}
      className="
        absolute
        bottom-0
        right-0
        bg-blue-600
        text-white
        text-xs
        px-2
        py-1
        rounded-md
        shadow
      "
    >
      อัปเดต
    </button>
  )}
</div>


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
              {actualIsSelf && "email" in profile && (
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
  {actualIsSelf && (
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

  {actualIsSelf && (
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
  {publicProfile && !actualIsSelf && !hasBlockedViewer && (
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
  {!actualIsSelf && isPublic && !hasBlockedViewer && (
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

{viewerIndex !== null && viewerType && (
  <ProfileMediaModal
  items={
    viewerType === "COVER"
      ? coverMedia.items
      : avatarMedia.items
  }
  loading={
    viewerType === "COVER"
      ? coverMedia.loading
      : avatarMedia.loading
  }
  index={viewerIndex}
  onClose={async () => {
  setViewerIndex(null);
  setViewerType(null);

  // 🔥 force reload avatar/cover after possible deletion
  await refetchCurrentMedia();
}}

  onNavigate={(newIndex) => {
    setViewerIndex(newIndex);
  }}
/>

)}
    </section>
  );
};

