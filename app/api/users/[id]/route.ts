import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        cover: true,
        bio: true,
        city: true,
        birthday: true,
        phone: true,
        website: true,
        status: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        _count: {
          select: {
            friendsA: true,
            friendsB: true,
            posts: true,
            photos: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const friendCount = user._count.friendsA + user._count.friendsB

    return NextResponse.json({
      ...user,
      _count: {
        ...user._count,
        friends: friendCount,
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
