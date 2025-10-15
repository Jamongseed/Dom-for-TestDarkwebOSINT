import './globals.css'
import AuthProvider from '@/components/AuthProvider'

export const metadata = {
  title: 'goormPay',
  description: '당신의 구름 코인을 저장하는 goormPay',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

