// backend/src/users/users.controller.ts

import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  Param,
  Req,
  UnauthorizedException,
  ConflictException,
  Header,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SessionUser } from '../auth/services/validate-session.service';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { ParseUserIdPipe } from './pipes/parse-user-id.pipe';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseGuards(AccessTokenCookieAuthGuard)
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() sessionUser: SessionUser,
  ) {
    if (!sessionUser?.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await this.authService.hashPassword(dto.password);
    const newUser = await this.usersService.createUser(
      dto.email,
      hashedPassword,
      dto.displayName,
    );

    return {
      message: 'User created successfully',
      data: newUser,
    };
  }

  @Get('me')
  @UseGuards(AccessTokenCookieAuthGuard)
  @Header(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  )
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async getMe(
    @CurrentUser() sessionUser: SessionUser,
  ): Promise<UserProfileDto> {
    if (!sessionUser?.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      return await this.usersService.getMe(sessionUser.userId);
    } catch (err) {
      throw new BadRequestException(
        'Authenticated user profile is not available',
      );
    }
  }

  @Get(':id')
  async getPublicProfile(
    @Param('id', ParseUserIdPipe) userId: string,
    @Req() req: Request,
  ) {
    const viewer = req.user ?? null;

    const profile = await this.usersService.getPublicProfile({
      targetUserId: userId,
      viewerUserId: viewer?.userId ?? null,
    });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    return profile;
  }
}
