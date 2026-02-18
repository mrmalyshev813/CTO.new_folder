'use client'

import { useState } from 'react'
import { Image, Video, Music, FileText, MapPin } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'

export default function PostComposer() {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please write something')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        setContent('')
        toast.success('Post published!')
        window.location.reload()
      } else {
        toast.error('Failed to publish post')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded shadow-sm p-4">
      <div className="flex gap-3">
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-[#e1e3e6] rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-[#818c99]">
              {session?.user?.name?.charAt(0)}
            </span>
          </div>
        )}

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full border border-[#d3d9de] rounded p-2 text-sm resize-none focus:outline-none focus:border-[#2688eb] min-h-[80px]"
            rows={3}
          />

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#d3d9de]">
            <div className="flex gap-1">
              <button className="p-2 hover:bg-[#f0f2f5] rounded text-[#818c99] transition-colors" title="Add photo">
                <Image className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-[#f0f2f5] rounded text-[#818c99] transition-colors" title="Add video">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-[#f0f2f5] rounded text-[#818c99] transition-colors" title="Add music">
                <Music className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-[#f0f2f5] rounded text-[#818c99] transition-colors" title="Add document">
                <FileText className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-[#f0f2f5] rounded text-[#818c99] transition-colors" title="Add location">
                <MapPin className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className="vk-button px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
