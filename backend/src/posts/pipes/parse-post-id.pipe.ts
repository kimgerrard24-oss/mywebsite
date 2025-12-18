// backend/src/posts/pipes/parse-post-id.pipe.ts
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { validate as isUUID } from 'uuid';

export class ParsePostIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isUUID(value)) {
      throw new BadRequestException('Invalid post id');
    }
    return value;
  }
}
