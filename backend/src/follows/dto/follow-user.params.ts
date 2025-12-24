// backend/src/follows/dto/follow-user.params.ts
import { IsUUID } from 'class-validator';

export class FollowUserParams {
  @IsUUID()
  userId!: string;
}
