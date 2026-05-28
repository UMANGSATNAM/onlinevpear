'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Truck, Headphones, RotateCcw, Shield, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
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

// Reusable section header component with gradient line and enhanced View All
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
        {/* Gradient line below title */}
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
  const { setStorefrontPage, selectedStoreId } = useAppStore()
  const [products, setProducts] = useState<Product[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

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

  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 8)

  const bestSellers = [...products]
    .sort((a, b) => (b.orderItems?.length || 0) - (a.orderItems?.length || 0))
    .slice(0, 8)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        {/* Floating decorative blobs */}
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
                {/* Pulse ring */}
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

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <SectionHeader
          title="New Arrivals"
          subtitle="Fresh picks just for you"
          onViewAll={() => setStorefrontPage('category')}
        />
        <ProductGrid products={newArrivals} loading={loading} />
      </section>

      {/* Promotional Banner */}
      <section className="relative bg-gradient-to-r from-rose-500 to-orange-400 overflow-hidden">
        {/* Diagonal pattern overlay */}
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
        {/* Floating background element */}
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

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <SectionHeader
          title="Best Sellers"
          subtitle="Our most popular products"
          onViewAll={() => setStorefrontPage('category')}
        />
        <ProductGrid products={bestSellers} loading={loading} />
      </section>

      {/* Newsletter Section */}
      <section className="relative bg-gradient-to-br from-neutral-50 via-rose-50/30 to-orange-50/30 overflow-hidden">
        {/* Decorative animated elements */}
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
    </div>
  )
}
