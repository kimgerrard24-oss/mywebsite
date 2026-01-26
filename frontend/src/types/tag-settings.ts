// frontend/src/types/tag-settings.ts

export type TagAllowScope =
  | "ANYONE"
  | "FOLLOWERS"
  | "NO_ONE";

export type MyTagSettings = {
  allowTagFrom: TagAllowScope;
  requireApproval: boolean;
};

export type UpdateTagSettingsInput = {
  allowTagFrom?: TagAllowScope;
  requireApproval?: boolean;
};

export type UpdateTagSettingsResponse = MyTagSettings;
