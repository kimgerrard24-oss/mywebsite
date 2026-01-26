// backend/src/users/dto/update-tag-settings.dto.ts

import {
  IsBoolean,
  IsIn,
  IsOptional,
} from 'class-validator';

import {
  TAG_ALLOW_SCOPES,
  type TagAllowScope,
} from '../types/tag-allow-scope.type';

export class UpdateTagSettingsDto {
  @IsOptional()
  @IsIn(TAG_ALLOW_SCOPES)
  allowTagFrom?: TagAllowScope;

  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;
}

