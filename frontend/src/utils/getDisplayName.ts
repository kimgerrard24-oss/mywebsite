// frontend/src/utils/getDisplayName.ts

export function getDisplayName(
  user?: { displayName?: string | null }
) {
  return user?.displayName?.trim()
    ? user.displayName
    : "Unknown user";
}
