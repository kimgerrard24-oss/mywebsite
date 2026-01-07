// frontend/src/components/search/PostSearchItem.tsx

import type { SearchPostItem } from '@/lib/api/search-posts';
import Link from 'next/link';

type Props = {
  post: SearchPostItem;
};

export default function PostSearchItem({ post }: Props) {
  const isBlocked = post.author.isBlocked === true;

  const content = (
    <article
      className={`
        rounded-md border p-3
        ${isBlocked ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}
      `}
    >
      <header className="mb-1 text-sm text-gray-600">
        {post.author.displayName ?? 'Unknown'}
      </header>

      {isBlocked && (
        <p className="text-xs text-gray-400 mb-1">
          ไม่สามารถเปิดโพสต์ของผู้ใช้นี้ได้
        </p>
      )}

      <p className="text-sm text-gray-900 line-clamp-3">
        {post.content}
      </p>

      <time
        dateTime={post.createdAt}
        className="mt-1 block text-xs text-gray-400"
      >
        {new Date(post.createdAt).toLocaleString()}
      </time>
    </article>
  );

  if (isBlocked) {
    return <div className="block">{content}</div>;
  }

  return (
    <Link href={`/posts/${post.id}`} className="block">
      {content}
    </Link>
  );
}
