import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MusicPlayer from '@/components/music/MusicPlayer'

export default async function MusicPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const tracks = await prisma.track.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  })

  const playlists = await prisma.playlist.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      tracks: {
        include: {
          track: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#2a5885]">Music</h1>

      <div className="bg-white rounded shadow-sm p-4">
        <h2 className="font-semibold mb-4">My Playlists</h2>
        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="bg-[#f0f2f5] rounded p-4">
                {playlist.cover ? (
                  <img
                    src={playlist.cover}
                    alt=""
                    className="w-full aspect-square object-cover rounded mb-3"
                  />
                ) : (
                  <div className="w-full aspect-square bg-[#e1e3e6] rounded mb-3 flex items-center justify-center">
                    <span className="text-4xl">🎵</span>
                  </div>
                )}
                <h3 className="font-medium">{playlist.title}</h3>
                <p className="text-sm text-[#818c99]">
                  {playlist.tracks.length} track{playlist.tracks.length !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#818c99] text-center py-8">
            No playlists yet. Create your first playlist!
          </p>
        )}
      </div>

      <div className="bg-white rounded shadow-sm p-4">
        <h2 className="font-semibold mb-4">All Tracks</h2>
        {tracks.length > 0 ? (
          <div className="space-y-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-3 p-2 hover:bg-[#f0f2f5] rounded cursor-pointer"
              >
                {track.cover ? (
                  <img
                    src={track.cover}
                    alt=""
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#e1e3e6] rounded flex items-center justify-center">
                    <span className="text-xl">🎵</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium">{track.title}</div>
                  <div className="text-sm text-[#818c99]">{track.artist}</div>
                </div>
                {track.duration && (
                  <div className="text-sm text-[#818c99]">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#818c99] text-center py-8">
            No tracks available yet.
          </p>
        )}
      </div>

      <MusicPlayer />
    </div>
  )
}
