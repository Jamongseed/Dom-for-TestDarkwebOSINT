import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

function normalizePhone(input: string) {
  let s = input.trim()
  // +82-10-1234-5678 -> 010-1234-5678
  const m82 = s.match(/^\+82-?1(\d)-(\d{3,4})-(\d{4})$/)
  if (m82) return `010-${m82[2]}-${m82[3]}`
  // 01012345678 -> 010-1234-5678
  const m010 = s.match(/^010(\d{4})(\d{4})$/)
  if (m010) return `010-${m010[1]}-${m010[2]}`
  return s
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const phoneRaw = url.searchParams.get("phone") || ""
  const phone = normalizePhone(phoneRaw)

  const sent = req.headers.get("x-incident-secret") || ""
  const expected =
    process.env.INCIDENT_SHARED_SECRET || process.env.INCIDENT_SECRET || ""
  if (!expected || sent !== expected) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  if (!phone) {
    return NextResponse.json({ ok: false, error: "phone required" }, { status: 400 })
  }

  const rows = await prisma.$queryRaw<{
    id: string
    email: string
    phone: string | null
    awsAccessKey: string | null
    awsKeyStatus: string | null
    locked: boolean
  }[]>`
    SELECT "id","email","phone","awsAccessKey","awsKeyStatus","locked"
    FROM "User"
    WHERE "phone" = ${phone}
    LIMIT 1
  `

  if (!rows.length) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 })
  }

  const user = rows[0]
  const iamUser = process.env.ROTATE_IAM_USER || "goormaws-app"

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      awsAccessKey: user.awsAccessKey,
      awsKeyStatus: user.awsKeyStatus,
      locked: user.locked,
    },
    iamUser,
  })
}

