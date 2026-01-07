// backend/src/users/user-block/dto/unblock-user.params.dto.ts

import { IsUUID } from 'class-validator';

export class UnblockUserParamsDto {
  @IsUUID()
  id!: string; // target user id
}
