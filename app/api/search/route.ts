import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all'

    if (!query) {
      return NextResponse.json({ users: [], groups: [], posts: [] })
    }

    const results: any = {
      users: [],
      groups: [],
      posts: [],
    }

    if (type === 'all' || type === 'people') {
      results.users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { username: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      })
    }

    if (type === 'all' || type === 'groups') {
      results.groups = await prisma.group.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
          isPublic: true,
        },
        take: 10,
      })
    }

    if (type === 'all' || type === 'posts') {
      results.posts = await prisma.post.findMany({
        where: {
          content: { contains: query, mode: 'insensitive' },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
        take: 10,
      })
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
