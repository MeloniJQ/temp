'use client'

import { useState } from 'react'
import { MessageSquare, Send, X } from 'lucide-react'

interface ChatWidgetProps {
  currentUsage: number
  dailyConsumption: number
}

const cannedAnswers = [
  {
    keywords: ['ac', 'cool', 'cooling', 'air conditioner'],
    answer: 'For efficient cooling, set the AC to 25°C, close curtains, and run ceiling fans together to reduce energy draw.',
  },
  {
    keywords: ['bill', 'cost', 'charge'],
    answer: 'To manage your bill, shift heavy appliances to off-peak hours and avoid extended high-demand usage during the evening.',
  },
  {
    keywords: ['peak', 'load', 'high usage'],
    answer: 'Your current peak usage is high. Lowering AC and heating use and separating heavy loads will help stabilize it.',
  },
  {
    keywords: ['stable', 'normal', 'good'],
    answer: 'Your energy usage is stable today. Keep following efficient habits and keep an eye on sudden spikes.',
  },
]

function findResponse(query: string) {
  const normalized = query.toLowerCase()
  const match = cannedAnswers.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)))
  return match?.answer || 'Try asking about AC efficiency, billing, peak load, or usage suggestions.'
}

export function ChatWidget({ currentUsage, dailyConsumption }: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{ from: 'user' | 'bot'; text: string }>>([
    { from: 'bot', text: 'Ask me about energy usage, billing, or how to optimize your grid.' },
  ])

  const handleSend = () => {
    if (!input.trim()) return

    const userText = input.trim()
    const botText = findResponse(userText)
    setMessages((prev) => [...prev, { from: 'user', text: userText }, { from: 'bot', text: botText }])
    setInput('')
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-[320px] ${open ? '' : 'pointer-events-none'}`}>
      {open ? (
        <div className="rounded-2xl border border-border bg-card/95 shadow-lg shadow-black/10 backdrop-blur-md pointer-events-auto transition-all duration-200">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Energy Assistant</p>
              <p className="text-xs text-muted-foreground">Quick energy guidance</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-border/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card/50"
              title="Close chat"
            >
              <X size={18} />
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`rounded-lg p-3 text-sm ${
                  message.from === 'bot'
                    ? 'bg-background/50 border border-border text-foreground'
                    : 'bg-primary/10 text-primary-foreground'
                }`}
              >
                <p className="leading-relaxed">{message.text}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border px-4 py-3 space-y-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              <button
                onClick={handleSend}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card/50 transition-all duration-200"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Usage: {currentUsage.toFixed(1)}W | Daily: {dailyConsumption.toFixed(1)}kWh</p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 pointer-events-auto"
        >
          <MessageSquare size={18} /> Assistant
        </button>
      )}
    </div>
  )
}
