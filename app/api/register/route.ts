import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}
function isValidPhone(p: string) {
  return /^\d{3}-\d{4}-\d{4}$/.test(p)
}

export async function POST(req: Request) {
  try {
    const { nickname, email, password, phone } = (await req.json()) as {
      nickname?: string
      email?: string
      password?: string
      phone?: string
    }

    if (!nickname || !email || !password || !phone) {
      return NextResponse.json({ error: 'Missing' }, { status: 400 })
    }

    const nick = nickname.trim()
    const norm = email.trim().toLowerCase()
    const phoneStr = phone.trim()

    if (nick.length < 2) {
      return NextResponse.json({ error: 'Nickname too short' }, { status: 422 })
    }
    if (!isValidEmail(norm)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 422 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password too short' }, { status: 422 })
    }
    if (!isValidPhone(phoneStr)) {
      return NextResponse.json({ error: 'Invalid phone (010-1234-5678)' }, { status: 422 })
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: norm }, { phone: phoneStr }] },
      select: { email: true, phone: true },
    })
    if (existing?.email === norm) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }
    if (existing?.phone === phoneStr) {
      return NextResponse.json({ error: 'Phone already registered' }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: { email: norm, passwordHash: hash, nickname: nick, phone: phoneStr },
    })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      const t = Array.isArray(e?.meta?.target) ? e.meta.target.join(',') : String(e?.meta?.target ?? '')
      const which = t.includes('phone') ? 'Phone already registered' : 'Email already registered'
      return NextResponse.json({ error: which }, { status: 409 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

