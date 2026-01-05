// frontend/src/components/admin/report/AdminReportTargetPreview.tsx

type Props = {
  targetType: "POST" | "COMMENT" | "USER";
  targetId: string;
};

export default function AdminReportTargetPreview({
  targetType,
  targetId,
}: Props) {
  return (
    <section className="rounded bg-gray-50 p-3 text-sm">
      <p className="font-medium">
        Target
      </p>
      <p>
        {targetType} — {targetId}
      </p>

      {/* 
        NOTE:
        ในขั้นถัดไป คุณสามารถ link ไปที่:
        /admin/posts/:id
        /admin/comments/:id
        /admin/users/:id
      */}
    </section>
  );
}
