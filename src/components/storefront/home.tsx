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
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
  { icon: Headphones, title: '24/7 Support', desc: 'Dedicated customer service' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
]

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
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6">
                New Collection Available
                <ArrowRight className="h-3 w-3" />
              </span>
            </motion.div>
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Discover Your
              <br />
              <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                Perfect Style
              </span>
            </motion.h1>
            <motion.p
              className="text-lg text-neutral-300 mb-8 max-w-lg"
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
                className="bg-rose-500 hover:bg-rose-600 text-white"
              >
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setStorefrontPage('category')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                View Collections
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {brandValues.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left"
              >
                <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                  <value.icon className="h-5 w-5 text-rose-500" />
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Featured Collections</h2>
              <p className="text-muted-foreground text-sm mt-1">Handpicked collections for you</p>
            </div>
            <Button variant="ghost" onClick={() => setStorefrontPage('category')}>
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
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
                  className="w-52 sm:w-64 overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-md transition-all"
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
        <section className="bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Shop by Category</h2>
                <p className="text-muted-foreground text-sm mt-1">Browse our categories</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card
                    className="overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-md transition-all"
                    onClick={() => setStorefrontPage('category')}
                  >
                    <div className={`h-24 sm:h-32 bg-gradient-to-br ${collectionGradients[i % collectionGradients.length]} flex items-center justify-center relative`}>
                      <span className="text-white/40 text-4xl font-bold">{cat.name.substring(0, 1).toUpperCase()}</span>
                    </div>
                    <div className="p-3 text-center">
                      <h3 className="font-semibold text-sm">{cat.name}</h3>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">New Arrivals</h2>
            <p className="text-muted-foreground text-sm mt-1">Fresh picks just for you</p>
          </div>
          <Button variant="ghost" onClick={() => setStorefrontPage('category')}>
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <ProductGrid products={newArrivals} loading={loading} />
      </section>

      {/* Promotional Banner */}
      <section className="bg-gradient-to-r from-rose-500 to-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
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
              className="bg-white text-rose-500 hover:bg-white/90 shrink-0"
            >
              Shop the Sale
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Best Sellers</h2>
            <p className="text-muted-foreground text-sm mt-1">Our most popular products</p>
          </div>
          <Button variant="ghost" onClick={() => setStorefrontPage('category')}>
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <ProductGrid products={bestSellers} loading={loading} />
      </section>

      {/* Newsletter Section */}
      <section className="bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">Stay in the Loop</h2>
            <p className="text-muted-foreground mb-6">
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
                className="flex-1"
                required
              />
              <Button type="submit" className="bg-rose-500 hover:bg-rose-600 shrink-0">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
