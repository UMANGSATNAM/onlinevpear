'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  ShoppingCart,
  Share2,
  Trash2,
  Star,
  ArrowRight,
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Link2,
  ShoppingBag,
  Loader2,
  Twitter,
  Facebook,
  Mail as MailIcon,
  MoveRight,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface WishlistProduct {
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
  reviews?: Array<{ rating: number }>
  createdAt?: string
  addedToWishlistAt: string
}

type SortOption = 'recently-added' | 'price-low-high' | 'price-high-low' | 'name-a-z'

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

function getGradient(id: string) {
  const index = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradientPalettes.length
  return gradientPalettes[index]
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}

function getStockStatus(inventory?: Array<{ quantity: number; reserved: number }>) {
  const stock = inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reserved, 0) ?? 99
  if (stock <= 0) return { label: 'Out of Stock', color: 'text-red-500', icon: XCircle, bgColor: 'bg-red-50' }
  if (stock <= 10) return { label: 'Low Stock', color: 'text-amber-600', icon: AlertTriangle, bgColor: 'bg-amber-50' }
  return { label: 'In Stock', color: 'text-emerald-600', icon: CheckCircle2, bgColor: 'bg-emerald-50' }
}

function getAverageRating(reviews?: Array<{ rating: number }>) {
  if (!reviews || reviews.length === 0) return 4.5
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

function timeAgo(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.3 } },
}

// Suggested products for "You might also like" section
const suggestedProducts = [
  { id: 'sug-1', name: 'Wireless Charging Pad', price: 29.99, category: 'Accessories' },
  { id: 'sug-2', name: 'Bluetooth Earbuds Pro', price: 89.99, comparePrice: 119.99, category: 'Audio' },
  { id: 'sug-3', name: 'USB-C Hub Adapter', price: 49.99, category: 'Accessories' },
  { id: 'sug-4', name: 'Laptop Stand Aluminum', price: 59.99, comparePrice: 79.99, category: 'Desk Setup' },
]

