'use client'

import Link from 'next/link'
import { User } from '@/context/auth-context'
import { MapPin, Hash, UserCircle2 } from 'lucide-react'

interface ProfileCardProps {
  user: User
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Profile</p>
          <h3 className="text-lg font-semibold text-foreground mt-1">Your account</h3>
        </div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground bg-transparent hover:bg-border/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all duration-200"
        >
          View profile
        </Link>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card/50 p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Name</p>
          <p className="font-semibold text-foreground">{user.name}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card/50 p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Email</p>
          <p className="font-semibold text-foreground">{user.email}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/50 p-4 flex items-start gap-3">
            <Hash className="text-primary flex-shrink-0 mt-1" size={16} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Meter ID</p>
              <p className="font-semibold text-foreground truncate">{user.meterId}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-4 flex items-start gap-3">
            <MapPin className="text-primary flex-shrink-0 mt-1" size={16} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</p>
              <p className="font-semibold text-foreground truncate">{user.location}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
