import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#e1e3e6]">
      <Header user={session.user} />
      <div className="pt-[48px] flex">
        <LeftSidebar user={session.user} />
        <main className="flex-1 min-h-[calc(100vh-48px)] px-4 py-4">
          <div className="max-w-[760px] mx-auto">
            {children}
          </div>
        </main>
        <RightSidebar />
      </div>
    </div>
  )
}
