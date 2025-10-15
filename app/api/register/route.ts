import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json() as { email?: string; password?: string }
    if (!email || !password) return NextResponse.json({ error: 'Missing' }, { status: 400 })

    const norm = email.trim().toLowerCase()
    if (!isValidEmail(norm)) return NextResponse.json({ error: 'Invalid email' }, { status: 422 })
    if (password.length < 8) return NextResponse.json({ error: 'Password too short' }, { status: 422 })

    const exists = await prisma.user.findUnique({ where: { email: norm } })
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const hash = await bcrypt.hash(password, 12)
    await prisma.user.create({ data: { email: norm, passwordHash: hash } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
