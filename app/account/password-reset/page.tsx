'use client'

import { useState } from 'react'
import NavBar from '@/components/NavBar'

export default function PasswordResetPage() {
  const [pwd, setPwd] = useState('')
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setOk(null); setErr(null); setLoading(true)
    try {
      const r = await fetch('/api/account/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: pwd }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || '변경 실패')
      setOk('비밀번호가 변경되었고, 계정 잠금이 해제되었습니다. 다시 로그인 해주세요.')
    } catch (e: any) {
      setErr(e?.message || '오류')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <NavBar />
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold mb-4">비밀번호 변경</h1>
        {ok && <p className="text-green-700 mb-3">{ok}</p>}
        {err && <p className="text-red-600 mb-3">{err}</p>}
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm">새 비밀번호 (8자 이상)</span>
            <input
              type="password"
              minLength={8}
              required
              className="mt-1 w-full rounded border px-3 py-2"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
          </label>
          <button
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-60"
          >
            {loading ? '변경 중…' : '변경하기'}
          </button>
        </form>
      </div>
    </main>
  )
}

