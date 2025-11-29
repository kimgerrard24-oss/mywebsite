// src/comment/comment.controller.ts
import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { RateLimitContext } from '../common/rate-limit/rate-limit.decorator';

@Controller('comments')
export class CommentController {
  @Post('')
  @RateLimitContext('commentCreate')
  async createComment(@Body() body: any) {
    // Your comment logic here
    return { message: 'Comment created' };
  }
}
