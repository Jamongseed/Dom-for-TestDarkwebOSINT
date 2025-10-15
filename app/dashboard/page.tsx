import NavBar from '@/components/NavBar'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  return (
    <main>
      <NavBar />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
        {session ? (
          <div className="space-y-2">
            <p className="text-gray-700">Signed in as <span className="font-mono">{session.user?.email}</span></p>
            <p className="text-gray-500 text-sm">This page is protected by middleware.</p>
          </div>
        ) : (
          <div className="text-gray-700">No session. <Link href="/login" className="underline">Sign in</Link></div>
        )}
      </div>
    </main>
  )
}
