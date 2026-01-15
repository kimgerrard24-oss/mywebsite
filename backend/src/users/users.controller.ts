// backend/src/users/users.controller.ts

import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  Param,
  Put,
  Patch,
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
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { VerifyCredentialDto } from './dto/verify-credential.dto';
import { SecurityEventsQueryDto } from './dto/security-events.query.dto';
import { UsernameAvailableQueryDto } from './dto/username-available.query.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { EmailChangeRequestDto } from './dto/email-change-request.dto';
import { ConfirmEmailChangeDto } from './dto/confirm-email-change.dto';
import { RequestPhoneChangeDto } from './dto/request-phone-change.dto';
import { ConfirmPhoneChangeDto } from './dto/confirm-phone-change.dto';

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
@UseGuards(AccessTokenCookieAuthGuard)
async searchUsers(
  @Query() query: SearchUsersQueryDto,
  @Req() req: Request,
): Promise<PublicUserSearchDto[]> {
  const viewerUserId = (req.user as any)?.userId;

  if (!viewerUserId) {
    throw new UnauthorizedException('Authentication required');
  }

  return this.usersService.searchUsers({
    query: query.query,
    limit: query.limit,
    viewerUserId,
  });
}


  @Get(':id')
@UseGuards(AccessTokenCookieAuthGuard)
async getPublicProfile(
  @Param('id', ParseUserIdPipe) userId: string,
  @Req() req: Request,
) {
  const viewer = req.user as { userId: string } | undefined;

  if (!viewer?.userId) {
    throw new UnauthorizedException('Authentication required');
  }

  const profile = await this.usersService.getPublicProfile({
    targetUserId: userId,
    viewerUserId: viewer.userId,
  });

  /**
   * 🔒 HARD VISIBILITY
   * - not found
   * - or blocked (service returns null)
   */
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
@RateLimit('updateAvatar')
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
 @RateLimit('updateCover')
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

 @Post('me/verify-credential')
@UseGuards(AccessTokenCookieAuthGuard)
@HttpCode(200)
@RateLimit('verifyCredential')
async verifyCredential(
  @CurrentUser() user: SessionUser,
  @Body() dto: VerifyCredentialDto,
  @Req() req: Request,
) {
  if (!user?.userId) {
    throw new UnauthorizedException();
  }

  return this.usersService.verifyCredential(user.userId, dto, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    jti: user.jti,
  });
 }
 

 @Get('me/security-events')
@UseGuards(AccessTokenCookieAuthGuard)
@Header('Cache-Control', 'no-store')
async getMySecurityEvents(
  @CurrentUser() user: SessionUser,
  @Query() query: SecurityEventsQueryDto,
) {
  if (!user?.userId) {
    throw new UnauthorizedException();
  }

  return this.usersService.getMySecurityEvents({
    userId: user.userId,
    limit: query.limit,
    cursor: query.cursor,
  });
 }

  /**
   * Public: realtime username availability check
   * Rate-limited (anti scraping)
   */
  @Get('username-available')
  @RateLimit('usernameCheck')
  async usernameAvailable(
    @Query() query: UsernameAvailableQueryDto,
  ) {
    return this.usersService.checkUsernameAvailability(
      query.u,
    );
  }

  @Patch('me/username')
@UseGuards(AccessTokenCookieAuthGuard)
@RateLimit('updateUsername')
async updateUsername(
  @CurrentUser() sessionUser: SessionUser,
  @Body() dto: UpdateUsernameDto,
  @Req() req: Request,
) {
  if (!sessionUser?.userId) {
    throw new UnauthorizedException('Authentication required');
  }

  return this.usersService.updateUsername(
    sessionUser.userId,
    dto,
    {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    },
  );
 }

  // =============================
  // POST /api/users/me/email/change-request
  // =============================
  @UseGuards(AccessTokenCookieAuthGuard)
  @Post('/me/email/change-request')
  async requestEmailChange(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: EmailChangeRequestDto,
  ) {
    return this.usersService.requestEmailChange(
      req.user.userId,
      dto,
      {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    );
  }

   @UseGuards(AccessTokenCookieAuthGuard)
  @Post('/me/email/confirm')
  async confirmEmailChange(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: ConfirmEmailChangeDto,
  ) {
    return this.usersService.confirmEmailChange(
      req.user.userId,
      dto,
      {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    );
  }

   // ================================
  // POST /api/users/me/phone/change-request
  // ================================
  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('phoneChangeRequest')
@Post('me/phone/change-request')
async requestPhoneChange(
  @Req() req: any,
  @Body() dto: RequestPhoneChangeDto,
) {
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthorizedException();
  }

  const forwarded = req.headers['x-forwarded-for'];
  const ip =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.ip || undefined;

  const userAgent =
    typeof req.headers['user-agent'] === 'string'
      ? req.headers['user-agent']
      : undefined;

  return this.usersService.requestPhoneChange(userId, dto, {
    ip,
    userAgent,
  });
}

@UseGuards(AccessTokenCookieAuthGuard)
@RateLimit('phoneChangeConfirm')
@Post('/me/phone/confirm')
async confirmPhoneChange(
  @Req() req: any,
  @Body() dto: ConfirmPhoneChangeDto,
) {
  const userId = req.user?.userId;
  if (!userId) throw new UnauthorizedException();

  const forwarded = req.headers['x-forwarded-for'];
  const ip =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.ip || undefined;

  const userAgent =
    typeof req.headers['user-agent'] === 'string'
      ? req.headers['user-agent']
      : undefined;

  return this.usersService.confirmPhoneChange(userId, dto, {
    ip,
    userAgent,
  });
}

}
