'use client'

import Link from 'next/link'
import { UserPlus, Calendar, Building2, Users } from 'lucide-react'

export default function RightSidebar() {
  const friendSuggestions = [
    { id: '1', name: 'Anna Kozlova', username: 'anna_k', mutualFriends: 5 },
    { id: '2', name: 'Petrov Sergey', username: 'sergey_p', mutualFriends: 3 },
    { id: '3', name: 'Olga Smirnova', username: 'olga_s', mutualFriends: 8 },
  ]

  const birthdays = [
    { id: '1', name: 'Dmitry Volnov', date: 'Today' },
    { id: '2', name: 'Elena Tikhonova', date: 'Tomorrow' },
  ]

  const interestingGroups = [
    { id: '1', name: 'Tech Enthusiasts', members: '12.5K' },
    { id: '2', name: 'Music Lovers', members: '8.2K' },
    { id: '3', name: 'Photography Club', members: '5.7K' },
  ]

  return (
    <aside className="hidden xl:block w-[280px] min-h-[calc(100vh-48px)] sticky top-[48px] overflow-y-auto scrollbar-thin">
      <div className="p-4 space-y-4">
        <Card
          title="Friend Suggestions"
          icon={<UserPlus className="w-4 h-4" />}
        >
          <div className="space-y-3">
            {friendSuggestions.map((friend) => (
              <div key={friend.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e1e3e6] rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{friend.name}</div>
                  <div className="text-xs text-[#818c99]">
                    {friend.mutualFriends} mutual friends
                  </div>
                </div>
                <button className="vk-button text-xs px-3 py-1">Add</button>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Birthdays"
          icon={<Calendar className="w-4 h-4" />}
        >
          <div className="space-y-3">
            {birthdays.map((birthday) => (
              <div key={birthday.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e1e3e6] rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{birthday.name}</div>
                  <div className="text-xs text-[#818c99]">{birthday.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Interesting Groups"
          icon={<Building2 className="w-4 h-4" />}
        >
          <div className="space-y-3">
            {interestingGroups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="flex items-center gap-3 hover:bg-[#f0f2f5] p-2 rounded transition-colors"
              >
                <div className="w-10 h-10 bg-[#2688eb] rounded flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{group.name}</div>
                  <div className="text-xs text-[#818c99]">{group.members} members</div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </aside>
  )
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#d3d9de]">
        {icon}
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  )
}
