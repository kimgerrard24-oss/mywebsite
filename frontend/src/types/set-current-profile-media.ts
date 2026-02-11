// frontend/src/types/set-current-profile-media.ts

export type ProfileMediaType = "AVATAR" | "COVER";

export type SetCurrentProfileMediaRequest = {
  type: ProfileMediaType;
};

export type SetCurrentProfileMediaResponse = {
  url: string;
  mediaId: string;
  type: ProfileMediaType;
};
