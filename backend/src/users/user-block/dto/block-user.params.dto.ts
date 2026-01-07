// backend/src/users/user-block/dto/block-user.params.dto.ts

import { IsUUID } from 'class-validator';

export class BlockUserParamsDto {
  @IsUUID()
  id!: string; // target user id
}
