// frontend/styles/cover.ts
export type UpdateCoverResponse = {
  success: boolean;
  coverUrl: string;

  /**
   * optional (future-proof)
   */
  message?: string;
};