export function WishlistPage() {
  const { setSelectedProductId, setStorefrontPage, selectedStoreId } = useAppStore()
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('recently-added')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [removingItem, setRemovingItem] = useState<string | null>(null)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const stored = localStorage.getItem('shopforge_wishlist')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWishlistItems(parsed)
            setLoading(false)
            return
          }
        }

        const storeId = sessionStorage.getItem('shopforge_store_id') || selectedStoreId
        if (!storeId) {
          setLoading(false)
          return
        }

        const res = await fetch(`/api/storefront?storeId=${storeId}`)
        if (res.ok) {
          const data = await res.json()
          const products = (data.products || []).slice(0, 10)
          const wishlistProducts: WishlistProduct[] = products.map((p: Record<string, unknown>, i: number) => ({
            ...p,
            addedToWishlistAt: new Date(Date.now() - i * 86400000 * Math.floor(Math.random() * 14 + 1)).toISOString(),
          }))
          setWishlistItems(wishlistProducts)
          localStorage.setItem('shopforge_wishlist', JSON.stringify(wishlistProducts))
        }
      } catch {
        const sampleItems: WishlistProduct[] = Array.from({ length: 8 }, (_, i) => ({
          id: `sample-${i + 1}`,
          name: ['Premium Headphones', 'Smart Watch Pro', 'Wireless Speaker', 'Phone Case Ultra', 'USB-C Charging Dock', 'Bluetooth Keyboard', 'HD Camera Lens', 'Portable Charger'][i],
          slug: `sample-product-${i + 1}`,
          price: [79.99, 299.99, 149.99, 34.99, 59.99, 129.99, 449.99, 39.99][i],
          comparePrice: [99.99, null, 199.99, null, 79.99, null, 599.99, 49.99][i],
          category: { id: `cat-${i % 4}`, name: ['Electronics', 'Audio', 'Accessories', 'Wearables'][i % 4], slug: `cat-${i % 4}` },
          inventory: [{ quantity: [15, 3, 28, 0, 7, 42, 2, 18][i], reserved: 0 }],
          reviews: Array.from({ length: Math.floor(Math.random() * 20 + 1) }, () => ({ rating: Math.floor(Math.random() * 2) + 4 })),
          addedToWishlistAt: new Date(Date.now() - i * 86400000 * (Math.floor(Math.random() * 14) + 1)).toISOString(),
          createdAt: new Date(Date.now() - i * 86400000 * 30).toISOString(),
        }))
        setWishlistItems(sampleItems)
        localStorage.setItem('shopforge_wishlist', JSON.stringify(sampleItems))
      } finally {
        setLoading(false)
      }
    }
    loadWishlist()
  }, [selectedStoreId])

  // Save wishlist to localStorage on change
  useEffect(() => {
    if (wishlistItems.length > 0) {
      localStorage.setItem('shopforge_wishlist', JSON.stringify(wishlistItems))
    } else {
      localStorage.removeItem('shopforge_wishlist')
    }
  }, [wishlistItems])

  // Sort wishlist items
  const sortedItems = useMemo(() => {
    const items = [...wishlistItems]
    switch (sortBy) {
      case 'recently-added':
        return items.sort((a, b) => new Date(b.addedToWishlistAt).getTime() - new Date(a.addedToWishlistAt).getTime())
      case 'price-low-high':
        return items.sort((a, b) => a.price - b.price)
      case 'price-high-low':
        return items.sort((a, b) => b.price - a.price)
      case 'name-a-z':
        return items.sort((a, b) => a.name.localeCompare(b.name))
      default:
        return items
    }
  }, [wishlistItems, sortBy])

  // Toggle select item
  const toggleSelectItem = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Toggle select all
  const toggleSelectAll = useCallback(() => {
    if (selectedItems.size === sortedItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(sortedItems.map((item) => item.id)))
    }
  }, [selectedItems.size, sortedItems])

  // Remove item from wishlist
  const handleRemoveItem = useCallback((id: string) => {
    setRemovingItem(id)
    setTimeout(() => {
      setWishlistItems((prev) => prev.filter((item) => item.id !== id))
      setSelectedItems((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setRemovingItem(null)
      setConfirmRemoveId(null)
      toast.success('Removed from wishlist')
    }, 300)
  }, [])

  // Add single item to cart
  const handleAddToCart = useCallback(async (product: WishlistProduct) => {
    setAddingToCart(product.id)
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
      setTimeout(() => setAddingToCart(null), 600)
    }
  }, [])

  // Bulk add selected to cart
  const handleAddSelectedToCart = useCallback(async () => {
    const itemsToAdd = sortedItems.filter((item) => selectedItems.has(item.id))
    if (itemsToAdd.length === 0) return

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
          items: itemsToAdd.map((item) => ({ productId: item.id, quantity: 1, price: item.price })),
        }),
      })
      if (res.ok) {
        toast.success(`${itemsToAdd.length} item${itemsToAdd.length > 1 ? 's' : ''} added to cart`)
        setSelectedItems(new Set())
      } else {
        toast.error('Failed to add items to cart')
      }
    } catch {
      toast.error('Failed to add items to cart')
    }
  }, [sortedItems, selectedItems])

  // Move all to cart
  const handleMoveAllToCart = useCallback(async () => {
    const inStockItems = sortedItems.filter((item) => {
      const stock = item.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reserved, 0) ?? 99
      return stock > 0
    })
    if (inStockItems.length === 0) {
      toast.error('No items in stock to add')
      return
    }

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
          items: inStockItems.map((item) => ({ productId: item.id, quantity: 1, price: item.price })),
        }),
      })
      if (res.ok) {
        toast.success(`${inStockItems.length} item${inStockItems.length > 1 ? 's' : ''} moved to cart`)
      } else {
        toast.error('Failed to add items to cart')
      }
    } catch {
      toast.error('Failed to add items to cart')
    }
  }, [sortedItems])

  // Share wishlist
  const handleShareWishlist = useCallback((platform?: string) => {
    const url = window.location.href
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=Check out my wishlist!&url=${encodeURIComponent(url)}`, '_blank')
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    } else if (platform === 'email') {
      window.open(`mailto:?subject=My Wishlist&body=Check out my wishlist: ${url}`)
    } else {
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Wishlist link copied to clipboard!')
      }).catch(() => {
        toast.error('Failed to copy link')
      })
    }
    setShowShareMenu(false)
  }, [])

  // Navigate to product detail
  const handleViewProduct = useCallback((productId: string) => {
    setSelectedProductId(productId)
    setStorefrontPage('product')
  }, [setSelectedProductId, setStorefrontPage])

  // Navigate to browse products
  const handleBrowseProducts = useCallback(() => {
    setStorefrontPage('category')
  }, [setStorefrontPage])

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-0 shadow-sm">
              <Skeleton className="aspect-[4/3]" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          {/* Animated Illustration */}
          <div className="relative mb-8">
            <div className="h-36 w-36 rounded-full bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-50 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Heart className="h-16 w-16 text-rose-300" />
              </motion.div>
            </div>
            <div className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center">
              <span className="text-sm font-bold text-rose-400">0</span>
            </div>
            {/* Decorative dots */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-1 -left-5 h-3 w-3 rounded-full bg-pink-200"
            />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              className="absolute top-4 -left-7 h-2.5 w-2.5 rounded-full bg-rose-200"
            />
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="absolute -bottom-3 right-10 h-2 w-2 rounded-full bg-fuchsia-300"
            />
          </div>

          <h2 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Start adding items you love to your wishlist. Click the heart icon on any product to save it here for later.
          </p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleBrowseProducts}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Continue Shopping
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Gradient Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 p-6 sm:p-8">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Heart className="h-7 w-7 text-white fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">My Wishlist</h1>
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-bold">
                    {wishlistItems.length} items
                  </Badge>
                </div>
                <p className="text-white/80 text-sm mt-0.5">
                  {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved for later
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Share Wishlist */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                >
                  <Share2 className="h-4 w-4 mr-1.5" />
                  Share
                </Button>
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border p-2 min-w-[160px] z-50"
                    >
                      {[
                        { icon: Twitter, label: 'Twitter', action: () => handleShareWishlist('twitter') },
                        { icon: Facebook, label: 'Facebook', action: () => handleShareWishlist('facebook') },
                        { icon: MailIcon, label: 'Email', action: () => handleShareWishlist('email') },
                        { icon: Link2, label: 'Copy Link', action: () => handleShareWishlist() },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={item.action}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[170px] h-9 text-sm bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-1 text-white/70" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recently-added">Recently Added</SelectItem>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  <SelectItem value="name-a-z">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>

              {/* Move All to Cart */}
              <Button
                size="sm"
                onClick={handleMoveAllToCart}
                className="bg-white/20 border border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <MoveRight className="h-4 w-4 mr-1.5" />
                Move All to Cart
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedItems.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mb-4 flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100"
          >
            <Checkbox
              checked={selectedItems.size === sortedItems.length}
              onCheckedChange={toggleSelectAll}
              className="border-rose-300"
            />
            <span className="text-sm font-medium text-rose-700">
              {selectedItems.size} selected
            </span>
            <Separator orientation="vertical" className="h-5" />
            <Button
              size="sm"
              onClick={handleAddSelectedToCart}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              Add Selected to Cart
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                selectedItems.forEach((id) => handleRemoveItem(id))
                setSelectedItems(new Set())
              }}
              className="text-rose-600 hover:bg-rose-100 hover:text-rose-700"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Remove Selected
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Select All Row */}
      {selectedItems.size === 0 && sortedItems.length > 1 && (
        <div className="flex items-center gap-3 mb-4">
          <Checkbox
            checked={selectedItems.size === sortedItems.length && sortedItems.length > 0}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-sm text-muted-foreground">Select all items</span>
        </div>
      )}

      {/* Wishlist Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      >
        <AnimatePresence mode="popLayout">
          {sortedItems.map((item) => {
            const gradient = getGradient(item.id)
            const rating = getAverageRating(item.reviews)
            const stockStatus = getStockStatus(item.inventory)
            const hasDiscount = item.comparePrice && item.comparePrice > item.price
            const discountPct = hasDiscount
              ? Math.round(((item.comparePrice! - item.price) / item.comparePrice!) * 100)
              : 0
            const isSelected = selectedItems.has(item.id)
            const isRemoving = removingItem === item.id
            const isAddingToCart = addingToCart === item.id
            const StockIcon = stockStatus.icon
            const isConfirmingRemove = confirmRemoveId === item.id

            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                exit="exit"
                layout
              >
                <Card
                  className={`group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                    isRemoving ? 'opacity-0 scale-90' : ''
                  } ${isSelected ? 'ring-2 ring-rose-300 ring-offset-2' : ''}`}
                >
                  {/* Gradient Accent Bar at Top */}
                  <div className={`h-1 bg-gradient-to-r ${gradient}`} />

                  {/* Product Image Area */}
                  <div
                    className="relative aspect-[4/3] overflow-hidden cursor-pointer"
                    onClick={() => handleViewProduct(item.id)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-110`} />

                    {/* Product initials */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-white/40 text-3xl sm:text-4xl font-bold select-none">
                        {item.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>

                    {/* Sale Badge */}
                    {hasDiscount && discountPct > 0 && (
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 text-xs font-semibold shadow-sm z-10">
                        -{discountPct}% OFF
                      </Badge>
                    )}

                    {/* Remove Button - Top Right */}
                    <div className="absolute top-3 right-3 z-20">
                      {isConfirmingRemove ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1 bg-white rounded-full shadow-md p-1"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveItem(item.id)
                            }}
                            className="h-7 w-7 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setConfirmRemoveId(null)
                            }}
                            className="h-7 w-7 rounded-full bg-muted flex items-center justify-center hover:bg-gray-200 transition-colors text-xs font-bold"
                          >
                            ✕
                          </button>
                        </motion.div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmRemoveId(item.id)
                          }}
                          className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all hover:scale-110 group/heart"
                        >
                          <Heart className="h-4 w-4 fill-rose-500 text-rose-500 transition-all group-hover/heart:scale-125" />
                        </button>
                      )}
                    </div>

                    {/* Select Checkbox */}
                    <div
                      className="absolute top-3 left-3 z-20"
                      onClick={(e) => e.stopPropagation()}
                      style={{ top: hasDiscount ? '2.5rem' : '0.75rem' }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectItem(item.id)}
                        className="border-white/60 bg-white/80 backdrop-blur-sm data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                      />
                    </div>

                    {/* Quick View on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full h-8 text-xs font-medium shadow-lg backdrop-blur-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewProduct(item.id)
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Info Area */}
                  <CardContent className="p-4">
                    {/* Category */}
                    {item.category && (
                      <p className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wider">{item.category.name}</p>
                    )}

                    {/* Name */}
                    <h3
                      className="font-medium text-sm leading-tight line-clamp-2 mb-1.5 group-hover:text-rose-500 transition-colors cursor-pointer"
                      onClick={() => handleViewProduct(item.id)}
                    >
                      {item.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const filled = i < Math.floor(rating)
                          const halfFilled = i === Math.floor(rating) && rating % 1 >= 0.5
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
                      <span className="text-xs text-muted-foreground">{rating.toFixed(1)}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-bold text-lg">{formatPrice(item.price)}</span>
                      {hasDiscount && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(item.comparePrice!)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${stockStatus.bgColor} ${stockStatus.color}`}>
                      <StockIcon className="h-3 w-3" />
                      {stockStatus.label}
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      className="w-full h-9 text-sm font-medium bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-sm hover:shadow-md transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToCart(item)
                      }}
                      disabled={isAddingToCart || stockStatus.label === 'Out of Stock'}
                    >
                      {isAddingToCart ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Adding...
                        </div>
                      ) : stockStatus.label === 'Out of Stock' ? (
                        'Out of Stock'
                      ) : (
                        <>
                          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                          Add to Cart
                        </>
                      )}
                    </Button>

                    {/* Date Added */}
                    <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Added {timeAgo(item.addedToWishlistAt)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* You Might Also Like Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-16"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">You Might Also Like</h2>
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-rose-500 to-pink-400 mt-2" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBrowseProducts}
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 group"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {suggestedProducts.map((product, i) => {
            const gradient = gradientPalettes[i % gradientPalettes.length]
            const hasDiscount = product.comparePrice && product.comparePrice > product.price
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Card
                  className="group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  onClick={handleBrowseProducts}
                >
                  <div className={`h-1 bg-gradient-to-r ${gradient}`} />
                  <div className="relative aspect-square overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-110`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white/40 text-xl font-bold select-none">
                        {product.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    {hasDiscount && (
                      <Badge className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-semibold shadow-sm z-10">
                        Sale
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{product.category}</p>
                    <h3 className="font-medium text-xs leading-tight line-clamp-2 mb-1.5 group-hover:text-rose-500 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-sm">{formatPrice(product.price)}</span>
                      {hasDiscount && (
                        <span className="text-[11px] text-muted-foreground line-through">
                          {formatPrice(product.comparePrice!)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
