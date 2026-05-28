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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
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

export function ShoppingCartPage() {
  const { setStorefrontPage, selectedStoreId } = useAppStore()
  const [cart, setCart] = useState<CartData | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

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
    try {
      const sid = sessionStorage.getItem('shopforge_session_id') || `sess_${Date.now()}`
      sessionStorage.setItem('shopforge_session_id', sid)
      const sId = sessionStorage.getItem('shopforge_store_id')
      if (!sId) return

      // Rebuild cart items with updated quantity
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

      // Clear and re-add all items
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

  if (isEmpty) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            Looks like you haven&apos;t added any items to your cart yet.
          </p>
          <Button
            size="lg"
            onClick={() => setStorefrontPage('category')}
            className="bg-rose-500 hover:bg-rose-600"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Start Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setStorefrontPage('home')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground text-sm">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cartItems.map((item, index) => {
              const gradient = itemGradients[index % itemGradients.length]
              const variantOptions = item.variant?.options
                ? (() => { try { return JSON.parse(item.variant.options) } catch { return null } })()
                : null

              return (
                <motion.div
                  key={`${item.productId}-${item.variantId}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-4 sm:p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
                        <span className="text-white/40 text-sm font-bold">
                          {item.product?.name?.substring(0, 2).toUpperCase() || 'P'}
                        </span>
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
                          <span className="font-semibold text-sm sm:text-base whitespace-nowrap">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateCartItem(item, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateCartItem(item, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Remove */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCartItem(item)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>

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

        {/* Order Summary */}
        <div>
          <Card className="p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(cart?.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {(cart?.shippingTotal || 0) === 0 ? (
                    <span className="text-emerald-600">Free</span>
                  ) : (
                    formatPrice(cart?.shippingTotal || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">{formatPrice(cart?.taxTotal || 0)}</span>
              </div>
              {(cart?.discountTotal || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatPrice(cart?.discountTotal || 0)}</span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total</span>
              <span>{formatPrice(cart?.total || 0)}</span>
            </div>

            {/* Coupon Code */}
            <div className="mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={applyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                >
                  {applyingCoupon ? '...' : 'Apply'}
                </Button>
              </div>
              {cart?.couponCode && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {cart.couponCode}
                  </Badge>
                </div>
              )}
            </div>

            {/* Checkout Button */}
            <Button
              size="lg"
              className="w-full bg-rose-500 hover:bg-rose-600 h-12"
              onClick={() => setStorefrontPage('checkout')}
            >
              Proceed to Checkout
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Shipping Note */}
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <Truck className="h-3 w-3" />
              <span>Free shipping on orders over $100</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
