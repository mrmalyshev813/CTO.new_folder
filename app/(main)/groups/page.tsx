import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Users } from 'lucide-react'

export default async function GroupsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const userGroups = await prisma.groupMember.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      group: {
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
      },
    },
    orderBy: {
      joinedAt: 'desc',
    },
  })

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
    take: 6,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#2a5885]">Groups</h1>
        <button className="vk-button text-sm px-3 py-1.5">Create Group</button>
      </div>

      {userGroups.length > 0 && (
        <div className="bg-white rounded shadow-sm p-4">
          <h2 className="font-semibold mb-4">My Groups ({userGroups.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userGroups.map((membership) => (
              <Link
                key={membership.group.id}
                href={`/groups/${membership.group.id}`}
                className="group"
              >
                <div className="bg-[#f0f2f5] rounded p-4 transition-transform group-hover:scale-[1.02]">
                  {membership.group.avatar ? (
                    <img
                      src={membership.group.avatar}
                      alt=""
                      className="w-full h-48 object-cover rounded mb-3"
                    />
                  ) : (
                    <div className="w-full h-48 bg-[#e1e3e6] rounded mb-3 flex items-center justify-center">
                      <Users className="w-16 h-16 text-[#818c99]" />
                    </div>
                  )}
                  <h3 className="font-medium text-[#2688eb]">{membership.group.name}</h3>
                  <p className="text-sm text-[#818c99]">
                    {membership.group._count.members} member{membership.group._count.members !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow-sm p-4">
        <h2 className="font-semibold mb-4">Suggested Groups</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestedGroups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="group"
            >
              <div className="bg-[#f0f2f5] rounded p-4 transition-transform group-hover:scale-[1.02]">
                {group.avatar ? (
                  <img
                    src={group.avatar}
                    alt=""
                    className="w-full h-48 object-cover rounded mb-3"
                  />
                ) : (
                  <div className="w-full h-48 bg-[#e1e3e6] rounded mb-3 flex items-center justify-center">
                    <Users className="w-16 h-16 text-[#818c99]" />
                  </div>
                )}
                <h3 className="font-medium text-[#2688eb]">{group.name}</h3>
                <p className="text-sm text-[#818c99]">
                  {group._count.members} member{group._count.members !== 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
