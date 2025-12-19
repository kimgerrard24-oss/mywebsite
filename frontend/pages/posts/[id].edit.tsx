// frontend/pages/posts/[id].edit.tsx

import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import EditPostForm from '@/components/posts/EditPostForm';
import cookie from 'cookie';

type Props = {
  postId: string;
  content: string;
};

export default function EditPostPage({
  postId,
  content,
}: Props) {
  return (
    <>
      <Head>
        <title>Edit post | PhlyPhant</title>
      </Head>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-xl font-semibold">
          Edit post
        </h1>

        <EditPostForm
          postId={postId}
          initialContent={content}
        />
      </main>
    </>
  );
}
