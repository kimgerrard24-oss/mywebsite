// frontend/pages/posts/edit.tsx

import Head from "next/head";
import EditPostForm from "@/components/posts/EditPostForm";

export { getServerSideProps } from "@/lib/gssp/edit-post";

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

      {/* ==============================
       * SEO / Future Media Support
       * ==============================
       * - หน้า edit ไม่ index
       * - media preview handled in form
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
        ✅ Media support:
        - EditPostForm เป็นผู้จัดการ media ทั้งหมด
        - page ไม่ยุ่ง logic ใด ๆ
      */}
      <section
        aria-label="Edit post form"
        className="w-full"
      >
        <EditPostForm
          postId={postId}
          initialContent={content}
        />
      </section>
    </main>
  </>
);

}
