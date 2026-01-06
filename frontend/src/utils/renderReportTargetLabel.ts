// frontend/src/utils/renderReportTargetLabel.ts

import type { ReportTargetType } from "@/types/report";

/**
 * UI helper
 * Convert ReportTargetType → human readable label
 */
export function renderReportTargetLabel(
  type: ReportTargetType,
): string {
  switch (type) {
    case "POST":
      return "post";
    case "COMMENT":
      return "comment";
    case "USER":
      return "user";
    case "CHAT_MESSAGE":
      return "chat message";
    default:
      return "content";
  }
}
