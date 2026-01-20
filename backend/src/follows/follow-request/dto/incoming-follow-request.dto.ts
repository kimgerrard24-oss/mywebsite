// backend/src/follows/follow-request/dto/incoming-follow-request.dto.ts

/**
 * Public-safe DTO for incoming follow requests
 * Backend authority shape only
 */
export class IncomingFollowRequestDto {
  id!: string;
  requesterId!: string;
  username!: string;
  displayName!: string | null;
  avatarUrl!: string | null;
  createdAt!: Date;

  /**
   * Map repository row → DTO
   * Do NOT expose internal relations directly
   */
  static fromEntity(row: IncomingFollowRequestRow): IncomingFollowRequestDto {
    return {
      id: row.id,
      requesterId: row.requester.id,
      username: row.requester.username,
      displayName: row.requester.displayName,
      avatarUrl: row.requester.avatarUrl,
      createdAt: row.createdAt,
    };
  }
}

/**
 * Internal repository row shape
 * (decoupled from Prisma utility types)
 */
export type IncomingFollowRequestRow = {
  id: string;
  createdAt: Date;
  requester: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};
