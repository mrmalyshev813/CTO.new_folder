'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MessageSquare, Bell, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

interface HeaderProps {
  user: any
}

export default function Header({ user }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="fixed top-0 left-0 right-0 h-[48px] bg-[#2a5885] z-50 flex items-center px-4">
      <div className="flex items-center gap-4 flex-1 max-w-[1200px] mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2688eb] rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">VK</span>
          </div>
          <span className="text-white font-semibold hidden md:block">VK Clone</span>
        </Link>

        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-white/10 border border-white/20 rounded px-4 py-1.5 text-white placeholder-white/70 text-sm focus:outline-none focus:border-white/40"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link href="/messages" className="p-2 text-white/80 hover:bg-white/10 rounded transition-colors">
            <MessageSquare className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-white/80 hover:bg-white/10 rounded transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 hover:bg-white/10 rounded transition-colors"
            >
              {user?.image ? (
                <img src={user.image} alt="" className="w-8 h-8 rounded" />
              ) : (
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-white text-sm hidden md:block">{user?.name}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded shadow-lg py-1 z-50">
                <Link
                  href={`/${user?.username || 'profile'}`}
                  className="block px-4 py-2 hover:bg-[#f0f2f5] text-sm"
                  onClick={() => setShowUserMenu(false)}
                >
                  My Page
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 hover:bg-[#f0f2f5] text-sm"
                  onClick={() => setShowUserMenu(false)}
                >
                  Settings
                </Link>
                <hr className="my-1 border-gray-200" />
                <button
                  onClick={() => {
                    signOut()
                    setShowUserMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#f0f2f5] text-sm text-red-500"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
