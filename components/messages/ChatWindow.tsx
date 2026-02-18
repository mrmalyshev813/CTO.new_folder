'use client'

import { useState, useRef, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Send, MoreVertical, Phone, Video, Info } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ChatWindowProps {
  conversation: any
  otherUser: any
  currentUserId: string
}

export default function ChatWindow({ conversation, otherUser, currentUserId }: ChatWindowProps) {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation.messages])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    try {
      const response = await fetch(`/api/messages/${conversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      })

      if (response.ok) {
        setMessage('')
        window.location.reload()
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-[#d3d9de]">
        <div className="flex items-center gap-3">
          {otherUser?.avatar ? (
            <div className="relative">
              <img
                src={otherUser.avatar}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              {otherUser.isOnline && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#4bb34b] border-2 border-white rounded-full" />
              )}
            </div>
          ) : (
            <div className="w-10 h-10 bg-[#e1e3e6] rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-[#818c99]">
                {otherUser?.name?.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <div className="font-medium">{otherUser?.name}</div>
            <div className="text-xs text-[#818c99]">
              {otherUser?.isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#f0f2f5] rounded text-[#818c99]">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-[#f0f2f5] rounded text-[#818c99]">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-[#f0f2f5] rounded text-[#818c99]">
            <Info className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-[#f0f2f5] rounded text-[#818c99]">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {conversation.messages.map((msg: any) => {
          const isOwn = msg.senderId === currentUserId

          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    isOwn
                      ? 'bg-[#2688eb] text-white'
                      : 'bg-[#e5ebf1] text-[#000000]'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
                <div
                  className={`text-xs text-[#818c99] mt-1 ${
                    isOwn ? 'text-right' : 'text-left'
                  }`}
                >
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-[#d3d9de]">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#f0f2f5] rounded text-[#818c99]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 border border-[#d3d9de] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#2688eb]"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />

          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-2 hover:bg-[#f0f2f5] rounded text-[#2688eb] disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
