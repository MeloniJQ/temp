'use client'

import { CloudSun, ThermometerSun, Sparkles, BellRing } from 'lucide-react'

interface WeatherForecast {
  day: string
  condition: string
  description: string
  high: number
  low: number
}

interface InsightData {
  status: 'normal' | 'high' | 'anomaly'
  message: string
  recommendation: string
  forecast: {
    next_24h_units: number
    next_24h_cost: number
    risk_level: string
  }
  weather: WeatherForecast[]
  suggestions: string[]
  notifications: string[]
}

interface AIInsightsCardProps {
  insight?: InsightData | null
  dailyLimit: number
  currentUsage: number
  averageUsage: number
  dailyConsumption: number
}

export function InsightsMentorCard({ insight, dailyLimit, currentUsage, averageUsage, dailyConsumption }: AIInsightsCardProps) {
  if (!insight) {
    return (
      <div className="metric-card">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Energy Mentor</h3>
        <p className="text-sm text-muted-foreground">Connecting to backend insights...</p>
      </div>
    )
  }

  const limitPercent = dailyLimit > 0 ? Math.min(100, Math.round((dailyConsumption / dailyLimit) * 100)) : 0
  const limitState = limitPercent >= 90 ? 'High' : limitPercent >= 70 ? 'Approaching' : 'Healthy'

  return (
    <div className="metric-card">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Usage Forecast & Guidance</h3>
            <p className="text-sm text-muted-foreground mt-1">Weather-aware energy recommendations and forecast guidance for your meter.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent flex-shrink-0">
            <CloudSun size={16} /> {insight.status === 'high' ? 'High Usage Risk' : insight.status === 'anomaly' ? 'Anomaly' : 'Stable'}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Forecast next 24h</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{insight.forecast.next_24h_units} kWh</p>
            <p className="text-sm text-muted-foreground mt-1">Estimated cost ₹{insight.forecast.next_24h_cost}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Daily limit progress</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{limitPercent}%</p>
            <p className="text-sm text-muted-foreground mt-1">{limitState} of {dailyLimit} kWh</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
            <ThermometerSun size={18} /> Weather Forecast
          </div>
          <div className="space-y-3">
            {insight.weather.slice(0, 3).map((day) => (
              <div key={day.day} className="rounded-lg bg-background/50 border border-border/50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{day.day}</p>
                    <p className="text-xs text-muted-foreground">{day.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{day.condition}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>High {day.high}°C</span>
                  <span>Low {day.low}°C</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
            <Sparkles size={18} /> Suggestions
          </div>
          <div className="space-y-3">
            {insight.suggestions.map((suggestion, index) => (
              <div key={index} className="rounded-lg border border-border bg-background/50 p-3 text-xs text-foreground leading-relaxed">
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card/50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
          <BellRing size={18} /> Notification Forecast
        </div>
        <div className="space-y-2">
          {insight.notifications.map((notification, index) => (
            <div key={index} className="rounded-lg bg-background/50 border border-border/50 p-3 text-xs text-muted-foreground">
              • {notification}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
