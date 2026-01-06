// frontend/src/utils/isModerationTargetType.ts
import { ModerationTargetType } from "@/types/moderation-action";

export function isModerationTargetType(
  value: string,
): value is ModerationTargetType {
  return (
    value === "USER" ||
    value === "POST" ||
    value === "COMMENT" ||
    value === "CHAT_MESSAGE"
  );
}
