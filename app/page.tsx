import NavBar from '@/components/NavBar'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main>
      <NavBar />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-semibold mb-2">Welcome</h1>
        <p className="text-gray-700">Next.js + NextAuth + Prisma (SQLite) — Signup & Login MVP.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/register" className="px-4 py-2 rounded-lg bg-black text-white">Create Account</Link>
          <Link href="/login" className="px-4 py-2 rounded-lg bg-gray-900/10">Login</Link>
          <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-gray-900/10">Open Dashboard</Link>
        </div>
      </div>
    </main>
  )
}
