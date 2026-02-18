import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/providers/SessionProvider'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'VK Clone',
  description: 'A VK.com social network clone',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="ru">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </SessionProvider>
      </body>
    </html>
  )
}
