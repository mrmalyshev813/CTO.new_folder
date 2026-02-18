'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  User,
  Users,
  MessageSquare,
  Newspaper,
  Image,
  Music,
  Video,
  Building2,
  FileText,
  ShoppingBag,
  Settings,
} from 'lucide-react'

interface LeftSidebarProps {
  user: any
}

export default function LeftSidebar({ user }: LeftSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: User, label: 'My Page' },
    { href: '/friends', icon: Users, label: 'Friends' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/news', icon: Newspaper, label: 'News' },
    { href: '/photos', icon: Image, label: 'Photos' },
    { href: '/music', icon: Music, label: 'Music' },
    { href: '/video', icon: Video, label: 'Video' },
    { href: '/groups', icon: Building2, label: 'Groups' },
    { href: '/documents', icon: FileText, label: 'Documents' },
    { href: '/market', icon: ShoppingBag, label: 'Market' },
  ]

  return (
    <aside className="hidden lg:block w-[220px] bg-white min-h-[calc(100vh-48px)] sticky top-[48px] overflow-y-auto scrollbar-thin">
      <div className="p-3">
        <Link
          href={`/${user?.username || 'profile'}`}
          className="flex items-center gap-3 p-2 hover:bg-[#f0f2f5] rounded transition-colors"
        >
          {user?.image ? (
            <img src={user.image} alt="" className="w-12 h-12 rounded" />
          ) : (
            <div className="w-12 h-12 bg-[#e1e3e6] rounded flex items-center justify-center">
              <User className="w-6 h-6 text-[#818c99]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{user?.name}</div>
            <div className="text-xs text-[#818c99] truncate">{user?.username}</div>
          </div>
        </Link>

        <nav className="mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-[#e5ebf1] text-[#2688eb] font-medium'
                    : 'text-[#000000] hover:bg-[#f0f2f5]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <hr className="my-3 border-[#d3d9de]" />

        <nav>
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
              pathname === '/settings'
                ? 'bg-[#e5ebf1] text-[#2688eb] font-medium'
                : 'text-[#000000] hover:bg-[#f0f2f5]'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>
    </aside>
  )
}
