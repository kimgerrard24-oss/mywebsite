'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/apiClient'
import Image from 'next/image';

export default function Header(){
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const path = usePathname()
  const [me, setMe] = useState<unknown>(null)
  useEffect(()=> {
    apiGet('/auth/me').then(setMe).catch(()=>setMe(null))
  },[])
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
                    src="/images/aaa.png"
                    alt="aaa"
                    width={50}
                    height={30}
                    priority
                    className="mx-auto rounded-2xl shadow-lg"/>
          <span className="font-bold">The Elephant</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/explore">Explore</Link>
          {me ? (
            <>
              <Link href="/home">Home</Link>
              <Link href="/profile/me">Profile</Link>
              <Link href="/messages">Messages</Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="px-3 py-1 bg-blue-600 text-white rounded">Login</Link>
              <Link href="/auth/register" className="px-3 py-1 border rounded">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
