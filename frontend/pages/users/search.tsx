// frontend/pages/users/search.tsx
import Head from "next/head";
import UserSearchPanel from "@/components/users/UserSearchPanel";

export default function UserSearchPage() {
  return (
    <>
      <Head>
        <title>Search users | PhlyPhant</title>
        <meta
          name="description"
          content="Search and discover people on PhlyPhant"
        />
      </Head>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <section aria-labelledby="search-heading">
          <h1
            id="search-heading"
            className="text-2xl font-semibold"
          >
            Search users
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Find people by username or display name
          </p>
        </section>

        {/* 🔍 Full Search Experience */}
        <section className="mt-4">
          <UserSearchPanel variant="page" />
        </section>
      </main>
    </>
  );
}
