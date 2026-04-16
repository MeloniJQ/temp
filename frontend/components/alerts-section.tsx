'use client'

import { AlertCircle, Zap, Clock } from 'lucide-react'

interface Alert {
  id: string
  title: string
  description: string
  timestamp: string
  severity: 'critical' | 'warning' | 'info'
}

function AlertItem({ alert }: { alert: Alert }) {
  const severityConfig = {
    critical: {
      icon: AlertCircle,
      bgColor: 'bg-destructive/10',
      textColor: 'text-destructive',
      dotColor: 'bg-destructive',
    },
    warning: {
      icon: Zap,
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-500',
      dotColor: 'bg-yellow-500',
    },
    info: {
      icon: Clock,
      bgColor: 'bg-chart-2/10',
      textColor: 'text-chart-2',
      dotColor: 'bg-chart-2',
    },
  }

  const config = severityConfig[alert.severity]
  const Icon = config.icon
  const isPulsing = alert.severity === 'critical'

  return (
    <div className={`flex gap-3 rounded-lg border border-border p-4 hover:bg-card/50 transition-all duration-200 ${isPulsing ? 'animate-pulse-glow' : ''}`}>
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${config.bgColor} transition-colors`}>
        <Icon size={16} className={config.textColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-foreground text-sm">{alert.title}</p>
          <span className={`flex-shrink-0 h-2 w-2 rounded-full ${config.dotColor} mt-1`} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
        <p className="text-xs text-muted-foreground/70 mt-2 font-medium">{alert.timestamp}</p>
      </div>
    </div>
  )
}

export function AlertsSection({ alerts = [] }: { alerts?: Alert[] }) {
  return (
    <div className="metric-card">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Alerts</h3>
      {alerts.length === 0 ? (
        <div className="rounded-lg border border-border bg-card/50 p-4 text-sm text-muted-foreground">
          No alerts currently. Your system looks stable.
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  )
}
