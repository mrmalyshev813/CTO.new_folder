'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ThumbsUp, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react'
import { PostWithAuthor } from '@/types'
import { toast } from 'react-hot-toast'

interface PostCardProps {
  post: PostWithAuthor
  currentUserId: string
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(
    post.likes?.some(like => like.userId === currentUserId) || false
  )
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
      }
    } catch (error) {
      toast.error('Failed to like post')
    }
  }

  const handleComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        setNewComment('')
        toast.success('Comment added!')
        window.location.reload()
      }
    } catch (error) {
      toast.error('Failed to add comment')
    }
  }

  const images = post.images ? JSON.parse(post.images) : []

  return (
    <div className="bg-white rounded shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <Link href={`/${post.author.username}`} className="flex items-center gap-3">
          {post.author.avatar ? (
            <img
              src={post.author.avatar}
              alt=""
              className="w-10 h-10 rounded object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-[#e1e3e6] rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-[#818c99]">
                {post.author.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <div className="font-medium text-[#2688eb] hover:underline">
              {post.author.name}
            </div>
            <div className="text-xs text-[#818c99]">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>
        </Link>

        <button className="p-1 hover:bg-[#f0f2f5] rounded">
          <MoreHorizontal className="w-4 h-4 text-[#818c99]" />
        </button>
      </div>

      {post.content && (
        <p className="text-[#000000] mb-3 whitespace-pre-wrap">{post.content}</p>
      )}

      {images.length > 0 && (
        <div className={`grid gap-1 mb-3 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {images.map((image: string, index: number) => (
            <img
              key={index}
              src={image}
              alt=""
              className="rounded object-cover max-h-[400px] w-full"
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-[#d3d9de]">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm transition-colors ${
              isLiked ? 'text-[#2688eb]' : 'text-[#818c99] hover:text-[#000000]'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-sm text-[#818c99] hover:text-[#000000] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post._count?.comments || 0}</span>
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

      {showComments && (
        <div className="mt-4 pt-4 border-t border-[#d3d9de]">
          <div className="space-y-3 mb-3 max-h-[200px] overflow-y-auto scrollbar-thin">
            {post.comments?.slice(0, 3).map((comment) => (
              <div key={comment.id} className="flex gap-2 text-sm">
                <div className="w-8 h-8 bg-[#e1e3e6] rounded-full flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#818c99]">
                    {comment.author.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <Link
                    href={`/${comment.author.username}`}
                    className="font-medium text-[#2688eb] hover:underline"
                  >
                    {comment.author.name}
                  </Link>
                  <span className="text-[#000000] ml-1">{comment.content}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-[#d3d9de] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#2688eb]"
              onKeyPress={(e) => e.key === 'Enter' && handleComment()}
            />
            <button
              onClick={handleComment}
              className="vk-button px-3 py-1.5 text-sm disabled:opacity-50"
              disabled={!newComment.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
