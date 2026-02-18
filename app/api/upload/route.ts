import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const MAX_FILE_SIZES: Record<string, number> = {
  photos: 10 * 1024 * 1024, // 10MB
  videos: 200 * 1024 * 1024, // 200MB
  documents: 50 * 1024 * 1024, // 50MB
  avatars: 5 * 1024 * 1024, // 5MB
  covers: 10 * 1024 * 1024, // 10MB
}

const ALLOWED_TYPES: Record<string, string[]> = {
  photos: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
  ],
  avatars: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  covers: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) || 'photos'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES[type]) {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 })
    }

    if (!ALLOWED_TYPES[type].includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES[type].join(', ')}` },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZES[type]) {
      return NextResponse.json(
        { error: `File too large. Max size: ${MAX_FILE_SIZES[type] / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileExtension = file.name.split('.').pop() || 'bin'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type, session.user.id)

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)

    const url = `/uploads/${type}/${session.user.id}/${fileName}`

    return NextResponse.json({
      url,
      fileName: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
