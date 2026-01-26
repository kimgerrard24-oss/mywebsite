// backend/src/users/types/tag-allow-scope.type.ts

export const TAG_ALLOW_SCOPES = [
  'ANYONE',
  'FOLLOWERS',
  'NO_ONE',
] as const;

export type TagAllowScope =
  (typeof TAG_ALLOW_SCOPES)[number];


  
