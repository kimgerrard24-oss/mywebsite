// frontend/src/hooks/useUpdatePost.ts
import { useState } from "react";
import { updatePost } from "@/lib/api/posts";

export type UpdatePostParams = {
  postId: string;
  content: string;

  /**
   * media ใหม่ที่แนบเพิ่ม
   */
  mediaIds?: string[];

  /**
   * media เดิมที่ต้องการเก็บไว้
   * (media ที่ไม่อยู่ใน list นี้ = ถูกลบ)
   */
  keepMediaIds?: string[];
};

export function useUpdatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(params: UpdatePostParams) {
    try {
      setLoading(true);
      setError(null);

      return await updatePost(params);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Failed to update post"
      );
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    submit,
    loading,
    error,
  };
}
