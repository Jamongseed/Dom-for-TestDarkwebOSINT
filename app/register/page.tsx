'use client'
export const dynamic = 'force-dynamic'

import { useSession } from 'next-auth/react'
import NavBar from '@/components/NavBar'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setMsg(null)
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    setMsg(res.ok ? 'Registered. You can now log in.' : data?.error || 'Failed')
    setLoading(false)
  }

  return (
    <main>
      <NavBar />
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-xl font-semibold mb-6">Create account</h1>
        {msg && <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm">{msg}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" required value={email}
                   onChange={e=>setEmail(e.target.value)}
                   className="w-full px-3 py-2 rounded-lg border" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" required value={password}
                   onChange={e=>setPassword(e.target.value)}
                   className="w-full px-3 py-2 rounded-lg border" />
            <p className="text-xs text-gray-500 mt-1">At least 8 characters.</p>
          </div>
          <button disabled={loading}
                  className="w-full px-4 py-2 rounded-lg bg-black text-white disabled:opacity-60">
            {loading ? 'Creating…' : 'Sign up'}
          </button>
        </form>
      </div>
    </main>
  )
}
