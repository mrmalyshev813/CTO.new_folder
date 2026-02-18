import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PostWithAuthor } from '@/types'
import PostComposer from '@/components/feed/PostComposer'
import PostCard from '@/components/feed/PostCard'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

export default async function NewsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      friendsA: true,
      friendsB: true,
    },
  })

  const friendIds = user
    ? [
        ...user.friendsA.map((f: any) => f.userBId),
        ...user.friendsB.map((f: any) => f.userAId),
      ]
    : []

  const posts = (await prisma.post.findMany({
    where: {
      authorId: {
        in: [...friendIds, session.user.id],
      },
    },
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
    take: 20,
  })) as PostWithAuthor[]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#2a5885]">News Feed</h1>
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
  )
}
