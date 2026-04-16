import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'

export interface PowerReading {
  timestamp: string
  voltage: number
  current: number
  power: number
  energy: number
}

export interface MeterData {
  meterId: string
  location: string
  current: PowerReading
  history: PowerReading[]
  totalConsumption: number
  dailyConsumption: number
  peakUsage: number
  averageUsage: number
}

export interface AlertData {
  id: string
  type: 'spike' | 'limit_exceeded' | 'low_voltage' | 'high_temp' | 'maintenance' | 'backend'
  severity: 'critical' | 'warning' | 'info'
  message: string
  timestamp: string
  value?: number
}

export interface InsightData {
  status: 'normal' | 'high' | 'anomaly'
  message: string
  recommendation: string
  forecast: {
    next_24h_units: number
    next_24h_cost: number
    risk_level: string
  }
  weather: Array<{
    day: string
    condition: string
    description: string
    high: number
    low: number
  }>
  suggestions: string[]
  notifications: string[]
}

function makeFallbackReading(hour: number): Omit<PowerReading, 'timestamp'> {
  let baseLoad = 10
  if (hour >= 6 && hour < 9) baseLoad = 35
  else if (hour >= 9 && hour < 17) baseLoad = 25
  else if (hour >= 17 && hour < 21) baseLoad = 40
  else if (hour >= 21 && hour < 23) baseLoad = 20

  const power = Math.max(5, Math.min(50, baseLoad + (Math.random() - 0.5) * 10))
  const voltage = 220 + (Math.random() - 0.5) * 10
  const current = power / (voltage / 1000)
  const energy = power / 1000

  return {
    voltage: Math.round(voltage * 100) / 100,
    current: Math.round(current * 100) / 100,
    power: Math.round(power * 100) / 100,
    energy: Math.round(energy * 100) / 100,
  }
}

export function useRealtimeData(meterId: string, initialHistoryLength: number = 24) {
  const [meterData, setMeterData] = useState<MeterData>(() => {
    const now = new Date()
    const history: PowerReading[] = []
    let totalEnergy = 0

    for (let i = initialHistoryLength - 1; i >= 0; i--) {
      const time = new Date(now)
      time.setHours(time.getHours() - i)
      const reading = makeFallbackReading(time.getHours())
      totalEnergy += reading.energy
      history.push({ timestamp: time.toISOString(), ...reading })
    }

    const currentReading = history[history.length - 1]
    const peakUsage = Math.max(...history.map((h) => h.power))
    const averageUsage = history.reduce((sum, h) => sum + h.power, 0) / history.length

    return {
      meterId,
      location: 'New Delhi, India',
      current: currentReading,
      history,
      totalConsumption: Math.round(totalEnergy * 100) / 100,
      dailyConsumption: Math.round(
        history
          .slice(-24)
          .reduce((sum, h) => sum + h.energy, 0) * 100,
      ) / 100,
      peakUsage: Math.round(peakUsage * 100) / 100,
      averageUsage: Math.round(averageUsage * 100) / 100,
    }
  })

  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [insights, setInsights] = useState<InsightData | null>(null)
  const [backendConnected, setBackendConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let didCancel = false

    async function refreshData() {
      try {
        const [liveData, historyData, alertsData, insightsData] = await Promise.all([
          apiFetch<{ live: any }>('/api/live'),
          apiFetch<{ history: any[] }>('/api/history'),
          apiFetch<{ alerts: any[] }>('/api/alerts'),
          apiFetch<InsightData>('/api/insights'),
        ])

        if (didCancel) return

        const historyRows = historyData.history
        const sortedHistory = [...historyRows].reverse()
        const enrichedHistory: PowerReading[] = sortedHistory.map((row, index) => {
          const previous = index > 0 ? sortedHistory[index - 1] : null
          const energy = previous
            ? Math.max(0, row.energy_units - previous.energy_units)
            : row.energy_units
          return {
            timestamp: row.timestamp,
            voltage: row.voltage,
            current: row.current,
            power: row.power,
            energy: Math.round(energy * 100) / 100,
          }
        })

        const latestReading = enrichedHistory[enrichedHistory.length - 1] ?? {
          timestamp: new Date().toISOString(),
          voltage: 220,
          current: 5,
          power: 15,
          energy: 0.02,
        }

        const peakUsage = Math.max(...enrichedHistory.map((row) => row.power), latestReading.power)
        const averageUsage = enrichedHistory.length
          ? enrichedHistory.reduce((sum, row) => sum + row.power, 0) / enrichedHistory.length
          : latestReading.power

        const last24Entries = enrichedHistory.slice(-24)
        const dailyConsumption = last24Entries.length > 0
          ? Math.round(
              last24Entries.reduce((sum, row) => sum + row.energy, 0) * 100,
            ) / 100
          : latestReading.energy

        setMeterData({
          meterId,
          location: 'New Delhi, India',
          current: {
            timestamp: liveData.live.timestamp,
            voltage: liveData.live.voltage,
            current: liveData.live.current,
            power: liveData.live.power,
            energy: latestReading.energy,
          },
          history: enrichedHistory.slice(-Math.max(initialHistoryLength, 24)),
          totalConsumption: liveData.live.energy_units ?? 0,
          dailyConsumption,
          peakUsage: Math.round(peakUsage * 100) / 100,
          averageUsage: Math.round(averageUsage * 100) / 100,
        })

        setAlerts(
          alertsData.alerts.map((alert) => ({
            id: String(alert.id),
            type: 'backend',
            severity: alert.level === 'high' ? 'critical' : 'warning',
            message: alert.message,
            timestamp: alert.timestamp,
          })),
        )

        setInsights(insightsData)
        setBackendConnected(true)
      } catch (error) {
        if (didCancel) return
        setBackendConnected(false)
      } finally {
        if (!didCancel) {
          setIsLoading(false)
        }
      }
    }

    refreshData()
    const timer = setInterval(refreshData, 15000)

    return () => {
      didCancel = true
      clearInterval(timer)
    }
  }, [meterId, initialHistoryLength])

  return { meterData, alerts, insights, backendConnected, isLoading }
}
