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

    <main
      className="
        mx-auto
        w-full
        max-w-xl
        sm:max-w-2xl
        md:max-w-3xl
        px-4
        sm:px-6
        py-6
        sm:py-8
      "
    >
      <section
        aria-labelledby="search-heading"
        className="mb-4 sm:mb-6"
      >
        <header>
          <h1
            id="search-heading"
            className="
              text-xl
              sm:text-2xl
              font-semibold
              text-gray-900
            "
          >
            Search users
          </h1>

          <p
            className="
              mt-1
              text-xs
              sm:text-sm
              text-gray-600
            "
          >
            Find people by username or display name
          </p>
        </header>
      </section>

      {/* 🔍 Full Search Experience */}
      <section
        className="
          mt-4
          sm:mt-6
        "
        aria-label="User search panel"
      >
        <UserSearchPanel variant="page" />
      </section>
    </main>
  </>
);

}
