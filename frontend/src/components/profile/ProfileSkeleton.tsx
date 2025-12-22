// frontend/components/profile/ProfileSkeleton.tsx
import React from 'react';

interface ProfileSkeletonProps {
  errorMessage?: string | null;
}

export const ProfileSkeleton: React.FC<ProfileSkeletonProps> = ({
  errorMessage,
}) => {
  if (errorMessage) {
    return (
      <section
        aria-label="ข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์"
        className="mx-auto mt-8 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-800"
      >
        <p className="font-semibold">ไม่สามารถโหลดข้อมูลโปรไฟล์ได้</p>
        <p className="mt-1">{errorMessage}</p>
      </section>
    );
  }

  return (
  <section
    aria-label="กำลังโหลดโปรไฟล์"
    role="status"
    aria-live="polite"
    className="
      mx-auto
      mt-6
      sm:mt-8
      w-full
      max-w-3xl
      animate-pulse
      rounded-xl
      sm:rounded-2xl
      border
      border-gray-200
      bg-white
      px-4
      sm:px-6
      pb-5
      sm:pb-6
    "
  >
    {/* ===== Cover skeleton ===== */}
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
    />

    {/* ===== Avatar + name skeleton ===== */}
    <div
      className="
        -mt-8
        sm:-mt-10
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
          rounded-full
          border-4
          border-white
          bg-gray-200
        "
      />
      <div
        className="
          mt-5
          sm:mt-6
          flex
          flex-col
          gap-1.5
          sm:gap-2
        "
      >
        <div
          className="
            h-3
            sm:h-4
            w-32
            sm:w-40
            rounded
            bg-gray-200
          "
        />
        <div
          className="
            h-3
            w-24
            sm:w-32
            rounded
            bg-gray-200
          "
        />
      </div>
    </div>

    {/* ===== Bio skeleton ===== */}
    <div
      className="
        mt-5
        sm:mt-6
        space-y-2
        sm:space-y-3
      "
    >
      <div
        className="
          h-3
          w-3/4
          rounded
          bg-gray-200
        "
      />
      <div
        className="
          h-3
          w-2/3
          rounded
          bg-gray-200
        "
      />
      <div
        className="
          h-3
          w-1/2
          rounded
          bg-gray-200
        "
      />
    </div>
  </section>
);

};
