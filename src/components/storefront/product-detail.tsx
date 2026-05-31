'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  RotateCcw,
  Shield,
  ChevronRight,
  ChevronDown,
  Check,
  Copy,
  Package,
  Clock,
  RefreshCw,
  MapPin,
  Loader2,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useAppStore } from '@/lib/store'
import { ProductGrid, formatPrice } from '@/components/storefront/product-grid'
import { PincodeChecker } from '@/components/storefront/pincode-checker'
import { toast } from 'sonner'

interface Review {
  id: string
  rating: number
  title?: string | null
  content?: string | null
  status: string
  isVerified: boolean
  createdAt: string
  customer?: { name?: string | null } | null
}

interface Variant {
  id: string
  title: string
  price: number
  comparePrice?: number | null
  options?: string
  sku?: string | null
  inventory?: Array<{ quantity: number; reserved: number }>
}

interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  shortDesc?: string | null
  price: number
  comparePrice?: number | null
  images?: string
  sku?: string | null
  weight?: number | null
  dimensions?: string | null
  category?: { id: string; name: string; slug: string } | null
  variants: Variant[]
  inventory?: Array<{ quantity: number; reserved: number }>
  reviews: Review[]
  tags?: string
  meta?: string
  createdAt: string
}

const imageGradients = [
  'from-rose-400 to-orange-300',
  'from-violet-400 to-purple-300',
  'from-emerald-400 to-teal-300',
  'from-amber-400 to-yellow-300',
  'from-sky-400 to-cyan-300',
  'from-fuchsia-400 to-pink-300',
]

// Sample "Frequently Bought Together" products
const sampleBoughtTogether = [
  { name: 'Premium Cleaning Kit', price: 24.99, rating: 4.3 },
  { name: 'Extended Protection Plan', price: 39.99, rating: 4.7 },
]

