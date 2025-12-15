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

    for (const key of Object.keys(value)) {
      if (!allowedKeys.includes(key as any)) {
        throw new BadRequestException(`Field not allowed: ${key}`);
      }
    }

    return value;
  }
}
