// frontend/src/components/admin/user/AdminUserStats.tsx

type Props = {
  stats: {
    postCount: number;
    commentCount: number;
  };
};

export default function AdminUserStats({
  stats,
}: Props) {
  return (
    <section className="rounded bg-gray-50 p-3 text-sm">
      <p className="font-medium">
        Activity Summary
      </p>
      <div className="mt-1 flex gap-4">
        <span>
          Posts: {stats.postCount}
        </span>
        <span>
          Comments: {stats.commentCount}
        </span>
      </div>
    </section>
  );
}
