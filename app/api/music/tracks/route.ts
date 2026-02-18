import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const tracks = await prisma.track.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json(tracks)
  } catch (error) {
    console.error('Error fetching tracks:', error)
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
    const { title, artist, url, cover, duration } = body

    if (!title?.trim() || !artist?.trim() || !url?.trim()) {
      return NextResponse.json(
        { error: 'Title, artist, and URL are required' },
        { status: 400 }
      )
    }

    const track = await prisma.track.create({
      data: {
        title,
        artist,
        url,
        cover,
        duration,
        userId: session.user.id,
      },
    })

    return NextResponse.json(track, { status: 201 })
  } catch (error) {
    console.error('Error creating track:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
