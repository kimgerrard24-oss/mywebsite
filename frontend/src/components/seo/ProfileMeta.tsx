import Head from 'next/head';
import type { PublicUserProfile } from '@/types/user-profile';

type Props = {
  profile: PublicUserProfile;
};

export default function ProfileMeta({ profile }: Props) {
  const title =
    profile.displayName
      ? `${profile.displayName} | PhlyPhant`
      : 'User Profile | PhlyPhant';

  const description =
    profile.bio ??
    'View user profile on PhlyPhant social media platform.';

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta
        property="og:url"
        content={`${process.env.NEXT_PUBLIC_SITE_URL}/users/${profile.id}`}
      />
      <meta property="og:type" content="profile" />
    </Head>
  );
}
