// frontend/src/components/admin/post/AdminPostMedia.tsx

type Props = {
  postId: string;
};

export default function AdminPostMedia({
  postId,
}: Props) {
  return (
    <section className="rounded bg-gray-50 p-3 text-sm">
      <p className="font-medium">
        Media Preview
      </p>
      <p className="text-gray-600">
        Media preview for post {postId}
      </p>

      {/*
        NOTE:
        ในขั้นถัดไป คุณสามารถโหลด media ของ post
        แบบ read-only สำหรับ admin ได้ที่นี่
      */}
    </section>
  );
}
