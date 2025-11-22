'use client'
import { useState } from 'react'
import { apiPost } from '@/lib/apiClient'

export default function Composer({ onPosted }: { onPosted?: ()=>void }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  async function post(){
    if(!text.trim()) return
    setLoading(true)
    try {
      await apiPost('/posts', { text })
      setText('')
      onPosted?.()
    } finally { setLoading(false) }
  }
  return (
    <div className="bg-white p-4 rounded shadow">
      <textarea className="w-full border p-2 rounded" rows={3} value={text} onChange={e=>setText(e.target.value)} placeholder="เขียนอะไรสักอย่าง..." />
      <div className="mt-2 flex justify-end">
        <button onClick={post} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'โพสต์...' : 'โพสต์'}</button>
      </div>
    </div>
  )
}
