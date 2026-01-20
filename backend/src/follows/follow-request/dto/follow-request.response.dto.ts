// backend/src/follows/follow-request/dto/follow-request.response.dto.ts

export class FollowRequestResponseDto {
  userId!: string;
  displayName!: string | null;
  avatarUrl!: string | null;
  requestedAt!: string;
}
