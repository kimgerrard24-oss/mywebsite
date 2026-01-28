// frontend/src/utils/externalShare.ts

export async function shareExternally(url: string) {
  if (
    typeof navigator !== "undefined" &&
    "share" in navigator
  ) {
    try {
      await navigator.share({ url });
      return;
    } catch {
      // fallback to copy
    }
  }

  await navigator.clipboard.writeText(url);
}
