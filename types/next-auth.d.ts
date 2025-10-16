import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      isAdmin?: boolean
      locked?: boolean
      nickname?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin?: boolean
    locked?: boolean
    nickname?: string | null
  }
}

