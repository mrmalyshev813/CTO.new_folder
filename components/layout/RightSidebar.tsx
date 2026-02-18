import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { UserPlus, Calendar, Building2, Users } from 'lucide-react'

export default async function RightSidebar() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      friendsA: {
        include: {
          userB: {
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
      friendsB: {
        include: {
          userA: {
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
      receivedRequests: {
        where: { status: 'pending' },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
        take: 3,
      },
    },
  })

  if (!user) {
    return null
  }

  const friends = [
    ...user.friendsA.map((f: any) => f.userB),
    ...user.friendsB.map((f: any) => f.userA),
  ]

  const friendIds = friends.map((f: any) => f.id)

  const suggestions = await prisma.user.findMany({
    where: {
      id: {
        notIn: [session.user.id, ...friendIds],
      },
    },
    take: 3,
  })

  const onlineFriends = friends.filter((f: any) => f.isOnline).slice(0, 5)

  const suggestedGroups = await prisma.group.findMany({
    where: {
      isPublic: true,
      NOT: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
    include: {
      _count: {
        select: {
          members: true,
        },
      },
    },
    take: 3,
  })

  const today = new Date()
  const todayMonth = today.getMonth()
  const todayDay = today.getDate()

  const birthdayFriends = friends.filter((f: any) => {
    if (!f.birthday) return false
    const bday = new Date(f.birthday)
    return bday.getMonth() === todayMonth && bday.getDate() === todayDay
  })

  return (
    <aside className="hidden xl:block w-[280px] min-h-[calc(100vh-48px)] sticky top-[48px] overflow-y-auto scrollbar-thin">
      <div className="p-4 space-y-4">
        {suggestions.length > 0 && (
          <Card
            title="Friend Suggestions"
            icon={<UserPlus className="w-4 h-4" />}
          >
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="flex items-center gap-3">
                  {suggestion.avatar ? (
                    <img
                      src={suggestion.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-[#e1e3e6] rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-[#818c99]">
                        {suggestion.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${suggestion.username}`}
                      className="text-sm font-medium hover:underline truncate block"
                    >
                      {suggestion.name}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {birthdayFriends.length > 0 && (
          <Card
            title="Birthdays"
            icon={<Calendar className="w-4 h-4" />}
          >
            <div className="space-y-3">
              {birthdayFriends.map((friend: any) => (
                <div key={friend.id} className="flex items-center gap-3">
                  {friend.avatar ? (
                    <img
                      src={friend.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-[#e1e3e6] rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-[#818c99]">
                        {friend.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${friend.username}`}
                      className="text-sm font-medium hover:underline truncate block"
                    >
                      {friend.name}
                    </Link>
                    <div className="text-xs text-[#818c99]">Today</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {onlineFriends.length > 0 && (
          <Card
            title="Online Friends"
            icon={<Users className="w-4 h-4" />}
          >
            <div className="space-y-3">
              {onlineFriends.map((friend: any) => (
                <Link
                  key={friend.id}
                  href={`/${friend.username}`}
                  className="flex items-center gap-3 hover:bg-[#f0f2f5] p-2 rounded transition-colors"
                >
                  <div className="relative">
                    {friend.avatar ? (
                      <img
                        src={friend.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#e1e3e6] rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-[#818c99]">
                          {friend.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4bb34b] border-2 border-white rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{friend.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {suggestedGroups.length > 0 && (
          <Card
            title="Interesting Groups"
            icon={<Building2 className="w-4 h-4" />}
          >
            <div className="space-y-3">
              {suggestedGroups.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="flex items-center gap-3 hover:bg-[#f0f2f5] p-2 rounded transition-colors"
                >
                  {group.avatar ? (
                    <img
                      src={group.avatar}
                      alt=""
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-[#2688eb] rounded flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{group.name}</div>
                    <div className="text-xs text-[#818c99]">
                      {group._count.members} member{group._count.members !== 1 ? 's' : ''}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
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
