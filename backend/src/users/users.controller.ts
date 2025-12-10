//  file: backend/src/users/users.controller.ts
import { 
  Controller, 
  Post,
  Get,
  UseGuards,
  Body, 
  Req, 
  UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { FirebaseAdminService } from '../firebase/firebase.service';
import * as cookie from 'cookie';
import { UserProfileDto } from './dto/user-profile.dto';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SessionUser } from '../auth/services/validate-session.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly firebase: FirebaseAdminService,
              private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto, @Req() req: Request) {
    const cookieName = process.env.SESSION_COOKIE_NAME || 'session';
    let sessionToken: string | undefined;

    // Parse cookies
    if (req.headers.cookie) {
      const parsed = cookie.parse(req.headers.cookie);
      sessionToken = parsed[cookieName];
    }

    // Fallback: Bearer token
    if (!sessionToken && req.headers.authorization?.startsWith('Bearer ')) {
      sessionToken = req.headers.authorization.replace('Bearer ', '');
    }

    if (!sessionToken) {
      throw new UnauthorizedException('Missing authentication token');
    }

    // Verify Firebase session cookie
    try {
      await this.firebase.auth().verifySessionCookie(sessionToken, true);
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    return {
      message: 'DTO Passed Validation',
      data: dto,
    };
  }
  // users/me โปรไฟล์ตัวเอง 
  @Get('me')
  @UseGuards(AccessTokenCookieAuthGuard)
  async getMe(
    @CurrentUser() sessionUser: SessionUser,
  ): Promise<UserProfileDto> {

    if (!sessionUser?.userId) {
      // Safety fallback — ปกติ Guard จะจับก่อนถึงจุดนี้
      throw new Error('Session user is not available');
    }

    return this.usersService.getMe(sessionUser.userId);
  }

}
