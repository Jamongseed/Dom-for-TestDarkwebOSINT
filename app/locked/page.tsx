'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'

export default function LockedPage() {
  return (
    <main>
      <NavBar />
      <div className="mx-auto max-w-2xl px-4 py-16 space-y-6">
        <h1 className="text-2xl font-semibold">[goormPay] 전화번호 관련 보안 알림 및 안내</h1>
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>현재 유출 의심 대상:</strong> 전화번호</p>
          <p><strong>다른 민감정보:</strong> 비밀번호/결제정보 등은 영향 없음</p>
          <p><strong>예상 위험:</strong> 스미싱/SMS 피싱 증가 가능성</p>
          <p><strong>안내:</strong> 의심 링크/전화 주의, goormPay 공식 도메인/번호 외 연락 주의</p>
          <p className="mt-4">추가적으로 현재 계정을 다시 사용하려면 <strong>비밀번호를 변경</strong>해야 합니다. 진행하시겠습니까?</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/account/password-reset"
            className="px-4 py-2 rounded-lg bg-black text-white"
          >
            비밀번호 변경
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-4 py-2 rounded-lg bg-gray-900/10"
          >
            지금은 안 함 (로그아웃)
          </button>
        </div>
      </div>
    </main>
  )
}
