import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import FriendCard from '@/components/friends/FriendCard'

export default async function FriendsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      friendsA: {
        include: {
          userB: true,
        },
      },
      friendsB: {
        include: {
          userA: true,
        },
      },
      receivedRequests: {
        where: { status: 'pending' },
        include: {
          requester: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  const friends = [
    ...user.friendsA.map((f: any) => f.userB),
    ...user.friendsB.map((f: any) => f.userA),
  ]

  const friendRequests = user.receivedRequests

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#2a5885]">Friends</h1>

      {friendRequests.length > 0 && (
        <div className="bg-white rounded shadow-sm p-4">
          <h2 className="font-semibold mb-3">Friend Requests ({friendRequests.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friendRequests.map((request: any) => (
              <FriendCard
                key={request.id}
                user={request.requester}
                requestId={request.id}
              />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow-sm p-4">
        <h2 className="font-semibold mb-3">All Friends ({friends.length})</h2>
        {friends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend: any) => (
              <FriendCard key={friend.id} user={friend} />
            ))}
          </div>
        ) : (
          <p className="text-[#818c99] text-center py-8">
            No friends yet. Add some friends to see them here!
          </p>
        )}
      </div>
    </div>
  )
}
