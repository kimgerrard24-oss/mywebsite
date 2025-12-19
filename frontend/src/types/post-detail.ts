// frontend/src/types/post-detail.ts

export type PostDetail = {
  id: string;
  content: string;
  createdAt: string;

  // ===== เพิ่มส่วนนี้เท่านั้น =====
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  // ===== จบส่วนที่เพิ่ม =====

  media: {
    id: string;
    type: string;
    url: string;
  }[];
};
