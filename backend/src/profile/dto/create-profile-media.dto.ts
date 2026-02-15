// backend/src/profile/dto/create-profile-media.dto.ts


export class CreateProfileMediaDto {

  mediaId!: string;

  type!: "AVATAR" | "COVER";

  caption?: string;

  setAsCurrent?: boolean;

}
