import NavBar from '@/components/NavBar'
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/login?redirect=/dashboard")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { awsKeyStatus: true, nickname: true },
  })

  const name = session.user.name || user?.nickname || "사용자"
  const isIncident = (user?.awsKeyStatus ?? "ACTIVE") !== "ACTIVE"

  return (
    <main className="p-8 space-y-3">
      <h1 className="text-2xl font-bold">goormAWS Dashboard</h1>

      {!isIncident ? (
        <>
          <p>어서오세요, {name}님,</p>
          <p>현재 당신의 <b>AWS</b>는 정상 유지 중입니다.</p>
        </>
      ) : (
        <>
          <p>어서오세요, {name}님,</p>
          <p className="text-rose-600 font-medium">
            최근 유출 사고(또는 그에 준하는 이슈) 발생으로 인해, 계정의 AWS키가 자동 초기화 됐습니다.
          </p>
          <p>자세한 내용은 관리자를 통해 문의해주세요.</p>
        </>
      )}
    </main>
  )
}

