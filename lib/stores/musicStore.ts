import { create } from 'zustand'

export interface Track {
  id: string
  title: string
  artist: string
  url: string
  cover?: string | null
  duration?: number | null
}

interface MusicStore {
  currentTrack: Track | null
  queue: Track[]
  isPlaying: boolean
  volume: number
  currentTime: number
  shuffle: boolean
  repeat: 'none' | 'one' | 'all'
  play: (track: Track) => void
  pause: () => void
  next: () => void
  prev: () => void
  setVolume: (v: number) => void
  setCurrentTime: (t: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  setQueue: (tracks: Track[]) => void
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 1,
  currentTime: 0,
  shuffle: false,
  repeat: 'none',
  play: (track) => set({ currentTrack: track, isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  next: () => {
    const { queue, currentTrack, shuffle } = get()
    if (queue.length === 0) return
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id)
    let nextIndex
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length)
    } else {
      nextIndex = (currentIndex + 1) % queue.length
    }
    set({ currentTrack: queue[nextIndex], isPlaying: true })
  },
  prev: () => {
    const { queue, currentTrack } = get()
    if (queue.length === 0) return
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id)
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1
    set({ currentTrack: queue[prevIndex], isPlaying: true })
  },
  setVolume: (v) => set({ volume: v }),
  setCurrentTime: (t) => set({ currentTime: t }),
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  toggleRepeat: () => set((state) => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'all', 'one']
    const currentIndex = modes.indexOf(state.repeat)
    return { repeat: modes[(currentIndex + 1) % modes.length] }
  }),
  setQueue: (tracks) => set({ queue: tracks }),
}))
