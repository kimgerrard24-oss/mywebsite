// backend/src/users/pipes/update-user-policy.pipe.ts
import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UpdateUserPolicyPipe
  implements PipeTransform<UpdateUserDto>
{
  transform(value: UpdateUserDto) {
    if (!value || Object.keys(value).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const allowedKeys: (keyof UpdateUserDto)[] = [
      'displayName',
      'bio',
    ];

    const entries = Object.entries(value).filter(
      ([, v]) => v !== undefined,
    );

    if (entries.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    for (const [key] of entries) {
      if (!allowedKeys.includes(key as keyof UpdateUserDto)) {
        throw new BadRequestException(`Field not allowed: ${key}`);
      }
    }

    return value;
  }
}

