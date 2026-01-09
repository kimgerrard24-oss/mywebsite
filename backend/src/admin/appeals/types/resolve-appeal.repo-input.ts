// backend/src/admin/appeals/types/resolve-appeal.repo-input.ts

export type ResolveAppealRepoInput = {
  adminUserId: string;

  appealId: string;

  decision: 'APPROVED' | 'REJECTED';

  resolutionNote?: string;
};
