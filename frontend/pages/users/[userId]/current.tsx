// frontend/pages/media/[userId]/current.tsx

import { useRouter } from "next/router";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";

export default function CurrentProfileMediaPage() {
  const router = useRouter();
  const { userId } = router.query;

  const { data, loading, error } =
    useCurrentProfileMedia(typeof userId === "string" ? userId : null);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 p-6">
      {data.avatar && (
        <img
          src={data.avatar.url}
          alt="Avatar"
          className="max-h-[40vh] rounded-full"
        />
      )}

      {data.cover && (
        <img
          src={data.cover.url}
          alt="Cover"
          className="max-h-[50vh] rounded-lg"
        />
      )}
    </div>
  );
}
