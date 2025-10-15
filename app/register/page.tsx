'use client'
export const dynamic = 'force-dynamic'

import { useState, FormEvent, Suspense } from 'react'
import NavBar from '@/components/NavBar'

function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || 'Register failed')
      }
      setMsg('회원가입이 완료되었습니다. 이제 로그인해 주세요.')
    } catch (err: any) {
      setMsg(`오류: ${err.message ?? 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <NavBar />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-semibold mb-2">Create account</h1>
        {msg && <p className="mb-3 text-sm">{msg}</p>}
        <form onSubmit={onSubmit} className="space-y-3 max-w-sm">
          <label className="block">
            <span className="text-sm">Email</span>
            <input
              type="email"
              className="mt-1 w-full rounded border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm">Password</span>
            <input
              type="password"
              className="mt-1 w-full rounded border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-60"
          >
            {loading ? 'Signing up…' : 'Sign up'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  )
}

