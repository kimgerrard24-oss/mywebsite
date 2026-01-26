// frontend/src/lib/api/tag-settings.ts

import { apiPatch, apiGet } from "./api";
import type {
  MyTagSettings,
  UpdateTagSettingsInput,
  UpdateTagSettingsResponse,
} from "@/types/tag-settings";

/**
 * GET /users/me/tag-settings
 * Backend authority
 */
export async function getMyTagSettings(): Promise<MyTagSettings> {
  return apiGet("/users/me/tag-settings");
}

/**
 * PATCH /users/me/tag-settings
 * Backend authority
 */
export async function updateMyTagSettings(
  input: UpdateTagSettingsInput,
): Promise<UpdateTagSettingsResponse> {
  return apiPatch("/users/me/tag-settings", input);
}
