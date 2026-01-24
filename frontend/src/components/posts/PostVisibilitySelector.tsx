// frontend/src/components/posts/PostVisibilitySelector.tsx

'use client';

import clsx from 'clsx';

export type PostVisibility =
  | 'PUBLIC'
  | 'FOLLOWERS'
  | 'PRIVATE'
  | 'CUSTOM';

export type PostVisibilityValue = {
  visibility: PostVisibility;
  includeUserIds?: string[];
  excludeUserIds?: string[];
};

type Props = {
  value: PostVisibilityValue;
  onChange: (value: PostVisibilityValue) => void;

  onPickInclude?: () => void;
  onPickExclude?: () => void;

  disabled?: boolean;
  compact?: boolean;
};


const OPTIONS: Array<{
  value: PostVisibility;
  title: string;
  description: string;
}> = [
  {
    value: 'PUBLIC',
    title: 'Public',
    description: 'Anyone can see this post',
  },
  {
    value: 'FOLLOWERS',
    title: 'Followers',
    description: 'Only people who follow you can see this post',
  },
  {
    value: 'PRIVATE',
    title: 'Only me',
    description: 'Only you can see this post',
  },
  {
    value: 'CUSTOM',
    title: 'Custom',
    description: 'Show or hide this post from specific people',
  },
];

export default function PostVisibilitySelector({
  value,
  onChange,
  onPickInclude,
  onPickExclude,
  disabled = false,
  compact = false,
}: Props)
 {
  // ✅ backend authority — use value from parent only
  const localVisibility = value.visibility;

  const includeUserIds = value.includeUserIds ?? [];
  const excludeUserIds = value.excludeUserIds ?? [];

  function selectVisibility(v: PostVisibility) {
    if (v !== 'CUSTOM') {
      onChange({ visibility: v });
      return;
    }

    onChange({
   visibility: 'CUSTOM',
   includeUserIds: includeUserIds ?? [],
   excludeUserIds: excludeUserIds ?? [],
 });
}

  return (
  <section
    aria-label="Post visibility"
    className={clsx(
      'flex flex-col gap-3',
      !compact && 'rounded-xl border p-4',
    )}
  >
    <h3 className="text-sm font-semibold">
      Who can see this post
    </h3>

    <ul className="flex flex-col gap-2">
      {OPTIONS.map((opt) => {
        const selected =
          localVisibility === opt.value;

        return (
          <li key={opt.value}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => selectVisibility(opt.value)}
              className={clsx(
                'w-full rounded-lg border px-3 py-2 text-left transition',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                selected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:bg-gray-50',
                disabled &&
                  'cursor-not-allowed opacity-60',
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {opt.title}
                  </span>
                  <span className="text-xs text-gray-600">
                    {opt.description}
                  </span>
                </div>

                {selected && (
                  <span
                    aria-hidden
                    className="text-blue-600"
                  >
                    ✓
                  </span>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>

    {/* ===== Custom summary ===== */}
    {localVisibility === 'CUSTOM' && (
      <p className="text-xs text-gray-600">
        {includeUserIds.length > 0 && (
          <>Shown to {includeUserIds.length} people</>
        )}
        {includeUserIds.length > 0 &&
          excludeUserIds.length > 0 && ' · '}
        {excludeUserIds.length > 0 && (
          <>Hidden from {excludeUserIds.length} people</>
        )}
        {includeUserIds.length === 0 &&
          excludeUserIds.length === 0 &&
          'No custom rules selected'}
      </p>
    )}

    {/* ================= CUSTOM RULES ================= */}
    {localVisibility === 'CUSTOM' && (
      <div
        role="group"
        aria-label="Custom visibility rules"
        className="mt-2 flex flex-col gap-4 rounded-lg border bg-gray-50 p-3"
      >
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase text-gray-700">
            Show to
          </span>

          {includeUserIds.length === 0 ? (
            <span className="text-xs text-gray-500">
              No specific users selected
            </span>
          ) : (
            <span className="text-xs text-gray-700">
              {includeUserIds.length} people selected
            </span>
          )}

          <button
            type="button"
            disabled={
              disabled ||
              !onPickInclude ||
              localVisibility !== 'CUSTOM'
            }
            className="mt-1 w-fit rounded-md border px-2 py-1 text-xs hover:bg-white disabled:opacity-60"
            onClick={() => onPickInclude?.()}
          >
            Select people
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase text-gray-700">
            Hide from
          </span>

          {excludeUserIds.length === 0 ? (
            <span className="text-xs text-gray-500">
              No excluded users
            </span>
          ) : (
            <span className="text-xs text-gray-700">
              {excludeUserIds.length} people excluded
            </span>
          )}

          <button
            type="button"
            disabled={
              disabled ||
              !onPickExclude ||
              localVisibility !== 'CUSTOM'
            }
            className="mt-1 w-fit rounded-md border px-2 py-1 text-xs hover:bg-white disabled:opacity-60"
            onClick={() => onPickExclude?.()}
          >
            Exclude people
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Excluded users will never see this post, even if they are followers.
        </p>
      </div>
    )}
  </section>
);

}

