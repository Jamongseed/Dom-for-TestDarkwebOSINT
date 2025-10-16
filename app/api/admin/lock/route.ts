import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  // @ts-ignore
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { userId, locked } = await req.json() as { userId?: string; locked?: boolean }
  if (!userId || typeof locked !== 'boolean') {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  await prisma.user.update({
    where: { id: userId },
    data: { locked },
  })
  return NextResponse.json({ ok: true })
}

