// app/api/incidents/ingest/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const runtime = "nodejs" // Prisma는 Edge 불가

const SHARED = process.env.INCIDENT_SHARED_SECRET

export async function POST(req: Request) {
  if (!SHARED) return new NextResponse("Server misconfigured", { status: 500 })

  // 러너에서 보낸 공용 시크릿 확인
  const hdr = req.headers.get("x-incident-secret")
  if (hdr !== SHARED) return new NextResponse("Forbidden", { status: 403 })

  let body: any = {}
  try { body = await req.json() } catch {}
  const leakedKey: string | undefined = body?.leakedKey
  const newKeyId: string | undefined = body?.newKeyId
  const reason: string = body?.reason || "rotated via actions_cloud_keys"

  if (!leakedKey || !newKeyId) {
    return NextResponse.json({ ok: false, error: "missing leakedKey or newKeyId" }, { status: 400 })
  }

  // 누가 가진 키인지 조회 (Raw)
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "User" WHERE "awsAccessKey" = ${leakedKey} LIMIT 1
  `
  if (rows.length === 0) {
    return NextResponse.json({ ok: true, matched: false })
  }
  const userId = rows[0].id

  // 트랜잭션: 감사로그 → 유저 업데이트(잠금 + 키 교체)
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO "KeyAudit" ("userId","oldKey","newKey","reason")
      VALUES (${userId}, ${leakedKey}, ${newKeyId}, ${reason})
    `
    await tx.$executeRaw`
      UPDATE "User"
      SET
        "awsAccessKey"   = ${newKeyId},
        "awsKeyStatus"   = 'ROTATED',
        "awsKeyIssuedAt" = NOW(),
        "locked"         = TRUE,
        "lockedAt"       = NOW(),
        "lockReason"     = ${reason}
      WHERE "id" = ${userId}
    `
  })

  return NextResponse.json({ ok: true, matched: true, rotated: true, locked: true, userId })
}

