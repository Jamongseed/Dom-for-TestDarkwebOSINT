// app/page.tsx
import NavBar from '@/components/NavBar'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect('/dashboard')
  }

  return (
    <main>
      <NavBar />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-semibold mb-2">어서오세요</h1>
        <p className="text-gray-700">당신의 구름 코인을 저장하는 goormPay입니다.</p>

        <div className="mt-6 flex gap-3">
          <Link href="/register" className="px-4 py-2 rounded-lg bg-black text-white">Create Account</Link>
          <Link href="/login" className="px-4 py-2 rounded-lg bg-gray-900/10">Login</Link>
          <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-gray-900/10">Open Dashboard</Link>
        </div>
      </div>
    </main>
  )
}

