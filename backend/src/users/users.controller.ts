// file: backend/src/users/users.controller.ts

import { 
  Controller, 
  Post,
  Get,
  UseGuards,
  Body, 
  Req, 
  UnauthorizedException 
} from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SessionUser } from '../auth/services/validate-session.service';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto, @Req() req: Request) {
    // ใช้ระบบ session ใหม่ — ใช้ access token จาก cookie
    const cookieName = process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access';
    const accessToken = req.cookies?.[cookieName];

    if (!accessToken) {
      throw new UnauthorizedException('Missing authentication token');
    }

    // verify JWT + redis session
    const payload = await this.authService.verifyAccessToken(accessToken);

    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    return {
      message: 'DTO Passed Validation',
      data: dto,
    };
  }

  @Get('me')
  @UseGuards(AccessTokenCookieAuthGuard)
  async getMe(
    @CurrentUser() sessionUser: SessionUser,
  ): Promise<UserProfileDto> {

    if (!sessionUser?.userId) {
      throw new Error('Session user is not available');
    }

    return this.usersService.getMe(sessionUser.userId);
  }
}
