// backend/src/auth/entities/user.entity.ts

export class UserEntity {
  id!: string;
  email!: string;
  username!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
