# VK Clone

A fully functional VK.com social network clone built with Next.js 14, Prisma, SQLite, and NextAuth.

## Features

- 🔐 **Authentication** - Register, login, logout with NextAuth
- 👤 **User Profiles** - Customizable profiles with avatar, cover photo, bio, status
- 📰 **News Feed** - Posts from friends with likes, comments, and shares
- 👥 **Friends System** - Send, accept, decline friend requests
- 💬 **Messages** - Real-time messaging with conversations
- 📸 **Photos** - Upload photos, create albums, like and comment
- 🎵 **Music** - Music player with playlists
- 🎬 **Videos** - Upload and watch videos
- 📚 **Groups** - Create and join communities
- 📄 **Documents** - Upload and share files
- 🛍️ **Market** - Buy and sell items
- 📱 **Stories** - Share temporary photos/videos that expire after 24 hours
- 🔔 **Notifications** - Get notified about likes, comments, friend requests
- ⚙️ **Settings** - Customize your profile and preferences

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Authentication**: NextAuth.js v4
- **Real-time**: Pusher (or polling fallback)
- **State Management**: Zustand
- **UI Components**: Custom VK-styled components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create the database and run migrations:
```bash
npm run db:push
```

3. Seed the database with demo data:
```bash
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Credentials

Use these accounts to test the application:

- **Email**: `alex@example.com` | **Password**: `password123`
- **Email**: `maria@example.com` | **Password**: `password123`
- **Email**: `dmitry@example.com` | **Password**: `password123`
- **Email**: `elena@example.com` | **Password**: `password123`
- **Email**: `ivan@example.com` | **Password**: `password123`

## Project Structure

```
├── app/
│   ├── (auth)/           # Authentication pages (login, register)
│   ├── (main)/           # Main application pages
│   │   ├── friends/      # Friends management
│   │   ├── groups/       # Groups/communities
│   │   ├── market/       # Marketplace
│   │   ├── messages/     # Messaging
│   │   ├── music/        # Music player
│   │   ├── news/         # News feed
│   │   ├── notifications/# Notifications
│   │   ├── photos/       # Photo albums
│   │   ├── search/       # Search functionality
│   │   ├── settings/     # User settings
│   │   ├── video/        # Video section
│   │   └── [username]/   # User profiles
│   ├── api/              # API routes
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/
│   ├── feed/             # Post-related components
│   ├── friends/          # Friend-related components
│   ├── layout/           # Layout components (Header, Sidebars)
│   ├── messages/         # Messaging components
│   ├── music/            # Music player components
│   ├── profile/          # Profile components
│   ├── settings/         # Settings components
│   ├── stories/          # Stories components
│   └── ui/               # Reusable UI components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   ├── pusher.ts         # Pusher server client
│   ├── pusher-client.ts  # Pusher browser client
│   └── stores/           # Zustand stores
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
├── public/
│   └── uploads/          # User-uploaded files
└── types/                # TypeScript type definitions
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="your-pusher-cluster"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with demo data
- `npm run db:studio` - Open Prisma Studio

## VK Styling

This clone closely matches VK.com's visual design:

- **Header**: Dark blue (#2a5885) with white text
- **Primary Blue**: #2688eb
- **Background**: Light grey (#e1e3e6)
- **Cards**: White with subtle shadows
- **Online Status**: Green dot (#4bb34b)
- **Typography**: System fonts (San Francisco, Helvetica Neue, Arial)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is for educational purposes only. VK is a trademark of VK Company Ltd.
