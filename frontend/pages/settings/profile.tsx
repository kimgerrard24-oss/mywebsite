// frontend/pages/settings/profile.tsx
import Head from "next/head";
import type { GetServerSideProps } from "next";
import ProfileForm from "@/components/profile/ProfileForm";
import { sessionCheckServerSide } from "@/lib/api/api";
import type { UserProfile } from "@/types/user-profile";

type Props = {
  user: UserProfile;
};

export default function ProfileSettingsPage({ user }: Props) {
  return (
    <>
      <Head>
        <title>Edit Profile | PhlyPhant</title>
        <meta
          name="description"
          content="Edit your public profile on PhlyPhant"
        />
      </Head>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <section>
          <h1 className="text-2xl font-semibold">
            Edit profile
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Update your public information
          </p>
        </section>

        <section className="mt-6">
          <ProfileForm user={user} />
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const session = await sessionCheckServerSide();

  if (!session.valid) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: session.user,
    },
  };
};

