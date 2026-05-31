'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
  Loader2,
  Banknote,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type DeliveryStatus = 'idle' | 'checking' | 'available' | 'unavailable'

interface DeliveryResult {
  deliverable: boolean
  estimatedDays: number
  codAvailable: boolean
  freeShipping: boolean
}

// Simulate delivery check - ~80% success rate for demo
function checkDeliveryAvailability(pincode: string): Promise<DeliveryResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Use pincode to deterministically decide (but with some randomness for demo feel)
      const seed = parseInt(pincode.substring(0, 4), 10)
      // ~80% success rate
      const isDeliverable = (seed % 10) < 8

      if (isDeliverable) {
        resolve({
          deliverable: true,
          estimatedDays: 3 + (seed % 5), // 3-7 business days
          codAvailable: (seed % 5) !== 0, // 80% COD availability
          freeShipping: (seed % 3) !== 0, // ~66% free shipping
        })
      } else {
        resolve({
          deliverable: false,
          estimatedDays: 0,
          codAvailable: false,
          freeShipping: false,
        })
      }
    }, 800 + Math.random() * 600) // Simulate network delay
  })
}

function getEstimatedDeliveryDate(days: number): string {
  const date = new Date()
  let remaining = days
  while (remaining > 0) {
    date.setDate(date.getDate() + 1)
    const day = date.getDay()
    if (day !== 0 && day !== 6) { // Skip weekends
      remaining--
    }
  }
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// Get saved pincode from localStorage (for lazy initialization)
function getSavedPincode(): string {
  if (typeof window === 'undefined') return ''
  try {
    const saved = localStorage.getItem('vepar_pincode')
    if (saved && /^\d{6}$/.test(saved)) return saved
  } catch {
    // localStorage not available
  }
  return ''
}

export function PincodeChecker() {
  const [pincode, setPincode] = useState(getSavedPincode)
  const [status, setStatus] = useState<DeliveryStatus>('idle')
  const [result, setResult] = useState<DeliveryResult | null>(null)

  const handlePincodeChange = (value: string) => {
    // Only allow digits, max 6
    const cleaned = value.replace(/\D/g, '').slice(0, 6)
    setPincode(cleaned)
    // Reset status when input changes
    if (status !== 'idle') {
      setStatus('idle')
      setResult(null)
    }
  }

  const handleCheck = async () => {
    if (pincode.length !== 6) return

    // Save to localStorage
    try {
      localStorage.setItem('vepar_pincode', pincode)
    } catch {
      // ignore
    }

    setStatus('checking')
    setResult(null)

    try {
      const deliveryResult = await checkDeliveryAvailability(pincode)
      setResult(deliveryResult)
      setStatus(deliveryResult.deliverable ? 'available' : 'unavailable')
    } catch {
      setStatus('unavailable')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pincode.length === 6) {
      handleCheck()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium">Check delivery availability</span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={pincode}
            onChange={(e) => handlePincodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter 6-digit pincode"
            maxLength={6}
            className="h-11 text-sm pr-12"
            inputMode="numeric"
            aria-label="Pincode for delivery check"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {pincode.length}/6
          </span>
        </div>
        <Button
          onClick={handleCheck}
          disabled={pincode.length !== 6 || status === 'checking'}
          className="h-11 px-5 bg-rose-500 hover:bg-rose-600 text-white shrink-0"
        >
          {status === 'checking' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Check'
          )}
        </Button>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {status === 'available' && result && (
          <motion.div
            key="available"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-2"
          >
            <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-emerald-800">
                  Delivery by {getEstimatedDeliveryDate(result.estimatedDays)}
                  {result.freeShipping && (
                    <span className="text-emerald-600"> — Free shipping</span>
                  )}
                </p>
                <p className="text-xs text-emerald-600">
                  {result.estimatedDays} business days to {pincode}
                </p>
              </div>
            </div>

            {result.codAvailable && (
              <Badge
                variant="secondary"
                className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 gap-1.5 px-3 py-1"
              >
                <Banknote className="h-3.5 w-3.5" />
                Cash on Delivery available
              </Badge>
            )}
          </motion.div>
        )}

        {status === 'unavailable' && (
          <motion.div
            key="unavailable"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-100"
          >
            <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">
                Not deliverable to this location
              </p>
              <p className="text-xs text-red-500 mt-0.5">
                We currently don&apos;t deliver to pincode {pincode}. Try a different pincode.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GST Info Tooltip */}
      <div className="flex items-center gap-1.5 pt-1">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                <Info className="h-3 w-3" />
                <span>Inclusive of all taxes</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px] text-xs">
              <p>Prices shown include applicable GST (Goods & Services Tax). No hidden charges at checkout.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Truck className="h-3 w-3 text-muted-foreground ml-2" />
        <span className="text-xs text-muted-foreground">Delivery across India</span>
      </div>
    </div>
  )
}
