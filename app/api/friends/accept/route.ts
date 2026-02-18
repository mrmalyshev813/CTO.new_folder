import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { requestId, userId } = body

    let friendRequest = null

    if (requestId) {
      friendRequest = await prisma.friendRequest.findUnique({
        where: { id: requestId },
      })
    } else if (userId) {
      friendRequest = await prisma.friendRequest.findFirst({
        where: {
          requesterId: userId,
          receiverId: session.user.id,
          status: 'pending',
        },
      })
    }

    if (!friendRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (friendRequest.receiverId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.$transaction([
      prisma.friendRequest.update({
        where: { id: friendRequest.id },
        data: { status: 'accepted' },
      }),
      prisma.friendship.create({
        data: {
          userAId: friendRequest.requesterId,
          userBId: friendRequest.receiverId,
        },
      }),
    ])

    return NextResponse.json({ message: 'Friend request accepted' })
  } catch (error) {
    console.error('Error accepting friend request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
