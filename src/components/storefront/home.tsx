'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight, Truck, Headphones, RotateCcw, Shield, ChevronRight, Star, Quote,
  X, ShoppingCart, Eye, Clock, Flame, Sparkles, Users, AlertTriangle,
  ChevronLeft, ChevronRight as ChevronRightIcon, Play, Pause, Zap, Mail,
  Instagram, BookOpen, Leaf, Gem, Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { ProductGrid } from '@/components/storefront/product-grid'
import { useThemeLayout } from '@/lib/theme-context'
import { getThemeConfig, type ThemeLayoutConfig, type SectionConfig, type CROConfig } from '@/lib/theme-configs'
import { toast } from 'sonner'

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  images?: string
  shortDesc?: string | null
  category?: { id: string; name: string; slug: string } | null
  variants?: Array<{ id: string; title: string; price: number }>
  inventory?: Array<{ quantity: number; reserved: number }>
  reviews?: Array<{ rating: number }>
  createdAt?: string
  orderItems?: Array<{ id: string; quantity: number }>
}

interface Collection {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  _count?: { products: number }
}

// ─── Shared Data ────────────────────────────────────────────────────────────

const collectionGradients = [
  'from-rose-500 to-pink-400',
  'from-violet-500 to-purple-400',
  'from-emerald-500 to-teal-400',
  'from-amber-500 to-orange-400',
  'from-sky-500 to-blue-400',
]

const brandValues = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100', gradient: 'from-rose-500 to-orange-400' },
  { icon: Headphones, title: '24/7 Support', desc: 'Dedicated customer service', gradient: 'from-violet-500 to-purple-400' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy', gradient: 'from-emerald-500 to-teal-400' },
  { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout', gradient: 'from-amber-500 to-orange-400' },
]

const trustBadges = [
  { icon: Shield, label: 'Secure Payment', desc: '256-bit SSL encryption' },
  { icon: RotateCcw, label: 'Free Returns', desc: '30-day money back' },
  { icon: Headphones, label: '24/7 Support', desc: 'Always here to help' },
  { icon: Star, label: 'Quality Guarantee', desc: 'Premium products only' },
]

const testimonials = [
  {
    name: 'Sarah Johnson', role: 'Verified Buyer',
    quote: 'Absolutely love the quality of products! The shipping was incredibly fast and everything arrived in perfect condition.',
    rating: 5, avatar: 'SJ', gradient: 'from-rose-500 to-pink-400',
  },
  {
    name: 'Michael Chen', role: 'Loyal Customer',
    quote: 'I\'ve been shopping here for over a year now and the experience keeps getting better. The customer service team is phenomenal.',
    rating: 5, avatar: 'MC', gradient: 'from-violet-500 to-purple-400',
  },
  {
    name: 'Emily Rodriguez', role: 'First-time Buyer',
    quote: 'Was skeptical at first but the product exceeded my expectations. The packaging was beautiful and the item was exactly as described.',
    rating: 4, avatar: 'ER', gradient: 'from-emerald-500 to-teal-400',
  },
]

// Fake purchase names for CRO
const croNames = ['John', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Lucas', 'Mia', 'Mason', 'Isabella']
const croCities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Francisco', 'Seattle', 'Miami', 'Denver', 'Boston']

// ─── Section Header Component ───────────────────────────────────────────────

function SectionHeader({ title, subtitle, onViewAll }: { title: string; subtitle: string; onViewAll?: () => void }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
        <div className="sf-section-accent-line h-1 w-16 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 mt-2" />
        <p className="text-muted-foreground text-sm mt-2">{subtitle}</p>
      </div>
      {onViewAll && (
        <Button variant="ghost" onClick={onViewAll} className="group text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          View All
          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Button>
      )}
    </div>
  )
}

// ─── Countdown Hook ─────────────────────────────────────────────────────────

function useCountdown(hours: number) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const endTime = new Date()
    endTime.setHours(endTime.getHours() + hours)
    const timer = setInterval(() => {
      const diff = endTime.getTime() - Date.now()
      if (diff <= 0) { clearInterval(timer); setTimeLeft({ hours: 0, minutes: 0, seconds: 0 }); return }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [hours])
  return timeLeft
}

function CountdownDigit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg w-14 h-14 flex items-center justify-center border border-white/20 shadow-lg">
        <span className="text-2xl font-bold text-white tabular-nums">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-white/70 mt-1.5 font-medium">{label}</span>
    </div>
  )
}

// ─── CRO Notification Component ─────────────────────────────────────────────

