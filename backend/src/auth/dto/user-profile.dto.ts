import { User } from '@prisma/client';

export class UserProfileDto {
  id!: string;
  email!: string;
  name!: string | null;
  displayName!: string | null;
  avatarUrl!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  /**
   * สร้าง DTO จาก User model ที่มาจากฐานข้อมูล
   * เลือกเฉพาะ field ที่ปลอดภัย
   */
  static fromUser(user: Pick<User,
    'id' | 'email' | 'name' | 'displayName' | 'avatarUrl' | 'createdAt' | 'updatedAt'
  >): UserProfileDto {
    const dto = new UserProfileDto();

    dto.id = user.id;
    dto.email = user.email;
    dto.name = user.name ?? null;
    dto.displayName = user.displayName ?? null;
    dto.avatarUrl = user.avatarUrl ?? null;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;

    return dto;
  }
}
