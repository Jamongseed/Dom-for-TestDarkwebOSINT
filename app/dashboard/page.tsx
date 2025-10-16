import NavBar from '@/components/NavBar'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const me = await prisma.user.findUnique({
    where: { email: session.user?.email || '' },
    select: { locked: true, nickname: true }
  })
  if (me?.locked) redirect('/locked')

  const nickname = me?.nickname || (session.user?.email?.split('@')[0] ?? '사용자')

  return (
    <main>
      <NavBar />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
        <p className="text-gray-700">
          어서오세요, <span className="font-semibold">{nickname}</span>님,<br />
          현재 당신의 코인 잔고는 <span className="font-semibold">100</span>코인 입니다.
        </p>
      </div>
    </main>
  )
}

