// frontend/src/types/admin-appeal-stats.ts

export type AdminAppealStats = {
  range: "24h" | "7d" | "30d";

  total: number;

  byStatus: {
    PENDING: number;
    RESOLVED: number;
    REJECTED: number;
  };

  avgResolveMs: number;

  generatedAt: string;
};
