import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const group = await prisma.group.findUnique({
      where: { id: params.id },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: session.user.id,
        },
      },
    })

    if (existingMembership) {
      await prisma.groupMember.delete({
        where: {
          groupId_userId: {
            groupId: group.id,
            userId: session.user.id,
          },
        },
      })
      return NextResponse.json({ joined: false })
    } else {
      await prisma.groupMember.create({
        data: {
          groupId: group.id,
          userId: session.user.id,
          role: 'member',
        },
      })
      return NextResponse.json({ joined: true })
    }
  } catch (error) {
    console.error('Error joining/leaving group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
