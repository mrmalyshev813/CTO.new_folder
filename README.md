# VK.com Clone

A fully functional VK.com social network clone built with Next.js 14, Prisma, SQLite, and Tailwind CSS.

## Features

- **User Authentication**: Register and login with secure password hashing
- **Profile Management**: Customizable profile with avatar, cover, bio, and personal info
- **Social Feed**: News feed with posts, likes, and comments
- **Friends System**: Send and accept friend requests
- **Messaging**: Real-time private messaging with conversation history
- **Photos**: Upload photos and organize them into albums
- **Music**: Listen to tracks with a built-in music player
- **Videos**: Watch and upload videos
- **Groups**: Create and join communities
- **Documents**: Upload and manage documents
- **Market**: Buy and sell items
- **Notifications**: Stay updated with your activities

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js v4
- **Styling**: Tailwind CSS
- **Real-time**: Pusher (for messaging)
- **State Management**: Zustand
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

The `.env.local` file already contains default values for local development.

3. Initialize the database:
```bash
npm run db:push
```

4. Seed the database with demo data:
```bash
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

The database seed includes these demo users (all with password: `password123`):

- **alex@example.com** - Alex Smith (Software developer)
- **maria@example.com** - Maria Ivanova (Designer)
- **dmitry@example.com** - Dmitry Kozlov (Music producer)
- **elena@example.com** - Elena Petrova (Travel blogger)
- **ivan@example.com** - Ivan Sidorov (Gamer)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (main)/            # Main application pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── feed/             # Feed components (PostCard, PostComposer)
│   ├── friends/          # Friends components
│   ├── layout/           # Layout components (Header, Sidebar)
│   ├── messages/         # Messaging components
│   ├── music/            # Music player components
│   ├── profile/          # Profile components
│   ├── settings/         # Settings components
│   └── ui/               # Shared UI components
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth configuration
│   ├── pusher.ts         # Pusher server configuration
│   └── stores/           # Zustand stores
├── prisma/               # Prisma schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seed file
├── public/               # Static assets
│   └── uploads/          # User uploaded files
└── types/                # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with demo data
- `npm run db:studio` - Open Prisma Studio

## Features Overview

### Authentication
- Secure registration with email validation
- JWT-based sessions with NextAuth
- Password hashing with bcrypt

### Social Features
- Create, like, and comment on posts
- Add and remove friends
- Real-time messaging
- Photo albums with lightbox
- Music streaming with playlist support
- Video uploads and playback
- Group communities
- Document management
- Marketplace for buying/selling

### UI/UX
- VK-accurate design with dark blue theme
- Responsive layout (mobile-friendly)
- Three-column layout on desktop
- Real-time updates
- Smooth transitions and animations

## Development Notes

### Database
The project uses SQLite for simplicity. The database file (`dev.db`) is created automatically when you run `npm run db:push`.

### File Uploads
User uploads are stored in `public/uploads/`. In production, you should use a cloud storage service like AWS S3.

### Real-time Features
The project is configured to use Pusher for real-time messaging. For local development, you can either:
- Use a free Pusher account
- Use Soketi (self-hosted Pusher alternative)
- Implement polling fallback

## Contributing

This is a demonstration project. Feel free to fork and modify it for your own use.

## License

MIT

## Acknowledgments

- Built as a learning project to demonstrate full-stack Next.js development
- UI inspired by VK.com
- Uses shadcn/ui components for the design system
