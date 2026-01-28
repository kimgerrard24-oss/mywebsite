// backend/src/shares/dto/create-external-share.dto.ts

import { IsUUID } from 'class-validator';

export class CreateExternalShareDto {
  @IsUUID()
  postId!: string;
}
