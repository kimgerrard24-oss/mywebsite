// backend/src/users/dto/tag-settings.response.dto.ts

import type { TagAllowScope } from '../types/tag-allow-scope.type';

export class TagSettingsResponseDto {
  allowTagFrom!: TagAllowScope;
  requireApproval!: boolean;

  static fromEntity(setting: {
    approvalMode: 'AUTO' | 'MANUAL' | 'DISABLED';
    allowFromAnyone: boolean;
    allowFromFollowers: boolean;
    allowFromFollowing: boolean;
    hideUntilApproved: boolean;
  }): TagSettingsResponseDto {
    let allowTagFrom: TagAllowScope = 'NO_ONE';

    if (setting.allowFromAnyone) {
      allowTagFrom = 'ANYONE';
    } else if (setting.allowFromFollowers) {
      allowTagFrom = 'FOLLOWERS';
    }

    return {
      allowTagFrom,
      requireApproval:
        setting.approvalMode === 'MANUAL' &&
        setting.hideUntilApproved === true,
    };
  }
}