function CRONotifications({ cro, products }: { cro: CROConfig; products: Product[] }) {
  const [purchaseNotif, setPurchaseNotif] = useState<{ name: string; city: string; product: string; time: string } | null>(null)
  const [viewerCount, setViewerCount] = useState(() => {
    if (!cro.showLiveViewers) return 0
    const [min, max] = cro.viewerCountRange
    if (min === 0 && max === 0) return 0
    return Math.floor(Math.random() * (max - min + 1)) + min
  })

  // Fluctuate viewer count over time
  useEffect(() => {
    if (!cro.showLiveViewers) return
    const [min, max] = cro.viewerCountRange
    if (min === 0 && max === 0) return
    const interval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2
        return Math.max(min, Math.min(max, prev + change))
      })
    }, 8000)
    return () => clearInterval(interval)
  }, [cro.showLiveViewers, cro.viewerCountRange])

  // Generate recent purchase notifications
  useEffect(() => {
    if (!cro.showRecentPurchases || products.length === 0) return
    const showNotification = () => {
      const product = products[Math.floor(Math.random() * products.length)]
      const name = croNames[Math.floor(Math.random() * croNames.length)]
      const city = croCities[Math.floor(Math.random() * croCities.length)]
      const mins = Math.floor(Math.random() * 12) + 1
      setPurchaseNotif({ name, city, product: product.name, time: `${mins} min ago` })
      setTimeout(() => setPurchaseNotif(null), 5000)
    }
    // Show first notification after 5 seconds
    const initialTimeout = setTimeout(showNotification, 5000)
    const interval = setInterval(showNotification, Math.floor(Math.random() * 7000) + 8000)
    return () => { clearTimeout(initialTimeout); clearInterval(interval) }
  }, [cro.showRecentPurchases, products])

  if (!cro.showLiveViewers && !cro.showRecentPurchases) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {/* Live Viewer Count */}
      <AnimatePresence>
        {cro.showLiveViewers && viewerCount > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-neutral-100 flex items-center gap-2 pointer-events-auto"
          >
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">{viewerCount} people viewing</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Purchase Toast */}
      <AnimatePresence>
        {purchaseNotif && cro.showRecentPurchases && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl border border-neutral-100 max-w-xs pointer-events-auto"
          >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shrink-0">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-900 truncate">
                  {purchaseNotif.name} from {purchaseNotif.city}
                </p>
                <p className="text-[11px] text-neutral-500 truncate">
                  just bought {purchaseNotif.product}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{purchaseNotif.time}</p>
              </div>
              <button onClick={() => setPurchaseNotif(null)} className="shrink-0 text-neutral-400 hover:text-neutral-600">
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Urgency Message Bar ────────────────────────────────────────────────────

function UrgencyBar({ message }: { message?: string }) {
  if (!message) return null
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white text-center py-2 px-4 text-sm font-semibold"
    >
      <motion.span
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {message}
      </motion.span>
    </motion.div>
  )
}

// ─── Hero Variants ──────────────────────────────────────────────────────────

function HeroSplit({ layout }: { layout: ThemeLayoutConfig }) {
  return (
    <section className="sf-hero relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <motion.div className="absolute inset-0 opacity-30">
        <motion.div className="sf-hero-blob-1 absolute top-20 left-10 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl" animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="sf-hero-blob-2 absolute bottom-10 right-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" animate={{ y: [0, 15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      </motion.div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <span className="sf-hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium mb-6 border border-white/10">
              New Collection Available <ArrowRight className="h-3 w-3" />
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              {layout.heroTitle.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="sf-hero-title-accent bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                {layout.heroTitle.split(' ').slice(-1)}
              </span>
            </h1>
            <p className="text-lg text-neutral-300 mb-8 max-w-lg leading-relaxed">{layout.heroSubtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="sf-hero-cta bg-rose-500 hover:bg-rose-600 text-white relative overflow-hidden group">
                <span className="absolute inset-0 rounded-md bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {layout.heroCtaText} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="sf-hero-cta-outline border-white/20 text-white hover:bg-white/10 hover:border-white/30">
                {layout.heroCtaSecondary}
              </Button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="hidden lg:block">
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/30 via-transparent to-orange-500/20 rounded-3xl blur-2xl" />
              <div className="relative h-full w-full bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden">
                <Package className="h-32 w-32 text-white/10" />
                <div className="absolute top-4 right-4"><Badge className="bg-rose-500/80 text-white backdrop-blur-sm">Featured</Badge></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function HeroFullscreen({ layout }: { layout: ThemeLayoutConfig }) {
  return (
    <section className="sf-hero relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-neutral-900">
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 z-10" />
      <motion.div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(239,68,68,0.3), transparent 50%), radial-gradient(circle at 70% 60%, rgba(249,115,22,0.3), transparent 50%)' }} />
      <motion.div className="relative z-20 text-center max-w-4xl mx-auto px-4 sm:px-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <motion.span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/20 text-red-300 text-sm font-bold mb-6 border border-red-500/30" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <Flame className="h-4 w-4" /> MEGA SALE LIVE NOW
        </motion.span>
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white mb-6 leading-none">
          {layout.heroTitle}
        </h1>
        <p className="text-xl text-neutral-300 mb-10 max-w-2xl mx-auto">{layout.heroSubtitle}</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" className="sf-hero-cta bg-red-500 hover:bg-red-600 text-white text-lg px-8 py-6 shadow-2xl shadow-red-500/25">
            {layout.heroCtaText} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" className="sf-hero-cta-outline border-white/30 text-white text-lg px-8 py-6 hover:bg-white/10">
            {layout.heroCtaSecondary}
          </Button>
        </div>
      </motion.div>
    </section>
  )
}

function HeroParallax({ layout }: { layout: ThemeLayoutConfig }) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, 200])
  const textY = useTransform(scrollY, [0, 400], [0, -50])
  return (
    <section className="sf-hero relative min-h-[85vh] overflow-hidden bg-neutral-950" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
      <motion.div className="absolute inset-0" style={{ y }}>
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/30 via-stone-900/50 to-neutral-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-yellow-700/10 rounded-full blur-3xl" />
      </motion.div>
      <motion.div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-36 text-center" style={{ y: textY }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-8" />
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-light text-white mb-6 tracking-wide italic">
            {layout.heroTitle}
          </h1>
          <p className="text-lg sm:text-xl text-amber-200/60 mb-10 font-sans max-w-xl mx-auto">{layout.heroSubtitle}</p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="sf-hero-cta bg-amber-700 hover:bg-amber-800 text-white border border-amber-600/30 px-8">
              {layout.heroCtaText}
            </Button>
            <Button size="lg" variant="outline" className="sf-hero-cta-outline border-amber-500/30 text-amber-300 hover:bg-amber-900/20 px-8">
              {layout.heroCtaSecondary}
            </Button>
          </div>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-8" />
        </motion.div>
      </motion.div>
    </section>
  )
}

function HeroImageFirst({ layout }: { layout: ThemeLayoutConfig }) {
  return (
    <section className="sf-hero relative overflow-hidden bg-white">
      <div className="relative h-[50vh] sm:h-[60vh] bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 overflow-hidden">
        <motion.div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity }} />
        <motion.div className="absolute bottom-10 right-10 w-60 h-60 bg-yellow-300/10 rounded-full blur-3xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Leaf className="h-40 w-40 text-white/15" />
        </div>
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 -mt-20 z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 text-center border border-emerald-100">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-4">{layout.heroTitle}</h1>
          <p className="text-lg text-neutral-600 mb-8 max-w-lg mx-auto">{layout.heroSubtitle}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" className="sf-hero-cta bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 px-8">
              {layout.heroCtaText} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-8">
              {layout.heroCtaSecondary}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function HeroSlider({ layout }: { layout: ThemeLayoutConfig }) {
  const [slide, setSlide] = useState(0)
  const slides = [
    { title: layout.heroTitle, subtitle: layout.heroSubtitle, gradient: 'from-orange-600 via-red-500 to-rose-500' },
    { title: 'New Arrivals Daily', subtitle: 'Be the first to discover our latest drops', gradient: 'from-violet-600 via-purple-500 to-fuchsia-500' },
    { title: 'Limited Edition', subtitle: 'Exclusive pieces you won\'t find anywhere else', gradient: 'from-amber-600 via-orange-500 to-yellow-500' },
  ]
  useEffect(() => {
    const interval = setInterval(() => setSlide(s => (s + 1) % slides.length), 5000)
    return () => clearInterval(interval)
  }, [slides.length])
  return (
    <section className="sf-hero relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={`min-h-[70vh] sm:min-h-[80vh] bg-gradient-to-br ${slides[slide].gradient} flex items-center justify-center relative`}
        >
          <motion.div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity }} />
          <motion.div className="absolute bottom-20 left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity }} />
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6">
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-5xl sm:text-7xl font-black text-white mb-6">
              {slides[slide].title}
            </motion.h1>
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
              {slides[slide].subtitle}
            </motion.p>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex gap-4 justify-center">
              <Button size="lg" className="bg-white text-neutral-900 hover:bg-white/90 shadow-xl px-8">{layout.heroCtaText} <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">{layout.heroCtaSecondary}</Button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setSlide(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === slide ? 'bg-white w-8' : 'bg-white/50'}`} />
        ))}
      </div>
    </section>
  )
}

