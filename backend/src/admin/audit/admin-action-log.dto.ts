// backend/src/admin/audit/admin-action-log.dto.ts

export type AdminActionLogPayload = {
  targetUserId: string;
  action: string;
  reason: string;
  fields: string[];
};
