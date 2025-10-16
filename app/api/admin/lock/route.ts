import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

function parseBool(val: unknown): boolean | undefined {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') {
    const v = val.toLowerCase()
    if (v === 'true' || v === '1') return true
    if (v === 'false' || v === '0') return false
    return undefined
  }
  if (typeof val === 'number') {
    if (val === 1) return true
    if (val === 0) return false
  }
  return undefined
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  // @ts-ignore
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let userId: string | undefined
  let locked: boolean | undefined

  const ct = req.headers.get('content-type') || ''
  try {
    if (ct.includes('application/json')) {
      const body = (await req.json()) as { userId?: string; locked?: unknown }
      userId = body.userId
      locked = parseBool(body.locked)
    } else {
      const form = await req.formData()
      const idVal = form.get('userId')
      const lockVal = form.get('locked')
      userId = typeof idVal === 'string' ? idVal : undefined
      locked = parseBool(lockVal)
    }
  } catch {
    return NextResponse.json({ error: 'Bad body' }, { status: 400 })
  }

  if (!userId || typeof locked !== 'boolean') {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { locked },
  })

  const url = new URL('/admin', req.url)
  return NextResponse.redirect(url, { status: 303 })
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}

