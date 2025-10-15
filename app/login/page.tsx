'use client'
import { FormEvent, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import NavBar from '@/components/NavBar'
import Link from 'next/link'

export default function LoginPage() {
  const params = useSearchParams()
  const error = params.get('error')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl: '/dashboard'
    })
    setLoading(false)
  }

  return (
    <main>
      <NavBar />
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-xl font-semibold mb-6">Login</h1>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">Invalid credentials</div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="w-full px-3 py-2 rounded-lg border" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="w-full px-3 py-2 rounded-lg border" />
          </div>
          <button disabled={loading} className="w-full px-4 py-2 rounded-lg bg-black text-white disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-sm mt-4">
          No account? <Link href="/register" className="underline">Create one</Link>
        </p>
      </div>
    </main>
  )
}
