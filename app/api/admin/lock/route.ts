// app/api/admin/lock/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

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
      const body = (await req.json()) as { userId?: string; locked?: boolean | string | number }
      userId = body.userId
      const lv = body.locked
      locked =
        lv === true || lv === 'true' || lv === 1 || lv === '1'
          ? true
          : lv === false || lv === 'false' || lv === 0 || lv === '0'
          ? false
          : undefined
    } else {
      const form = await req.formData()
      userId = String(form.get('userId') || '')
      const l = form.get('locked')
      locked =
        l === 'true' || l === true || l === '1' || l === 1
          ? true
          : l === 'false' || l === false || l === '0' || l === 0
          ? false
          : undefined
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
