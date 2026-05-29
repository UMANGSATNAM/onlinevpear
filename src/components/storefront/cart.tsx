'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Tag,
  Truck,
  ChevronRight,
  Gift,
  Shield,
  Package,
  Clock,
  AlertTriangle,
  Sparkles,
  Check,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  ArrowRight,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAppStore } from '@/lib/store'
import { formatPrice } from '@/components/storefront/product-grid'
import { toast } from 'sonner'

interface CartItem {
  productId: string
  variantId?: string
  quantity: number
  price: number
  product?: {
    id: string
    name: string
    images?: string
    status: string
  } | null
  variant?: {
    id: string
    title: string
    options?: string
  } | null
}

interface CartData {
  id: string
  storeId: string
  items: string
  subtotal: number
  taxTotal: number
  shippingTotal: number
  discountTotal: number
  total: number
  couponCode?: string | null
}

const itemGradients = [
  'from-rose-400 to-orange-300',
  'from-violet-400 to-purple-300',
  'from-emerald-400 to-teal-300',
  'from-amber-400 to-yellow-300',
  'from-sky-400 to-cyan-300',
]

// Sample suggestions for "You might also like"
const sampleSuggestions = [
  { name: 'Premium Cleaning Kit', price: 24.99, originalPrice: 34.99, gradient: 'from-emerald-400 to-teal-300', rating: 4.5 },
  { name: 'Extended Protection Plan', price: 39.99, originalPrice: null, gradient: 'from-violet-400 to-purple-300', rating: 4.8 },
  { name: 'Gift Wrapping Service', price: 5.99, originalPrice: null, gradient: 'from-amber-400 to-yellow-300', rating: 4.2 },
  { name: 'Express Delivery Upgrade', price: 9.99, originalPrice: 14.99, gradient: 'from-sky-400 to-cyan-300', rating: 4.6 },
  { name: 'Luxury Carry Case', price: 29.99, originalPrice: 39.99, gradient: 'from-rose-400 to-pink-300', rating: 4.7 },
  { name: 'Accessory Bundle Pack', price: 19.99, originalPrice: 29.99, gradient: 'from-indigo-400 to-blue-300', rating: 4.3 },
]

const FREE_SHIPPING_THRESHOLD = 100
const TAX_RATE = 0.08

