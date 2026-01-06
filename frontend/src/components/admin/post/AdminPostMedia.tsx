// frontend/src/components/admin/post/AdminPostMedia.tsx

type Props = {
  postId: string;

  /**
   * Derived state from parent (Post)
   * Media is controlled by post moderation only
   */
  isHidden?: boolean;
  isDeleted?: boolean;
};

export default function AdminPostMedia({
  postId,
  isHidden = false,
  isDeleted = false,
}: Props) {
  return (
    <section className="rounded border bg-gray-50 p-3 text-sm space-y-1">
      <p className="font-medium text-gray-700">
        Media Preview
      </p>

      {isDeleted && (
        <p className="text-red-600 text-xs">
          Media unavailable (post deleted)
        </p>
      )}

      {!isDeleted && isHidden && (
        <p className="text-orange-600 text-xs">
          Media hidden (post is hidden by admin)
        </p>
      )}

      {!isDeleted && !isHidden && (
        <p className="text-gray-600">
          Media preview for post{" "}
          <span className="font-mono">
            {postId}
          </span>
        </p>
      )}

      {/* 
        NOTE:
        - Media visibility is derived from Post moderation
        - No direct hide / unhide on media (policy enforced)
        - In next step:
          - Load media read-only for admin
          - Respect post.isHidden / post.isDeleted
      */}
    </section>
  );
}
