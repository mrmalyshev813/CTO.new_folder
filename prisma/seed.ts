import { PrismaClient, User, Post, Friendship } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alex@example.com',
        username: 'alex_smith',
        name: 'Alex Smith',
        password: hashedPassword,
        bio: 'Software developer and tech enthusiast',
        city: 'Moscow',
        status: 'Coding something cool',
        isOnline: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'maria@example.com',
        username: 'maria_ivanova',
        name: 'Maria Ivanova',
        password: hashedPassword,
        bio: 'Designer and photographer',
        city: 'Saint Petersburg',
        status: 'Working on new projects',
      },
    }),
    prisma.user.create({
      data: {
        email: 'dmitry@example.com',
        username: 'dmitry_k',
        name: 'Dmitry Kozlov',
        password: hashedPassword,
        bio: 'Music producer',
        city: 'Moscow',
        status: 'In the studio',
      },
    }),
    prisma.user.create({
      data: {
        email: 'elena@example.com',
        username: 'elena_p',
        name: 'Elena Petrova',
        password: hashedPassword,
        bio: 'Travel blogger',
        city: 'Kazan',
        status: 'Planning my next trip',
      },
    }),
    prisma.user.create({
      data: {
        email: 'ivan@example.com',
        username: 'ivan_sidorov',
        name: 'Ivan Sidorov',
        password: hashedPassword,
        bio: 'Gamer and streamer',
        city: 'Novosibirsk',
        status: 'Live streaming',
      },
    }),
  ])

  const posts = await Promise.all([
    prisma.post.create({
      data: {
        content: 'Just deployed my new project! 🚀 Really excited about how it turned out.',
        authorId: users[0].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'Beautiful sunset today! Nature never fails to amaze me 🌅',
        images: JSON.stringify(['https://images.unsplash.com/photo-1495616811223-4d98c6e9c869']),
        authorId: users[1].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'New track coming soon! Stay tuned 🎵',
        authorId: users[2].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'Just visited an amazing coffee shop in the city center. Highly recommend!',
        authorId: users[3].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'Who wants to play some games tonight? 🎮',
        authorId: users[4].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'Learning TypeScript has been a game changer for my productivity',
        authorId: users[0].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'Working on a new photography series about urban architecture',
        authorId: users[1].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'Just finished mixing a new song. Can\'t wait to share it!',
        authorId: users[2].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'Anyone have recommendations for good documentaries to watch?',
        authorId: users[3].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'Stream starting in 30 minutes! Come hang out!',
        authorId: users[4].id,
      },
    }),
  ])

  await Promise.all([
    prisma.like.create({
      data: {
        userId: users[1].id,
        postId: posts[0].id,
      },
    }),
    prisma.like.create({
      data: {
        userId: users[2].id,
        postId: posts[0].id,
      },
    }),
    prisma.like.create({
      data: {
        userId: users[0].id,
        postId: posts[1].id,
      },
    }),
  ])

  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'That\'s awesome! Congrats! 🎉',
        authorId: users[1].id,
        postId: posts[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Great job! Looking forward to seeing more.',
        authorId: users[2].id,
        postId: posts[0].id,
      },
    }),
  ])

  await Promise.all([
    prisma.friendship.create({
      data: {
        userAId: users[0].id,
        userBId: users[1].id,
      },
    }),
    prisma.friendship.create({
      data: {
        userAId: users[0].id,
        userBId: users[2].id,
      },
    }),
    prisma.friendship.create({
      data: {
        userAId: users[1].id,
        userBId: users[3].id,
      },
    }),
    prisma.friendship.create({
      data: {
        userAId: users[2].id,
        userBId: users[4].id,
      },
    }),
  ])

  const groups = await Promise.all([
    prisma.group.create({
      data: {
        name: 'Tech Enthusiasts',
        description: 'A community for tech lovers to share ideas and projects',
        isPublic: true,
        ownerId: users[0].id,
      },
    }),
    prisma.group.create({
      data: {
        name: 'Photography Club',
        description: 'Share your best shots and learn from others',
        isPublic: true,
        ownerId: users[1].id,
      },
    }),
    prisma.group.create({
      data: {
        name: 'Music Producers',
        description: 'Connect with other producers and share your music',
        isPublic: true,
        ownerId: users[2].id,
      },
    }),
  ])

  await Promise.all([
    prisma.groupMember.create({
      data: {
        groupId: groups[0].id,
        userId: users[0].id,
        role: 'admin',
      },
    }),
    prisma.groupMember.create({
      data: {
        groupId: groups[0].id,
        userId: users[1].id,
        role: 'member',
      },
    }),
    prisma.groupMember.create({
      data: {
        groupId: groups[0].id,
        userId: users[2].id,
        role: 'member',
      },
    }),
    prisma.groupMember.create({
      data: {
        groupId: groups[1].id,
        userId: users[1].id,
        role: 'admin',
      },
    }),
    prisma.groupMember.create({
      data: {
        groupId: groups[1].id,
        userId: users[3].id,
        role: 'member',
      },
    }),
  ])

  const albums = await Promise.all([
    prisma.album.create({
      data: {
        title: 'Nature Photography',
        description: 'My best shots of nature',
        userId: users[1].id,
      },
    }),
    prisma.album.create({
      data: {
        title: 'Urban Scenes',
        description: 'City life through my lens',
        userId: users[1].id,
      },
    }),
    prisma.album.create({
      data: {
        title: 'Travel 2024',
        description: 'Memories from my travels',
        userId: users[3].id,
      },
    }),
  ])

  await Promise.all([
    prisma.photo.create({
      data: {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        userId: users[1].id,
        albumId: albums[0].id,
      },
    }),
    prisma.photo.create({
      data: {
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
        userId: users[1].id,
        albumId: albums[0].id,
      },
    }),
    prisma.photo.create({
      data: {
        url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
        userId: users[1].id,
        albumId: albums[1].id,
      },
    }),
  ])

  const tracks = await Promise.all([
    prisma.track.create({
      data: {
        title: 'Summer Vibes',
        artist: 'Dmitry K',
        url: '/uploads/music/track1.mp3',
        userId: users[2].id,
      },
    }),
    prisma.track.create({
      data: {
        title: 'Night Drive',
        artist: 'Dmitry K',
        url: '/uploads/music/track2.mp3',
        userId: users[2].id,
      },
    }),
    prisma.track.create({
      data: {
        title: 'Electric Dreams',
        artist: 'Dmitry K',
        url: '/uploads/music/track3.mp3',
        userId: users[2].id,
      },
    }),
  ])

  await Promise.all([
    prisma.playlist.create({
      data: {
        title: 'My Favorites',
        userId: users[0].id,
      },
    }),
    prisma.playlist.create({
      data: {
        title: 'Chill Vibes',
        userId: users[1].id,
      },
    }),
  ])

  const conversation = await prisma.conversation.create({
    data: {
      isGroup: false,
    },
  })

  await Promise.all([
    prisma.conversationParticipant.create({
      data: {
        conversationId: conversation.id,
        userId: users[0].id,
      },
    }),
    prisma.conversationParticipant.create({
      data: {
        conversationId: conversation.id,
        userId: users[1].id,
      },
    }),
  ])

  await Promise.all([
    prisma.message.create({
      data: {
        content: 'Hey! How are you?',
        senderId: users[0].id,
        conversationId: conversation.id,
      },
    }),
    prisma.message.create({
      data: {
        content: 'I\'m doing great! Just finished a new project.',
        senderId: users[1].id,
        conversationId: conversation.id,
      },
    }),
    prisma.message.create({
      data: {
        content: 'That\'s awesome! What kind of project?',
        senderId: users[0].id,
        conversationId: conversation.id,
      },
    }),
  ])

  await Promise.all([
    prisma.notification.create({
      data: {
        type: 'like',
        message: 'Maria Ivanova liked your post',
        recipientId: users[0].id,
        triggeredBy: users[1].id,
        link: `/`,
      },
    }),
    prisma.notification.create({
      data: {
        type: 'comment',
        message: 'Dmitry K commented on your post',
        recipientId: users[0].id,
        triggeredBy: users[2].id,
        link: `/`,
      },
    }),
  ])

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
