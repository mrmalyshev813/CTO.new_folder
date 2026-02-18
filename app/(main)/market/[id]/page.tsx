import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ShoppingBag, MessageSquare, Heart, Share, Flag } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default async function MarketItemPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          city: true,
          isOnline: true,
        },
      },
      group: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!product) {
    notFound()
  }

  const images = product.images ? JSON.parse(product.images) : []

  return (
    <div className="space-y-4">
      <div className="bg-white rounded shadow-sm p-4">
        <Link href="/market" className="text-[#2688eb] hover:underline text-sm">
          ← Back to Market
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow-sm overflow-hidden">
          {images.length > 0 ? (
            <div className="space-y-2">
              <div className="aspect-square bg-[#e1e3e6]">
                <img
                  src={images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto scrollbar-thin">
                  {images.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt=""
                      className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square bg-[#e1e3e6] flex items-center justify-center">
              <ShoppingBag className="w-24 h-24 text-[#818c99]" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded shadow-sm p-4">
            <div className="text-3xl font-bold text-[#2688eb] mb-2">
              {product.price.toFixed(2)} {product.currency}
            </div>

            <h1 className="text-xl font-bold text-[#2a5885] mb-2">{product.title}</h1>

            <div className="flex items-center gap-4 text-sm text-[#818c99] mb-4">
              <span>
                {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}
              </span>
              {product.category && (
                <span className="px-2 py-1 bg-[#f0f2f5] rounded">
                  {product.category}
                </span>
              )}
              {product.condition && (
                <span className={`px-2 py-1 rounded ${
                  product.condition === 'new' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {product.condition === 'new' ? 'New' : 'Used'}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 vk-button py-3 flex items-center justify-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Buy Now
              </button>
              <button className="flex-1 vk-button-secondary py-3 flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Contact Seller
              </button>
            </div>

            <div className="flex gap-2 mt-3 pt-3 border-t border-[#d3d9de]">
              <button className="flex-1 flex items-center justify-center gap-2 text-sm text-[#818c99] hover:text-[#000000] transition-colors py-2">
                <Heart className="w-4 h-4" />
                Add to Favorites
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 text-sm text-[#818c99] hover:text-[#000000] transition-colors py-2">
                <Share className="w-4 h-4" />
                Share
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 text-sm text-[#818c99] hover:text-[#000000] transition-colors py-2">
                <Flag className="w-4 h-4" />
                Report
              </button>
            </div>
          </div>

          <div className="bg-white rounded shadow-sm p-4">
            <h2 className="font-semibold mb-3">Seller</h2>
            <Link
              href={`/${product.user.username}`}
              className="flex items-center gap-3 hover:bg-[#f0f2f5] p-2 rounded transition-colors"
            >
              {product.user.avatar ? (
                <div className="relative">
                  <img
                    src={product.user.avatar}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  {product.user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4bb34b] border-2 border-white rounded-full" />
                  )}
                </div>
              ) : (
                <div className="w-14 h-14 bg-[#e1e3e6] rounded-full flex items-center justify-center relative">
                  <span className="text-xl font-bold text-[#818c99]">
                    {product.user.name.charAt(0)}
                  </span>
                  {product.user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4bb34b] border-2 border-white rounded-full" />
                  )}
                </div>
              )}
              <div>
                <div className="font-medium text-[#2688eb]">{product.user.name}</div>
                {product.user.city && (
                  <div className="text-sm text-[#818c99]">{product.user.city}</div>
                )}
              </div>
            </Link>
          </div>

          {product.description && (
            <div className="bg-white rounded shadow-sm p-4">
              <h2 className="font-semibold mb-3">Description</h2>
              <p className="text-[#000000] whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {product.group && (
            <div className="bg-white rounded shadow-sm p-4">
              <h2 className="font-semibold mb-3">Listed in</h2>
              <Link
                href={`/groups/${product.group.id}`}
                className="text-[#2688eb] hover:underline"
              >
                {product.group.name}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
