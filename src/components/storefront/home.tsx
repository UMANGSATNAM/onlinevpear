'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Truck, Headphones, RotateCcw, Shield, ChevronRight, Star, Quote, X, ShoppingCart, Eye } from 'lucide-react'
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
import { toast } from 'sonner'

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

// Trust badges data
const trustBadges = [
  { icon: Shield, label: 'Secure Payment', desc: '256-bit SSL encryption' },
  { icon: RotateCcw, label: 'Free Returns', desc: '30-day money back' },
  { icon: Headphones, label: '24/7 Support', desc: 'Always here to help' },
  { icon: Star, label: 'Quality Guarantee', desc: 'Premium products only' },
]

// Testimonials data
const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Verified Buyer',
    quote: 'Absolutely love the quality of products! The shipping was incredibly fast and everything arrived in perfect condition. Will definitely order again.',
    rating: 5,
    avatar: 'SJ',
    gradient: 'from-rose-500 to-pink-400',
  },
  {
    name: 'Michael Chen',
    role: 'Loyal Customer',
    quote: 'I\'ve been shopping here for over a year now and the experience keeps getting better. The customer service team is phenomenal.',
    rating: 5,
    avatar: 'MC',
    gradient: 'from-violet-500 to-purple-400',
  },
  {
    name: 'Emily Rodriguez',
    role: 'First-time Buyer',
    quote: 'Was skeptical at first but the product exceeded my expectations. The packaging was beautiful and the item was exactly as described.',
    rating: 4,
    avatar: 'ER',
    gradient: 'from-emerald-500 to-teal-400',
  },
  {
    name: 'David Park',
    role: 'Repeat Customer',
    quote: 'Great value for money! The return process was hassle-free when I needed a different size. Highly recommend this store to everyone.',
    rating: 5,
    avatar: 'DP',
    gradient: 'from-amber-500 to-orange-400',
  },
  {
    name: 'Lisa Thompson',
    role: 'Premium Member',
    quote: 'The quality is consistently outstanding. I appreciate the attention to detail in every product. This is my go-to online store now.',
    rating: 5,
    avatar: 'LT',
    gradient: 'from-sky-500 to-cyan-400',
  },
]

// Reusable section header component
function SectionHeader({
  title,
  subtitle,
  onViewAll,
}: {
  title: string
  subtitle: string
  onViewAll?: () => void
}) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
        <div className="h-1 w-16 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 mt-2" />
        <p className="text-muted-foreground text-sm mt-2">{subtitle}</p>
      </div>
      {onViewAll && (
        <Button
          variant="ghost"
          onClick={onViewAll}
          className="group text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          View All
          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Button>
      )}
    </div>
  )
}

