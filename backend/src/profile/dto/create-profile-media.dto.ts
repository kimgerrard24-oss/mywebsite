// backend/src/profile/dto/create-profile-media.dto.ts


export class CreateProfileMediaDto {
  objectKey!: string;
  type!: "AVATAR" | "COVER";
  caption?: string;
  setAsCurrent?: boolean;
}

