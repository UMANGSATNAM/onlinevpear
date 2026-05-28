'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
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
]

export function ProductDetail() {
  const { selectedProductId, setStorefrontPage, selectedStoreId } = useAppStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])

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
        const storeId = sessionStorage.getItem('shopforge_store_id') || selectedStoreId
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
    : 0
  const totalStock = product.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reserved, 0) ?? 99
  const variantStock = selectedVariant?.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reserved, 0) ?? totalStock
  const inStock = variantStock > 0
  const tags = product.tags ? JSON.parse(product.tags) : []
  const parsedDimensions = product.dimensions ? JSON.parse(product.dimensions) : null

  const handleAddToCart = async () => {
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
    }
  }

  const handleVariantChange = (variant: Variant) => {
    setSelectedVariant(variant)
    setQuantity(1)
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Breadcrumb */}
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
        {/* Image Gallery */}
        <div className="space-y-4">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="aspect-square rounded-xl overflow-hidden"
          >
            <div className={`w-full h-full bg-gradient-to-br ${imageGradients[activeImage % imageGradients.length]} flex items-center justify-center`}>
              <span className="text-white/30 text-6xl font-bold">{product.name.substring(0, 2).toUpperCase()}</span>
            </div>
          </motion.div>

          {/* Thumbnail Gallery */}
          <div className="flex gap-3">
            {imageGradients.map((grad, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  activeImage === i ? 'border-rose-500 shadow-sm' : 'border-transparent hover:border-gray-200'
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
        <div className="space-y-6">
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
            <div className="flex items-center gap-1">
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
              {avgRating.toFixed(1)} ({product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(currentPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-xl text-muted-foreground line-through">{formatPrice(comparePrice!)}</span>
                <Badge className="bg-red-500 text-white hover:bg-red-600">-{discountPct}%</Badge>
              </>
            )}
          </div>

          {/* Short Description */}
          {product.shortDesc && (
            <p className="text-muted-foreground">{product.shortDesc}</p>
          )}

          <Separator />

          {/* Variant Selector */}
          {product.variants.length > 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Options</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant)}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                      selectedVariant?.id === variant.id
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{variant.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{formatPrice(variant.price)}</div>
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
                    return (
                      <button
                        key={val}
                        onClick={() => matchingVariant && handleVariantChange(matchingVariant)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedVariant?.options && (() => { try { return JSON.parse(selectedVariant.options)[key] === val } catch { return false } })()
                            ? 'border-rose-500 ring-2 ring-rose-200'
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
                    return (
                      <button
                        key={val}
                        onClick={() => matchingVariant && handleVariantChange(matchingVariant)}
                        className={`h-10 min-w-[40px] px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedVariant?.options && (() => { try { return JSON.parse(selectedVariant.options)[key] === val } catch { return false } })()
                            ? 'border-rose-500 bg-rose-50 text-rose-700'
                            : 'border-gray-200 hover:border-gray-300'
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

          {/* Quantity */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Quantity</h3>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="h-10 w-16 flex items-center justify-center border rounded-lg text-sm font-medium">
                {quantity}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(variantStock, quantity + 1))}
                disabled={quantity >= variantStock}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground ml-3">
                {inStock ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Check className="h-3 w-3" /> In Stock ({variantStock})
                  </span>
                ) : (
                  <span className="text-red-500">Out of Stock</span>
                )}
              </span>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="flex gap-3">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex-1 h-14 text-base bg-rose-500 hover:bg-rose-600"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button size="lg" variant="outline" className="h-14 w-14">
              <Heart className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 w-14">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Shipping Info */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="flex flex-col items-center text-center gap-1">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">30-Day Returns</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Secure Payment</span>
            </div>
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
          )}
        </div>
      </div>

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
              Reviews ({product.reviews.length})
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
              {/* Rating Summary */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold">{avgRating.toFixed(1)}</div>
                  <div className="flex items-center gap-1 mt-1">
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
                    {product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Individual Reviews */}
              {product.reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <Card key={review.id} className="p-4">
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
                              <Badge variant="secondary" className="text-xs">
                                <Check className="h-3 w-3 mr-1" /> Verified
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
