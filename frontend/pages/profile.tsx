// frontend/pages/profile.tsx

import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthContext } from "@/context/AuthContext";
import ProfileCard from "@/components/auth/ProfileCard";

export const dynamic = 'force-dynamic';

const ProfilePage: React.FC = () => {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    if (typeof window !== "undefined") {
      router.push("/");
    }
    return null;
  }

  return (
    <>
      <Head>
        <title>User Profile | PhlyPhant</title>
        <meta name="description" content="Your PhlyPhant profile page" />
      </Head>

      <main className="max-w-3xl mx-auto mt-10">
        <ProfileCard />
      </main>
    </>
  );
};

export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default ProfilePage;
