import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { User, Users, FileText, Music, Video, Image } from 'lucide-react'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const query = searchParams.q || ''
  const type = searchParams.type || 'all'

  let users: any[] = []
  let groups: any[] = []
  let posts: any[] = []

  if (query) {
    users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    })

    groups = await prisma.group.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
        isPublic: true,
      },
      take: 10,
    })

    posts = await prisma.post.findMany({
      where: {
        content: { contains: query, mode: 'insensitive' },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
      take: 10,
    })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#2a5885]">Search</h1>

      <div className="bg-white rounded shadow-sm p-4">
        <form className="mb-4">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search..."
            className="vk-input w-full"
          />
        </form>

        <div className="flex gap-2 mb-4">
          <button
            className={`px-3 py-1.5 rounded text-sm ${
              type === 'all' ? 'bg-[#2688eb] text-white' : 'bg-[#f0f2f5]'
            }`}
          >
            All
          </button>
          <button
            className={`px-3 py-1.5 rounded text-sm ${
              type === 'people' ? 'bg-[#2688eb] text-white' : 'bg-[#f0f2f5]'
            }`}
          >
            People
          </button>
          <button
            className={`px-3 py-1.5 rounded text-sm ${
              type === 'groups' ? 'bg-[#2688eb] text-white' : 'bg-[#f0f2f5]'
            }`}
          >
            Groups
          </button>
          <button
            className={`px-3 py-1.5 rounded text-sm ${
              type === 'posts' ? 'bg-[#2688eb] text-white' : 'bg-[#f0f2f5]'
            }`}
          >
            Posts
          </button>
        </div>

        {!query ? (
          <p className="text-[#818c99] text-center py-8">
            Enter a search term to find people, groups, or posts
          </p>
        ) : (
          <div className="space-y-6">
            {users.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  People ({users.length})
                </h2>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 hover:bg-[#f0f2f5] rounded cursor-pointer"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#e1e3e6] rounded-full" />
                      )}
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-[#818c99]">{user.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {groups.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Groups ({groups.length})
                </h2>
                <div className="space-y-2">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center gap-3 p-2 hover:bg-[#f0f2f5] rounded cursor-pointer"
                    >
                      {group.avatar ? (
                        <img
                          src={group.avatar}
                          alt=""
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#e1e3e6] rounded flex items-center justify-center">
                          <Users className="w-5 h-5 text-[#818c99]" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{group.name}</div>
                        <div className="text-sm text-[#818c99]">{group.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {posts.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Posts ({posts.length})
                </h2>
                <div className="space-y-2">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="p-3 hover:bg-[#f0f2f5] rounded cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {post.author.avatar ? (
                          <img
                            src={post.author.avatar}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-[#e1e3e6] rounded-full" />
                        )}
                        <span className="text-sm font-medium">{post.author.name}</span>
                      </div>
                      <p className="text-sm text-[#000000] line-clamp-2">{post.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {users.length === 0 && groups.length === 0 && posts.length === 0 && (
              <p className="text-[#818c99] text-center py-8">
                No results found for "{query}"
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
