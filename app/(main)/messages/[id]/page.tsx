import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import ChatWindow from '@/components/messages/ChatWindow'

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
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
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!conversation) {
    notFound()
  }

  const isParticipant = conversation.participants.some(
    (p: any) => p.user.id === session.user.id
  )

  if (!isParticipant) {
    redirect('/messages')
  }

  const otherParticipants = conversation.participants.filter(
    (p: any) => p.user.id !== session.user.id
  )

  const otherUser = otherParticipants[0]?.user

  return (
    <div className="h-[calc(100vh-48px)] bg-white rounded shadow-sm overflow-hidden">
      <ChatWindow
        conversation={conversation}
        otherUser={otherUser}
        currentUserId={session.user.id}
      />
    </div>
  )
}
