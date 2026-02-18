import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function PhotosPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const albums = await prisma.album.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      _count: {
        select: {
          photos: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const photos = await prisma.photo.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  })

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#2a5885]">Photos</h1>

      <div className="bg-white rounded shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Albums ({albums.length})</h2>
          <button className="vk-button text-sm px-3 py-1.5">Create Album</button>
        </div>

        {albums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/photos/albums/${album.id}`}
                className="group"
              >
                <div className="bg-[#f0f2f5] rounded p-4 transition-transform group-hover:scale-[1.02]">
                  {album.cover ? (
                    <img
                      src={album.cover}
                      alt=""
                      className="w-full h-48 object-cover rounded mb-3"
                    />
                  ) : (
                    <div className="w-full h-48 bg-[#e1e3e6] rounded mb-3 flex items-center justify-center">
                      <span className="text-4xl text-[#818c99]">📷</span>
                    </div>
                  )}
                  <h3 className="font-medium text-[#2688eb]">{album.title}</h3>
                  <p className="text-sm text-[#818c99]">
                    {album._count.photos} photo{album._count.photos !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[#818c99] text-center py-8">
            No albums yet. Create your first album!
          </p>
        )}
      </div>

      <div className="bg-white rounded shadow-sm p-4">
        <h2 className="font-semibold mb-4">All Photos ({photos.length})</h2>
        {photos.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {photos.map((photo) => (
              <img
                key={photo.id}
                src={photo.url}
                alt=""
                className="aspect-square object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
              />
            ))}
          </div>
        ) : (
          <p className="text-[#818c99] text-center py-8">
            No photos yet. Upload your first photo!
          </p>
        )}
      </div>
    </div>
  )
}
