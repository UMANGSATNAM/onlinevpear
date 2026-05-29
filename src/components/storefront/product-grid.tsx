'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Star, Eye, Heart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/lib/store'
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
  variants?: Array<{ id: string; title: string; price: number; options?: string }>
  inventory?: Array<{ quantity: number; reserved: number }>
  status?: string
  reviews?: Array<{ rating: number }>
  createdAt?: string
}

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  loadingMore?: boolean
}

// Gradient color palette for product image placeholders
const gradientPalettes = [
  'from-rose-400 to-orange-300',
  'from-violet-400 to-purple-300',
  'from-emerald-400 to-teal-300',
  'from-amber-400 to-yellow-300',
  'from-sky-400 to-cyan-300',
  'from-fuchsia-400 to-pink-300',
  'from-lime-400 to-green-300',
  'from-indigo-400 to-blue-300',
]

// Color map for variant swatches
const colorMap: Record<string, string> = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
  black: '#1f2937', white: '#f9fafb', pink: '#ec4899', purple: '#a855f7',
  orange: '#f97316', brown: '#92400e', gray: '#6b7280', grey: '#6b7280',
  navy: '#1e3a5f', teal: '#14b8a6', coral: '#f87171', burgundy: '#7f1d1d',
  olive: '#84cc16', gold: '#d97706', silver: '#9ca3af', beige: '#d2b48c',
  cream: '#fef3c7', khaki: '#a3a066', maroon: '#800000', lavender: '#a78bfa',
}

function getGradient(id: string) {
  const index = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradientPalettes.length
  return gradientPalettes[index]
}

function getAverageRating(reviews?: Array<{ rating: number }>) {
  if (!reviews || reviews.length === 0) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

function formatPrice(price: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
}

function isNewProduct(createdAt?: string) {
  if (!createdAt) return false
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return new Date(createdAt) > thirtyDaysAgo
}

// Extract color names from variant options
function extractColorSwatches(variants?: Array<{ id: string; title: string; price: number; options?: string }>) {
  if (!variants || variants.length === 0) return []
  const colors: string[] = []
  variants.forEach((v) => {
    if (v.options) {
      try {
        const opts = JSON.parse(v.options)
        Object.entries(opts).forEach(([key, value]) => {
          if (key.toLowerCase() === 'color' && typeof value === 'string') {
            if (!colors.includes(value)) colors.push(value)
          }
        })
      } catch {
        // ignore
      }
    }
  })
  return colors
}

function ProductCard({ product }: { product: Product }) {
  const { setSelectedProductId, setStorefrontPage } = useAppStore()
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const gradient = getGradient(product.id)
  const rating = getAverageRating(product.reviews)
  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0
  const stock = product.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reserved, 0) ?? 99
  const isOutOfStock = stock <= 0
  const isNew = isNewProduct(product.createdAt)
  const colorSwatches = extractColorSwatches(product.variants)

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedProductId(product.id)
    setStorefrontPage('product')
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setAddingToCart(true)
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
    } finally {
      setTimeout(() => setAddingToCart(false), 600)
    }
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleQuickView}
      >
        {/* Image Area */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br rounded-t-lg">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-110`} />

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {/* Sale Badge */}
            {hasDiscount && discountPct > 0 && (
              <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 text-xs font-semibold shadow-sm">
                -{discountPct}% OFF
              </Badge>
            )}
            {/* New Badge */}
            {isNew && (
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 text-xs font-semibold shadow-sm">
                <Sparkles className="h-3 w-3 mr-0.5" />
                New
              </Badge>
            )}
          </div>

          {/* Wishlist Heart - Top Right */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all hover:scale-110"
          >
            <Heart className={`h-4 w-4 transition-all ${isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600'}`} />
          </button>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
              <span className="bg-white/95 text-gray-800 px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick View Overlay - Bottom of image area */}
          <AnimatePresence>
            {isHovered && !isOutOfStock && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent"
              >
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1 h-9 text-xs font-medium shadow-lg backdrop-blur-sm"
                    onClick={handleQuickView}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Quick View
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product initials as visual */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white/50 text-2xl sm:text-3xl font-bold select-none">
              {product.name.substring(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Add to Cart Button - grows from icon to full button on hover */}
          <AnimatePresence>
            {isHovered && !isOutOfStock && (
              <motion.button
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={handleAddToCart}
                className="absolute bottom-14 right-3 z-20 h-10 min-w-[40px] bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all overflow-hidden group/cart"
              >
                {addingToCart ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-3" />
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 shrink-0 mx-3 group-hover/cart:mx-2 transition-all" />
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      className="overflow-hidden whitespace-nowrap text-sm font-medium pr-3"
                    >
                      Add
                    </motion.span>
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Info Area */}
        <div className="p-3 sm:p-4">
          {/* Category */}
          {product.category && (
            <p className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wider">{product.category.name}</p>
          )}

          {/* Name */}
          <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1.5 group-hover:text-rose-500 transition-colors">
            {product.name}
          </h3>

          {/* Rating - always show with 4.5 format */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = rating > 0 ? i < Math.floor(rating) : i < 4
                const halfFilled = rating > 0 ? i === Math.floor(rating) && rating % 1 >= 0.5 : i === 4
                return (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      filled
                        ? 'fill-amber-400 text-amber-400'
                        : halfFilled
                        ? 'fill-amber-400/50 text-amber-400'
                        : 'text-gray-200'
                    }`}
                  />
                )
              })}
            </div>
            <span className="text-xs text-muted-foreground">
              {rating > 0 ? rating.toFixed(1) : '4.5'}
              {product.reviews && product.reviews.length > 0 && (
                <span className="ml-0.5">({product.reviews.length})</span>
              )}
            </span>
          </div>

          {/* Price - more prominent */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg text-foreground">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.comparePrice!)}
              </span>
            )}
          </div>

          {/* Color Swatches */}
          {colorSwatches.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5">
              {colorSwatches.slice(0, 5).map((color) => (
                <div
                  key={color}
                  className="h-4 w-4 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: colorMap[color.toLowerCase()] || color.toLowerCase() }}
                  title={color}
                />
              ))}
              {colorSwatches.length > 5 && (
                <span className="text-[10px] text-muted-foreground">+{colorSwatches.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <Skeleton className="aspect-square" />
      <div className="p-3 sm:p-4 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-20" />
      </div>
    </Card>
  )
}

export function ProductGrid({ products, loading, onLoadMore, hasMore, loadingMore }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No products found</h3>
        <p className="text-muted-foreground text-sm">Check back later for new additions.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="min-w-[200px]"
          >
            {loadingMore ? 'Loading...' : 'Load More Products'}
          </Button>
        </div>
      )}
    </div>
  )
}

export { ProductCard, formatPrice, getGradient, getAverageRating }
