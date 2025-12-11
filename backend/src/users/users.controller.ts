// file: backend/src/users/users.controller.ts

import { 
  Controller, 
  Post,
  Get,
  UseGuards,
  Body, 
  Req, 
  UnauthorizedException,
  ConflictException 
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

    // Check if the email is already registered
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await this.authService.hashPassword(dto.password);
    const newUser = await this.usersService.createUser(dto.email, hashedPassword, dto.displayName);

    return {
      message: 'User created successfully',
      data: newUser,
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

