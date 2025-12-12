// frontend/src/components/feed/feed.tsx
'use client'
import { useEffect, useState } from 'react'
import Composer from './Composer'
import PostCard from './PostCard'
import type { Post } from '@/types/index'
import { client } from '@/lib/api/api'   // ← เปลี่ยนจาก apiGet

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([])

  async function load() {
    const data = await client.get<Post[]>('/posts/feed')
    setPosts(data)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-4">
      <Composer onPosted={load} />
      {posts.map(p => <PostCard key={p.id} post={p} />)}
    </div>
  )
}
