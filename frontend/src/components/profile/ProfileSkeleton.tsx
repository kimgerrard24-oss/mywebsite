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
      className="mx-auto mt-8 max-w-3xl animate-pulse rounded-2xl border border-gray-200 bg-white px-6 pb-6"
    >
      <div className="h-32 w-full rounded-t-2xl bg-gray-200" />
      <div className="-mt-8 flex items-end gap-4">
        <div className="h-20 w-20 rounded-full border-4 border-white bg-gray-200" />
        <div className="mt-6 flex flex-col gap-2">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="h-3 w-32 rounded bg-gray-200" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="h-3 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-2/3 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
      </div>
    </section>
  );
};
