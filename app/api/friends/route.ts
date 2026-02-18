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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        friendsA: {
          include: {
            userB: true,
          },
        },
        friendsB: {
          include: {
            userA: true,
          },
        },
        receivedRequests: {
          where: { status: 'pending' },
          include: {
            requester: true,
          },
        },
        sentRequests: {
          where: { status: 'pending' },
          include: {
            receiver: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const friends = [
      ...user.friendsA.map((f: any) => f.userB),
      ...user.friendsB.map((f: any) => f.userA),
    ]

    const suggestions = await prisma.user.findMany({
      where: {
        id: {
          notIn: [
            session.user.id,
            ...friends.map((f: any) => f.id),
            ...user.receivedRequests.map((r: any) => r.requesterId),
            ...user.sentRequests.map((r: any) => r.receiverId),
          ],
        },
      },
      take: 10,
    })

    return NextResponse.json({
      friends,
      requests: user.receivedRequests,
      suggestions,
    })
  } catch (error) {
    console.error('Error fetching friends:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
