'use client'

import { useState, useRef, useEffect } from 'react'
import { useMusicStore, Track } from '@/lib/stores/musicStore'
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from 'lucide-react'

export default function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    shuffle,
    repeat,
    play,
    pause,
    next,
    prev,
    setVolume,
    setCurrentTime,
    toggleShuffle,
    toggleRepeat,
  } = useMusicStore()

  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const handlePlayPause = () => {
    if (isPlaying) {
      pause()
      audioRef.current?.pause()
    } else {
      play(currentTrack!)
      audioRef.current?.play()
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      if (progressRef.current) {
        progressRef.current.value = audioRef.current.currentTime.toString()
      }
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const handleEnded = () => {
    if (repeat === 'one') {
      audioRef.current?.play()
    } else {
      next()
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!currentTrack) {
    return null
  }

  const duration = audioRef.current?.duration || 0

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t border-[#d3d9de] z-50 flex items-center px-4">
        <div className="flex items-center gap-3 flex-1 max-w-[1200px] mx-auto">
          {currentTrack.cover ? (
            <img
              src={currentTrack.cover}
              alt=""
              className="w-12 h-12 rounded object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-[#e1e3e6] rounded flex items-center justify-center">
              <span className="text-xl">🎵</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{currentTrack.title}</div>
            <div className="text-sm text-[#818c99] truncate">{currentTrack.artist}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded ${shuffle ? 'text-[#2688eb]' : 'text-[#818c99]'}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={prev}
              className="p-2 rounded text-[#818c99] hover:text-[#000000]"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={handlePlayPause}
              className="vk-button p-2"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={next}
              className="p-2 rounded text-[#818c99] hover:text-[#000000]"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 rounded ${repeat !== 'none' ? 'text-[#2688eb]' : 'text-[#818c99]'}`}
            >
              <Repeat className="w-4 h-4" />
              {repeat === 'one' && <span className="text-xs absolute">1</span>}
            </button>

            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#818c99]" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-[#d3d9de] rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-[#818c99]">
              <span>{formatTime(currentTime)}</span>
              <input
                ref={progressRef}
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-32 h-1 bg-[#d3d9de] rounded-full appearance-none cursor-pointer"
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      )}
    </>
  )
}
