// frontend/pages/posts/create.tsx
import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import { requireSession } from '@/lib/auth/require-session';
import CreatePostForm from '@/components/posts/CreatePostForm';

export default function CreatePostPage() {
  return (
  <>
    <Head>
      <title>Create Post | PhlyPhant</title>
      <meta
        name="description"
        content="Create a new post on PhlyPhant"
      />
    </Head>

    <main
      className="
        mx-auto
        w-full
        max-w-sm
        sm:max-w-md
        md:max-w-2xl
        px-4
        sm:px-6
        py-6
        sm:py-8
      "
    >
      <section
        aria-labelledby="create-post-heading"
        className="mb-4 sm:mb-6"
      >
        <header>
          <h1
            id="create-post-heading"
            className="
              text-xl
              sm:text-2xl
              font-semibold
              text-gray-900
            "
          >
            Create a post
          </h1>

          <p
            className="
              mt-1
              text-xs
              sm:text-sm
              text-gray-600
            "
          >
            Share your thoughts with the community
          </p>
        </header>
      </section>

      <section
        aria-label="Create post form"
        className="mt-4 sm:mt-6"
      >
        <CreatePostForm />
      </section>
    </main>
  </>
);

}

export const getServerSideProps: GetServerSideProps =
  requireSession();
