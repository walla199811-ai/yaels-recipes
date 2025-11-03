import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'
import '../styles/rtl-placeholders.css'
import { Providers } from '@/lib/providers'

const heebo = Heebo({
  subsets: ['latin', 'hebrew'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'מתכוני המשפחה של יעל',
  description: 'אוסף מתכונים יקרים מהמשפחה',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={heebo.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}