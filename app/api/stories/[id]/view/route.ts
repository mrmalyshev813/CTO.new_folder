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

    const story = await prisma.story.findUnique({
      where: { id: params.id },
    })

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    const existingView = await prisma.storyView.findUnique({
      where: {
        storyId_userId: {
          storyId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (existingView) {
      return NextResponse.json({ message: 'Already viewed' })
    }

    await prisma.storyView.create({
      data: {
        storyId: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: 'View recorded' })
  } catch (error) {
    console.error('Error recording view:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
