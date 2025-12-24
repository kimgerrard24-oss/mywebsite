// backend/src/follows/dto/get-followers.params.ts
import { IsUUID } from 'class-validator';

export class GetFollowersParams {
  @IsUUID()
  userId!: string;
}
