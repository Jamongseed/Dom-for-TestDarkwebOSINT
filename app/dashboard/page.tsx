// app/dashboard/page.tsx
import NavBar from '@/components/NavBar'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'

type AwsRow = { awsKeyStatus: string | null }

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const me = await prisma.user.findUnique({
    where: { email: session.user?.email || '' },
    select: { locked: true, nickname: true }
  })
  if (me?.locked) redirect('/locked')

  // awsKeyStatus는 Prisma 스키마에 없을 수 있으므로 Raw SQL로 안전하게 조회
  const awsRows = await prisma.$queryRaw<AwsRow[]>`
    SELECT "awsKeyStatus"
    FROM "User"
    WHERE email = ${session.user?.email || ''}
    LIMIT 1
  `
  const awsKeyStatus = awsRows[0]?.awsKeyStatus ?? 'ACTIVE'
  const isIncident = awsKeyStatus !== 'ACTIVE'

  const nickname = me?.nickname || (session.user?.email?.split('@')[0] ?? '사용자')

  return (
    <main>
      <NavBar />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-semibold mb-4">goormAWS Dashboard</h1>

        {!isIncident ? (
          <p className="text-gray-700">
            어서오세요, <span className="font-semibold">{nickname}</span>님,<br />
            현재 당신의 <span className="font-semibold">AWS</span>는 정상 유지 중입니다.
          </p>
        ) : (
          <p className="text-gray-700">
            어서오세요, <span className="font-semibold">{nickname}</span>님,<br />
            최근 유출 사고(또는 그에 준하는 이슈) 발생으로 인해, 계정의 <span className="font-semibold">AWS키</span>가 자동 초기화 됐습니다.<br />
            자세한 내용은 관리자를 통해 문의해주세요.
          </p>
        )}
      </div>
    </main>
  )
}

