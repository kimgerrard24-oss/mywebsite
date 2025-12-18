// frontend/pages/users/[userId].tsx
import { GetServerSideProps } from "next";
import ProfileLayout from "@/components/layout/ProfileLayout";
import ProfileMeta from "@/components/seo/ProfileMeta";
import PublicUserProfile from "@/components/profile/PublicUserProfile";
import { fetchPublicUserProfileServer } from "@/lib/api/user";

import type { PublicUserProfile as PublicUserProfileType } from "@/lib/api/user";

type Props = {
  profile: PublicUserProfileType;
};


export default function UserProfilePage({ profile }: Props) {
  
  return (
    <>
      <ProfileMeta profile={profile} />
      <ProfileLayout>
        <main>
          <PublicUserProfile profile={profile} />
        </main>
      </ProfileLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const userId = ctx.params?.userId;

  // guard: userId ต้องเป็น string เท่านั้น
  if (typeof userId !== "string") {
    return { notFound: true };
  }

  try {
    const { profile } = await fetchPublicUserProfileServer(
      userId,
      ctx.req.headers.cookie
    );

    if (!profile) {
      return { notFound: true };
    }

    return {
      props: { profile },
    };
  } catch {
    // fail-soft: backend error / network error
    return { notFound: true };
  }
};
