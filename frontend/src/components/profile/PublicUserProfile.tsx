// components/profile/PublicUserProfile.tsx
import UserProfileHeader from "./UserProfileHeader";
import UserProfileStats from "./UserProfileStats";
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

      {/* 
        NOTE:
        - User posts feed ถูกย้ายไป render ที่ page-level (/users/[userId].tsx)
        - เพื่อหลีกเลี่ยง placeholder / empty state หลอก
        - component นี้ทำหน้าที่เฉพาะ "profile presentation" เท่านั้น
      */}
    </section>
  );
}
