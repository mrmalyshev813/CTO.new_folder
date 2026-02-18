'use client'

import { MapPin, Calendar, Link as LinkIcon, Briefcase } from 'lucide-react'

interface ProfileInfoProps {
  user: {
    id: string
    name: string
    username: string
    avatar: string | null
    bio: string | null
    city: string | null
    birthday: Date | null
    status: string | null
  }
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded shadow-sm p-4">
      <h3 className="font-semibold text-sm mb-3 pb-2 border-b border-[#d3d9de]">
        Information
      </h3>

      <div className="space-y-3">
        {user.city && (
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="w-4 h-4 text-[#818c99] mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-[#818c99] text-xs mb-0.5">City</div>
              <div>{user.city}</div>
            </div>
          </div>
        )}

        {user.birthday && (
          <div className="flex items-start gap-3 text-sm">
            <Calendar className="w-4 h-4 text-[#818c99] mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-[#818c99] text-xs mb-0.5">Birthday</div>
              <div>{formatDate(user.birthday)}</div>
            </div>
          </div>
        )}

        {user.status && (
          <div className="flex items-start gap-3 text-sm">
            <Briefcase className="w-4 h-4 text-[#818c99] mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-[#818c99] text-xs mb-0.5">Status</div>
              <div>{user.status}</div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 text-sm">
          <LinkIcon className="w-4 h-4 text-[#818c99] mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[#818c99] text-xs mb-0.5">Link</div>
            <a
              href={`/${user.username}`}
              className="text-[#2688eb] hover:underline"
            >
              vk.com/{user.username}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
