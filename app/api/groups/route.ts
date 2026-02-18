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

    const userGroups = await prisma.groupMember.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        group: {
          include: {
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    })

    const suggestedGroups = await prisma.group.findMany({
      where: {
        isPublic: true,
        NOT: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
      take: 10,
    })

    return NextResponse.json({
      groups: userGroups.map((m: any) => m.group),
      suggestions: suggestedGroups,
    })
  } catch (error) {
    console.error('Error fetching groups:', error)
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
    const { name, description, isPublic } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        isPublic: isPublic !== false,
        ownerId: session.user.id,
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    })

    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: session.user.id,
        role: 'admin',
      },
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
