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
        password: { label: 'Password', type: 'password' }
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
      }
    })
  ],
  pages: { signIn: '/login' }
}
