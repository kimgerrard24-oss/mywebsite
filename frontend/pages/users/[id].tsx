import { GetServerSideProps } from "next";
import ProfileLayout from "@/components/layout/ProfileLayout";
import UserProfileHeader from "@/components/profile/UserProfileHeader";
import UserProfileStats from "@/components/profile/UserProfileStats";
import ProfileMeta from "@/components/seo/ProfileMeta";
import {
  fetchPublicUserProfileServer,
} from "@/lib/api/user";

import type { PublicUserProfile } from "@/lib/api/user";

type Props = {
  profile: PublicUserProfile;
};

export default function UserProfilePage({ profile }: Props) {
  return (
    <>
      <ProfileMeta profile={profile} />
      <ProfileLayout>
        <main>
          <article>
            <UserProfileHeader profile={profile} />
            <UserProfileStats profile={profile} />
          </article>
        </main>
      </ProfileLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const userId = ctx.params?.id as string | undefined;
  if (!userId) {
    return { notFound: true };
  }

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
};
