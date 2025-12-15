// src/users/dto/user-profile.dto.ts

export class UserProfileDto {
  id: string;
  email: string;
  username: string;
  firebaseUid: string | null;
  name: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: any) {
    this.id = user.id;
    this.email = user.email;
    this.username = user.username;
    this.firebaseUid = user.firebaseUid;
    this.name = user.name;
    this.displayName = user.displayName;
    this.avatarUrl = user.avatarUrl;
    this.bio = user.bio;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
    static fromUser(user: any): UserProfileDto {
    return new UserProfileDto(user);
  }


  }

