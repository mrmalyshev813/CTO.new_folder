'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import StoryViewer from './StoryViewer'

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

interface StoriesBarProps {
  stories: Story[]
  currentUserId: string
}

export default function StoriesBar({ stories, currentUserId }: StoriesBarProps) {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null)

  const groupedStories = stories.reduce((acc, story) => {
    const userId = story.userId
    if (!acc[userId]) {
      acc[userId] = []
    }
    acc[userId].push(story)
    return acc
  }, {} as Record<string, Story[]>)

  const storyGroups = Object.values(groupedStories)

  const myStories = storyGroups.find(group => group[0].userId === currentUserId)
  const otherStories = storyGroups.filter(group => group[0].userId !== currentUserId)

  return (
    <>
      <div className="bg-white rounded shadow-sm p-4 mb-4">
        <div className="flex gap-4 overflow-x-auto scrollbar-thin pb-2">
          {myStories && myStories.length > 0 ? (
            <button
              onClick={() => setSelectedStoryIndex(0)}
              className="flex-shrink-0 flex flex-col items-center gap-2"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-[#2688eb] to-[#1a5eb8]">
                  {myStories[0].user.avatar ? (
                    <img
                      src={myStories[0].user.avatar}
                      alt=""
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#e1e3e6] flex items-center justify-center border-2 border-white">
                      <span className="text-sm font-bold text-[#818c99]">
                        {myStories[0].user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#2688eb] rounded-full flex items-center justify-center border-2 border-white">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </div>
              <span className="text-xs text-[#000000] truncate w-16 text-center">
                Your Story
              </span>
            </button>
          ) : (
            <button className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-[#f0f2f5] flex items-center justify-center">
                  <Plus className="w-6 h-6 text-[#818c99]" />
                </div>
              </div>
              <span className="text-xs text-[#000000] truncate w-16 text-center">
                Add Story
              </span>
            </button>
          )}

          {otherStories.map((group, index) => {
            const user = group[0].user
            const hasUnviewed = group.some(story => 
              !story.views.some(v => v.userId === currentUserId)
            )

            return (
              <button
                key={user.id}
                onClick={() => setSelectedStoryIndex(myStories && myStories.length > 0 ? index + 1 : index)}
                className="flex-shrink-0 flex flex-col items-center gap-2"
              >
                <div className={`w-16 h-16 rounded-full p-0.5 ${
                  hasUnviewed 
                    ? 'bg-gradient-to-br from-[#2688eb] to-[#1a5eb8]'
                    : 'bg-[#d3d9de]'
                }`}>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#e1e3e6] flex items-center justify-center border-2 border-white">
                      <span className="text-sm font-bold text-[#818c99]">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-[#000000] truncate w-16 text-center">
                  {user.name.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={selectedStoryIndex}
          currentUserId={currentUserId}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}
    </>
  )
}
