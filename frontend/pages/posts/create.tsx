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

      <main className="mx-auto max-w-2xl px-4 py-8">
        <section>
          <h1 className="text-2xl font-semibold">
            Create a post
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Share your thoughts with the community
          </p>
        </section>

        <section className="mt-6">
          <CreatePostForm />
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps =
  requireSession();
