// backend/src/users/users.controller.ts

import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  Param,
  Put,
  Req,
  UnauthorizedException,
  ConflictException,
  Header,
  UseInterceptors,
  UploadedFile,
  HttpCode,
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
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserPolicyPipe } from './pipes/update-user-policy.pipe';
import { ImageValidationPipe } from './upload/image-validation.pipe';
import { avatarMulterConfig } from './upload/multer-avatar.config';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Put('update')
  @UseGuards(AccessTokenCookieAuthGuard)
  async updateProfile(
    @Req() req: Request,
    @Body(new UpdateUserPolicyPipe()) dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const userId = req.user!.userId;

    const user = await this.usersService.updateProfile(userId, dto);

    return UserResponseDto.fromUser(user);
  }

  @UseGuards(AccessTokenCookieAuthGuard)
 @Put('update-avatar')
 @HttpCode(200)
 @UseInterceptors(FileInterceptor('avatar', avatarMulterConfig))
 async updateAvatar(
 @UploadedFile(new ImageValidationPipe()) file: Express.Multer.File,
 @Req() req: Request,
      ) {
 const user = req.user as { userId: string; jti: string };


 return this.usersService.updateAvatar({
    userId: user.userId,
 file,
 });
 }
}
