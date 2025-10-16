import type { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase()
        const password = credentials?.password ?? ''
        if (!email || !password) return null
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null
        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null
        return { id: user.id, email: user.email }
      },
    }),
  ],
  pages: { signIn: '/login' },

  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const db = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isAdmin: true, locked: true, nickname: true },
        })
        token.isAdmin = db?.isAdmin ?? false
        token.locked = db?.locked ?? false
        token.nickname = db?.nickname ?? null
      } else if (token.sub) {
        const db = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { isAdmin: true, locked: true, nickname: true },
        })
        token.isAdmin = db?.isAdmin ?? false
        token.locked = db?.locked ?? false
        token.nickname = db?.nickname ?? null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.isAdmin = Boolean((token as any).isAdmin)
        session.user.locked  = Boolean((token as any).locked)
        session.user.nickname = ((token as any).nickname ?? null) as string | null
      }
      return session
    },
  },
}

