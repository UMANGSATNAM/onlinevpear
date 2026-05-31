'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Star, Eye, Heart, Sparkles, Zap,
  Crown, Leaf, Sun, Waves, Diamond, Shirt, TreePine, Bolt,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/lib/store'
import { useThemeLayout } from '@/lib/theme-context'
import type { ProductCardVariant, GridLayout } from '@/lib/theme-configs'
import { toast } from 'sonner'

// ─── Types ──────────────────────────────────────────────────────────────────

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

// ─── Shared Helpers ─────────────────────────────────────────────────────────

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

const colorMap: Record<string, string> = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
  black: '#1f2937', white: '#f9fafb', pink: '#ec4899', purple: '#a855f7',
  orange: '#f97316', brown: '#92400e', gray: '#6b7280', grey: '#6b7280',
  navy: '#1e3a5f', teal: '#14b8a6', coral: '#f87171', burgundy: '#7f1d1d',
  olive: '#84cc16', gold: '#d97706', silver: '#9ca3af', beige: '#d2b48c',
  cream: '#fef3c7', khaki: '#a3a066', maroon: '#800000', lavender: '#a78bfa',
}

export function getGradient(id: string) {
  const index = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradientPalettes.length
  return gradientPalettes[index]
}

export function getAverageRating(reviews?: Array<{ rating: number }>) {
  if (!reviews || reviews.length === 0) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

export function formatPrice(price: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
}

// GST inclusive text component for product cards
function GSTText({ className = '' }: { className?: string }) {
  return (
    <p className={`text-[10px] text-muted-foreground/70 ${className}`}>
      Inclusive of all taxes
    </p>
  )
}

function isNewProduct(createdAt?: string) {
  if (!createdAt) return false
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return new Date(createdAt) > thirtyDaysAgo
}

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

// Extract size options from variants
function extractSizeOptions(variants?: Array<{ id: string; title: string; price: number; options?: string }>) {
  if (!variants || variants.length === 0) return []
  const sizes: string[] = []
  variants.forEach((v) => {
    if (v.options) {
      try {
        const opts = JSON.parse(v.options)
        Object.entries(opts).forEach(([key, value]) => {
          if (key.toLowerCase() === 'size' && typeof value === 'string') {
            if (!sizes.includes(value)) sizes.push(value)
          }
        })
      } catch {
        // ignore
      }
    }
  })
  return sizes
}

// ─── Shared Star Rating Component ──────────────────────────────────────────

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'xs' | 'sm' | 'md' }) {
  const sizeClass = size === 'xs' ? 'h-2.5 w-2.5' : size === 'md' ? 'h-4 w-4' : 'h-3 w-3'
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = rating > 0 ? i < Math.floor(rating) : i < 4
        const halfFilled = rating > 0 ? i === Math.floor(rating) && rating % 1 >= 0.5 : i === 4
        return (
          <Star
            key={i}
            className={`${sizeClass} ${
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
  )
}

// ─── Shared Interaction Handlers ───────────────────────────────────────────

function useProductInteractions(product: Product) {
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
  const sizeOptions = extractSizeOptions(product.variants)
  const displayRating = rating > 0 ? rating : 4.5

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedProductId(product.id)
    setStorefrontPage('product')
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setAddingToCart(true)
    try {
      const sessionId = sessionStorage.getItem('vepar_session_id') || `sess_${Date.now()}`
      sessionStorage.setItem('vepar_session_id', sessionId)
      const storeId = sessionStorage.getItem('vepar_store_id')
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

  return {
    isHovered, setIsHovered, isWishlisted, addingToCart, gradient, rating: displayRating,
    hasDiscount, discountPct, stock, isOutOfStock, isNew, colorSwatches, sizeOptions,
    handleQuickView, handleAddToCart, handleToggleWishlist,
  }
}

// ─── Variant 1: Clean ──────────────────────────────────────────────────────
// Minimal card with thin border, small image, text below. No hover effects. Very understated.

function CleanCard({ product }: { product: Product }) {
  const ctx = useProductInteractions(product)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="sf-product-card"
    >
      <div
        className="group cursor-pointer border border-gray-100 bg-white rounded-md overflow-hidden"
        onClick={ctx.handleQuickView}
      >
        {/* Small image area */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${ctx.gradient}`} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white/40 text-xl font-light select-none">
              {product.name.substring(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Minimal badge area */}
          <div className="absolute top-2 left-2 flex gap-1">
            {ctx.hasDiscount && ctx.discountPct > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-900 text-white rounded-sm">
                -{ctx.discountPct}%
              </span>
            )}
            {ctx.isNew && (
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-600 text-white rounded-sm">New</span>
            )}
          </div>

          {/* Wishlist - very subtle */}
          <button
            onClick={ctx.handleToggleWishlist}
            className="absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center bg-white/70 hover:bg-white transition-colors"
          >
            <Heart className={`h-3 w-3 ${ctx.isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>

          {ctx.isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs text-gray-600 font-medium">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Text area - minimal */}
        <div className="p-3">
          {product.category && (
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5 sf-product-category">{product.category.name}</p>
          )}
          <h3 className="text-sm font-normal text-gray-800 line-clamp-1 mb-1">{product.name}</h3>
          <StarRating rating={ctx.rating} size="xs" />
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-sm font-medium text-gray-900 sf-product-price">{formatPrice(product.price)}</span>
            {ctx.hasDiscount && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.comparePrice!)}</span>
            )}
          </div>
          <GSTText className="mt-0.5" />

          {/* Color swatches - minimal dots */}
          {ctx.colorSwatches.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {ctx.colorSwatches.slice(0, 4).map((color) => (
                <div
                  key={color}
                  className="h-2.5 w-2.5 rounded-full border border-gray-200"
                  style={{ backgroundColor: colorMap[color.toLowerCase()] || color.toLowerCase() }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Variant 2: Bold ───────────────────────────────────────────────────────
// Large card with bold price, big "SALE" badges, thick borders. Price is the most prominent element.

function BoldCard({ product }: { product: Product }) {
  const ctx = useProductInteractions(product)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="sf-product-card"
    >
      <div
        className="group cursor-pointer border-3 border-gray-900 bg-white rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
        style={{ borderWidth: '3px' }}
        onClick={ctx.handleQuickView}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${ctx.gradient} transition-transform duration-300 group-hover:scale-105`} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white/50 text-3xl font-black select-none">
              {product.name.substring(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Bold SALE badge */}
          {ctx.hasDiscount && ctx.discountPct > 0 && (
            <div className="absolute top-0 left-0 bg-red-600 text-white px-4 py-2 font-black text-lg tracking-wider rounded-br-2xl shadow-lg">
              SALE
            </div>
          )}

          {/* New badge - bold style */}
          {ctx.isNew && (
            <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1.5 font-bold text-sm rounded-bl-xl">
              NEW
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={ctx.handleToggleWishlist}
            className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Heart className={`h-5 w-5 ${ctx.isWishlisted ? 'fill-red-600 text-red-600' : 'text-gray-900'}`} />
          </button>

          {ctx.isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <span className="bg-yellow-400 text-gray-900 px-6 py-3 text-xl font-black rounded-lg">SOLD OUT</span>
            </div>
          )}
        </div>

        {/* Info - price is HUGE */}
        <div className="p-4">
          {product.category && (
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1 sf-product-category">{product.category.name}</p>
          )}
          <h3 className="font-bold text-base line-clamp-1 mb-2 group-hover:text-red-600 transition-colors">{product.name}</h3>

          {/* BOLD price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-gray-900 sf-product-price">{formatPrice(product.price)}</span>
            {ctx.hasDiscount && (
              <span className="text-lg text-red-500 line-through font-bold">{formatPrice(product.comparePrice!)}</span>
            )}
          </div>
          <GSTText className="mt-0.5" />

          <div className="flex items-center justify-between">
            <StarRating rating={ctx.rating} size="sm" />
            <Button
              size="sm"
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-none h-9 px-4"
              onClick={ctx.handleAddToCart}
              disabled={ctx.addingToCart || ctx.isOutOfStock}
            >
              {ctx.addingToCart ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  ADD
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Variant 3: Luxury ─────────────────────────────────────────────────────
// Elegant card with hover zoom on image, subtle shadow, serif font for name, gold accent line at top

function LuxuryCard({ product }: { product: Product }) {
  const ctx = useProductInteractions(product)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sf-product-card"
    >
      <div
        className="group cursor-pointer bg-white rounded-sm overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-500"
        onClick={ctx.handleQuickView}
        onMouseEnter={() => ctx.setIsHovered(true)}
        onMouseLeave={() => ctx.setIsHovered(false)}
      >
        {/* Gold accent line */}
        <div className="h-1 bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300" />

        {/* Image with hover zoom */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${ctx.gradient} transition-transform duration-700 group-hover:scale-110`} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white/30 text-2xl font-light italic select-none" style={{ fontFamily: 'Georgia, serif' }}>
              {product.name.substring(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Elegant badge */}
          {ctx.hasDiscount && ctx.discountPct > 0 && (
            <div className="absolute top-4 left-4 bg-amber-900/80 text-amber-100 px-3 py-1 text-xs tracking-widest uppercase backdrop-blur-sm">
              {ctx.discountPct}% Off
            </div>
          )}
          {ctx.isNew && (
            <div className="absolute top-4 right-4">
              <Crown className="h-5 w-5 text-amber-500" />
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={ctx.handleToggleWishlist}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all"
            style={{ right: ctx.isNew ? '2.5rem' : '1rem' }}
          >
            <Heart className={`h-3.5 w-3.5 ${ctx.isWishlisted ? 'fill-amber-500 text-amber-500' : 'text-white/70'}`} />
          </button>

          {ctx.isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="text-white/90 text-sm tracking-widest uppercase">Unavailable</span>
            </div>
          )}

          {/* Quick View overlay */}
          <AnimatePresence>
            {ctx.isHovered && !ctx.isOutOfStock && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 flex items-center justify-center z-10"
                onMouseEnter={() => ctx.setIsHovered(true)}
              >
                <Button
                  variant="outline"
                  className="bg-white/90 backdrop-blur-sm border-amber-200 text-amber-900 hover:bg-white text-xs tracking-wider uppercase"
                  onClick={ctx.handleQuickView}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Quick View
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info - serif font */}
        <div className="p-4">
          {product.category && (
            <p className="text-[10px] text-amber-700/60 uppercase tracking-[0.2em] mb-1.5 sf-product-category">{product.category.name}</p>
          )}
          <h3 className="text-base font-normal line-clamp-1 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            {product.name}
          </h3>
          <StarRating rating={ctx.rating} size="sm" />
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-lg font-medium text-gray-900 sf-product-price">{formatPrice(product.price)}</span>
            {ctx.hasDiscount && (
              <span className="text-sm text-amber-700/50 line-through" style={{ fontFamily: 'Georgia, serif' }}>
                {formatPrice(product.comparePrice!)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Variant 4: Soft ───────────────────────────────────────────────────────
// Rounded corners (xl), pastel shadow, soft hover lift, organic feel

function SoftCard({ product }: { product: Product }) {
  const ctx = useProductInteractions(product)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="sf-product-card"
    >
      <div
        className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-400"
        onClick={ctx.handleQuickView}
        onMouseEnter={() => ctx.setIsHovered(true)}
        onMouseLeave={() => ctx.setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-2xl">
          <div className={`absolute inset-0 bg-gradient-to-br ${ctx.gradient} rounded-t-2xl transition-transform duration-500 group-hover:scale-105`} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white/40 text-2xl font-medium select-none rounded-full bg-white/10 w-16 h-16 flex items-center justify-center">
              {product.name.substring(0, 1).toUpperCase()}
            </span>
          </div>

          {/* Soft badges */}
          {ctx.hasDiscount && ctx.discountPct > 0 && (
            <Badge className="absolute top-3 left-3 bg-pink-100 text-pink-700 hover:bg-pink-100 border-0 rounded-full text-xs font-medium px-3">
              -{ctx.discountPct}% Off
            </Badge>
          )}
          {ctx.isNew && (
            <Badge className="absolute top-3 right-3 bg-green-100 text-green-700 hover:bg-green-100 border-0 rounded-full text-xs font-medium px-3">
              <Leaf className="h-3 w-3 mr-1" />
              New
            </Badge>
          )}

          {/* Wishlist */}
          <button
            onClick={ctx.handleToggleWishlist}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-all"
            style={{ right: ctx.isNew ? '5rem' : '0.75rem' }}
          >
            <Heart className={`h-4 w-4 transition-all ${ctx.isWishlisted ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
          </button>

          {ctx.isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-t-2xl">
              <span className="text-sm text-gray-500 font-medium bg-white/80 px-4 py-2 rounded-full">Out of Stock</span>
            </div>
          )}

          {/* Add to cart - soft pill */}
          <AnimatePresence>
            {ctx.isHovered && !ctx.isOutOfStock && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={ctx.handleAddToCart}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 h-9 px-5 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full flex items-center gap-1.5 shadow-md hover:bg-white text-sm font-medium transition-colors"
              >
                {ctx.addingToCart ? (
                  <span className="h-4 w-4 border-2 border-pink-300 border-t-pink-500 rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add to Cart
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Info - soft rounded feel */}
        <div className="p-4 pb-5">
          {product.category && (
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 sf-product-category">{product.category.name}</p>
          )}
          <h3 className="text-sm font-medium line-clamp-1 mb-1.5 text-gray-700">{product.name}</h3>
          <div className="flex items-center gap-1.5 mb-2">
            <StarRating rating={ctx.rating} size="xs" />
            <span className="text-[11px] text-gray-400">{ctx.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-semibold text-gray-800 sf-product-price">{formatPrice(product.price)}</span>
            {ctx.hasDiscount && (
              <span className="text-sm text-pink-400 line-through">{formatPrice(product.comparePrice!)}</span>
            )}
          </div>
          <GSTText className="mt-0.5" />

          {/* Color swatches - soft circles */}
          {ctx.colorSwatches.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5">
              {ctx.colorSwatches.slice(0, 5).map((color) => (
                <div
                  key={color}
                  className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: colorMap[color.toLowerCase()] || color.toLowerCase() }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Variant 5: Warm ───────────────────────────────────────────────────────
// Gradient warm border on hover, warm shadow, amber price color

function WarmCard({ product }: { product: Product }) {
  const ctx = useProductInteractions(product)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sf-product-card"
    >
      <div
        className="group cursor-pointer bg-white rounded-xl overflow-hidden border-2 border-orange-100 hover:border-transparent transition-all duration-300 hover:shadow-[0_8px_30px_rgba(251,146,60,0.2)] relative"
        onClick={ctx.handleQuickView}
        onMouseEnter={() => ctx.setIsHovered(true)}
        onMouseLeave={() => ctx.setIsHovered(false)}
      >
        {/* Gradient warm border on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 p-[2px]">
          <div className="w-full h-full bg-white rounded-xl" />
        </div>

        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${ctx.gradient} transition-transform duration-500 group-hover:scale-105`} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white/40 text-2xl font-semibold select-none">
              {product.name.substring(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Warm badges */}
          {ctx.hasDiscount && ctx.discountPct > 0 && (
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs font-bold shadow-md">
              <Sun className="h-3 w-3 mr-1" />
              -{ctx.discountPct}%
            </Badge>
          )}
          {ctx.isNew && (
            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-rose-400 to-orange-400 text-white border-0 text-xs font-bold shadow-md">
              New
            </Badge>
          )}

          {/* Wishlist */}
          <button
            onClick={ctx.handleToggleWishlist}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-all"
            style={{ right: ctx.isNew ? '5rem' : '0.75rem' }}
          >
            <Heart className={`h-4 w-4 transition-all ${ctx.isWishlisted ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
          </button>

          {ctx.isOutOfStock && (
            <div className="absolute inset-0 bg-amber-900/30 flex items-center justify-center z-10">
              <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info - amber price */}
        <div className="p-4">
          {product.category && (
            <p className="text-[10px] text-amber-600/60 uppercase tracking-widest mb-1 sf-product-category">{product.category.name}</p>
          )}
          <h3 className="text-sm font-medium line-clamp-1 mb-1.5 group-hover:text-amber-700 transition-colors">{product.name}</h3>
          <StarRating rating={ctx.rating} size="xs" />
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-lg font-bold text-amber-600 sf-product-price">{formatPrice(product.price)}</span>
            {ctx.hasDiscount && (
              <span className="text-sm text-orange-300 line-through">{formatPrice(product.comparePrice!)}</span>
            )}
          </div>
          <GSTText className="mt-0.5" />

          {/* Add to cart - warm */}
          <Button
            size="sm"
            className="mt-3 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 rounded-lg h-8 text-xs"
            onClick={ctx.handleAddToCart}
            disabled={ctx.addingToCart || ctx.isOutOfStock}
          >
            {ctx.addingToCart ? (
              <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Variant 6: Wave ───────────────────────────────────────────────────────
// Wavy bottom border (using CSS clip-path), wave animation on hover, fluid feel

function WaveCard({ product }: { product: Product }) {
  const ctx = useProductInteractions(product)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="sf-product-card"
    >
      <div
        className="group cursor-pointer bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
        onClick={ctx.handleQuickView}
        onMouseEnter={() => ctx.setIsHovered(true)}
        onMouseLeave={() => ctx.setIsHovered(false)}
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), 95% 100%, 85% calc(100% - 12px), 70% 100%, 55% calc(100% - 8px), 40% 100%, 25% calc(100% - 12px), 10% 100%, 0 calc(100% - 20px))' }}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${ctx.gradient} transition-transform duration-500 group-hover:scale-110`} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white/40 text-2xl font-medium select-none">
              {product.name.substring(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Wave badges */}
          {ctx.hasDiscount && ctx.discountPct > 0 && (
            <Badge className="absolute top-3 left-3 bg-sky-500 text-white border-0 text-xs font-bold shadow-md rounded-full">
              <Waves className="h-3 w-3 mr-1" />
              -{ctx.discountPct}%
            </Badge>
          )}
          {ctx.isNew && (
            <Badge className="absolute top-3 right-3 bg-cyan-500 text-white border-0 text-xs font-bold rounded-full">
              New
            </Badge>
          )}

          {/* Wishlist */}
          <button
            onClick={ctx.handleToggleWishlist}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-all"
            style={{ right: ctx.isNew ? '5rem' : '0.75rem' }}
          >
            <Heart className={`h-4 w-4 transition-all ${ctx.isWishlisted ? 'fill-sky-500 text-sky-500' : 'text-gray-400'}`} />
          </button>

          {ctx.isOutOfStock && (
            <div className="absolute inset-0 bg-sky-900/40 flex items-center justify-center z-10">
              <span className="text-white text-sm font-medium bg-sky-500/80 px-4 py-2 rounded-full">Out of Stock</span>
            </div>
          )}

          {/* Quick View */}
          <AnimatePresence>
            {ctx.isHovered && !ctx.isOutOfStock && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-4 left-0 right-0 flex justify-center z-20"
              >
                <Button
                  size="sm"
                  className="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-6 shadow-lg"
                  onClick={ctx.handleQuickView}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Quick View
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info - wave bottom padding for clip-path */}
        <div className="p-4 pb-8">
          {product.category && (
            <p className="text-[10px] text-sky-600/60 uppercase tracking-widest mb-1 sf-product-category">{product.category.name}</p>
          )}
          <h3 className="text-sm font-medium line-clamp-1 mb-1.5 group-hover:text-sky-600 transition-colors">{product.name}</h3>
          <div className="flex items-center gap-1.5 mb-2">
            <StarRating rating={ctx.rating} size="xs" />
            <span className="text-[11px] text-sky-400">{ctx.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-sky-700 sf-product-price">{formatPrice(product.price)}</span>
            {ctx.hasDiscount && (
              <span className="text-sm text-sky-300 line-through">{formatPrice(product.comparePrice!)}</span>
            )}
          </div>
          <GSTText className="mt-0.5" />

          {/* Add to cart */}
          <button
            onClick={ctx.handleAddToCart}
            className="mt-3 w-full h-8 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-full text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            disabled={ctx.addingToCart || ctx.isOutOfStock}
          >
            {ctx.addingToCart ? (
              <span className="h-3 w-3 border-2 border-sky-300 border-t-sky-500 rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Variant 7: Glass ──────────────────────────────────────────────────────
// Glassmorphism card with backdrop-blur, semi-transparent bg, subtle glow border

function GlassCard({ product }: { product: Product }) {
  const ctx = useProductInteractions(product)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="sf-product-card"
    >
      <div
        className="group cursor-pointer rounded-2xl overflow-hidden border border-white/30 bg-white/10 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:border-white/50 transition-all duration-300 hover:shadow-purple-500/10"
        onClick={ctx.handleQuickView}
        onMouseEnter={() => ctx.setIsHovered(true)}
        onMouseLeave={() => ctx.setIsHovered(false)}
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))' }}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${ctx.gradient} transition-transform duration-500 group-hover:scale-110`} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white/30 text-2xl font-light select-none">
              {product.name.substring(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Glass badges */}
          {ctx.hasDiscount && ctx.discountPct > 0 && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-xs font-medium">
              -{ctx.discountPct}% Off
            </div>
          )}
          {ctx.isNew && (
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-xs font-medium flex items-center gap-1">
              <Diamond className="h-3 w-3" />
              New
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={ctx.handleToggleWishlist}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all"
            style={{ right: ctx.isNew ? '5rem' : '0.75rem' }}
          >
            <Heart className={`h-4 w-4 ${ctx.isWishlisted ? 'fill-purple-400 text-purple-400' : 'text-white/70'}`} />
          </button>

          {ctx.isOutOfStock && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-10">
              <span className="text-white/80 text-sm bg-white/10 px-4 py-2 rounded-full border border-white/20">Out of Stock</span>
            </div>
          )}

          {/* Add to cart - glass style */}
          <AnimatePresence>
            {ctx.isHovered && !ctx.isOutOfStock && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={ctx.handleAddToCart}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 h-9 px-5 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center gap-1.5 border border-white/30 hover:bg-white/30 text-sm font-medium transition-colors shadow-lg"
              >
                {ctx.addingToCart ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Info - glass feel */}
        <div className="p-4">
          {product.category && (
            <p className="text-[10px] text-purple-300/80 uppercase tracking-widest mb-1 sf-product-category">{product.category.name}</p>
          )}
          <h3 className="text-sm font-medium line-clamp-1 mb-1.5 text-white/90">{product.name}</h3>
          <div className="flex items-center gap-1.5 mb-2">
            <StarRating rating={ctx.rating} size="xs" />
            <span className="text-[11px] text-white/40">{ctx.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-purple-200 sf-product-price">{formatPrice(product.price)}</span>
            {ctx.hasDiscount && (
              <span className="text-sm text-white/30 line-through">{formatPrice(product.comparePrice!)}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Variant 8: Boutique ───────────────────────────────────────────────────
// Fashion-style card with overlay on hover showing size options, elegant badge

function BoutiqueCard({ product }: { product: Product }) {
  const ctx = useProductInteractions(product)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="sf-product-card"
    >
      <div
        className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
        onClick={ctx.handleQuickView}
        onMouseEnter={() => ctx.setIsHovered(true)}
        onMouseLeave={() => ctx.setIsHovered(false)}
      >
        {/* Image - taller fashion ratio */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${ctx.gradient} transition-transform duration-700 group-hover:scale-105`} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white/30 text-3xl font-light select-none italic" style={{ fontFamily: 'Georgia, serif' }}>
              {product.name.substring(0, 1).toUpperCase()}
            </span>
          </div>

          {/* Boutique badge */}
          {ctx.hasDiscount && ctx.discountPct > 0 && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-rose-900/70 text-rose-100 text-[10px] tracking-[0.15em] uppercase font-medium backdrop-blur-sm rounded-sm">
              {ctx.discountPct}% Off
            </div>
          )}
          {ctx.isNew && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-rose-500/90 text-white text-[10px] tracking-wider uppercase rounded-sm">
              <Shirt className="h-3 w-3" />
              New
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={ctx.handleToggleWishlist}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/40 transition-all"
            style={{ right: ctx.isNew ? '5rem' : '0.75rem' }}
          >
            <Heart className={`h-3.5 w-3.5 transition-all ${ctx.isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-white/70'}`} />
          </button>

          {ctx.isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <span className="text-white/80 text-xs tracking-widest uppercase">Sold Out</span>
            </div>
          )}

          {/* Boutique overlay on hover - size options */}
          <AnimatePresence>
            {ctx.isHovered && !ctx.isOutOfStock && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3 z-10"
              >
                {ctx.sizeOptions.length > 0 && (
                  <div className="flex gap-2">
                    {ctx.sizeOptions.slice(0, 5).map((size) => (
                      <span
                        key={size}
                        className="h-8 w-8 flex items-center justify-center bg-white text-gray-900 text-xs font-medium rounded-sm hover:bg-rose-500 hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                )}
                <Button
                  size="sm"
                  className="bg-white text-gray-900 hover:bg-rose-500 hover:text-white rounded-none text-xs tracking-wider uppercase h-9 px-6"
                  onClick={ctx.handleQuickView}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View Details
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info - fashion style */}
        <div className="p-4">
          {product.category && (
            <p className="text-[10px] text-rose-400/70 uppercase tracking-[0.2em] mb-1 sf-product-category">{product.category.name}</p>
          )}
          <h3 className="text-sm font-medium line-clamp-1 mb-1.5 tracking-wide group-hover:text-rose-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold text-gray-900 sf-product-price">{formatPrice(product.price)}</span>
              {ctx.hasDiscount && (
                <span className="text-sm text-rose-300 line-through">{formatPrice(product.comparePrice!)}</span>
              )}
            </div>
            <StarRating rating={ctx.rating} size="xs" />
          </div>

          {/* Color swatches */}
          {ctx.colorSwatches.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {ctx.colorSwatches.slice(0, 5).map((color) => (
                <div
                  key={color}
                  className="h-3.5 w-3.5 rounded-full border border-gray-200"
                  style={{ backgroundColor: colorMap[color.toLowerCase()] || color.toLowerCase() }}
                  title={color}
                />
              ))}
              {ctx.colorSwatches.length > 5 && (
                <span className="text-[9px] text-rose-400">+{ctx.colorSwatches.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Variant 9: Rustic ─────────────────────────────────────────────────────
// Bordered card with double border, kraft-paper texture feel, serif font

function RusticCard({ product }: { product: Product }) {
  const ctx = useProductInteractions(product)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sf-product-card"
    >
      <div
        className="group cursor-pointer bg-amber-50 rounded overflow-hidden border-4 border-amber-800 shadow-[4px_4px_0_0_#92400e] hover:shadow-[6px_6px_0_0_#92400e] transition-all duration-200"
        style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a, #fef3c7)' }}
        onClick={ctx.handleQuickView}
      >
        {/* Inner border effect */}
        <div className="border-2 border-amber-700/30 m-1 rounded-sm overflow-hidden">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${ctx.gradient} opacity-80`} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white/40 text-2xl select-none" style={{ fontFamily: 'Georgia, serif' }}>
                {product.name.substring(0, 2).toUpperCase()}
              </span>
            </div>

            {/* Rustic badges - stamp style */}
            {ctx.hasDiscount && ctx.discountPct > 0 && (
              <div className="absolute top-3 left-3 border-2 border-amber-900 text-amber-900 px-2 py-0.5 text-xs font-bold bg-amber-100/80 rounded-sm -rotate-3">
                SAVE {ctx.discountPct}%
              </div>
            )}
            {ctx.isNew && (
              <div className="absolute top-3 right-3 border-2 border-green-800 text-green-800 px-2 py-0.5 text-[10px] font-bold bg-green-100/80 rounded-sm rotate-2">
                <TreePine className="h-3 w-3 inline mr-0.5" />
                FRESH
              </div>
            )}

            {/* Wishlist */}
            <button
              onClick={ctx.handleToggleWishlist}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-amber-100/80 flex items-center justify-center border border-amber-700/30 hover:bg-amber-200/80 transition-all"
              style={{ right: ctx.isNew ? '5rem' : '0.75rem' }}
            >
              <Heart className={`h-4 w-4 ${ctx.isWishlisted ? 'fill-amber-800 text-amber-800' : 'text-amber-700'}`} />
            </button>

            {ctx.isOutOfStock && (
              <div className="absolute inset-0 bg-amber-900/40 flex items-center justify-center z-10">
                <span className="text-amber-100 text-sm font-bold border-2 border-amber-100 px-4 py-2 bg-amber-900/80" style={{ fontFamily: 'Georgia, serif' }}>
                  Unavailable
                </span>
              </div>
            )}
          </div>

          {/* Info - kraft style */}
          <div className="p-3" style={{ background: 'linear-gradient(180deg, #fef3c7, #fde68a)' }}>
            {product.category && (
              <p className="text-[10px] text-amber-800/50 uppercase tracking-widest mb-0.5 sf-product-category" style={{ fontFamily: 'Georgia, serif' }}>
                {product.category.name}
              </p>
            )}
            <h3 className="text-sm font-bold line-clamp-1 mb-1 text-amber-950" style={{ fontFamily: 'Georgia, serif' }}>
              {product.name}
            </h3>
            <StarRating rating={ctx.rating} size="xs" />
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-base font-bold text-amber-900 sf-product-price">{formatPrice(product.price)}</span>
              {ctx.hasDiscount && (
                <span className="text-sm text-amber-600/50 line-through" style={{ fontFamily: 'Georgia, serif' }}>
                  {formatPrice(product.comparePrice!)}
                </span>
              )}
            </div>

            {/* Add to cart - rustic style */}
            <button
              onClick={ctx.handleAddToCart}
              className="mt-2 w-full h-8 bg-amber-800 hover:bg-amber-900 text-amber-100 text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 rounded-sm border border-amber-900"
              disabled={ctx.addingToCart || ctx.isOutOfStock}
            >
              {ctx.addingToCart ? (
                <span className="h-3 w-3 border-2 border-amber-400 border-t-amber-100 rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Variant 10: Neon ──────────────────────────────────────────────────────
// Dark card with neon glow border, glow effect on hover, cyberpunk price display

function NeonCard({ product }: { product: Product }) {
  const ctx = useProductInteractions(product)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="sf-product-card"
    >
      <div
        className="group cursor-pointer bg-gray-950 rounded-lg overflow-hidden border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:border-cyan-400/60 transition-all duration-300"
        onClick={ctx.handleQuickView}
        onMouseEnter={() => ctx.setIsHovered(true)}
        onMouseLeave={() => ctx.setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${ctx.gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-80`} />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-cyan-400/20 text-3xl font-black select-none tracking-wider">
              {product.name.substring(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Neon badges */}
          {ctx.hasDiscount && ctx.discountPct > 0 && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 text-xs font-bold rounded shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <Zap className="h-3 w-3 inline mr-1" />
              -{ctx.discountPct}%
            </div>
          )}
          {ctx.isNew && (
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-fuchsia-500/20 border border-fuchsia-400/50 text-fuchsia-400 text-[10px] font-bold rounded shadow-[0_0_10px_rgba(217,70,239,0.3)]">
              <Bolt className="h-3 w-3 inline mr-0.5" />
              NEW
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={ctx.handleToggleWishlist}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-gray-950/60 backdrop-blur-sm flex items-center justify-center border border-cyan-500/30 hover:border-cyan-400/60 transition-all"
            style={{ right: ctx.isNew ? '5rem' : '0.75rem' }}
          >
            <Heart className={`h-4 w-4 ${ctx.isWishlisted ? 'fill-fuchsia-500 text-fuchsia-500' : 'text-cyan-400/50'}`} />
          </button>

          {ctx.isOutOfStock && (
            <div className="absolute inset-0 bg-gray-950/60 flex items-center justify-center z-10">
              <span className="text-red-400 text-sm font-bold border border-red-500/50 px-4 py-2 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                OFFLINE
              </span>
            </div>
          )}

          {/* Quick View - neon */}
          <AnimatePresence>
            {ctx.isHovered && !ctx.isOutOfStock && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20"
              >
                <Button
                  size="sm"
                  className="bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-300 rounded-sm text-xs shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  onClick={ctx.handleQuickView}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Scan
                </Button>
                <Button
                  size="sm"
                  className="bg-fuchsia-500/20 border border-fuchsia-400/50 text-fuchsia-400 hover:bg-fuchsia-500/30 hover:text-fuchsia-300 rounded-sm text-xs shadow-[0_0_10px_rgba(217,70,239,0.2)]"
                  onClick={ctx.handleAddToCart}
                  disabled={ctx.addingToCart}
                >
                  {ctx.addingToCart ? (
                    <span className="h-3 w-3 border-2 border-fuchsia-400/30 border-t-fuchsia-400 rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                      Add
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info - cyberpunk */}
        <div className="p-4">
          {product.category && (
            <p className="text-[10px] text-cyan-600/50 uppercase tracking-[0.25em] mb-1 sf-product-category">{product.category.name}</p>
          )}
          <h3 className="text-sm font-bold line-clamp-1 mb-1.5 text-cyan-100 tracking-wide group-hover:text-cyan-300 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 mb-2">
            <StarRating rating={ctx.rating} size="xs" />
            <span className="text-[11px] text-cyan-600">{ctx.rating.toFixed(1)}</span>
          </div>

          {/* Cyberpunk price display */}
          <div className="flex items-baseline gap-2">
            <span
              className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 sf-product-price"
              style={{ textShadow: '0 0 20px rgba(6,182,212,0.5)' }}
            >
              {formatPrice(product.price)}
            </span>
            {ctx.hasDiscount && (
              <span className="text-sm text-gray-600 line-through">{formatPrice(product.comparePrice!)}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── ProductCard Router ────────────────────────────────────────────────────

const VARIANT_MAP: Record<ProductCardVariant, React.ComponentType<{ product: Product }>> = {
  clean: CleanCard,
  bold: BoldCard,
  luxury: LuxuryCard,
  soft: SoftCard,
  warm: WarmCard,
  wave: WaveCard,
  glass: GlassCard,
  boutique: BoutiqueCard,
  rustic: RusticCard,
  neon: NeonCard,
}

export function ProductCard({ product, variant }: { product: Product; variant?: ProductCardVariant }) {
  const CardComponent = VARIANT_MAP[variant || 'clean'] || CleanCard
  return <CardComponent product={product} />
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

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

// ─── Grid Layout Helpers ───────────────────────────────────────────────────

function getGridClasses(layout: GridLayout): string {
  switch (layout) {
    case '2-col':
      return 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'
    case '3-col':
      return 'grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6'
    case '4-col':
      return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'
    case 'masonry':
      return 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6 space-y-4 sm:space-y-6'
    case 'mixed':
      return 'grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6'
    default:
      return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'
  }
}

// ─── ProductGrid ───────────────────────────────────────────────────────────

export function ProductGrid({ products, loading, onLoadMore, hasMore, loadingMore }: ProductGridProps) {
  const themeLayout = useThemeLayout()
  const variant: ProductCardVariant = themeLayout.productCardVariant || 'clean'
  const gridLayout: GridLayout = themeLayout.gridLayout || '4-col'

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

  const gridClasses = getGridClasses(gridLayout)
  const isMasonry = gridLayout === 'masonry'

  return (
    <div>
      {gridLayout === 'mixed' ? (
        <div className={gridClasses}>
          {products.map((product, index) => (
            <div
              key={product.id}
              className={index === 0 ? 'col-span-2 row-span-2' : ''}
            >
              <ProductCard product={product} variant={variant} />
            </div>
          ))}
        </div>
      ) : isMasonry ? (
        <div className={gridClasses}>
          {products.map((product) => (
            <div key={product.id} className="break-inside-avoid">
              <ProductCard product={product} variant={variant} />
            </div>
          ))}
        </div>
      ) : (
        <div className={gridClasses}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} variant={variant} />
          ))}
        </div>
      )}

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
