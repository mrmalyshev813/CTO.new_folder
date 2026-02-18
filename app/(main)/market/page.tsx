import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function MarketPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
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
    take: 20,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#2a5885]">Market</h1>
        <button className="vk-button text-sm px-3 py-1.5">Sell Item</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/market/${product.id}`}
            className="bg-white rounded shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-[#e1e3e6]">
              {product.images && JSON.parse(product.images).length > 0 ? (
                <img
                  src={JSON.parse(product.images)[0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">🛍️</span>
                </div>
              )}
            </div>

            <div className="p-3">
              <div className="font-bold text-[#2688eb] text-lg mb-1">
                {product.price.toFixed(2)} {product.currency}
              </div>
              <h3 className="font-medium line-clamp-2 mb-2">{product.title}</h3>
              <div className="flex items-center gap-2">
                {product.user.avatar ? (
                  <img
                    src={product.user.avatar}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 bg-[#e1e3e6] rounded-full" />
                )}
                <span className="text-sm text-[#818c99] truncate">
                  {product.user.name}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <div className="bg-white rounded shadow-sm p-8 text-center">
          <p className="text-[#818c99]">No items for sale yet. Be the first to sell something!</p>
        </div>
      )}
    </div>
  )
}
