import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ConversationList from '@/components/messages/ConversationList'

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
              isOnline: true,
            },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return (
    <div className="h-[calc(100vh-48px)]">
      <h1 className="text-xl font-bold text-[#2a5885] mb-4">Messages</h1>
      <div className="bg-white rounded shadow-sm overflow-hidden">
        <ConversationList conversations={conversations} currentUserId={session.user.id} />
      </div>
    </div>
  )
}
