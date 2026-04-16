'use client'

import { AlertCircle, Zap, Clock } from 'lucide-react'

interface Alert {
  id: string
  title: string
  description: string
  timestamp: string
  severity: 'critical' | 'warning' | 'info'
}

<<<<<<< HEAD
=======
const alerts: Alert[] = [
  {
    id: '1',
    title: 'High consumption detected',
    description: 'Power usage exceeded 4000W at 19:30',
    timestamp: '2 hours ago',
    severity: 'critical',
  },
  {
    id: '2',
    title: 'Unusual spike at 7 PM',
    description: 'Consumption jumped 25% above average',
    timestamp: '3 hours ago',
    severity: 'warning',
  },
  {
    id: '3',
    title: 'System operating normally',
    description: 'All metrics within expected range',
    timestamp: '5 hours ago',
    severity: 'info',
  },
]

>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
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
<<<<<<< HEAD
=======

>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
  const isPulsing = alert.severity === 'critical'

  return (
    <div className={`flex gap-3 rounded-lg border border-border p-3 hover:bg-card/50 transition-colors ${isPulsing ? 'animate-pulse-glow' : ''}`}>
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}>
        <Icon size={18} className={config.textColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-foreground text-sm">{alert.title}</p>
<<<<<<< HEAD
          <span className={`flex-shrink-0 h-2 w-2 rounded-full ${config.dotColor} mt-1`} />
=======
          <span className={`flex-shrink-0 h-2 w-2 rounded-full ${config.dotColor} mt-1`}></span>
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
        <p className="text-xs text-muted-foreground/70 mt-2">{alert.timestamp}</p>
      </div>
    </div>
  )
}

<<<<<<< HEAD
export function AlertsSection({ alerts = [] }: { alerts?: Alert[] }) {
  return (
    <div className="metric-card">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Alerts</h3>
      {alerts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          No alerts currently. Your system looks stable.
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>
      )}
=======
export function AlertsSection() {
  return (
    <div className="metric-card">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Alerts</h3>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </div>
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
    </div>
  )
}
