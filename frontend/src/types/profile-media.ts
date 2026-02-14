// frontend/src/types/profile-media.ts

export type SetAvatarResponse = {
  avatarUrl: string;
  mediaId: string;
};

export type SetCoverResponse = {
  coverUrl: string;
};

export type DeleteProfileMediaResponse = {
  success: true;
};

