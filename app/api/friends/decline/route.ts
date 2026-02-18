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
    const { requestId } = body

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    })

    if (!friendRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (friendRequest.receiverId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'rejected' },
    })

    return NextResponse.json({ message: 'Friend request declined' })
  } catch (error) {
    console.error('Error declining friend request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