function HeroVideo({ layout }: { layout: ThemeLayoutConfig }) {
  return (
    <section className="sf-hero relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(135deg, #0c4a6e, #0369a1, #0ea5e9, #0284c7)',
              'linear-gradient(135deg, #0369a1, #0ea5e9, #0c4a6e, #0284c7)',
              'linear-gradient(135deg, #0ea5e9, #0284c7, #0369a1, #0c4a6e)',
              'linear-gradient(135deg, #0c4a6e, #0369a1, #0ea5e9, #0284c7)',
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 bg-blue-900/30" />
        <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity }} />
        <motion.div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky-400/15 rounded-full blur-3xl" animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 8, repeat: Infinity }} />
        {/* Simulated wave overlay */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <motion.path
            d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,120 L0,120 Z"
            fill="rgba(255,255,255,0.05)"
            animate={{ d: [
              'M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,120 L0,120 Z',
              'M0,80 C360,20 720,100 1080,40 C1260,60 1380,100 1440,80 L1440,120 L0,120 Z',
              'M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,120 L0,120 Z',
            ] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      </div>
      <motion.div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6">{layout.heroTitle}</h1>
        <p className="text-xl text-sky-100/70 mb-10 max-w-xl mx-auto">{layout.heroSubtitle}</p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="sf-hero-cta bg-sky-500 hover:bg-sky-600 text-white shadow-xl px-8">{layout.heroCtaText} <ArrowRight className="ml-2 h-4 w-4" /></Button>
          <Button size="lg" variant="outline" className="sf-hero-cta-outline border-white/20 text-white hover:bg-white/10">{layout.heroCtaSecondary}</Button>
        </div>
      </motion.div>
    </section>
  )
}

function HeroGradient({ layout }: { layout: ThemeLayoutConfig }) {
  return (
    <section className="sf-hero relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-neutral-950">
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(6,182,212,0.3) 0%, transparent 50%)',
            'radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.3) 0%, transparent 50%), radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.3) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse' }}
      />
      {/* Glow particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-violet-400 rounded-full"
          style={{ left: `${15 + i * 15}%`, top: `${30 + (i % 3) * 20}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: [0, -40, 0] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.7 }}
        />
      ))}
      <motion.div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white mb-6">
          {layout.heroTitle}
        </h1>
        <p className="text-xl text-violet-200/60 mb-10 max-w-xl mx-auto">{layout.heroSubtitle}</p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="sf-hero-cta bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-xl shadow-violet-500/25 px-8 hover:from-violet-700 hover:to-cyan-600">{layout.heroCtaText} <ArrowRight className="ml-2 h-4 w-4" /></Button>
          <Button size="lg" variant="outline" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10">{layout.heroCtaSecondary}</Button>
        </div>
      </motion.div>
    </section>
  )
}

function HeroCarousel({ layout }: { layout: ThemeLayoutConfig }) {
  const [slide, setSlide] = useState(0)
  const slides = [
    { title: layout.heroTitle, subtitle: layout.heroSubtitle, accent: 'from-rose-600 to-pink-500' },
    { title: 'Curated Elegance', subtitle: 'Every piece handpicked for quality and style', accent: 'from-fuchsia-600 to-purple-500' },
    { title: 'Timeless Beauty', subtitle: 'Fashion that transcends seasons and trends', accent: 'from-pink-600 to-rose-500' },
  ]
  useEffect(() => {
    const interval = setInterval(() => setSlide(s => (s + 1) % slides.length), 4000)
    return () => clearInterval(interval)
  }, [slides.length])
  return (
    <section className="sf-hero relative min-h-[75vh] overflow-hidden bg-neutral-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${slides[slide].accent} opacity-20`} />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-24 sm:py-36 flex flex-col items-center justify-center min-h-[75vh] text-center">
        <AnimatePresence mode="wait">
          <motion.div key={slide} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-8" />
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light text-white mb-6 tracking-wide" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}>
              {slides[slide].title}
            </h1>
            <p className="text-lg text-neutral-300 mb-10 max-w-lg mx-auto font-sans">{slides[slide].subtitle}</p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="sf-hero-cta bg-rose-500 hover:bg-rose-600 text-white px-8">{layout.heroCtaText}</Button>
              <Button size="lg" variant="outline" className="sf-hero-cta-outline border-white/20 text-white hover:bg-white/10">{layout.heroCtaSecondary}</Button>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-8 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} className={`w-2 h-2 rounded-full transition-all ${i === slide ? 'bg-rose-400 w-6' : 'bg-white/40'}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

function HeroStorytelling({ layout }: { layout: ThemeLayoutConfig }) {
  return (
    <section className="sf-hero relative overflow-hidden bg-gradient-to-b from-amber-50 to-stone-100">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2392400e\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-medium mb-8 border border-amber-200">
            <BookOpen className="h-4 w-4" /> Our Story
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-amber-950 mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {layout.heroTitle}
          </h1>
          <p className="text-lg text-amber-800/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            {layout.heroSubtitle}
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="sf-hero-cta bg-amber-800 hover:bg-amber-900 text-white px-8 border border-amber-700">{layout.heroCtaText}</Button>
            <Button size="lg" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-50">{layout.heroCtaSecondary}</Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function HeroAnimated({ layout }: { layout: ThemeLayoutConfig }) {
  return (
    <section className="sf-hero relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-neutral-950">
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.15) 0%, transparent 70%)',
        }}
      />
      {/* Neon border animation */}
      <motion.div
        className="absolute inset-4 sm:inset-8 border border-cyan-500/20 rounded-xl"
        animate={{ borderColor: ['rgba(6,182,212,0.1)', 'rgba(6,182,212,0.4)', 'rgba(6,182,212,0.1)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Glitch lines */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px bg-cyan-400/30"
          style={{ top: `${20 + i * 20}%`, left: 0, right: 0 }}
          animate={{ opacity: [0, 0.5, 0], scaleX: [0, 1, 0] }}
          transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 + i * 0.5, delay: i * 0.2 }}
        />
      ))}
      <motion.div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <motion.div animate={{ opacity: [1, 0.8, 1], x: [0, -2, 2, 0] }} transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 5 }}>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 mb-6" style={{ textShadow: '0 0 40px rgba(6,182,212,0.3)' }}>
            {layout.heroTitle}
          </h1>
        </motion.div>
        <p className="text-xl text-cyan-200/50 mb-10 max-w-xl mx-auto">{layout.heroSubtitle}</p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="sf-hero-cta bg-gradient-to-r from-cyan-500 to-teal-400 text-neutral-900 font-bold shadow-xl shadow-cyan-500/25 px-8 hover:from-cyan-400 hover:to-teal-300">{layout.heroCtaText} <Zap className="ml-2 h-4 w-4" /></Button>
          <Button size="lg" variant="outline" className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10">{layout.heroCtaSecondary}</Button>
        </div>
      </motion.div>
    </section>
  )
}

