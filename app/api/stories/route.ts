import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        friendsA: true,
        friendsB: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const friendIds = [
      ...user.friendsA.map(f => f.userBId),
      ...user.friendsB.map(f => f.userAId),
    ]

    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const stories = await prisma.story.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { userId: { in: friendIds } },
        ],
        expiresAt: {
          gt: now,
        },
        createdAt: {
          gt: twentyFourHoursAgo,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        views: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(stories)
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { mediaUrl, mediaType, text } = body

    if (!mediaUrl || !mediaType) {
      return NextResponse.json({ error: 'Media URL and type are required' }, { status: 400 })
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours

    const story = await prisma.story.create({
      data: {
        userId: session.user.id,
        mediaUrl,
        mediaType,
        text,
        expiresAt,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(story, { status: 201 })
  } catch (error) {
    console.error('Error creating story:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