export function ShoppingCartPage() {
  const { setStorefrontPage, selectedStoreId } = useAppStore()
  const [cart, setCart] = useState<CartData | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [savedItems, setSavedItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [removeItem, setRemoveItem] = useState<CartItem | null>(null)
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const [orderNotes, setOrderNotes] = useState('')

  const sessionId = typeof window !== 'undefined' ? sessionStorage.getItem('shopforge_session_id') : null
  const storeId = typeof window !== 'undefined' ? sessionStorage.getItem('shopforge_store_id') : null

  const fetchCart = useCallback(async () => {
    try {
      if (!sessionId && !cart?.id) {
        setLoading(false)
        return
      }
      const params = new URLSearchParams()
      if (sessionId) params.set('sessionId', sessionId)
      else if (cart?.id) params.set('cartId', cart.id)

      const res = await fetch(`/api/storefront/cart?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setCart(data.cart)
        setCartItems(data.items || [])
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err)
    } finally {
      setLoading(false)
    }
  }, [sessionId, cart?.id])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const updateCartItem = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return
    const itemKey = `${item.productId}-${item.variantId}`
    setUpdatingItems((prev) => new Set(prev).add(itemKey))
    try {
      const sid = sessionStorage.getItem('shopforge_session_id') || `sess_${Date.now()}`
      sessionStorage.setItem('shopforge_session_id', sid)
      const sId = sessionStorage.getItem('shopforge_store_id')
      if (!sId) return

      const updatedItems = cartItems.map((ci) => {
        if (ci.productId === item.productId && ci.variantId === item.variantId) {
          return { ...ci, quantity: newQuantity }
        }
        return ci
      }).map((ci) => ({
        productId: ci.productId,
        variantId: ci.variantId,
        quantity: ci.quantity,
        price: ci.price,
      }))

      const res = await fetch('/api/storefront/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: sId,
          sessionId: sid,
          items: updatedItems,
          couponCode: cart?.couponCode || undefined,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setCart(data.cart)
        await fetchCart()
      }
    } catch {
      toast.error('Failed to update cart')
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev)
        next.delete(itemKey)
        return next
      })
    }
  }

  const removeCartItem = async (item: CartItem) => {
    try {
      const sid = sessionStorage.getItem('shopforge_session_id') || `sess_${Date.now()}`
      sessionStorage.setItem('shopforge_session_id', sid)
      const sId = sessionStorage.getItem('shopforge_store_id')
      if (!sId) return

      const updatedItems = cartItems
        .filter((ci) => !(ci.productId === item.productId && ci.variantId === item.variantId))
        .map((ci) => ({
          productId: ci.productId,
          variantId: ci.variantId,
          quantity: ci.quantity,
          price: ci.price,
        }))

      const res = await fetch('/api/storefront/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: sId,
          sessionId: sid,
          items: updatedItems,
          couponCode: cart?.couponCode || undefined,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setCart(data.cart)
        await fetchCart()
        toast.success('Item removed from cart')
      }
    } catch {
      toast.error('Failed to remove item')
    }
    setRemoveItem(null)
  }

  // Save for Later
  const saveForLater = (item: CartItem) => {
    setSavedItems((prev) => [...prev, item])
    removeCartItem(item)
    toast.success('Item saved for later')
  }

  const moveToCart = async (item: CartItem) => {
    setSavedItems((prev) => prev.filter((si) => !(si.productId === item.productId && si.variantId === item.variantId)))
    try {
      const sid = sessionStorage.getItem('shopforge_session_id') || `sess_${Date.now()}`
      sessionStorage.setItem('shopforge_session_id', sid)
      const sId = sessionStorage.getItem('shopforge_store_id')
      if (!sId) return

      const allItems = [...cartItems, item].map((ci) => ({
        productId: ci.productId,
        variantId: ci.variantId,
        quantity: ci.quantity,
        price: ci.price,
      }))

      const res = await fetch('/api/storefront/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: sId,
          sessionId: sid,
          items: allItems,
          couponCode: cart?.couponCode || undefined,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setCart(data.cart)
        await fetchCart()
        toast.success('Item moved to cart')
      }
    } catch {
      toast.error('Failed to move item to cart')
    }
  }

  const removeSavedItem = (item: CartItem) => {
    setSavedItems((prev) => prev.filter((si) => !(si.productId === item.productId && si.variantId === item.variantId)))
    toast.success('Item removed from saved list')
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      setApplyingCoupon(true)
      const sid = sessionStorage.getItem('shopforge_session_id') || `sess_${Date.now()}`
      sessionStorage.setItem('shopforge_session_id', sid)
      const sId = sessionStorage.getItem('shopforge_store_id')
      if (!sId) return

      const res = await fetch('/api/storefront/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: sId,
          sessionId: sid,
          items: cartItems.map((ci) => ({
            productId: ci.productId,
            variantId: ci.variantId,
            quantity: ci.quantity,
            price: ci.price,
          })),
          couponCode: couponCode.trim(),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setCart(data.cart)
        await fetchCart()
        toast.success('Coupon applied!')
      } else {
        toast.error('Invalid coupon code')
      }
    } catch {
      toast.error('Failed to apply coupon')
    } finally {
      setApplyingCoupon(false)
    }
  }

  // Calculate free shipping progress
  const subtotal = cart?.subtotal || 0
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const amountUntilFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0)

  // Estimated tax calculation
  const estimatedTax = subtotal * TAX_RATE
  const displayedTax = cart?.taxTotal || estimatedTax

  // Estimated delivery date
  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5)
  const deliveryStr = estimatedDelivery.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  const isEmpty = !cartItems || cartItems.length === 0

  if (isEmpty && savedItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center max-w-md mx-auto">
          {/* Empty Cart Illustration */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-orange-100 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag className="h-14 w-14 text-rose-300" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-rose-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">0</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            Looks like you haven&apos;t added any items to your cart yet. Start exploring our amazing products!
          </p>
          <Button
            size="lg"
            onClick={() => setStorefrontPage('category')}
            className="bg-rose-500 hover:bg-rose-600"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Start Shopping
          </Button>
          <Button
            variant="ghost"
            onClick={() => setStorefrontPage('home')}
            className="mt-3 block mx-auto text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setStorefrontPage('home')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground text-sm">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      {/* Free Shipping Progress Bar */}
      <Card className="p-4 mb-6 border-0 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center gap-3">
          <Truck className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            {amountUntilFreeShipping > 0 ? (
              <>
                <p className="text-sm font-medium text-emerald-800">
                  Add <span className="font-bold">{formatPrice(amountUntilFreeShipping)}</span> more for free shipping!
                </p>
                <Progress value={shippingProgress} className="h-2 mt-2 [&>div]:bg-emerald-500" />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-800">
                  🎉 You qualify for free shipping!
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cartItems.map((item, index) => {
              const gradient = itemGradients[index % itemGradients.length]
              const variantOptions = item.variant?.options
                ? (() => { try { return JSON.parse(item.variant.options) } catch { return null } })()
                : null
              const itemKey = `${item.productId}-${item.variantId}`
              const isUpdating = updatingItems.has(itemKey)

              return (
                <motion.div
                  key={itemKey}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-4 sm:p-5 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 relative`}>
                        <span className="text-white/40 text-sm font-bold">
                          {item.product?.name?.substring(0, 2).toUpperCase() || 'P'}
                        </span>
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-rose-500 text-white border-0 shadow-sm">
                          {item.quantity}
                        </Badge>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <div>
                            <h3
                              className="font-semibold text-sm sm:text-base cursor-pointer hover:text-rose-500 transition-colors line-clamp-1"
                              onClick={() => {
                                useAppStore.getState().setSelectedProductId(item.productId)
                                setStorefrontPage('product')
                              }}
                            >
                              {item.product?.name || 'Product'}
                            </h3>
                            {item.variant && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.variant.title}
                                {variantOptions && ` - ${Object.entries(variantOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}`}
                              </p>
                            )}
                          </div>
                          <span className="font-bold text-base whitespace-nowrap">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity Controls with +/- */}
                          <div className="flex items-center border rounded-lg overflow-hidden">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none hover:bg-gray-100"
                              onClick={() => updateCartItem(item, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isUpdating}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center text-sm font-semibold border-x bg-gray-50/50 py-1">
                              {isUpdating ? (
                                <span className="inline-block h-3 w-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none hover:bg-gray-100"
                              onClick={() => updateCartItem(item, item.quantity + 1)}
                              disabled={isUpdating}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Unit price */}
                          <span className="text-xs text-muted-foreground">
                            {formatPrice(item.price)} each
                          </span>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => saveForLater(item)}
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              title="Save for Later"
                            >
                              <Bookmark className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Save</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRemoveItem(item)}
                              className="text-red-400 hover:text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Saved for Later Section */}
          {savedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <BookmarkCheck className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold">Saved for Later</h2>
                <Badge variant="secondary" className="text-xs">{savedItems.length} items</Badge>
              </div>
              <div className="space-y-3">
                {savedItems.map((item, index) => {
                  const gradient = itemGradients[(index + 2) % itemGradients.length]
                  const itemKey = `saved-${item.productId}-${item.variantId}`
                  return (
                    <motion.div
                      key={itemKey}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="p-4 border-dashed border-2 border-neutral-200 bg-neutral-50/50 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
                            <span className="text-white/40 text-xs font-bold">
                              {item.product?.name?.substring(0, 2).toUpperCase() || 'P'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm line-clamp-1">{item.product?.name || 'Product'}</h3>
                            <p className="text-sm font-bold mt-0.5">{formatPrice(item.price)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moveToCart(item)}
                              className="text-xs h-8 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <ArrowLeft className="h-3 w-3 mr-1 rotate-180" />
                              Move to Cart
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSavedItem(item)}
                              className="text-xs h-8 text-red-400 hover:text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Continue Shopping */}
          <Button
            variant="ghost"
            onClick={() => setStorefrontPage('category')}
            className="text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-4">
          <Card className="p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
                <span className="font-medium">{formatPrice(cart?.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {(cart?.shippingTotal || 0) === 0 ? (
                    <span className="text-emerald-600 font-medium">Free</span>
                  ) : (
                    formatPrice(cart?.shippingTotal || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  Estimated Tax
                  <span className="text-[10px] text-muted-foreground/60">({(TAX_RATE * 100).toFixed(0)}%)</span>
                </span>
                <span className="font-medium">{formatPrice(displayedTax)}</span>
              </div>
              {(cart?.discountTotal || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Discount
                  </span>
                  <span className="font-medium">-{formatPrice(cart?.discountTotal || 0)}</span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Total</span>
              <span>{formatPrice(cart?.total || (subtotal + displayedTax))}</span>
            </div>

            {/* Promo Code Input */}
            <div className="mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Promo code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="pl-9 h-10"
                    onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={applyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                  className="h-10"
                >
                  {applyingCoupon ? (
                    <span className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
              </div>
              {cart?.couponCode && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                    <Tag className="h-3 w-3 mr-1" />
                    {cart.couponCode}
                  </Badge>
                  <Check className="h-3 w-3 text-emerald-500" />
                </div>
              )}
            </div>

            {/* Order Notes */}
            <div className="mb-4">
              <label className="text-sm font-medium flex items-center gap-1.5 mb-2">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                Order Notes
              </label>
              <Textarea
                placeholder="Special delivery instructions, gift messages, etc."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="min-h-[80px] text-sm resize-none bg-neutral-50/50 focus:bg-white transition-colors"
                rows={3}
              />
            </div>

            {/* Checkout Button */}
            <Button
              size="lg"
              className="w-full bg-rose-500 hover:bg-rose-600 h-12 text-base"
              onClick={() => setStorefrontPage('checkout')}
            >
              Proceed to Checkout
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Estimated Delivery */}
            <div className="flex items-center gap-2 mt-4 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs font-medium">Estimated delivery</p>
                <p className="text-xs text-muted-foreground">{deliveryStr}</p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-4 mt-4 py-2">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Shield className="h-3 w-3" />
                SSL Secure
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Package className="h-3 w-3" />
                Free Returns
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Gift className="h-3 w-3" />
                Gift Options
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* You Might Also Like - Enhanced Horizontal Scroll */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-rose-500" />
            You Might Also Like
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="group text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setStorefrontPage('category')}
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-4 -mx-4 px-4">
          {sampleSuggestions.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="snap-start shrink-0 w-52 sm:w-60"
            >
              <Card
                className="overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                onClick={() => {
                  toast.success(`${item.name} — browse products to add!`)
                  setStorefrontPage('category')
                }}
              >
                <div className="relative aspect-square overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} transition-transform duration-500 group-hover:scale-110`} />
                  {/* Price overlay */}
                  <div className="absolute bottom-2 right-2 z-10">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-white/10">
                      <span className="text-white font-bold text-sm">{formatPrice(item.price)}</span>
                      {item.originalPrice && (
                        <span className="text-white/60 text-xs line-through ml-1.5">{formatPrice(item.originalPrice)}</span>
                      )}
                    </div>
                  </div>
                  {/* Discount badge */}
                  {item.originalPrice && (
                    <Badge className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] border-0 font-semibold">
                      -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                    </Badge>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      className="bg-white text-neutral-900 hover:bg-white/90 shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        toast.success(`${item.name} — browse products to add!`)
                        setStorefrontPage('category')
                      }}
                    >
                      <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                      Add to Cart
                    </Button>
                  </div>
                  {/* Placeholder icon */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <ShoppingBag className="h-8 w-8 text-white/25" />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-1 group-hover:text-rose-500 transition-colors">{item.name}</h3>
                  <div className="flex items-center gap-1 mt-1.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-3 w-3 ${j < Math.floor(item.rating) ? 'fill-amber-400 text-amber-400' : j < item.rating ? 'fill-amber-400/50 text-amber-400' : 'text-gray-200'}`} />
                    ))}
                    <span className="text-[11px] text-muted-foreground ml-0.5">{item.rating}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!removeItem} onOpenChange={(open) => !open && setRemoveItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Remove Item?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-medium text-foreground">{removeItem?.product?.name || 'this item'}</span> from your cart? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeItem && removeCartItem(removeItem)}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
