// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 보호할 경로만 적용 (기존 matcher와 동일하게 유지)
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // 미인증 → 로그인으로
  if (!token) {
    const url = new URL("/login", req.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // 잠금 → /locked 로
  if ((token as any).locked) {
    return NextResponse.redirect(new URL("/locked", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}

