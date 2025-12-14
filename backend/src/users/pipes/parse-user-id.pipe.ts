// backend/src/users/pipes/parse-user-id.pipe.ts
import { PipeTransform, BadRequestException } from '@nestjs/common';

export class ParseUserIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException('Invalid user id');
    }

    // รองรับ uuid / cuid / custom id
    if (value.length < 10 || value.length > 64) {
      throw new BadRequestException('Invalid user id format');
    }

    return value;
  }
}
