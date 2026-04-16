'use client'

import { Bell, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'

interface HeaderProps {
  notificationCount?: number
}

export function Header({ notificationCount = 2 }: HeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-40 transition-all duration-200">
      <div className="flex h-16 items-center justify-between px-6 gap-6">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Smart Grid</h1>
          <p className="text-xs font-medium text-muted-foreground">Real-Time Monitoring & Billing</p>
        </div>

        <div className="hidden md:flex flex-col text-right text-sm">
          <p className="text-foreground font-semibold">{user?.name || 'Guest'}</p>
          <p className="text-muted-foreground text-xs">{user?.location || 'Location'}</p>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button
            className="relative p-2 text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card/50"
            title="Notifications"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute -top-0 -right-0 inline-flex items-center justify-center h-5 w-5 bg-destructive text-destructive-foreground rounded-full text-xs font-bold">
                {notificationCount}
              </span>
            )}
          </button>

          <Link
            href="/settings"
            className="p-2 text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-border/50 rounded-lg inline-flex focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card/50"
            title="Settings"
          >
            <Settings size={20} />
          </Link>

          <div className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-border/50 transition-colors cursor-pointer">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-muted-foreground hover:text-destructive transition-all duration-200 hover:bg-destructive/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-card/50"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
