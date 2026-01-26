// backend/src/posts/dto/post-user-tag.dto.ts

export class PostUserTagDto {
  id!: string;
  status!: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REMOVED';

  taggedUser!: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };

  isTaggedUser!: boolean;
  isPostOwner!: boolean;
}
