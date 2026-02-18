import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/settings/SettingsForm'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#2a5885]">Settings</h1>

      <div className="bg-white rounded shadow-sm p-4">
        <SettingsForm user={user} />
      </div>
    </div>
  )
}
