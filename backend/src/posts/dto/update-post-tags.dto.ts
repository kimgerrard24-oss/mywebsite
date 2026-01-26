// backend/src/posts/dto/update-post-tags.dto.ts

import { IsEnum, IsUUID } from 'class-validator';

/**
 * Client intent only (NOT DB status)
 * Server will map action -> next PostUserTagStatus via Policy
 */
export enum PostUserTagUpdateAction {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
  REMOVE = 'REMOVE',
}

export class UpdatePostTagsDto {
  @IsUUID('4')
  tagId!: string;

  @IsEnum(PostUserTagUpdateAction)
  action!: PostUserTagUpdateAction;
}

