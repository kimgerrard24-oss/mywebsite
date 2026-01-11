// frontend/src/utils/renderContentWithHashtags.tsx
import Link from "next/link";
import { Fragment } from "react";

/**
 * Render text content with clickable hashtags (#tag)
 *
 * Rules:
 * - Only words starting with #
 * - # must be at word boundary (not letter/number/_)
 * - Stop at whitespace or punctuation
 * - Safe against XSS (no HTML injection)
 */
export function renderContentWithHashtags(
  content: string,
): React.ReactNode[] {
  if (!content) return [];

  // Regex:
  // (^|[^\p{L}\p{N}_]) -> start OR non-word char (space, punctuation, emoji, etc.)
  // (#[\p{L}\p{N}_]+)  -> hashtag (unicode-safe)
  const hashtagRegex =
    /(^|[^\p{L}\p{N}_])(#[\p{L}\p{N}_]+)/gu;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(
    hashtagRegex,
  )) {
    const matchIndex = match.index ?? 0;
    const prefix = match[1]; // boundary char or ""
    const hashtag = match[2]; // #tag

    // Push text before hashtag
    if (matchIndex > lastIndex) {
      nodes.push(
        <Fragment key={lastIndex}>
          {content.slice(lastIndex, matchIndex)}
        </Fragment>,
      );
    }

    // Push prefix (space / punctuation / emoji boundary)
    if (prefix) {
      nodes.push(
        <Fragment key={`${matchIndex}-p`}>
          {prefix}
        </Fragment>,
      );
    }

    const tagName = hashtag.slice(1);

    // Push hashtag link
    nodes.push(
      <Link
        key={`${matchIndex}-h`}
        href={`/tags/${encodeURIComponent(
          tagName,
        )}`}
        className="text-blue-600 hover:underline"
      >
        {hashtag}
      </Link>,
    );

    lastIndex =
      matchIndex + prefix.length + hashtag.length;
  }

  // Push remaining text
  if (lastIndex < content.length) {
    nodes.push(
      <Fragment key={lastIndex}>
        {content.slice(lastIndex)}
      </Fragment>,
    );
  }

  
  return nodes;
}
