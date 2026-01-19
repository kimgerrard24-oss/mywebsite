// frontend/src/lib/api/user-export.ts

export function triggerProfileExport(apiBase: string) {
  if (!apiBase) {
    throw new Error("API base URL is required for export");
  }

  // Let browser handle file download via attachment headers
  window.location.href = `${apiBase}/users/me/profile/export`;
}

