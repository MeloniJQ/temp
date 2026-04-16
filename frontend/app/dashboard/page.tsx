'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
<<<<<<< HEAD
import { useRealtimeData } from '@/hooks/use-realtime-data'
=======
import { useRealtimeData, MeterData } from '@/hooks/use-realtime-data'
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
import { Header } from '@/components/header'
import { MetricCard } from '@/components/metric-card'
import { PowerChart } from '@/components/power-chart'
import { EnergyAnalytics } from '@/components/energy-analytics'
import { AlertsSection } from '@/components/alerts-section'
import { PredictionPanel } from '@/components/prediction-panel'
import { BillingSection } from '@/components/billing-section'
<<<<<<< HEAD
import { AIInsightsCard } from '@/components/AIInsightsCard'
=======
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
import { MeterSelector, Meter } from '@/components/meter-selector'
import { Zap, Waves, Lightbulb, Activity } from 'lucide-react'

const MOCK_METERS: Meter[] = [
  { id: '1', meterId: 'MTR-2024-001', location: 'New Delhi, India' },
  { id: '2', meterId: 'MTR-2024-002', location: 'Mumbai, India' },
  { id: '3', meterId: 'MTR-2024-003', location: 'Bangalore, India' },
]

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [selectedMeterId, setSelectedMeterId] = useState('1')
<<<<<<< HEAD
  const { meterData, alerts, insights, backendConnected, isLoading: dataLoading } = useRealtimeData(
    `MTR-2024-${String(selectedMeterId).padStart(3, '0')}`,
  )

=======
  const { meterData, alerts } = useRealtimeData(`MTR-2024-${String(selectedMeterId).padStart(3, '0')}`)
  const [alertCount, setAlertCount] = useState(2)

  // Redirect to login if not authenticated
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

<<<<<<< HEAD
  if (isLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary mb-4" />
=======
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary mb-4"></div>
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
          <p className="text-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

<<<<<<< HEAD
=======
  // Convert hourly history to daily/hourly data for charts
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
  const chartData = meterData.history.map((reading) => {
    const date = new Date(reading.timestamp)
    return {
      hour: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      usage: Math.round(reading.power * 10) / 10,
    }
  })

<<<<<<< HEAD
  const status = insights?.status ?? (meterData.peakUsage > 40 ? 'high' : 'normal')
  const message = insights?.message ?? (meterData.peakUsage > 40 ? 'High Usage Detected' : 'Normal Operations')
  const recommendation =
    insights?.recommendation ??
    (meterData.peakUsage > 40
      ? 'Consider reducing load or checking connected devices.'
      : 'All systems operating normally.')

  const notificationCount = alerts.length

  return (
    <div className="min-h-screen bg-background">
      <Header notificationCount={notificationCount} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {!backendConnected && (
          <div className="mb-6 rounded-3xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
            The backend is currently unavailable. Showing fallback preview data where possible.
          </div>
        )}

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Welcome back, {user.name}. Your meter is currently tracking live power usage.
            </p>
          </div>
=======
  return (
    <div className="min-h-screen bg-background">
      <Header notificationCount={alertCount} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Meter Selector */}
        <div className="mb-8 flex justify-end">
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
          <MeterSelector
            meters={MOCK_METERS}
            selectedMeterId={selectedMeterId}
            onMeterChange={setSelectedMeterId}
          />
        </div>

<<<<<<< HEAD
=======
        {/* Live Metrics Section */}
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Live Metrics</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              type="voltage"
              label="Voltage"
              value={meterData.current.voltage}
              unit="V"
              icon={<Zap size={20} />}
<<<<<<< HEAD
              trend={Math.round(meterData.current.voltage - 230)}
              trendLabel="Live value"
=======
              trend={2.5}
              trendLabel="+2.5% vs avg"
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
            />
            <MetricCard
              type="current"
              label="Current"
              value={meterData.current.current}
              unit="A"
              icon={<Waves size={20} />}
<<<<<<< HEAD
              trend={Math.round(meterData.current.current - 5)}
              trendLabel="Live value"
=======
              trend={-1.2}
              trendLabel="-1.2% vs avg"
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
            />
            <MetricCard
              type="power"
              label="Power"
              value={meterData.current.power}
              unit="W"
              icon={<Lightbulb size={20} />}
<<<<<<< HEAD
              trend={Math.round(meterData.current.power - meterData.averageUsage)}
              trendLabel="vs avg"
            />
            <MetricCard
              type="energy"
              label="Today&apos;s Energy"
              value={meterData.dailyConsumption}
              unit="kWh"
              icon={<Activity size={20} />}
              trend={Math.round((meterData.dailyConsumption / (user.dailyLimit || 1)) * 100)}
              trendLabel={`${Math.round((meterData.dailyConsumption / user.dailyLimit) * 100)}% of limit`}
=======
              trend={5.8}
              trendLabel="+5.8% vs avg"
            />
            <MetricCard
              type="energy"
              label="Energy Consumed"
              value={meterData.dailyConsumption}
              unit="kWh"
              icon={<Activity size={20} />}
              trend={3.2}
              trendLabel="+3.2% vs avg"
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
            />
          </div>
        </section>

<<<<<<< HEAD
=======
        {/* Charts Section */}
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
        <section className="mb-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
          <PowerChart data={meterData.history} />
          <EnergyAnalytics data={chartData} />
        </section>

<<<<<<< HEAD
        <section className="mb-8 grid gap-6 grid-cols-1 xl:grid-cols-[1.2fr_0.8fr]">
          <PredictionPanel status={status} message={message} recommendation={recommendation} />
          <AIInsightsCard
            insight={insights}
            dailyLimit={user.dailyLimit}
            currentUsage={meterData.current.power}
            averageUsage={meterData.averageUsage}
            dailyConsumption={meterData.dailyConsumption}
          />
        </section>

        <section className="mb-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
          <BillingSection dailyConsumption={meterData.dailyConsumption} paymentStatus="pending" />
          <AlertsSection alerts={alerts} />
        </section>

=======
        {/* Alerts and Prediction Section */}
        <section className="mb-8 grid gap-6 grid-cols-1 lg:grid-cols-3">
          <PredictionPanel
            status={meterData.peakUsage > 40 ? 'high' : 'normal'}
            message={meterData.peakUsage > 40 ? 'High Usage Detected' : 'Normal Operations'}
            recommendation={
              meterData.peakUsage > 40
                ? 'Consider reducing load or checking connected devices.'
                : 'All systems operating normally.'
            }
          />
          <div className="lg:col-span-2">
            <AlertsSection />
          </div>
        </section>

        {/* Billing Section */}
        <section className="mb-8">
          <BillingSection
            dailyConsumption={meterData.dailyConsumption}
            paymentStatus="pending"
          />
        </section>

        {/* Footer */}
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
        <footer className="text-center text-sm text-muted-foreground py-8">
          <p>Smart Energy Grid Monitoring System v1.0</p>
        </footer>
      </main>
    </div>
  )
}
