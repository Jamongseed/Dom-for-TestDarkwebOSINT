// app/dashboard/_components/DashboardMessage.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/db"

type Row = { awsKeyStatus: string | null; nickname: string | null }

export default async function DashboardMessage() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email ?? null

  let displayName = "사용자"
  let isIncident = false

  if (email) {
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT "awsKeyStatus","nickname"
      FROM "User"
      WHERE email = ${email}
      LIMIT 1
    `
    const row = rows[0] ?? { awsKeyStatus: null, nickname: null }
    displayName = (row.nickname?.trim()) || email.split("@")[0] || "사용자"
    isIncident = (row.awsKeyStatus ?? "ACTIVE") !== "ACTIVE"
  }

  return (
    <>
      <p>어서오세요, {displayName}님,</p>
      {!isIncident ? (
        <p>
          현재 당신의 <b>AWS</b>는 정상 유지 중입니다.
        </p>
      ) : (
        <>
          <p className="text-rose-600 font-medium">
            최근 유출 사고(또는 그에 준하는 이슈) 발생으로 인해, 계정의 AWS키가 자동 초기화 됐습니다.
          </p>
          <p>자세한 내용은 관리자를 통해 문의해주세요.</p>
        </>
      )}
    </>
  )
}

