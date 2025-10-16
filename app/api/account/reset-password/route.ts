import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { newPassword } = await req.json() as { newPassword?: string }
  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: 'Password too short' }, { status: 422 })
  }

  const hash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { email: session.user.email },
    data: { passwordHash: hash, locked: false },
  })

  return NextResponse.json({ ok: true })
}

