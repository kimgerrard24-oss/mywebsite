// frontend/pages/posts/edit.tsx

import Head from 'next/head';
import EditPostForm from '@/components/posts/EditPostForm';


export { getServerSideProps } from '@/lib/gssp/edit-post';

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
