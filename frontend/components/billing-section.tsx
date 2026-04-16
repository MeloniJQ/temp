'use client'

import { CreditCard, TrendingUp } from 'lucide-react'
import { Button } from './ui/button'

interface BillingSectionProps {
  dailyConsumption?: number
  paymentStatus?: 'paid' | 'pending'
}

export function BillingSection({ dailyConsumption = 125.5, paymentStatus = 'pending' }: BillingSectionProps) {
  const costPerUnit = 8.5
  const totalBill = (dailyConsumption * costPerUnit).toFixed(2)
  const estimatedMonthlyBill = (parseFloat(totalBill) * 30).toFixed(2)
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 5)
  const dueDateStr = dueDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })

  const isPending = paymentStatus === 'pending'

  return (
    <div className="metric-card">
      {/* Payment Status Alert */}
      {isPending && (
        <div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
          <div className="flex-shrink-0 h-5 w-5 rounded-full bg-destructive mt-0.5"></div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">Payment Due</p>
            <p className="text-xs text-destructive/80 mt-1">Please pay to avoid service interruption.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-foreground">Billing Summary</h3>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                isPending ? 'bg-destructive/20 text-destructive' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isPending ? 'Pending' : 'Paid'}
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card/50 p-4 hover:border-primary/50 transition-all duration-200">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Today&apos;s Consumption</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{dailyConsumption}</p>
              <p className="mt-1 text-xs text-muted-foreground">kWh</p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-4 hover:border-primary/50 transition-all duration-200">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cost Per Unit</p>
              <p className="mt-2 text-2xl font-bold text-foreground">₹{costPerUnit}</p>
              <p className="mt-1 text-xs text-muted-foreground">per kWh</p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 hover:border-primary/50 transition-all duration-200">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Today&apos;s Bill</p>
              <p className="mt-2 text-2xl font-bold text-primary">₹{totalBill}</p>
              <p className="mt-1 text-xs text-muted-foreground">estimated</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 hover:border-primary/50 transition-all duration-200">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estimated Monthly</p>
              <p className="mt-2 text-3xl font-bold text-primary">₹{estimatedMonthlyBill}</p>
              <p className="mt-1 text-xs text-muted-foreground">at current consumption</p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-4 hover:border-primary/50 transition-all duration-200">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Due Date</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{dueDateStr}</p>
              <p className="mt-1 text-xs text-muted-foreground">payment deadline</p>
            </div>
          </div>
        </div>

        <button className="w-full lg:w-auto h-12 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card/50 font-semibold text-sm transition-all duration-200 inline-flex items-center justify-center gap-2 flex-shrink-0">
          <CreditCard size={18} />
          <span>Pay Now</span>
        </button>
      </div>
    </div>
  )
}
