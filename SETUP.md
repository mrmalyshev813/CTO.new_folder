# VK Clone - Setup Guide

This guide will help you set up and run the VK.com clone on your local machine.

## Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher (or yarn 1.22+)
- **Git** (for version control)

## Installation Steps

### 1. Clone or Navigate to the Project

If you have the project files, navigate to the project directory:

```bash
cd /path/to/vk-clone
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- Prisma (ORM)
- NextAuth.js (Authentication)
- React Hot Toast (Notifications)
- Zustand (State Management)
- Tailwind CSS (Styling)
- And many more...

### 3. Environment Configuration

The project includes a `.env.local` file with default values for local development. You don't need to modify it for basic functionality.

Default environment variables:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="vk-clone-super-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
PUSHER_APP_ID="vk_clone_app"
PUSHER_KEY="vk_clone_key"
PUSHER_SECRET="vk_clone_secret"
PUSHER_CLUSTER="eu"
NEXT_PUBLIC_PUSHER_KEY="vk_clone_key"
NEXT_PUBLIC_PUSHER_CLUSTER="eu"
```

### 4. Initialize the Database

Run the Prisma migration to create the SQLite database:

```bash
npm run db:push
```

This will create a `dev.db` file in the project root with all the required tables.

### 5. Seed the Database

Populate the database with demo data (5 users, posts, friends, etc.):

```bash
npm run db:seed
```

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Demo Accounts

After seeding, you can log in with these accounts (password: `password123` for all):

| Email | Name | Description |
|-------|------|-------------|
| alex@example.com | Alex Smith | Software developer |
| maria@example.com | Maria Ivanova | Designer and photographer |
| dmitry@example.com | Dmitry Kozlov | Music producer |
| elena@example.com | Elena Petrova | Travel blogger |
| ivan@example.com | Ivan Sidorov | Gamer and streamer |

## Available Features

### Core Features
- ✅ User Registration & Login
- ✅ Profile Management
- ✅ News Feed with Posts
- ✅ Like & Comment System
- ✅ Friend Requests
- ✅ Private Messaging
- ✅ Photo Albums
- ✅ Music Player
- ✅ Video Gallery
- ✅ Groups/Communities
- ✅ Documents
- ✅ Marketplace
- ✅ Notifications
- ✅ Search

### Navigation

- **My Page** (`/`) - Your profile and posts
- **Friends** (`/friends`) - Manage friends and requests
- **Messages** (`/messages`) - Private conversations
- **News** (`/news`) - Feed from friends
- **Photos** (`/photos`) - Photo albums
- **Music** (`/music`) - Listen to music
- **Video** (`/video`) - Watch videos
- **Groups** (`/groups`) - Join communities
- **Documents** (`/documents`) - Your files
- **Market** (`/market`) - Buy and sell items
- **Notifications** (`/notifications`) - Activity updates
- **Settings** (`/settings`) - Account settings
- **Search** (`/search`) - Find people, groups, posts

## Development Tools

### Prisma Studio

View and edit your database visually:

```bash
npm run db:studio
```

This opens a web-based database viewer at http://localhost:5555.

### Linting

Check for code issues:

```bash
npm run lint
```

### Building for Production

Create an optimized production build:

```bash
npm run build
```

Run the production server:

```bash
npm run start
```

## Database Management

### Reset Database

To start fresh:

```bash
rm dev.db*
npm run db:push
npm run db:seed
```

### View Database Schema

```bash
npx prisma studio
```

Or open `prisma/schema.prisma` to see the full schema.

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can specify a different port:

```bash
PORT=3001 npm run dev
```

### Database Errors

If you encounter database errors, try resetting the database:

```bash
rm dev.db*
npm run db:push
npm run db:seed
```

### Module Not Found Errors

If you see module not found errors, reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Project Structure

```
vk-clone/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (main)/            # Main app pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── feed/             # Feed components
│   ├── friends/          # Friend components
│   ├── layout/           # Layout components
│   ├── messages/         # Message components
│   ├── music/            # Music components
│   ├── profile/          # Profile components
│   ├── settings/         # Settings components
│   └── ui/               # Shared UI components
├── lib/                   # Utilities
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # Auth config
│   └── stores/           # State stores
├── prisma/               # Database
│   ├── schema.prisma     # Schema definition
│   └── seed.ts           # Seed data
└── public/               # Static assets
    └── uploads/          # User uploads
```

## Next Steps

1. **Customize the UI**: Modify the Tailwind config to change colors and styles
2. **Add Features**: Extend the schema and add new pages
3. **Deploy**: Deploy to Vercel, Netlify, or your own server
4. **Add Tests**: Add unit and integration tests

## Deployment

For production deployment:

1. Change `NEXTAUTH_SECRET` to a secure random string
2. Configure a production database (PostgreSQL recommended)
3. Set up cloud storage for file uploads (AWS S3, Cloudinary, etc.)
4. Configure Pusher for real-time messaging
5. Build and deploy:

```bash
npm run build
```

Then deploy the `.next` folder and `public` folder to your hosting platform.

## Support

For issues or questions, refer to the project README or check the Next.js and Prisma documentation.

---

Happy coding! 🚀
