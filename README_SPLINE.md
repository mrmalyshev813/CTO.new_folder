# NLABTEAM Smart Parser - Spline 3D Search Interface

A modern Next.js application featuring AI-powered search with stunning Spline 3D visualization.

## 🚀 Features

- **Spline 3D Visualization**: Interactive 3D scene on the right side of the interface
- **AI-Powered Search**: OpenAI GPT-4o-mini integration for intelligent responses
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: Framer Motion for beautiful transitions
- **Secure API**: OpenAI API key is stored server-side, never exposed to the client

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **3D Visualization**: Spline (@splinetool/react-spline)
- **Animations**: Framer Motion
- **AI**: OpenAI GPT-4o-mini
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   ⚠️ **IMPORTANT**: Never commit `.env.local` to version control. It's already in `.gitignore`.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
/home/engine/project/
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.ts          # OpenAI API endpoint (server-side)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   └── ui/
│       ├── card.tsx              # shadcn Card component
│       ├── demo.tsx              # Main search interface
│       ├── spline.tsx            # Spline 3D scene wrapper
│       └── spotlight.tsx         # Spotlight effect component
├── lib/
│   └── utils.ts                  # Utility functions (cn helper)
├── public/                       # Static assets
├── .env.local                    # Environment variables (not in Git)
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── next.config.ts                # Next.js configuration
```

## 🔐 Security

### API Key Management

This application follows security best practices:

- ✅ API keys are stored in `.env.local` (server-side only)
- ✅ `.env.local` is in `.gitignore` and never committed
- ✅ OpenAI API calls are made from `/app/api/search/route.ts` (backend)
- ✅ Frontend only communicates with the backend API route
- ❌ API keys are NEVER exposed to the client/browser

### API Route

The search functionality uses a Next.js API route at `/api/search`:

```typescript
// Frontend calls the backend API route
const response = await fetch("/api/search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});

// Backend route uses the API key securely
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side only
});
```

## 🎨 Components

### SplineScene
Lazy-loaded Spline 3D visualization with suspense fallback.

### Spotlight
Animated spotlight effect for visual enhancement.

### Card
shadcn/ui card component for clean content presentation.

### Demo
Main component integrating search interface and Spline visualization.

## 🚀 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📱 Responsive Design

The application is fully responsive:

- **Desktop**: Side-by-side search interface and 3D visualization
- **Mobile**: Stacked layout with touch-friendly controls
- **Tablet**: Optimized for medium screen sizes

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variable: `OPENAI_API_KEY`
4. Deploy

### Other Platforms

Make sure to:
- Set the `OPENAI_API_KEY` environment variable
- Use Node.js 18+ runtime
- Build command: `npm run build`
- Output directory: `.next`

## 🎯 Usage

1. Enter your search query in the input field
2. Click "Search" or press Enter
3. The AI will process your query and display results
4. Enjoy the interactive 3D visualization while you search

## 📝 License

MIT

## 🙏 Credits

- **Spline**: 3D design tool and runtime
- **OpenAI**: GPT-4o-mini API
- **shadcn/ui**: Beautiful UI components
- **Vercel**: Next.js framework

---

Built with ❤️ by NLABTEAM
