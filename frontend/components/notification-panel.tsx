'use client'

interface NotificationPanelProps {
  notifications: string[]
}

export function NotificationPanel({ notifications }: NotificationPanelProps) {
  return (
    <div className="metric-card">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Advisor</p>
          <h3 className="text-lg font-semibold text-foreground mt-1">Notifications</h3>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Dynamic</span>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-lg border border-border bg-card/50 p-4 text-sm text-muted-foreground">
            No new insights at this moment. Your grid is operating as expected.
          </div>
        ) : (
          notifications.slice(0, 4).map((notification, index) => (
            <div key={index} className="rounded-lg border border-border bg-background/50 p-4 text-sm text-foreground">
              {notification}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
