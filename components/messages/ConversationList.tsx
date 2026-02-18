'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, User } from 'lucide-react'

interface ConversationListProps {
  conversations: any[]
  currentUserId: string
}

export default function ConversationList({ conversations, currentUserId }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-[#818c99]">
        <MessageCircle className="w-16 h-16 mb-4" />
        <p>No conversations yet</p>
        <p className="text-sm">Start a conversation with your friends!</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[#d3d9de]">
      {conversations.map((conversation) => {
        const otherParticipants = conversation.participants.filter(
          (p: any) => p.user.id !== currentUserId
        )

        if (otherParticipants.length === 0) return null

        const otherUser = otherParticipants[0].user
        const lastMessage = conversation.messages[0]

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className="flex items-center gap-3 p-4 hover:bg-[#f0f2f5] transition-colors"
          >
            {otherUser.avatar ? (
              <div className="relative">
                <img
                  src={otherUser.avatar}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
                {otherUser.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4bb34b] border-2 border-white rounded-full" />
                )}
              </div>
            ) : (
              <div className="relative w-12 h-12 bg-[#e1e3e6] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-[#818c99]" />
                {otherUser.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4bb34b] border-2 border-white rounded-full" />
                )}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-[#000000]">{otherUser.name}</span>
                {lastMessage && (
                  <span className="text-xs text-[#818c99]">
                    {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              <div className="text-sm text-[#818c99] truncate">
                {lastMessage?.content || 'No messages yet'}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
