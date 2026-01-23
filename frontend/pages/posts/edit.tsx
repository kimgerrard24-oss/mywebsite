// frontend/pages/posts/edit.tsx

import Head from "next/head";
import EditPostForm from "@/components/posts/EditPostForm";
import type { PostVisibilityValue } from "@/components/posts/PostVisibilitySelector";

export { getServerSideProps } from "@/lib/gssp/edit-post";

type Props = {
  postId: string;
  content: string;

  /**
   * ✅ Loaded from:
   * GET /posts/:id/visibility-rules (owner only)
   * via getServerSideProps
   */
  initialVisibility: PostVisibilityValue;
};

export default function EditPostPage({
  postId,
  content,
  initialVisibility,
}: Props) {
  return (
    <>
      <Head>
        <title>Edit post | PhlyPhant</title>

        {/* ==============================
         * SEO
         * ==============================
         * - edit page must not be indexed
         */}
        <meta name="robots" content="noindex,nofollow" />
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
        <header className="mb-4 sm:mb-6">
          <h1
            className="
              text-lg
              sm:text-xl
              font-semibold
              text-gray-900
            "
          >
            Edit post
          </h1>
        </header>

        {/* 
          ✅ Backend authority:
          - session check
          - owner check
          - visibility rules loading
          handled entirely in getServerSideProps
        */}
        <section
          aria-label="Edit post form"
          className="w-full"
        >
          <EditPostForm
            postId={postId}
            initialContent={content}
            initialVisibility={initialVisibility}
          />
        </section>
      </main>
    </>
  );
}
