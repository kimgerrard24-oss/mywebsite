// backend/src/users/users.controller.ts

import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  Param,
  Put,
  Query,
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
import { coverMulterConfig } from './upload/multer-cover.config';
import { SearchUsersQueryDto } from './dto/search-users.query.dto';
import { PublicUserSearchDto } from './dto/public-user-search.dto';

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
) {
  if (!sessionUser?.userId) {
    throw new UnauthorizedException('Authentication required');
  }

  /**
   * IMPORTANT:
   * - Service layer เป็น authority ทั้งหมด
   * - Controller แค่ส่งผ่าน response
   * - Payload ต้องตรงกับ public profile shape (มี stats)
   */
  return this.usersService.getMe(sessionUser.userId);
}


    @Get('search')
  async searchUsers(
    @Query() query: SearchUsersQueryDto,
    @Req() req: Request,
  ): Promise<PublicUserSearchDto[]> {
    const viewerUserId = (req.user as any)?.userId;

    return this.usersService.searchUsers({
      query: query.query,
      limit: query.limit,
      viewerUserId,
    });
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

@Post('update-avatar')
@HttpCode(200)
@UseGuards(AccessTokenCookieAuthGuard)
@UseInterceptors(FileInterceptor('file', avatarMulterConfig))
async updateAvatar(
  @UploadedFile(new ImageValidationPipe())
  file: Express.Multer.File | undefined,
  @Req() req: Request,
) {
  
  if (!file) {
    throw new BadRequestException('Avatar file is required');
  }

  const user = req.user as { userId: string };

  if (!user?.userId) {
    throw new UnauthorizedException('Authentication required');
  }

  return this.usersService.updateAvatar({
    userId: user.userId,
    file,
  });
}

@Post('update-cover')
@HttpCode(200)
@UseGuards(AccessTokenCookieAuthGuard)
@UseInterceptors(FileInterceptor('file', coverMulterConfig))
async updateCover(
  @UploadedFile(new ImageValidationPipe())
  file: Express.Multer.File | undefined,
  @Req() req: Request,
  ) {
  // 🔥 DEBUG LOG (ชั่วคราว)
  console.log('🔥 update-cover HIT', {
    hasFile: !!file,
    bodyKeys: Object.keys((req as any).body ?? {}),
    contentType: req.headers['content-type'],
  });

  if (!file) {
    throw new BadRequestException('Cover image is required');
  }

  const user = req.user as { userId: string };

  if (!user?.userId) {
    throw new UnauthorizedException('Authentication required');
  }

  const result = await this.usersService.updateCover({
    userId: user.userId,
    file,
  });

  return {
    coverUrl: result.coverUrl,
  };
 }
 
}
