import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Users, Settings, Image, Video, FileText, ShoppingBag } from 'lucide-react'
import PostCard from '@/components/feed/PostCard'
import { PostWithAuthor } from '@/types'

export default async function GroupPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    notFound()
  }

  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
      members: {
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
        take: 12,
      },
      _count: {
        select: {
          members: true,
          posts: true,
          albums: true,
          videos: true,
          products: true,
        },
      },
    },
  })

  if (!group) {
    notFound()
  }

  const userMembership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: group.id,
        userId: session.user.id,
      },
    },
  })

  const posts = (await prisma.post.findMany({
    where: { groupId: group.id },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
      likes: {
        select: {
          userId: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 3,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  })) as PostWithAuthor[]

  const isAdmin = userMembership?.role === 'admin' || group.ownerId === session.user.id

  return (
    <div className="space-y-4">
      <div className="bg-white rounded shadow-sm overflow-hidden">
        <div className="h-[200px] bg-gradient-to-br from-[#2688eb] to-[#1a5eb8] relative">
          {group.cover && (
            <img src={group.cover} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-end gap-4 -mt-16 mb-4">
            <div className="w-[140px] h-[140px] bg-white rounded-lg p-1 shadow-md">
              {group.avatar ? (
                <img src={group.avatar} alt="" className="w-full h-full rounded object-cover" />
              ) : (
                <div className="w-full h-full bg-[#e1e3e6] rounded flex items-center justify-center">
                  <Users className="w-16 h-16 text-[#818c99]" />
                </div>
              )}
            </div>

            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-bold text-[#2a5885]">{group.name}</h1>
              <div className="text-[#818c99] text-sm">
                {group._count.members} member{group._count.members !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="flex items-center gap-2 pb-2">
              {userMembership ? (
                <button className="vk-button-secondary px-4 py-2 text-sm">
                  Leave Group
                </button>
              ) : (
                <button className="vk-button px-4 py-2 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Join Group
                </button>
              )}
              {isAdmin && (
                <button className="p-2 hover:bg-[#f0f2f5] rounded transition-colors">
                  <Settings className="w-5 h-5 text-[#818c99]" />
                </button>
              )}
            </div>
          </div>

          {group.description && (
            <p className="text-[#000000] mb-4">{group.description}</p>
          )}

          <div className="flex gap-6 text-sm border-t border-[#d3d9de] pt-4">
            <button className="flex items-center gap-2 hover:text-[#2688eb] transition-colors font-medium text-[#2688eb]">
              Posts
            </button>
            <button className="flex items-center gap-2 hover:text-[#2688eb] transition-colors text-[#818c99]">
              <Image className="w-4 h-4" />
              Photos ({group._count.albums})
            </button>
            <button className="flex items-center gap-2 hover:text-[#2688eb] transition-colors text-[#818c99]">
              <Video className="w-4 h-4" />
              Videos ({group._count.videos})
            </button>
            <button className="flex items-center gap-2 hover:text-[#2688eb] transition-colors text-[#818c99]">
              <Users className="w-4 h-4" />
              Members
            </button>
            {group.products.length > 0 && (
              <button className="flex items-center gap-2 hover:text-[#2688eb] transition-colors text-[#818c99]">
                <ShoppingBag className="w-4 h-4" />
                Market ({group._count.products})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="bg-white rounded shadow-sm p-4">
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b border-[#d3d9de]">
              Members
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {group.members.slice(0, 8).map((member) => (
                <Link
                  key={member.user.id}
                  href={`/${member.user.username}`}
                  className="text-center"
                >
                  {member.user.avatar ? (
                    <img
                      src={member.user.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full mx-auto object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-[#e1e3e6] rounded-full mx-auto flex items-center justify-center">
                      <span className="text-xs font-bold text-[#818c99]">
                        {member.user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
            {group._count.members > 8 && (
              <Link
                href="#"
                className="block text-center text-sm text-[#2688eb] hover:underline mt-3"
              >
                Show all {group._count.members} members
              </Link>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  _count: {
                    likes: post.likes.length,
                    comments: post.comments.length,
                  },
                }}
                currentUserId={session.user.id}
              />
            ))}
          </div>

          {posts.length === 0 && (
            <div className="bg-white rounded shadow-sm p-8 text-center">
              <p className="text-[#818c99]">No posts yet. Be the first to post!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
