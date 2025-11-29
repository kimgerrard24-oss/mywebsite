// src/post/post.controller.ts
import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { RateLimitContext } from 'src/common/rate-limit/rate-limit.decorator';

@Controller('posts')
export class PostController {
  @Post('')
  @RateLimitContext('postCreate')
  async createPost(@Body() body: any) {
    // Your post creation logic here
    return { message: 'Post created' };
  }
}
