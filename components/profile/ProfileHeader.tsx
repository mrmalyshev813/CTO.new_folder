'use client'

import Link from 'next/link'
import { Camera, MessageSquare, UserPlus, UserCheck, UserX, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface ProfileHeaderProps {
  user: {
    id: string
    name: string
    username: string
    avatar: string | null
    cover: string | null
    bio: string | null
    city: string | null
    isOnline: boolean
  }
  friendCount: number
  postCount: number
  isOwnProfile: boolean
  friendshipStatus?: 'friends' | 'sent' | 'received' | 'none'
}

export default function ProfileHeader({
  user,
  friendCount,
  postCount,
  isOwnProfile,
  friendshipStatus = 'none',
}: ProfileHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState(friendshipStatus)
  const router = useRouter()

  const handleFriendAction = async () => {
    if (status === 'friends') {
      return
    }

    setIsLoading(true)
    try {
      if (status === 'none') {
        const response = await fetch('/api/friends/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        })
        if (response.ok) {
          setStatus('sent')
          toast.success('Friend request sent!')
        }
      } else if (status === 'received') {
        const response = await fetch('/api/friends/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        })
        if (response.ok) {
          setStatus('friends')
          toast.success('Friend request accepted!')
          router.refresh()
        }
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getFriendButton = () => {
    if (isOwnProfile) {
      return (
        <button className="vk-button px-4 py-2 text-sm">
          Edit Page
        </button>
      )
    }

    switch (status) {
      case 'friends':
        return (
          <button className="vk-button-secondary px-4 py-2 text-sm flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Friends
          </button>
        )
      case 'sent':
        return (
          <button className="vk-button-secondary px-4 py-2 text-sm flex items-center gap-2 opacity-70" disabled>
            <UserPlus className="w-4 h-4" />
            Request Sent
          </button>
        )
      case 'received':
        return (
          <button
            onClick={handleFriendAction}
            disabled={isLoading}
            className="vk-button px-4 py-2 text-sm flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Accept Request
          </button>
        )
      default:
        return (
          <button
            onClick={handleFriendAction}
            disabled={isLoading}
            className="vk-button px-4 py-2 text-sm flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Friend
          </button>
        )
    }
  }

  return (
    <div className="bg-white rounded shadow-sm overflow-hidden">
      <div className="h-[200px] bg-gradient-to-br from-[#2688eb] to-[#1a5eb8] relative">
        {user.cover && (
          <img
            src={user.cover}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        {isOwnProfile && (
          <button className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors">
            <Camera className="w-4 h-4" />
            Edit Cover
          </button>
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-end gap-4 -mt-16 mb-4">
          <div className="relative">
            <div className="w-[140px] h-[140px] bg-white rounded-lg p-1 shadow-md">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full rounded object-cover" />
              ) : (
                <div className="w-full h-full bg-[#e1e3e6] rounded flex items-center justify-center">
                  <span className="text-4xl text-[#818c99] font-bold">
                    {user.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            {user.isOnline && (
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-[#4bb34b] border-3 border-white rounded-full" />
            )}
          </div>

          <div className="flex-1 pb-1">
            <h1 className="text-2xl font-bold text-[#2a5885]">{user.name}</h1>
            <div className="text-[#818c99] text-sm">{user.city || ''}</div>
          </div>

          <div className="flex items-center gap-2 pb-2">
            {getFriendButton()}
            {!isOwnProfile && (
              <button className="vk-button-secondary px-4 py-2 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
            )}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-[#f0f2f5] rounded transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-[#818c99]" />
            </button>
          </div>
        </div>

        {user.bio && (
          <p className="text-[#000000] mb-4">{user.bio}</p>
        )}

        <div className="flex gap-6 text-sm">
          <Link
            href={`/${user.username}/friends`}
            className="hover:text-[#2688eb] transition-colors"
          >
            <span className="font-bold">{friendCount}</span> friend
            {friendCount !== 1 ? 's' : ''}
          </Link>
          <Link
            href={`/${user.username}/photos`}
            className="hover:text-[#2688eb] transition-colors"
          >
            <span className="font-bold">{postCount}</span> post
            {postCount !== 1 ? 's' : ''}
          </Link>
        </div>
      </div>
    </div>
  )
}
