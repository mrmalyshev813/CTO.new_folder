import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function AlbumPage({ params }: { params: { albumId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const album = await prisma.album.findUnique({
    where: { id: params.albumId },
    include: {
      photos: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      user: {
        select: {
          name: true,
          username: true,
        },
      },
    },
  })

  if (!album) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <Link href="/photos" className="text-[#2688eb] hover:underline text-sm">
        ← Back to Photos
      </Link>

      <div className="bg-white rounded shadow-sm p-4">
        <h1 className="text-xl font-bold text-[#2a5885] mb-2">{album.title}</h1>
        {album.description && (
          <p className="text-[#000000] mb-2">{album.description}</p>
        )}
        <p className="text-sm text-[#818c99]">
          By {album.user.name} • {album.photos.length} photo{album.photos.length !== 1 ? 's' : ''}
        </p>
      </div>

      {album.photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {album.photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.url}
              alt={photo.description || ''}
              className="aspect-square object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded shadow-sm p-8 text-center">
          <p className="text-[#818c99]">No photos in this album yet.</p>
        </div>
      )}
    </div>
  )
}
