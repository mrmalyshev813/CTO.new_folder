'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

interface Story {
  id: string
  userId: string
  mediaUrl: string
  mediaType: string
  text: string | null
  user: {
    id: string
    name: string
    username: string
    avatar: string | null
  }
  views: Array<{ userId: string }>
  createdAt: string
}

interface StoryViewerProps {
  stories: Story[]
  initialIndex: number
  currentUserId: string
  onClose: () => void
}

export default function StoryViewer({
  stories,
  initialIndex,
  currentUserId,
  onClose,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const STORY_DURATION = 5000 // 5 seconds

  const currentStory = stories[currentIndex]

  const groupedStories = stories.reduce((acc, story) => {
    const userId = story.userId
    if (!acc[userId]) {
      acc[userId] = []
    }
    acc[userId].push(story)
    return acc
  }, {} as Record<string, Story[]>)

  const currentGroup = groupedStories[currentStory.userId] || []
  const storyIndexInGroup = currentGroup.findIndex(s => s.id === currentStory.id)

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext()
          return 0
        }
        return prev + (100 / (STORY_DURATION / 100))
      })
    }, 100)

    return () => clearInterval(interval)
  }, [currentIndex, isPaused])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === ' ') setIsPaused(prev => !prev)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, onClose])

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }, [currentIndex, stories.length, onClose])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setProgress(0)
    }
  }, [currentIndex])

  const handleMarkAsViewed = async () => {
    try {
      await fetch(`/api/stories/${currentStory.id}/view`, {
        method: 'POST',
      })
    } catch (error) {
      console.error('Error marking story as viewed:', error)
    }
  }

  useEffect(() => {
    if (!currentStory.views.some(v => v.userId === currentUserId)) {
      handleMarkAsViewed()
    }
  }, [currentStory.id])

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="relative w-full max-w-md h-full max-h-[90vh] md:rounded-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 z-10 p-2">
          <div className="flex gap-1 mb-2">
            {currentGroup.map((story, index) => (
              <div
                key={story.id}
                className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width: index < storyIndexInGroup 
                      ? '100%' 
                      : index === storyIndexInGroup 
                        ? `${progress}%` 
                        : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStory.user.avatar ? (
                <img
                  src={currentStory.user.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#e1e3e6] flex items-center justify-center">
                  <span className="text-sm font-bold text-[#818c99]">
                    {currentStory.user.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <div className="font-medium text-white">{currentStory.user.name}</div>
                <div className="text-xs text-white/70">
                  {new Date(currentStory.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(prev => !prev)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                {isPaused ? (
                  <Play className="w-5 h-5 text-white" />
                ) : (
                  <Pause className="w-5 h-5 text-white" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div 
          className="absolute inset-0 flex items-center justify-center"
          onClick={() => setIsPaused(prev => !prev)}
        >
          {currentStory.mediaType === 'video' ? (
            <video
              src={currentStory.mediaUrl}
              className="max-w-full max-h-full object-contain"
              autoPlay
              playsInline
              muted
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt=""
              className="max-w-full max-h-full object-contain"
            />
          )}

          {currentStory.text && (
            <div className="absolute bottom-20 left-0 right-0 text-center p-4">
              <p className="text-white text-lg font-medium drop-shadow-lg">
                {currentStory.text}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  )
}
