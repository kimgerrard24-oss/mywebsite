// backend/src/admin/appeals/types/resolve-appeal.input.ts

export type ResolveAppealInput = {
  appealId: string;

  decision: 'APPROVED' | 'REJECTED';

  resolutionNote?: string;
};


