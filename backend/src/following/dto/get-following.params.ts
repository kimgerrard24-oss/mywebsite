// backend/src/following/dto/get-following.params.ts
import { IsUUID } from 'class-validator';

export class GetFollowingParams {
  @IsUUID()
  userId!: string;
}
