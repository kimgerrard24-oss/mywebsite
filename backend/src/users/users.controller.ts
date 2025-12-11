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
  @UseGuards(AccessTokenCookieAuthGuard)
  async create(@Body() dto: CreateUserDto, @CurrentUser() sessionUser: SessionUser) {

    if (!sessionUser?.userId) {
      throw new UnauthorizedException('Authentication required');
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
      throw new UnauthorizedException('Authentication required');
    }

    return this.usersService.getMe(sessionUser.userId);
  }
}
