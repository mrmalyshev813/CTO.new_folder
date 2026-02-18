export type UserWithRelations = {
  id: string
  email: string
  username: string
  name: string
  avatar: string | null
  cover: string | null
  bio: string | null
  city: string | null
  birthday: Date | null
  status: string | null
  isOnline: boolean
  lastSeen: Date
  createdAt: Date
  _count?: {
    friends?: number
    posts?: number
  }
}

export type PostWithAuthor = {
  id: string
  content: string
  images: string | null
  createdAt: Date
  author: {
    id: string
    username: string
    name: string
    avatar: string | null
  }
  _count?: {
    likes: number
    comments: number
  }
  likes?: Array<{ userId: string }>
}

export type MessageWithSender = {
  id: string
  content: string
  createdAt: Date
  isRead: boolean
  sender: {
    id: string
    username: string
    name: string
    avatar: string | null
  }
}

export type ConversationWithParticipants = {
  id: string
  isGroup: boolean
  name: string | null
  avatar: string | null
  participants: Array<{
    user: {
      id: string
      username: string
      name: string
      avatar: string | null
      isOnline: boolean
    }
  }>
  messages: MessageWithSender[]
  _count?: {
    participants: number
  }
}
