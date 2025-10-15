import type { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'

const prisma = new PrismaClient()

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
        if (!credentials?.email || !credentials?.password) return null

        const demoEmail = process.env.DEMO_EMAIL
        const demoHash = process.env.DEMO_PASSWORD_HASH
        if (demoEmail && demoHash && credentials.email === demoEmail) {
          const ok = await compare(credentials.password, demoHash)
          if (ok) return { id: 'demo', email: demoEmail, name: demoEmail.split('@')[0] }
        }

        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user) return null
        const ok = await compare(credentials.password, user.passwordHash)
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.email.split('@')[0] }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/api/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
        session.user.id = token.sub
      }
      return session
    },
  },
}

