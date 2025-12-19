// frontend/src/components/feed/PostCard.tsx
import type { Post } from '@/types/index'
import { useState } from 'react'
import Link from 'next/link'
import { apiPost } from '@/lib/api/api'
import PostActionMenu from '@/components/posts/PostActionMenu'

export default function PostCard({ post }: { post: Post }) {
  const [likes, setLikes] = useState(post.likes)

  async function like() {
    try {
      await apiPost(`/posts/${post.id}/like`)
      setLikes(l => l + 1)
    } catch {}
  }

  return (
    <article className="bg-white p-4 rounded shadow">
      <div className="flex gap-3">
        {/* ===== ของเดิม: ลิงก์โปรไฟล์ ===== */}
    <Link
       href={`/users/${post.author.id}`}
         className="shrink-0"
>
        <img
         className="w-10 h-10 rounded-full"
          src={post.author.avatarUrl ?? '/images/avatar-default.jpg'}
          alt={
               post.author.displayName ??
               post.author.username ??
                    'User avatar'
               }
             />
          </Link>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <Link
                href={`/users/${post.author.id}`}
                className="font-semibold hover:underline"
              >
                {post.author.displayName ?? post.author.username}
              </Link>
              <div className="text-xs text-gray-400">
                {new Date(post.createdAt).toLocaleString()}
              </div>
            </div>

            {/* ===== เพิ่มการทำงานใหม่: Post Action Menu ===== */}
            <PostActionMenu
              postId={post.id}
              canDelete={post.canDelete}
              canEdit={post.canDelete}
              canReport={!post.canDelete}
            />
            {/* ===== จบการทำงานใหม่ ===== */}
          </div>

          <p className="mt-2">{post.text}</p>

          <div className="mt-3 flex gap-4 text-sm text-gray-600">
            <button onClick={like}>ไลก์ ({likes})</button>
            <button>คอมเมนต์ ({post.comments})</button>
            <button>แชร์</button>
          </div>
        </div>
      </div>
    </article>
  )
}
