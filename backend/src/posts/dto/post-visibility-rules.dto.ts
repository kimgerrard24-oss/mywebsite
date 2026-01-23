// backend/src/posts/dto/post-visibility-rules.dto.ts

import { PostVisibility } from '@prisma/client';

export class PostVisibilityRulesDto {
  visibility!: PostVisibility;
  includeUserIds!: string[];
  excludeUserIds!: string[];
}
