import type { Post } from '@/types/index'
import { useState } from 'react'
import { apiPost } from '@/lib/apiClient'

export default function PostCard({ post }: { post: Post }) {
  const [likes, setLikes] = useState(post.likes)
  async function like() {
    try {
      await apiPost(`/posts/${post.id}/like`)
      setLikes(l => l+1)
    } catch {}
  }
  return (
    <article className="bg-white p-4 rounded shadow">
      <div className="flex gap-3">
        <img className="w-10 h-10 rounded-full" src={post.author.avatarUrl ?? '/images/avatar-default.jpg'} />
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <div className="font-semibold">{post.author.displayName ?? post.author.username}</div>
              <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
            </div>
            <div>...</div>
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
