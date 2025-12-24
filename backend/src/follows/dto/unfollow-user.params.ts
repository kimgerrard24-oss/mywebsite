// backend/src/follows/dto/unfollow-user.params.ts
import { IsUUID } from 'class-validator';

export class UnfollowUserParams {
  @IsUUID()
  userId!: string;
}
