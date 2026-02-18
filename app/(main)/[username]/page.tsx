import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileInfo from '@/components/profile/ProfileInfo'
import PostComposer from '@/components/feed/PostComposer'
import PostCard from '@/components/feed/PostCard'
import { PostWithAuthor } from '@/types'

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      _count: {
        select: {
          friendsA: true,
          friendsB: true,
          posts: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  const isOwnProfile = session.user.id === user.id

  const posts = (await prisma.post.findMany({
    where: { authorId: user.id },
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

  const friends = await prisma.user.findMany({
    where: {
      OR: [
        {
          friendsA: {
            some: {
              userBId: user.id,
            },
          },
        },
        {
          friendsB: {
            some: {
              userAId: user.id,
            },
          },
        },
      ],
    },
    take: 6,
  })

  const friendCount = user._count.friendsA + user._count.friendsB

  const existingFriendRequest = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { requesterId: session.user.id, receiverId: user.id },
        { requesterId: user.id, receiverId: session.user.id },
      ],
    },
  })

  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userAId: session.user.id, userBId: user.id },
        { userAId: user.id, userBId: session.user.id },
      ],
    },
  })

  return (
    <div className="space-y-4">
      <ProfileHeader
        user={{
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          cover: user.cover,
          bio: user.bio,
          city: user.city,
          isOnline: user.isOnline,
        }}
        friendCount={friendCount}
        postCount={user._count.posts}
        isOwnProfile={isOwnProfile}
        friendshipStatus={
          existingFriendship
            ? 'friends'
            : existingFriendRequest?.requesterId === session.user.id
            ? 'sent'
            : existingFriendRequest
            ? 'received'
            : 'none'
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <ProfileInfo
            user={{
              id: user.id,
              name: user.name,
              username: user.username,
              avatar: user.avatar,
              bio: user.bio,
              city: user.city,
              birthday: user.birthday,
              status: user.status,
            }}
          />

          {friends.length > 0 && (
            <div className="bg-white rounded shadow-sm p-4">
              <h3 className="font-semibold text-sm mb-3 pb-2 border-b border-[#d3d9de]">
                Friends ({friendCount})
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {friends.map((friend) => (
                  <a
                    key={friend.id}
                    href={`/${friend.username}`}
                    className="text-center"
                  >
                    {friend.avatar ? (
                      <img
                        src={friend.avatar}
                        alt=""
                        className="w-full aspect-square rounded object-cover mb-1"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-[#e1e3e6] rounded flex items-center justify-center mb-1">
                        <span className="text-sm font-bold text-[#818c99]">
                          {friend.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="text-xs truncate">{friend.name}</div>
                  </a>
                ))}
              </div>
              {friendCount > 6 && (
                <a
                  href={`/${user.username}/friends`}
                  className="block text-center text-sm text-[#2688eb] hover:underline mt-3"
                >
                  Show all friends
                </a>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {isOwnProfile && <PostComposer />}
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
              <p className="text-[#818c99]">No posts yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
