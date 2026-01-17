'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api/api'
import Image from 'next/image';

export default function Header(){
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const path = usePathname()

  type Me = {
  id: string
  email?: string | null
  displayName?: string | null
  avatarUrl?: string | null
}
const [me, setMe] = useState<Me | null>(null)

  useEffect(()=> {
    apiGet('/auth/me').then(setMe).catch(()=>setMe(null))
  },[])

  function getInitial(me: Me) {
  const base =
    me.displayName?.trim() ||
    me.email?.split("@")[0] ||
    "U"

  return base.charAt(0).toUpperCase()
}

  return (
  <header
    className="
      bg-white
      shadow-sm
    "
  >
    <div
      className="
        mx-auto
        w-full
        max-w-7xl
        px-3
        sm:px-4
        md:px-6
        py-2
        sm:py-3
        flex
        items-center
        justify-between
        gap-3
      "
    >
      {/* ===== Logo ===== */}
      <Link
        href="/"
        className="
          flex
          items-center
          gap-2
          sm:gap-3
          shrink-0
        "
      >
        <Image
          src="/images/aaa.png"
          alt="aaa"
          width={50}
          height={30}
          priority
          className="
            h-6
            sm:h-7
            w-auto
            rounded-xl
            shadow-lg
          "
        />
        <span
          className="
            text-sm
            sm:text-base
            md:text-lg
            font-bold
            text-gray-900
            whitespace-nowrap
          "
        >
          The Elephant
        </span>
      </Link>

      {/* ===== Navigation ===== */}
      <nav
        className="
          flex
          items-center
          gap-2
          sm:gap-3
          md:gap-4
          text-sm
          sm:text-base
        "
        aria-label="Main navigation"
      >
        <Link
          href="/explore"
          className="
            hover:underline
          "
        >
          Explore
        </Link>

        {me ? (
  <>
    <Link
      href="/home"
      className="hover:underline"
    >
      Home
    </Link>

    <Link
      href="/profile/me"
      className="hover:underline"
    >
      Profile
    </Link>

    <Link
      href="/messages"
      className="hover:underline"
    >
      Messages
    </Link>

    {/* ===== User Avatar ===== */}
    <Link
      href="/profile/me"
      className="ml-2 flex items-center"
      aria-label="Your profile"
    >
      <div
        className="
          h-8
          w-8
          rounded-full
          overflow-hidden
          bg-gray-200
          flex
          items-center
          justify-center
        "
      >
        {me.avatarUrl ? (
          <img
            src={me.avatarUrl}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-sm font-semibold text-gray-700">
            {getInitial(me)}
          </span>
        )}
      </div>
    </Link>
  </>
) : (

          <>
            <Link
              href="/auth/login"
              className="
                px-3
                py-1
                rounded
                bg-blue-600
                text-white
                text-xs
                sm:text-sm
                hover:bg-blue-700
                transition
              "
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="
                px-3
                py-1
                rounded
                border
                text-xs
                sm:text-sm
                hover:bg-gray-50
                transition
              "
            >
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </div>
  </header>
);

}
