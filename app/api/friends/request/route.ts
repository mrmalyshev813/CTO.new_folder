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
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, receiverId: userId },
          { requesterId: userId, receiverId: session.user.id },
        ],
      },
    })

    if (existingRequest) {
      return NextResponse.json({ error: 'Request already exists' }, { status: 400 })
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        requesterId: session.user.id,
        receiverId: userId,
      },
    })

    return NextResponse.json(friendRequest, { status: 201 })
  } catch (error) {
    console.error('Error sending friend request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
