'use client'

import { useState } from 'react'
import { Truck, ShieldCheck, Sparkles, X } from 'lucide-react'

const messages = [
  { icon: Truck, text: 'Free shipping on every order — no minimum' },
  { icon: ShieldCheck, text: 'Perfect-fit guarantee or we remake it free' },
  { icon: Sparkles, text: 'Made from Zendura® FLX — orthodontist-grade material' },
]

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative bg-foreground text-primary-foreground">
      <div className="container-custom flex items-center justify-center gap-8 py-2.5 text-xs tracking-wide">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`items-center gap-2 ${i === 0 ? 'flex' : 'hidden md:flex'}`}
          >
            <m.icon className="h-3.5 w-3.5" strokeWidth={2} />
            <span>{m.text}</span>
          </div>
        ))}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 p-1 hover:opacity-70 transition-opacity"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
