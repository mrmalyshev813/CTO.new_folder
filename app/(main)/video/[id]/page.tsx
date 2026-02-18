import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ThumbsUp, MessageCircle, Share, Bookmark, Eye } from 'lucide-react'

export default async function VideoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  const video = await prisma.video.findUnique({
    where: { id: params.id },
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
  })

  if (!video) {
    notFound()
  }

  await prisma.video.update({
    where: { id: video.id },
    data: { views: { increment: 1 } },
  })

  const relatedVideos = await prisma.video.findMany({
    where: {
      id: { not: video.id },
    },
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
    take: 6,
  })

  return (
    <div className="space-y-4">
      <div className="bg-white rounded shadow-sm overflow-hidden">
        <div className="aspect-video bg-black">
          <video
            src={video.url}
            controls
            className="w-full h-full"
            poster={video.thumbnail || undefined}
          />
        </div>

        <div className="p-4">
          <h1 className="text-xl font-bold text-[#2a5885] mb-2">{video.title}</h1>

          {video.description && (
            <p className="text-[#000000] mb-3">{video.description}</p>
          )}

          <div className="flex items-center justify-between text-sm text-[#818c99] mb-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{video.views} view{video.views !== 1 ? 's' : ''}</span>
            </div>
            <div>
              {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#d3d9de]">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm text-[#818c99] hover:text-[#000000] transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span>Like</span>
              </button>

              <button className="flex items-center gap-2 text-sm text-[#818c99] hover:text-[#000000] transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>Comment</span>
              </button>

              <button className="flex items-center gap-2 text-sm text-[#818c99] hover:text-[#000000] transition-colors">
                <Share className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>

            <button className="p-1 hover:bg-[#f0f2f5] rounded text-[#818c99] transition-colors">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm p-4">
        <Link
          href={`/${video.user.username}`}
          className="flex items-center gap-3 hover:bg-[#f0f2f5] p-2 rounded transition-colors"
        >
          {video.user.avatar ? (
            <img
              src={video.user.avatar}
              alt=""
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-[#e1e3e6] rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-[#818c99]">
                {video.user.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <div className="font-medium text-[#2688eb]">{video.user.name}</div>
            <div className="text-sm text-[#818c99]">Video author</div>
          </div>
        </Link>
      </div>

      {relatedVideos.length > 0 && (
        <div className="bg-white rounded shadow-sm p-4">
          <h2 className="font-semibold mb-4">Related Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedVideos.map((relatedVideo) => (
              <Link
                key={relatedVideo.id}
                href={`/video/${relatedVideo.id}`}
                className="group"
              >
                <div className="aspect-video bg-[#e1e3e6] rounded overflow-hidden mb-2">
                  {relatedVideo.thumbnail ? (
                    <img
                      src={relatedVideo.thumbnail}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl">🎬</span>
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-[#2688eb] group-hover:underline line-clamp-2">
                  {relatedVideo.title}
                </h3>
                <p className="text-sm text-[#818c99]">{relatedVideo.user.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
