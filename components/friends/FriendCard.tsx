'use client'

import Link from 'next/link'
import { UserPlus, MessageSquare, Check, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface FriendCardProps {
  user: {
    id: string
    name: string
    username: string
    avatar: string | null
    bio?: string | null
    city?: string | null
  }
  requestId?: string
}

export default function FriendCard({ user, requestId }: FriendCardProps) {
  const handleAcceptRequest = async () => {
    if (!requestId) return

    try {
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      })

      if (response.ok) {
        toast.success('Friend request accepted!')
        window.location.reload()
      }
    } catch (error) {
      toast.error('Failed to accept request')
    }
  }

  const handleDeclineRequest = async () => {
    if (!requestId) return

    try {
      const response = await fetch('/api/friends/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      })

      if (response.ok) {
        toast.success('Friend request declined')
        window.location.reload()
      }
    } catch (error) {
      toast.error('Failed to decline request')
    }
  }

  const handleSendRequest = async () => {
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        toast.success('Friend request sent!')
      }
    } catch (error) {
      toast.error('Failed to send request')
    }
  }

  return (
    <div className="bg-[#f0f2f5] rounded p-4">
      <Link href={`/${user.username}`} className="flex items-center gap-3 mb-3">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="w-12 h-12 rounded object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-[#e1e3e6] rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-[#818c99]">
              {user.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-[#2688eb] hover:underline truncate">
            {user.name}
          </div>
          {user.city && (
            <div className="text-xs text-[#818c99]">{user.city}</div>
          )}
        </div>
      </Link>

      {requestId ? (
        <div className="flex gap-2">
          <button
            onClick={handleAcceptRequest}
            className="flex-1 vk-button py-1.5 text-sm flex items-center justify-center gap-1"
          >
            <Check className="w-4 h-4" />
            Accept
          </button>
          <button
            onClick={handleDeclineRequest}
            className="flex-1 vk-button-secondary py-1.5 text-sm flex items-center justify-center gap-1"
          >
            <X className="w-4 h-4" />
            Decline
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleSendRequest}
            className="flex-1 vk-button py-1.5 text-sm flex items-center justify-center gap-1"
          >
            <UserPlus className="w-4 h-4" />
            Add Friend
          </button>
          <button className="flex-1 vk-button-secondary py-1.5 text-sm flex items-center justify-center gap-1">
            <MessageSquare className="w-4 h-4" />
            Message
          </button>
        </div>
      )}
    </div>
  )
}
