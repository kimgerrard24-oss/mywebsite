// components/profile/PublicUserPosts.tsx
import PublicUserEmptyState from "./PublicUserEmptyState";

/**
 * NOTE:
 * - ตอนนี้ยังไม่มี API post ของ user
 * - component นี้ถูกออกแบบไว้รองรับในอนาคต
 * - production-safe (fail-soft)
 */

type Props = {
  userId: string;
};

export default function PublicUserPosts({ userId }: Props) {
  /**
   * TODO (Phase ถัดไป)
   * - fetch /users/:id/posts
   * - pagination
   * - skeleton loading
   */

  const posts: any[] = []; // placeholder (intentional)

  if (posts.length === 0) {
    return <PublicUserEmptyState />;
  }

 return (
  <section
    aria-label="User posts"
    className="
      w-full
      mt-4
      sm:mt-6
      max-w-3xl
      mx-auto
      px-4
      sm:px-6
      lg:px-0
    "
  >
    {/* Future implementation */}
  </section>
);

}
