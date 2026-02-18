import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageSquare, UserPlus, Bell } from 'lucide-react'

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const notifications = await prisma.notification.findMany({
    where: {
      recipientId: session.user.id,
    },
    include: {
      trigger: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case 'friend_request':
        return <UserPlus className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#2a5885]">Notifications</h1>

      <div className="bg-white rounded shadow-sm divide-y divide-[#d3d9de]">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-[#f0f2f5] transition-colors ${
                !notification.isRead ? 'bg-[#e5ebf1]' : ''
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    {notification.trigger?.avatar ? (
                      <img
                        src={notification.trigger.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#e1e3e6] rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-[#818c99]">
                          {notification.trigger?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}

                    <div className="flex-1">
                      <p className="text-[#000000]">
                        {notification.message}
                      </p>
                      <p className="text-sm text-[#818c99] mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <Bell className="w-16 h-16 mx-auto text-[#818c99] mb-4" />
            <p className="text-[#818c99]">No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
