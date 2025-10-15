import './globals.css'
import type { Metadata } from 'next'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'OSINT Portal - Auth MVP',
  description: 'Next.js + NextAuth + Prisma (SQLite) signup/login'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
