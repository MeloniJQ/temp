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

export function AIInsightsCard({ insight, dailyLimit, currentUsage, averageUsage, dailyConsumption }: AIInsightsCardProps) {
  if (!insight) {
    return (
      <div className="metric-card">
        <h3 className="mb-4 text-lg font-semibold text-foreground">AI Insights</h3>
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
            <h3 className="text-lg font-semibold text-foreground">AI Insights & Forecast</h3>
            <p className="text-sm text-muted-foreground mt-1">Weather, usage forecast, and smart suggestions based on live backend data.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            <CloudSun size={16} /> {insight.status === 'high' ? 'High Usage Risk' : insight.status === 'anomaly' ? 'Anomaly' : 'Stable'}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Forecast next 24h</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{insight.forecast.next_24h_units} kWh</p>
            <p className="text-sm text-muted-foreground mt-1">Estimated cost ₹{insight.forecast.next_24h_cost}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Daily limit progress</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{limitPercent}%</p>
            <p className="text-sm text-muted-foreground mt-1">{limitState} of {dailyLimit} kWh</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <ThermometerSun size={18} /> Weather Forecast
          </div>
          <div className="space-y-3">
            {insight.weather.slice(0, 3).map((day) => (
              <div key={day.day} className="rounded-2xl bg-background/80 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{day.day}</p>
                    <p className="text-xs text-muted-foreground">{day.description}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{day.condition}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>High {day.high}°C</span>
                  <span>Low {day.low}°C</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <Sparkles size={18} /> Suggestions
          </div>
          <div className="space-y-3">
            {insight.suggestions.map((suggestion, index) => (
              <div key={index} className="rounded-2xl border border-border p-3 bg-background/80 text-sm text-foreground">
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          <BellRing size={18} /> Notification Forecast
        </div>
        <div className="space-y-2">
          {insight.notifications.map((notification, index) => (
            <div key={index} className="rounded-2xl bg-background/80 p-3 text-sm text-muted-foreground">
              • {notification}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