// Sample reviews for when there are no real reviews
const sampleReviews = [
  { id: 'sr1', rating: 5, title: 'Excellent quality!', content: 'Really impressed with the build quality. Exceeded my expectations in every way.', isVerified: true, customer: { name: 'Sarah M.' }, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'sr2', rating: 4, title: 'Great value', content: 'Good product for the price. Would recommend to others looking for something in this range.', isVerified: true, customer: { name: 'James K.' }, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'sr3', rating: 5, title: 'Perfect gift', content: 'Bought this as a gift and they absolutely loved it. Fast shipping too!', isVerified: false, customer: { name: 'Lisa R.' }, createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
]

export function ProductDetail() {
  const { selectedProductId, setStorefrontPage, selectedStoreId } = useAppStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [addingToCart, setAddingToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [returnsOpen, setReturnsOpen] = useState(false)
  const [boughtTogetherChecked, setBoughtTogetherChecked] = useState<boolean[]>([true, false])

  useEffect(() => {
    if (!selectedProductId) return
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/products/${selectedProductId}`)
        if (res.ok) {
          const data = await res.json()
          setProduct(data.product)
          if (data.product.variants?.length > 0) {
            setSelectedVariant(data.product.variants[0])
          }
        }
      } catch (err) {
        console.error('Failed to fetch product:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [selectedProductId])

  useEffect(() => {
    if (!product) return
    const fetchRelated = async () => {
      try {
        const storeId = sessionStorage.getItem('vepar_store_id') || selectedStoreId
        if (!storeId) return
        const res = await fetch(`/api/storefront?storeId=${storeId}`)
        if (res.ok) {
          const data = await res.json()
          const related = (data.products || []).filter(
            (p: any) => p.id !== product.id && p.category?.id === product.category?.id
          ).slice(0, 4)
          setRelatedProducts(related)
        }
      } catch {
        // ignore
      }
    }
    fetchRelated()
  }, [product, selectedStoreId])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">Product not found</h2>
        <p className="text-muted-foreground mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => setStorefrontPage('home')}>Back to Home</Button>
      </div>
    )
  }

  const currentPrice = selectedVariant?.price || product.price
  const comparePrice = selectedVariant?.comparePrice || product.comparePrice
  const hasDiscount = comparePrice && comparePrice > currentPrice
  const discountPct = hasDiscount ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100) : 0
  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 4.5
  const totalStock = product.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reserved, 0) ?? 99
  const variantStock = selectedVariant?.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reserved, 0) ?? totalStock
  const inStock = variantStock > 0
  const tags = product.tags ? JSON.parse(product.tags) : []
  const parsedDimensions = product.dimensions ? JSON.parse(product.dimensions) : null

  // Calculate bought together price
  const boughtTogetherTotal = currentPrice + sampleBoughtTogether
    .filter((_, i) => boughtTogetherChecked[i])
    .reduce((sum, p) => sum + p.price, 0)

  const handleAddToCart = async () => {
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
          items: [{
            productId: product.id,
            variantId: selectedVariant?.id,
            quantity,
            price: currentPrice,
          }],
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
      setTimeout(() => setAddingToCart(false), 800)
    }
  }

  const handleVariantChange = (variant: Variant) => {
    setSelectedVariant(variant)
    setQuantity(1)
  }

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setLinkCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  // Parse variant options
  const variantOptions: Record<string, Set<string>> = {}
  product.variants.forEach((v) => {
    if (v.options) {
      try {
        const opts = JSON.parse(v.options)
        Object.entries(opts).forEach(([key, value]) => {
          if (!variantOptions[key]) variantOptions[key] = new Set()
          variantOptions[key].add(String(value))
        })
      } catch {
        // ignore
      }
    }
  })

  // Star breakdown for reviews
  const starBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = product.reviews.filter((r) => r.rating === star).length
    const pct = product.reviews.length > 0 ? (count / product.reviews.length) * 100 : star === 5 ? 60 : star === 4 ? 25 : star === 3 ? 10 : star === 2 ? 3 : 2
    return { star, count, pct }
  })

  // Estimated delivery date
  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5)
  const deliveryStr = estimatedDelivery.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const displayReviews = product.reviews.length > 0 ? product.reviews : sampleReviews

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => setStorefrontPage('home')} className="cursor-pointer">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {product.category && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => setStorefrontPage('category')} className="cursor-pointer">
                  {product.category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery with Thumbnail Navigation */}
        <div className="space-y-4">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="aspect-square rounded-xl overflow-hidden relative group/img"
          >
            <div className={`w-full h-full bg-gradient-to-br ${imageGradients[activeImage % imageGradients.length]} flex items-center justify-center transition-transform duration-500 group-hover/img:scale-105`}>
              <span className="text-white/30 text-6xl font-bold">{product.name.substring(0, 2).toUpperCase()}</span>
            </div>
            {/* Navigation arrows */}
            {imageGradients.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev - 1 + imageGradients.length) % imageGradients.length) }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5 rotate-180" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev + 1) % imageGradients.length) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            {/* Image counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
              {activeImage + 1} / {imageGradients.length}
            </div>
          </motion.div>

          {/* Thumbnail Gallery - Horizontal Row */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {imageGradients.map((grad, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  activeImage === i ? 'border-rose-500 shadow-md ring-2 ring-rose-200' : 'border-transparent hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}>
                  <span className="text-white/30 text-sm font-bold">{i + 1}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {avgRating.toFixed(1)} ({product.reviews.length || sampleReviews.length} reviews)
            </span>
          </div>

          {/* Price with MRP and GST info */}
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">{formatPrice(currentPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-muted-foreground line-through">MRP: {formatPrice(comparePrice!)}</span>
                  <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600">-{discountPct}% OFF</Badge>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px] text-xs">
                    <p>Price includes applicable GST (Goods & Services Tax). No additional taxes will be charged at checkout.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Short Description */}
          {product.shortDesc && (
            <p className="text-muted-foreground leading-relaxed">{product.shortDesc}</p>
          )}

          <Separator />

          {/* Variant Selector Pills */}
          {product.variants.length > 1 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Options</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant)}
                    className={`px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                      selectedVariant?.id === variant.id
                        ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {variant.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Swatches from Variant Options */}
          {Object.entries(variantOptions).map(([key, values]) => (
            key.toLowerCase() === 'color' ? (
              <div key={key} className="space-y-2">
                <h3 className="font-semibold text-sm">
                  {key}: <span className="font-normal text-muted-foreground">{selectedVariant?.options ? JSON.parse(selectedVariant.options)[key] : ''}</span>
                </h3>
                <div className="flex gap-2">
                  {Array.from(values).map((val) => {
                    const matchingVariant = product.variants.find((v) => {
                      try { return JSON.parse(v.options || '{}')[key] === val } catch { return false }
                    })
                    const isSelected = selectedVariant?.options && (() => { try { return JSON.parse(selectedVariant.options)[key] === val } catch { return false } })()
                    return (
                      <button
                        key={val}
                        onClick={() => matchingVariant && handleVariantChange(matchingVariant)}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${
                          isSelected
                            ? 'border-rose-500 ring-2 ring-rose-200 scale-110'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: val.toLowerCase() }}
                        title={val}
                      />
                    )
                  })}
                </div>
              </div>
            ) : key.toLowerCase() === 'size' ? (
              <div key={key} className="space-y-2">
                <h3 className="font-semibold text-sm">
                  {key}: <span className="font-normal text-muted-foreground">{selectedVariant?.options ? JSON.parse(selectedVariant.options)[key] : ''}</span>
                </h3>
                <div className="flex gap-2">
                  {Array.from(values).map((val) => {
                    const matchingVariant = product.variants.find((v) => {
                      try { return JSON.parse(v.options || '{}')[key] === val } catch { return false }
                    })
                    const isSelected = selectedVariant?.options && (() => { try { return JSON.parse(selectedVariant.options)[key] === val } catch { return false } })()
                    return (
                      <button
                        key={val}
                        onClick={() => matchingVariant && handleVariantChange(matchingVariant)}
                        className={`h-10 min-w-[40px] px-4 rounded-full border-2 text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {val}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null
          ))}

          {/* Quantity Selector with +/- buttons */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Quantity</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-none"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="h-10 w-14 flex items-center justify-center text-sm font-semibold border-x">
                  {quantity}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(variantStock, quantity + 1))}
                  disabled={quantity >= variantStock}
                  className="h-10 w-10 rounded-none"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground ml-2">
                {inStock ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Check className="h-3 w-3" /> In Stock ({variantStock} available)
                  </span>
                ) : (
                  <span className="text-red-500">Out of Stock</span>
                )}
              </span>
            </div>
          </div>

          {/* Add to Cart + Wishlist + Share */}
          <div className="flex gap-3">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
              className="flex-1 h-14 text-base bg-rose-500 hover:bg-rose-600 relative overflow-hidden"
            >
              {addingToCart ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Adding...
                </motion.span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  {inStock ? 'Add to Cart' : 'Out of Stock'}
                </span>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-14"
              onClick={handleToggleWishlist}
            >
              <Heart className={`h-5 w-5 transition-all ${isWishlisted ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-14"
              onClick={handleShareLink}
            >
              {linkCopied ? <Check className="h-5 w-5 text-emerald-500" /> : <Share2 className="h-5 w-5" />}
            </Button>
          </div>

          {/* Pincode Delivery Checker */}
          <PincodeChecker />

          {/* Delivery & Returns - Expandable */}
          <div className="space-y-2">
            <Collapsible open={deliveryOpen} onOpenChange={setDeliveryOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-gray-50">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    Delivery Information
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${deliveryOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <Truck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Standard Shipping</p>
                      <p className="text-muted-foreground">5-7 business days. Free on orders over $100.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Express Shipping</p>
                      <p className="text-muted-foreground">2-3 business days. $19.99 flat rate.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">International Shipping</p>
                      <p className="text-muted-foreground">7-14 business days. Rates calculated at checkout.</p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={returnsOpen} onOpenChange={setReturnsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-gray-50">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    Returns & Exchanges
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${returnsOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <RotateCcw className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">30-Day Returns</p>
                      <p className="text-muted-foreground">Return any unused item within 30 days for a full refund.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Buyer Protection</p>
                      <p className="text-muted-foreground">Full refund if item not as described. Money-back guarantee.</p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Shipping Info Badges */}
          <div className="grid grid-cols-3 gap-3 py-2">
            <div className="flex flex-col items-center text-center gap-1.5 p-2 rounded-lg bg-gray-50">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground font-medium">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5 p-2 rounded-lg bg-gray-50">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground font-medium">30-Day Returns</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5 p-2 rounded-lg bg-gray-50">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground font-medium">Secure Payment</span>
            </div>
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
          )}
        </div>
      </div>

      {/* Frequently Bought Together */}
      <section className="mt-12 sm:mt-16">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-rose-500" />
            Frequently Bought Together
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Main product */}
            <div className="flex items-center gap-3">
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${imageGradients[0]} flex items-center justify-center shrink-0`}>
                <span className="text-white/40 text-xs font-bold">{product.name.substring(0, 2).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                <p className="text-sm text-muted-foreground">{formatPrice(currentPrice)}</p>
              </div>
            </div>

            <span className="text-xl text-muted-foreground font-light">+</span>

            {/* Suggested products */}
            {sampleBoughtTogether.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl text-muted-foreground font-light hidden sm:inline">+</span>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={boughtTogetherChecked[i]}
                    onChange={(e) => {
                      const newChecked = [...boughtTogetherChecked]
                      newChecked[i] = e.target.checked
                      setBoughtTogetherChecked(newChecked)
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                  />
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
                    <ShoppingCart className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(item.price)}</p>
                  </div>
                </label>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">Total price: </span>
              <span className="text-lg font-bold">{formatPrice(boughtTogetherTotal)}</span>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
              className="bg-rose-500 hover:bg-rose-600"
            >
              {addingToCart ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              Add All to Cart
            </Button>
          </div>
        </Card>
      </section>

      {/* Product Tabs */}
      <div className="mt-12 sm:mt-16">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-rose-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-rose-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
            >
              Specifications
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-rose-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
            >
              Reviews ({product.reviews.length || sampleReviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="pt-6">
            <div className="max-w-3xl">
              {product.description ? (
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                  {product.description}
                </div>
              ) : (
                <p className="text-muted-foreground">No description available for this product.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="pt-6">
            <div className="max-w-2xl">
              <div className="divide-y">
                {product.sku && (
                  <div className="flex justify-between py-3">
                    <span className="text-sm text-muted-foreground">SKU</span>
                    <span className="text-sm font-medium">{product.sku}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between py-3">
                    <span className="text-sm text-muted-foreground">Weight</span>
                    <span className="text-sm font-medium">{product.weight} kg</span>
                  </div>
                )}
                {parsedDimensions && (
                  <>
                    {parsedDimensions.length && (
                      <div className="flex justify-between py-3">
                        <span className="text-sm text-muted-foreground">Length</span>
                        <span className="text-sm font-medium">{parsedDimensions.length} {parsedDimensions.unit || 'cm'}</span>
                      </div>
                    )}
                    {parsedDimensions.width && (
                      <div className="flex justify-between py-3">
                        <span className="text-sm text-muted-foreground">Width</span>
                        <span className="text-sm font-medium">{parsedDimensions.width} {parsedDimensions.unit || 'cm'}</span>
                      </div>
                    )}
                    {parsedDimensions.height && (
                      <div className="flex justify-between py-3">
                        <span className="text-sm text-muted-foreground">Height</span>
                        <span className="text-sm font-medium">{parsedDimensions.height} {parsedDimensions.unit || 'cm'}</span>
                      </div>
                    )}
                  </>
                )}
                {product.category && (
                  <div className="flex justify-between py-3">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="text-sm font-medium">{product.category.name}</span>
                  </div>
                )}
                {tags.length > 0 && (
                  <div className="flex justify-between py-3">
                    <span className="text-sm text-muted-foreground">Tags</span>
                    <span className="text-sm font-medium">{tags.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="pt-6">
            <div className="max-w-3xl space-y-6">
              {/* Rating Summary with Star Breakdown */}
              <div className="flex flex-col sm:flex-row items-start gap-8">
                <div className="text-center min-w-[120px]">
                  <div className="text-5xl font-bold">{avgRating.toFixed(1)}</div>
                  <div className="flex items-center gap-0.5 mt-2 justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {product.reviews.length || sampleReviews.length} reviews
                  </p>
                </div>
                <div className="flex-1 w-full space-y-1.5">
                  {starBreakdown.map(({ star, count, pct }) => (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-8 text-right text-muted-foreground">{star}★</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-muted-foreground text-xs">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Individual Reviews */}
              {displayReviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                <div className="space-y-4">
                  {displayReviews.map((review) => (
                    <Card key={review.id} className="p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            {review.isVerified && (
                              <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                                <Check className="h-3 w-3 mr-1" /> Verified Purchase
                              </Badge>
                            )}
                          </div>
                          {review.title && (
                            <h4 className="font-medium text-sm mt-1">{review.title}</h4>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.content && (
                        <p className="text-sm text-muted-foreground">{review.content}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          — {review.customer?.name || 'Anonymous'}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 sm:mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  )
}
