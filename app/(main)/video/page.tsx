import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Play from 'lucide-react/dist/esm/icons/play'

export default async function VideoPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const videos = await prisma.video.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#2a5885]">Videos</h1>
        <button className="vk-button text-sm px-3 py-1.5">Upload Video</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Link
            key={video.id}
            href={`/video/${video.id}`}
            className="bg-white rounded shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-video bg-[#e1e3e6]">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">🎬</span>
                </div>
              )}
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                <Play className="w-12 h-12 text-white" />
              </div>
            </div>

            <div className="p-3">
              <h3 className="font-medium text-[#2688eb] hover:underline line-clamp-2">
                {video.title}
              </h3>
              <p className="text-sm text-[#818c99] mt-1">
                {video.user.name}
              </p>
              <p className="text-sm text-[#818c99]">
                {video.views} view{video.views !== 1 ? 's' : ''}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="bg-white rounded shadow-sm p-8 text-center">
          <p className="text-[#818c99]">No videos yet. Upload your first video!</p>
        </div>
      )}
    </div>
  )
}
