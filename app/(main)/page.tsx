import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileInfo from '@/components/profile/ProfileInfo'
import PostComposer from '@/components/feed/PostComposer'
import { PostWithAuthor } from '@/types'
import PostCard from '@/components/feed/PostCard'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

export default async function MyPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          friendsA: true,
          posts: true,
        },
      },
    },
  })

  if (!user) {
    redirect('/auth/login')
  }

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
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  })) as PostWithAuthor[]

  const friendCount = user._count.friendsA + user._count.friendsB

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
        isOwnProfile={true}
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
        </div>

        <div className="lg:col-span-2 space-y-4">
          <PostComposer />
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  createdAt: post.createdAt,
                  _count: {
                    likes: post.likes.length,
                    comments: post.comments.length,
                  },
                }}
                currentUserId={session.user.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
