'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function NavBar() {
  const sessionState = useSession()
  const session = sessionState?.data

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="mx-auto max-w-4xl flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">goormPay</Link>

        <div className="flex items-center gap-3">
          {!session && <Link className="text-sm hover:underline" href="/">Home</Link>}
          <Link className="text-sm hover:underline" href="/dashboard">Dashboard</Link>

          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-red-600 hover:underline"
            >
              Sign out
            </button>
          ) : (
            <>
              <Link className="text-sm hover:underline" href="/login">Login</Link>
              <Link className="text-sm hover:underline" href="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

