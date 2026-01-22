// backend/src/admin/moderation/validators/is-valid-override-visibility.validator.ts

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import {
  ModerationActionType,
  ModerationTargetType,
} from '@prisma/client';

@ValidatorConstraint({ name: 'IsValidOverrideVisibility', async: false })
export class IsValidOverrideVisibility
  implements ValidatorConstraintInterface
{
  validate(
    actionType: ModerationActionType,
    args: ValidationArguments,
  ) {
    const obj = args.object as any;

    if (
      actionType ===
        ModerationActionType.POST_FORCE_PUBLIC ||
      actionType ===
        ModerationActionType.POST_FORCE_PRIVATE
    ) {
      return obj.targetType === ModerationTargetType.POST;
    }

    return true;
  }

  defaultMessage() {
    return 'POST_FORCE_* actions are only allowed for POST target';
  }
}
