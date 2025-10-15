import './globals.css'
import type { Metadata } from 'next'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'goormPay',
  description: '당신의 구름 코인을 안전하게 보관하는 goormPay',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