// ─── Hero Router ────────────────────────────────────────────────────────────

function HeroSection({ layout }: { layout: ThemeLayoutConfig }) {
  const variants: Record<string, React.FC<{ layout: ThemeLayoutConfig }>> = {
    split: HeroSplit,
    fullscreen: HeroFullscreen,
    parallax: HeroParallax,
    'image-first': HeroImageFirst,
    slider: HeroSlider,
    video: HeroVideo,
    gradient: HeroGradient,
    carousel: HeroCarousel,
    storytelling: HeroStorytelling,
    animated: HeroAnimated,
  }
  const HeroComponent = variants[layout.heroVariant] || HeroSplit
  return <HeroComponent layout={layout} />
}

// ─── Section Renderers ──────────────────────────────────────────────────────

function TrustBadgesSection() {
  return (
    <section className="sf-trust-badges-section bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {trustBadges.map((badge, i) => (
            <motion.div key={badge.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }} className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="sf-trust-badge-icon h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
                <badge.icon className="h-5 w-5 text-white" />
              </div>
              <div><p className="font-semibold text-sm">{badge.label}</p><p className="text-xs text-muted-foreground">{badge.desc}</p></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrendingSection({ products, onViewAll, onAddToCart }: { products: Product[]; onViewAll: () => void; onAddToCart: (p: Product) => void }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <SectionHeader title="Trending Now" subtitle="What everyone's talking about" onViewAll={onViewAll} />
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-4 -mx-4 px-4">
        {products.length > 0 ? products.map((product, i) => (
          <motion.div key={product.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }} className="snap-center shrink-0 w-72 sm:w-80">
            <Card className="overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" onClick={() => {}}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${collectionGradients[i % collectionGradients.length]} transition-transform duration-500 group-hover:scale-110`} />
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-white/30 text-4xl font-bold">{product.name.substring(0, 2).toUpperCase()}</span></div>
                <div className="absolute top-3 left-3"><Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-md"><Flame className="h-3 w-3 mr-1" />Trending</Badge></div>
                <div className="absolute bottom-3 right-3"><div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10"><span className="text-white font-bold text-lg">${product.price.toFixed(2)}</span></div></div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button size="sm" className="bg-white text-neutral-900 hover:bg-white/90 shadow-lg" onClick={(e) => { e.stopPropagation(); onAddToCart(product) }}><ShoppingCart className="h-4 w-4 mr-1.5" />Quick Add</Button>
                </div>
              </div>
              <div className="p-4">
                {product.category && <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{product.category.name}</p>}
                <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
              </div>
            </Card>
          </motion.div>
        )) : Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="snap-center shrink-0 w-72 sm:w-80"><Card className="overflow-hidden border-0 shadow-sm"><Skeleton className="aspect-[4/3]" /><div className="p-4 space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-4 w-3/4" /></div></Card></div>
        ))}
      </div>
    </section>
  )
}

function FlashSaleSection({ countdown }: { countdown: { hours: number; minutes: number; seconds: number } }) {
  return (
    <section className="sf-flash-sale relative bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)' }} />
      <motion.div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2"><Flame className="h-6 w-6 text-white" /><span className="text-white/80 text-sm font-semibold uppercase tracking-wider">Limited Time</span></div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Flash Sale</h2>
            <p className="text-white/80 text-lg max-w-md">Up to 60% off on selected items. Don&apos;t miss out!</p>
          </div>
          <div className="flex items-center gap-3">
            <CountdownDigit value={countdown.hours} label="Hours" />
            <span className="text-white text-2xl font-bold mt-[-16px]">:</span>
            <CountdownDigit value={countdown.minutes} label="Min" />
            <span className="text-white text-2xl font-bold mt-[-16px]">:</span>
            <CountdownDigit value={countdown.seconds} label="Sec" />
          </div>
          <Button size="lg" className="sf-btn-primary bg-white text-rose-600 hover:bg-white/90 shrink-0 shadow-lg font-bold"><ShoppingCart className="mr-2 h-4 w-4" />Shop Flash Sale</Button>
        </div>
      </div>
    </section>
  )
}

function BrandValuesSection() {
  return (
    <section className="sf-brand-values-section border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {brandValues.map((value, i) => (
            <motion.div key={value.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }} className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left cursor-default hover:scale-105 transition-transform duration-200">
              <div className={`sf-brand-value-icon h-11 w-11 rounded-full bg-gradient-to-br ${value.gradient} flex items-center justify-center shrink-0 shadow-sm`}><value.icon className="h-5 w-5 text-white" /></div>
              <div><h3 className="font-semibold text-sm">{value.title}</h3><p className="text-xs text-muted-foreground">{value.desc}</p></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CollectionsSection({ collections, onViewAll }: { collections: Collection[]; onViewAll: () => void }) {
  if (collections.length === 0) return null
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <SectionHeader title="Featured Collections" subtitle="Handpicked collections for you" onViewAll={onViewAll} />
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {collections.map((collection, i) => (
          <motion.div key={collection.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }} className="shrink-0">
            <Card className="w-52 sm:w-64 overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-lg transition-all duration-300" onClick={onViewAll}>
              <div className={`sf-collection-card-gradient h-36 sm:h-44 bg-gradient-to-br ${collectionGradients[i % collectionGradients.length]} relative`}>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-white/40 text-3xl font-bold">{collection.name.substring(0, 2).toUpperCase()}</span></div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-sm group-hover:text-rose-500 transition-colors">{collection.name}</h3>
                {collection.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{collection.description}</p>}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function CategoriesSection({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null
  return (
    <section className="sf-categories-section bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <SectionHeader title="Shop by Category" subtitle="Browse our categories" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
              <Card className="overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className={`sf-category-card-gradient h-24 sm:h-32 bg-gradient-to-br ${collectionGradients[i % collectionGradients.length]} flex items-center justify-center relative`}>
                  <span className="text-white/40 text-4xl font-bold">{cat.name.substring(0, 1).toUpperCase()}</span>
                </div>
                <div className="p-3 text-center">
                  <h3 className="font-semibold text-sm">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat._count?.products || 0} products</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductsSection({ products, loading, onQuickView, lowStockThreshold }: { products: Product[]; loading: boolean; onQuickView: (p: Product) => void; lowStockThreshold: number }) {
  const [productTab, setProductTab] = useState<'new' | 'best'>('new')
  const newArrivals = [...products].sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()).slice(0, 8)
  const bestSellers = [...products].sort((a, b) => (b.orderItems?.length || 0) - (a.orderItems?.length || 0)).slice(0, 8)
  const displayProducts = productTab === 'new' ? newArrivals : bestSellers

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Our Products</h2>
          <div className="sf-section-accent-line h-1 w-16 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 mt-2" />
        </div>
        <div className="sf-product-tabs-bg flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
          <button onClick={() => setProductTab('new')} className={`sf-product-tab-${productTab === 'new' ? 'active' : 'inactive'} px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${productTab === 'new' ? 'bg-white text-rose-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
            <Sparkles className="h-3.5 w-3.5 inline mr-1.5" />New Arrivals
          </button>
          <button onClick={() => setProductTab('best')} className={`sf-product-tab-${productTab === 'best' ? 'active' : 'inactive'} px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${productTab === 'best' ? 'bg-white text-rose-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
            <Flame className="h-3.5 w-3.5 inline mr-1.5" />Best Sellers
          </button>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={productTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
          <ProductGridWithQuickView products={displayProducts} loading={loading} onQuickView={onQuickView} lowStockThreshold={lowStockThreshold} />
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

function PromoBannerSection() {
  return (
    <section className="sf-promo-banner relative bg-gradient-to-r from-rose-500 to-orange-400 overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }} />
      <motion.div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" animate={{ y: [0, 20, 0], x: [0, -15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Summer Sale is On!</h2>
            <p className="text-white/80 text-lg max-w-md">Get up to 50% off on selected items. Limited time only!</p>
          </div>
          <Button size="lg" className="sf-btn-primary bg-white text-rose-500 hover:bg-white/90 shrink-0 shadow-lg hover:shadow-xl transition-all">Shop the Sale <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="sf-testimonials-section relative bg-gradient-to-br from-violet-50 via-rose-50/30 to-amber-50/30 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">What Our Customers Say</h2>
            <div className="sf-testimonial-accent-line h-1 w-16 rounded-full bg-gradient-to-r from-violet-500 to-rose-400 mx-auto mt-3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                <Card className="sf-card-surface p-6 border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm h-full flex flex-col">
                  <div className="flex items-center gap-1 mb-3">{Array.from({ length: 5 }).map((_, si) => (<Star key={si} className={`h-4 w-4 ${si < t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />))}</div>
                  <Quote className="h-6 w-6 text-rose-300 mb-2" />
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{t.quote}</p>
                  <div className="flex items-center gap-3 pt-3 border-t">
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold`}>{t.avatar}</div>
                    <div><p className="text-sm font-semibold">{t.name}</p><p className="text-xs text-muted-foreground">{t.role}</p></div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function NewsletterSection() {
  return (
    <section className="sf-newsletter-section relative bg-gradient-to-br from-neutral-50 via-rose-50/30 to-orange-50/30 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Stay in the Loop</h2>
            <div className="sf-newsletter-accent-line h-1 w-12 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 mx-auto mb-4" />
            <p className="text-muted-foreground mb-8">Subscribe to our newsletter and get 10% off your first order.</p>
            <form onSubmit={(e) => { e.preventDefault(); toast.success('Thank you for subscribing!') }} className="flex gap-2">
              <Input type="email" placeholder="Enter your email address" className="flex-1 bg-[var(--theme-surface)] backdrop-blur-sm border-[var(--theme-border)] text-[var(--theme-text)] focus:ring-2 focus:ring-[var(--theme-accent)]/20 focus:border-[var(--theme-accent)] transition-all" required />
              <Button type="submit" className="sf-newsletter-btn bg-rose-500 hover:bg-rose-600 shrink-0 shadow-sm"><Mail className="h-4 w-4 mr-2" />Subscribe</Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function SocialProofSection() {
  return (
    <section className="bg-gradient-to-r from-neutral-50 via-white to-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-muted-foreground text-sm mb-6">Trusted by thousands of happy customers worldwide</p>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="text-center"><span className="text-3xl font-bold">50K+</span><p className="text-xs text-muted-foreground">Happy Customers</p></div>
          <Separator orientation="vertical" className="h-12" />
          <div className="text-center"><span className="text-3xl font-bold">4.8</span><p className="text-xs text-muted-foreground">Average Rating</p></div>
          <Separator orientation="vertical" className="h-12" />
          <div className="text-center"><span className="text-3xl font-bold">100+</span><p className="text-xs text-muted-foreground">Countries</p></div>
        </div>
      </div>
    </section>
  )
}

function RecentlyViewedSection() {
  return null // Placeholder — would require persistent storage
}

function InstagramFeedSection() {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Follow Us on Instagram</h2>
        <p className="text-muted-foreground text-sm mb-8">@shopforge</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`aspect-square bg-gradient-to-br ${collectionGradients[i % collectionGradients.length]} rounded-lg flex items-center justify-center group cursor-pointer hover:opacity-80 transition-opacity`}>
              <Instagram className="h-6 w-6 text-white/40 group-hover:text-white/80 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function LookbookSection() {
  return (
    <section className="py-12 sm:py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Lookbook</h2>
        <p className="text-muted-foreground text-sm mb-8">Curated styles for every occasion</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`aspect-[3/4] bg-gradient-to-br ${collectionGradients[i % collectionGradients.length]} rounded-xl flex items-center justify-center group cursor-pointer hover:shadow-lg transition-all`}>
              <BookOpen className="h-10 w-10 text-white/30 group-hover:text-white/60 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Product Grid with Quick View ───────────────────────────────────────────

function ProductGridWithQuickView({ products, loading, onQuickView, lowStockThreshold }: {
  products: Product[]
  loading?: boolean
  onQuickView: (product: Product) => void
  lowStockThreshold: number
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden border-0 shadow-sm"><Skeleton className="aspect-square" /><div className="p-3 sm:p-4 space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-4 w-full" /><Skeleton className="h-5 w-20" /></div></Card>
        ))}
      </div>
    )
  }
  const gradientPalettes = ['from-rose-400 to-orange-300', 'from-violet-400 to-purple-300', 'from-emerald-400 to-teal-300', 'from-amber-400 to-yellow-300', 'from-sky-400 to-cyan-300', 'from-fuchsia-400 to-pink-300']
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product, i) => {
        const idx = product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradientPalettes.length
        const gradient = gradientPalettes[idx]
        const hasDiscount = product.comparePrice && product.comparePrice > product.price
        const stock = product.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reserved, 0) ?? 99
        const isLowStock = stock > 0 && stock <= lowStockThreshold
        return (
          <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
            <Card className="group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="relative aspect-square overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-110`} />
                {hasDiscount && <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-semibold">-{Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}% OFF</Badge>}
                {isLowStock && <Badge className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-semibold flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Only {stock} left</Badge>}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button size="sm" variant="secondary" className="shadow-lg backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); onQuickView(product) }}><Eye className="h-4 w-4 mr-1.5" />Quick View</Button>
                </div>
                {stock <= 0 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10"><span className="bg-white/95 text-gray-800 px-4 py-2 rounded-lg text-sm font-bold">Out of Stock</span></div>}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-white/40 text-2xl sm:text-3xl font-bold select-none">{product.name.substring(0, 2).toUpperCase()}</span></div>
              </div>
              <div className="p-3 sm:p-4">
                {product.category && <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{product.category.name}</p>}
                <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1.5 group-hover:text-rose-500 transition-colors">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, j) => (<Star key={j} className={`h-3 w-3 ${j < 4 ? 'fill-amber-400 text-amber-400' : j === 4 ? 'fill-amber-400/50 text-amber-400' : 'text-gray-200'}`} />))}</div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                  {hasDiscount && <span className="text-sm text-muted-foreground line-through">${product.comparePrice!.toFixed(2)}</span>}
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Main StorefrontHome Component ──────────────────────────────────────────

export function StorefrontHome() {
  const { setStorefrontPage, selectedStoreId, setSelectedProductId } = useAppStore()
  const [products, setProducts] = useState<Product[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  // Get theme layout config
  const layoutConfig = useThemeLayout()
  const layout = layoutConfig ?? getThemeConfig('minimal-dawn')

  // Flash sale countdown
  const countdown = useCountdown(24)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeId = sessionStorage.getItem('shopforge_store_id') || selectedStoreId
        if (!storeId) return
        const res = await fetch(`/api/storefront?storeId=${storeId}`)
        if (res.ok) {
          const data = await res.json()
          setProducts(data.products || [])
          setCollections(data.collections || [])
          setCategories(data.categories || [])
        }
      } catch (err) {
        console.error('Failed to fetch storefront data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedStoreId])

  // Enable smooth scrolling
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => { document.documentElement.style.scrollBehavior = '' }
  }, [])

  const trendingProducts = [...products].sort((a, b) => (b.orderItems?.length || 0) - (a.orderItems?.length || 0)).slice(0, 4)

  const handleQuickView = (product: Product) => { setQuickViewProduct(product); setQuickViewOpen(true) }

  const handleAddToCart = async (product: Product) => {
    try {
      const sessionId = sessionStorage.getItem('shopforge_session_id') || `sess_${Date.now()}`
      sessionStorage.setItem('shopforge_session_id', sessionId)
      const storeId = sessionStorage.getItem('shopforge_store_id')
      if (!storeId) { toast.error('Store not found'); return }
      const res = await fetch('/api/storefront/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, sessionId, items: [{ productId: product.id, quantity: 1, price: product.price }] }),
      })
      if (res.ok) { toast.success(`${product.name} added to cart`) } else { toast.error('Failed to add to cart') }
    } catch { toast.error('Failed to add to cart') }
  }

  // Section renderer map
  const sectionRenderers: Record<string, React.ReactNode> = {
    'hero': <HeroSection layout={layout} />,
    'trust-badges': <TrustBadgesSection />,
    'trending': <TrendingSection products={trendingProducts} onViewAll={() => setStorefrontPage('category')} onAddToCart={handleAddToCart} />,
    'flash-sale': <FlashSaleSection countdown={countdown} />,
    'brand-values': <BrandValuesSection />,
    'collections': <CollectionsSection collections={collections} onViewAll={() => setStorefrontPage('category')} />,
    'categories': <CategoriesSection categories={categories} />,
    'products': <ProductsSection products={products} loading={loading} onQuickView={handleQuickView} lowStockThreshold={layout.cro.lowStockThreshold} />,
    'promo-banner': <PromoBannerSection />,
    'testimonials': <TestimonialsSection />,
    'newsletter': <NewsletterSection />,
    'social-proof': <SocialProofSection />,
    'recently-viewed': <RecentlyViewedSection />,
    'instagram-feed': <InstagramFeedSection />,
    'lookbook': <LookbookSection />,
  }

  // Build sections from layout config, respecting visibility and order
  const visibleSections = layout.sections.filter(s => s.visible)

  return (
    <div>
      {/* Urgency Message Bar */}
      {layout.cro.showUrgencyTimer && <UrgencyBar message={layout.cro.urgencyMessage} />}

      {/* Render sections based on theme config */}
      {visibleSections.map((section) => (
        <div key={section.id}>{sectionRenderers[section.id] ?? null}</div>
      ))}

      {/* CRO Notifications */}
      <CRONotifications cro={layout.cro} products={products} />

      {/* Product Quick View Modal */}
      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {quickViewProduct && (
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-1/2 bg-gradient-to-br from-rose-400 to-orange-300 relative min-h-[250px] sm:min-h-[400px] flex items-center justify-center">
                <span className="text-white/30 text-6xl font-bold">{quickViewProduct.name.substring(0, 2).toUpperCase()}</span>
                {quickViewProduct.comparePrice && quickViewProduct.comparePrice > quickViewProduct.price && (
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white">-{Math.round(((quickViewProduct.comparePrice - quickViewProduct.price) / quickViewProduct.comparePrice) * 100)}% OFF</Badge>
                )}
              </div>
              <div className="sm:w-1/2 p-6 flex flex-col">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl">{quickViewProduct.name}</DialogTitle>
                  <DialogDescription>{quickViewProduct.category?.name || 'Product Details'}</DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`h-4 w-4 ${i < 4 ? 'fill-amber-400 text-amber-400' : i === 4 ? 'fill-amber-400/50 text-amber-400' : 'text-gray-200'}`} />))}</div>
                  <span className="text-sm text-muted-foreground">{quickViewProduct.reviews?.length || 0} reviews</span>
                </div>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-2xl font-bold">${quickViewProduct.price.toFixed(2)}</span>
                  {quickViewProduct.comparePrice && quickViewProduct.comparePrice > quickViewProduct.price && (<span className="text-lg text-muted-foreground line-through">${quickViewProduct.comparePrice.toFixed(2)}</span>)}
                </div>
                {quickViewProduct.shortDesc && <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{quickViewProduct.shortDesc}</p>}
                <div className="mb-4">
                  {(() => {
                    const stock = quickViewProduct.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reserved, 0) ?? 99
                    if (stock <= 0) return <Badge variant="destructive">Out of Stock</Badge>
                    if (stock <= layout.cro.lowStockThreshold) return <Badge variant="secondary" className="bg-amber-100 text-amber-800"><AlertTriangle className="h-3 w-3 mr-1" />Only {stock} left</Badge>
                    return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">In Stock</Badge>
                  })()}
                </div>
                <Separator className="mb-4" />
                <div className="flex gap-3 mt-auto">
                  <Button className="flex-1 bg-rose-500 hover:bg-rose-600" onClick={() => { handleAddToCart(quickViewProduct); setQuickViewOpen(false) }}><ShoppingCart className="h-4 w-4 mr-2" />Add to Cart</Button>
                  <Button variant="outline" onClick={() => { setSelectedProductId(quickViewProduct.id); setStorefrontPage('product'); setQuickViewOpen(false) }}><Eye className="h-4 w-4 mr-2" />Full Details</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
