// backend/src/users/cover/user-cover.policy.ts
import { ForbiddenException, BadRequestException } from '@nestjs/common';

export class UserCoverPolicy {
  static assertCanUpdateCover(params: {
    isActive: boolean;
    isDisabled: boolean;
    file: Express.Multer.File;
  }) {
    const { isActive, isDisabled, file } = params;

    if (!isActive || isDisabled) {
      throw new ForbiddenException('Account is not allowed to update cover');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Invalid image file');
    }
  }
}