export function StorefrontHome() {
  const { setStorefrontPage, selectedStoreId, setSelectedProductId } = useAppStore()
  const [products, setProducts] = useState<Product[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const testimonialRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
    return () => {
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    testimonialRef.current = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => {
      if (testimonialRef.current) clearInterval(testimonialRef.current)
    }
  }, [])

  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 8)

  const bestSellers = [...products]
    .sort((a, b) => (b.orderItems?.length || 0) - (a.orderItems?.length || 0))
    .slice(0, 8)

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product)
    setQuickViewOpen(true)
  }

  const handleAddToCart = async (product: Product) => {
    try {
      const sessionId = sessionStorage.getItem('shopforge_session_id') || `sess_${Date.now()}`
      sessionStorage.setItem('shopforge_session_id', sessionId)

      const storeId = sessionStorage.getItem('shopforge_store_id')
      if (!storeId) {
        toast.error('Store not found')
        return
      }

      const res = await fetch('/api/storefront/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          sessionId,
          items: [{ productId: product.id, quantity: 1, price: product.price }],
        }),
      })
      if (res.ok) {
        toast.success(`${product.name} added to cart`)
      } else {
        toast.error('Failed to add to cart')
      }
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="absolute inset-0 opacity-30">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"
            animate={{ y: [0, -12, 0], x: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium mb-6 border border-white/10">
                New Collection Available
                <ArrowRight className="h-3 w-3" />
              </span>
            </motion.div>
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Discover Your
              <br />
              <span className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-transparent drop-shadow-lg">
                Perfect Style
              </span>
            </motion.h1>
            <motion.p
              className="text-lg text-neutral-300 mb-8 max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Explore our curated collection of premium products designed to elevate your everyday experience.
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                size="lg"
                onClick={() => setStorefrontPage('category')}
                className="bg-rose-500 hover:bg-rose-600 text-white relative overflow-hidden group"
              >
                <span className="absolute inset-0 rounded-md bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
                <span className="absolute inset-0 rounded-md animate-ping bg-rose-400/20" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setStorefrontPage('category')}
                className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all focus:ring-2 focus:ring-white/20"
              >
                View Collections
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges Bar */}
      <section className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="flex items-center gap-3 justify-center sm:justify-start"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
                  <badge.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{badge.label}</p>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {brandValues.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left cursor-default hover:scale-105 transition-transform duration-200"
              >
                <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${value.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                  <value.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{value.title}</h3>
                  <p className="text-xs text-muted-foreground">{value.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      {collections.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <SectionHeader
            title="Featured Collections"
            subtitle="Handpicked collections for you"
            onViewAll={() => setStorefrontPage('category')}
          />
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {collections.map((collection, i) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="shrink-0"
              >
                <Card
                  className="w-52 sm:w-64 overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-lg transition-all duration-300"
                  onClick={() => setStorefrontPage('category')}
                >
                  <div className={`h-36 sm:h-44 bg-gradient-to-br ${collectionGradients[i % collectionGradients.length]} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white/40 text-3xl font-bold">{collection.name.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-sm group-hover:text-rose-500 transition-colors">{collection.name}</h3>
                    {collection.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{collection.description}</p>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Categories Quick Access */}
      {categories.length > 0 && (
        <section className="bg-gradient-to-b from-neutral-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <SectionHeader
              title="Shop by Category"
              subtitle="Browse our categories"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card
                    className="overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => setStorefrontPage('category')}
                  >
                    <div className={`h-24 sm:h-32 bg-gradient-to-br ${collectionGradients[i % collectionGradients.length]} flex items-center justify-center relative`}>
                      <span className="text-white/40 text-4xl font-bold">{cat.name.substring(0, 1).toUpperCase()}</span>
                    </div>
                    <div className="p-3 text-center">
                      <h3 className="font-semibold text-sm group-hover:text-rose-500 transition-colors">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cat._count?.products || 0} products
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals with Quick View */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <SectionHeader
          title="New Arrivals"
          subtitle="Fresh picks just for you"
          onViewAll={() => setStorefrontPage('category')}
        />
        <ProductGridWithQuickView products={newArrivals} loading={loading} onQuickView={handleQuickView} />
      </section>

      {/* Promotional Banner */}
      <section className="relative bg-gradient-to-r from-rose-500 to-orange-400 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255,255,255,0.1) 10px,
              rgba(255,255,255,0.1) 20px
            )`,
          }}
        />
        <motion.div
          className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Summer Sale is On!
              </h2>
              <p className="text-white/80 text-lg max-w-md">
                Get up to 50% off on selected items. Limited time only - don&apos;t miss out!
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setStorefrontPage('category')}
              className="bg-white text-rose-500 hover:bg-white/90 shrink-0 shadow-lg hover:shadow-xl transition-all focus:ring-2 focus:ring-white/30"
            >
              Shop the Sale
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Best Sellers with Quick View */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <SectionHeader
          title="Best Sellers"
          subtitle="Our most popular products"
          onViewAll={() => setStorefrontPage('category')}
        />
        <ProductGridWithQuickView products={bestSellers} loading={loading} onQuickView={handleQuickView} />
      </section>

      {/* Testimonials Section */}
      <section className="relative bg-gradient-to-br from-violet-50 via-rose-50/30 to-amber-50/30 overflow-hidden">
        <motion.div
          className="absolute top-10 right-10 w-32 h-32 bg-violet-200/20 rounded-full blur-xl"
          animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-24 h-24 bg-rose-200/20 rounded-full blur-xl"
          animate={{ y: [0, 8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold">What Our Customers Say</h2>
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-violet-500 to-rose-400 mx-auto mt-3" />
              <p className="text-muted-foreground mt-3 max-w-md mx-auto">Real reviews from real customers who love our products</p>
            </div>

            {/* Testimonials Carousel */}
            <div className="relative">
              <div className="overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={testimonialIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {/* Show 3 at a time on desktop, 1 on mobile */}
                    {[0, 1, 2].map((offset) => {
                      const idx = (testimonialIndex + offset) % testimonials.length
                      const t = testimonials[idx]
                      return (
                        <Card key={`${idx}-${offset}`} className="p-6 border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm">
                          <div className="flex items-center gap-1 mb-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                          <Quote className="h-6 w-6 text-rose-300 mb-2" />
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t.quote}</p>
                          <div className="flex items-center gap-3 mt-auto pt-3 border-t">
                            <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold`}>
                              {t.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{t.name}</p>
                              <p className="text-xs text-muted-foreground">{t.role}</p>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dots navigation */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === testimonialIndex ? 'w-6 bg-rose-500' : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative bg-gradient-to-br from-neutral-50 via-rose-50/30 to-orange-50/30 overflow-hidden">
        <motion.div
          className="absolute top-10 right-10 w-20 h-20 bg-rose-200/30 rounded-full blur-xl"
          animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-24 h-24 bg-orange-200/30 rounded-full blur-xl"
          animate={{ y: [0, 8, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-16 h-16 bg-amber-200/20 rounded-full blur-lg"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="max-w-xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Stay in the Loop</h2>
              <div className="h-1 w-12 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 mx-auto mb-4" />
              <p className="text-muted-foreground mb-8">
                Subscribe to our newsletter and get 10% off your first order.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  toast.success('Thank you for subscribing! Check your email for 10% off.')
                }}
                className="flex gap-2"
              >
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 bg-white/80 backdrop-blur-sm border-neutral-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition-all"
                  required
                />
                <Button type="submit" className="bg-rose-500 hover:bg-rose-600 shrink-0 shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-rose-500/30">
                  Subscribe
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Quick View Modal */}
      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {quickViewProduct && (
            <div className="flex flex-col sm:flex-row">
              {/* Image side */}
              <div className="sm:w-1/2 bg-gradient-to-br from-rose-400 to-orange-300 relative min-h-[250px] sm:min-h-[400px] flex items-center justify-center">
                <span className="text-white/30 text-6xl font-bold">{quickViewProduct.name.substring(0, 2).toUpperCase()}</span>
                {quickViewProduct.comparePrice && quickViewProduct.comparePrice > quickViewProduct.price && (
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                    -{Math.round(((quickViewProduct.comparePrice - quickViewProduct.price) / quickViewProduct.comparePrice) * 100)}% OFF
                  </Badge>
                )}
              </div>

              {/* Details side */}
              <div className="sm:w-1/2 p-6 flex flex-col">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl">{quickViewProduct.name}</DialogTitle>
                  <DialogDescription>
                    {quickViewProduct.category?.name || 'Product Details'}
                  </DialogDescription>
                </DialogHeader>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < 4 ? 'fill-amber-400 text-amber-400' : i === 4 ? 'fill-amber-400/50 text-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {quickViewProduct.reviews?.length || 0} reviews
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-2xl font-bold">${quickViewProduct.price.toFixed(2)}</span>
                  {quickViewProduct.comparePrice && quickViewProduct.comparePrice > quickViewProduct.price && (
                    <span className="text-lg text-muted-foreground line-through">${quickViewProduct.comparePrice.toFixed(2)}</span>
                  )}
                </div>

                {/* Description */}
                {quickViewProduct.shortDesc && (
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{quickViewProduct.shortDesc}</p>
                )}

                {/* Stock */}
                <div className="mb-4">
                  {(() => {
                    const stock = quickViewProduct.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reserved, 0) ?? 99
                    if (stock <= 0) return <Badge variant="destructive">Out of Stock</Badge>
                    if (stock < 10) return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Only {stock} left</Badge>
                    return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">In Stock</Badge>
                  })()}
                </div>

                <Separator className="mb-4" />

                {/* Actions */}
                <div className="flex gap-3 mt-auto">
                  <Button
                    className="flex-1 bg-rose-500 hover:bg-rose-600"
                    onClick={() => {
                      handleAddToCart(quickViewProduct)
                      setQuickViewOpen(false)
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProductId(quickViewProduct.id)
                      setStorefrontPage('product')
                      setQuickViewOpen(false)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Full Details
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Product grid that supports Quick View
function ProductGridWithQuickView({ products, loading, onQuickView }: {
  products: Product[]
  loading?: boolean
  onQuickView: (product: Product) => void
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden border-0 shadow-sm">
            <Skeleton className="aspect-square" />
            <div className="p-3 sm:p-4 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-20" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const gradientPalettes = [
    'from-rose-400 to-orange-300',
    'from-violet-400 to-purple-300',
    'from-emerald-400 to-teal-300',
    'from-amber-400 to-yellow-300',
    'from-sky-400 to-cyan-300',
    'from-fuchsia-400 to-pink-300',
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product, i) => {
        const idx = product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradientPalettes.length
        const gradient = gradientPalettes[idx]
        const hasDiscount = product.comparePrice && product.comparePrice > product.price
        const stock = product.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reserved, 0) ?? 99

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Card className="group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="relative aspect-square overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-110`} />

                {/* Badges */}
                {hasDiscount && (
                  <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-semibold">
                    -{Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}% OFF
                  </Badge>
                )}

                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="shadow-lg backdrop-blur-sm"
                    onClick={(e) => { e.stopPropagation(); onQuickView(product) }}
                  >
                    <Eye className="h-4 w-4 mr-1.5" />
                    Quick View
                  </Button>
                </div>

                {/* Out of Stock */}
                {stock <= 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <span className="bg-white/95 text-gray-800 px-4 py-2 rounded-lg text-sm font-bold">Out of Stock</span>
                  </div>
                )}

                {/* Product initials */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-white/40 text-2xl sm:text-3xl font-bold select-none">{product.name.substring(0, 2).toUpperCase()}</span>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                {product.category && (
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{product.category.name}</p>
                )}
                <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1.5 group-hover:text-rose-500 transition-colors">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-3 w-3 ${j < 4 ? 'fill-amber-400 text-amber-400' : j === 4 ? 'fill-amber-400/50 text-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through">${product.comparePrice!.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
