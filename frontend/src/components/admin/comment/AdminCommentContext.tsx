// frontend/src/components/admin/comment/AdminCommentContext.tsx

type Props = {
  post: {
    id: string;
    content: string;
    authorId: string;
  };
};

export default function AdminCommentContext({
  post,
}: Props) {
  return (
    <section className="rounded bg-gray-50 p-3 text-sm">
      <p className="font-medium">
        Parent Post
      </p>
      <p className="text-gray-700 line-clamp-3">
        {post.content}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Post ID: {post.id}
      </p>

      {/*
        NOTE:
        ขั้นถัดไปสามารถ link ไป
        /admin/posts/:id ได้
      */}
    </section>
  );
}
