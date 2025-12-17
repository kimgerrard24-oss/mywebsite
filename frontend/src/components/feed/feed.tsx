// frontend/src/components/feed/feed.tsx
'use client'

import { useEffect, useState } from 'react'
import PostComposer from '@/components/posts/PostComposer'
import PostCard from './PostCard'
import type { Post } from '@/types/index'
import { client } from '@/lib/api/api'

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([])

  async function load() {
    const posts = await client.get<Post[]>('/posts/feed')
    setPosts(posts)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-4">
      <PostComposer onPosted={load} />
      {posts.map(p => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  )
}

