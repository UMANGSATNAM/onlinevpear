'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Truck,
  User,
  Package,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/lib/store'
import { formatPrice } from '@/components/storefront/product-grid'
import { toast } from 'sonner'

type CheckoutStep = 'information' | 'shipping' | 'payment' | 'confirmation'

interface CartItem {
  productId: string
  variantId?: string
  quantity: number
  price: number
  product?: { id: string; name: string; images?: string; status: string } | null
  variant?: { id: string; title: string; options?: string } | null
}

interface ShippingMethod {
  id: string
  name: string
  description?: string | null
  price: number
  freeAbove?: number | null
  estimatedDays?: string | null
}

const steps: Array<{ id: CheckoutStep; label: string; icon: React.ReactNode }> = [
  { id: 'information', label: 'Information', icon: <User className="h-4 w-4" /> },
  { id: 'shipping', label: 'Shipping', icon: <Truck className="h-4 w-4" /> },
  { id: 'payment', label: 'Payment', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'confirmation', label: 'Confirmation', icon: <Check className="h-4 w-4" /> },
]

const itemGradients = [
  'from-rose-400 to-orange-300',
  'from-violet-400 to-purple-300',
  'from-emerald-400 to-teal-300',
  'from-amber-400 to-yellow-300',
]

export function CheckoutPage() {
  const { setStorefrontPage } = useAppStore()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('information')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartTotal, setCartTotal] = useState(0)
  const [cartSubtotal, setCartSubtotal] = useState(0)
  const [cartTax, setCartTax] = useState(0)
  const [cartShipping, setCartShipping] = useState(0)
  const [cartDiscount, setCartDiscount] = useState(0)
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)

  // Form state
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' })
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })
  const [selectedShipping, setSelectedShipping] = useState('')
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: '',
  })

  const sessionId = typeof window !== 'undefined' ? sessionStorage.getItem('shopforge_session_id') : null

  const fetchCart = useCallback(async () => {
    try {
      if (!sessionId) {
        setLoading(false)
        return
      }
      const res = await fetch(`/api/storefront/cart?sessionId=${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        setCartItems(data.items || [])
        if (data.cart) {
          setCartTotal(data.cart.total)
          setCartSubtotal(data.cart.subtotal)
          setCartTax(data.cart.taxTotal)
          setCartShipping(data.cart.shippingTotal)
          setCartDiscount(data.cart.discountTotal)
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  const fetchShipping = useCallback(async () => {
    try {
      const storeId = sessionStorage.getItem('shopforge_store_id')
      if (!storeId) return
      const res = await fetch(`/api/storefront?storeId=${storeId}`)
      if (res.ok) {
        const data = await res.json()
        setShippingMethods(data.shippingMethods || [])
        if (data.shippingMethods?.length > 0) {
          setSelectedShipping(data.shippingMethods[0].id)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchCart()
    fetchShipping()
  }, [fetchCart, fetchShipping])

  const stepIndex = steps.findIndex((s) => s.id === currentStep)

  const handleNext = () => {
    if (currentStep === 'information') {
      if (!contactInfo.email) {
        toast.error('Please enter your email')
        return
      }
      if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.address1 || !shippingAddress.city) {
        toast.error('Please fill in all required address fields')
        return
      }
      setCurrentStep('shipping')
    } else if (currentStep === 'shipping') {
      if (!selectedShipping) {
        toast.error('Please select a shipping method')
        return
      }
      setCurrentStep('payment')
    } else if (currentStep === 'payment') {
      if (!paymentInfo.cardNumber || !paymentInfo.expiry || !paymentInfo.cvv || !paymentInfo.cardName) {
        toast.error('Please fill in all payment details')
        return
      }
      handlePlaceOrder()
    }
  }

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true)
      const storeId = sessionStorage.getItem('shopforge_store_id')
      if (!storeId) {
        toast.error('Store not found')
        return
      }

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          subtotal: cartSubtotal,
          taxTotal: cartTax,
          shippingTotal: cartShipping,
          discountTotal: cartDiscount,
          total: cartTotal,
          shippingAddress: JSON.stringify(shippingAddress),
          billingAddress: JSON.stringify(shippingAddress),
          shippingMethod: selectedShipping,
          items: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.product?.name || 'Product',
            sku: '',
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
            options: item.variant?.options || '{}',
          })),
        }),
      })

      if (orderRes.ok) {
        setCurrentStep('confirmation')
      } else {
        toast.error('Failed to place order')
      }
    } catch {
      toast.error('Failed to place order')
    } finally {
      setPlacingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        </div>
      </div>
    )
  }

  if (cartItems.length === 0 && currentStep !== 'confirmation') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some items before checking out.</p>
        <Button onClick={() => setStorefrontPage('category')} className="bg-rose-500 hover:bg-rose-600">
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Back Button */}
      {currentStep !== 'confirmation' && (
        <Button variant="ghost" onClick={() => setStorefrontPage('cart')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Button>
      )}

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center gap-2 ${
                i <= stepIndex ? 'text-rose-500' : 'text-muted-foreground'
              }`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  i < stepIndex
                    ? 'bg-rose-500 text-white'
                    : i === stepIndex
                    ? 'bg-rose-100 text-rose-500 border-2 border-rose-500'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {i < stepIndex ? <Check className="h-4 w-4" /> : step.icon}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-16 lg:w-24 h-0.5 mx-2 ${
                  i < stepIndex ? 'bg-rose-500' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {currentStep === 'information' && (
              <motion.div key="information" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    />
                  </div>
                </div>

                <h2 className="text-xl font-bold mt-8 mb-6">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={shippingAddress.firstName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={shippingAddress.lastName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address1">Address *</Label>
                    <Input
                      id="address1"
                      placeholder="123 Main St"
                      value={shippingAddress.address1}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address1: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address2">Apartment, suite, etc.</Label>
                    <Input
                      id="address2"
                      placeholder="Apt 4B"
                      value={shippingAddress.address2}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address2: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="NY"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      placeholder="10001"
                      value={shippingAddress.zip}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="US"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'shipping' && (
              <motion.div key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-xl font-bold mb-6">Shipping Method</h2>
                {shippingMethods.length === 0 ? (
                  <div className="space-y-3">
                    <Card className="p-4 cursor-pointer border-2 border-rose-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-rose-500" />
                          <div>
                            <p className="font-medium text-sm">Standard Shipping</p>
                            <p className="text-xs text-muted-foreground">5-7 business days</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {cartSubtotal >= 100 ? (
                            <span className="text-emerald-600 font-medium text-sm">Free</span>
                          ) : (
                            <span className="font-medium text-sm">{formatPrice(9.99)}</span>
                          )}
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">Express Shipping</p>
                            <p className="text-xs text-muted-foreground">2-3 business days</p>
                          </div>
                        </div>
                        <span className="font-medium text-sm">{formatPrice(19.99)}</span>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                    <div className="space-y-3">
                      {shippingMethods.map((method) => (
                        <Label key={method.id} htmlFor={method.id} className="cursor-pointer">
                          <Card className={`p-4 transition-colors ${
                            selectedShipping === method.id ? 'border-2 border-rose-500' : ''
                          }`}>
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value={method.id} id={method.id} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">{method.name}</p>
                                    {method.description && (
                                      <p className="text-xs text-muted-foreground">{method.description}</p>
                                    )}
                                    {method.estimatedDays && (
                                      <p className="text-xs text-muted-foreground">{method.estimatedDays}</p>
                                    )}
                                  </div>
                                  <span className="font-medium text-sm">
                                    {method.freeAbove && cartSubtotal >= method.freeAbove
                                      ? <span className="text-emerald-600">Free</span>
                                      : formatPrice(method.price)
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </motion.div>
            )}

            {currentStep === 'payment' && (
              <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-xl font-bold mb-6">Payment</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Lock className="h-4 w-4" />
                    All transactions are secure and encrypted
                  </div>

                  <Card className="p-4 border-2 border-rose-500">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="h-5 w-5 text-rose-500" />
                      <span className="font-medium text-sm">Credit Card</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardName">Name on card</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={paymentInfo.cardName}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiration date</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            value={paymentInfo.expiry}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={paymentInfo.cvv}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {currentStep === 'confirmation' && (
              <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
                    className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="h-10 w-10 text-emerald-600" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
                  <p className="text-muted-foreground mb-2">
                    Thank you for your purchase. Your order has been placed successfully.
                  </p>
                  <p className="text-sm text-muted-foreground mb-8">
                    Order number: <span className="font-medium text-foreground">SF-{Date.now().toString().slice(-8)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-8">
                    A confirmation email has been sent to <span className="font-medium text-foreground">{contactInfo.email}</span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => setStorefrontPage('home')} className="bg-rose-500 hover:bg-rose-600">
                      Continue Shopping
                    </Button>
                    <Button variant="outline" onClick={() => setStorefrontPage('account')}>
                      View Orders
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep !== 'confirmation' && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep === 'shipping') setCurrentStep('information')
                  else if (currentStep === 'payment') setCurrentStep('shipping')
                  else setStorefrontPage('cart')
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {stepIndex > 0 ? 'Back' : 'Return to Cart'}
              </Button>
              <Button
                onClick={handleNext}
                disabled={placingOrder}
                className="bg-rose-500 hover:bg-rose-600 min-w-[140px]"
              >
                {placingOrder ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : currentStep === 'payment' ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Place Order
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        {currentStep !== 'confirmation' && (
          <div className="lg:col-span-2">
            <Card className="p-6 sticky top-24">
              <h3 className="font-bold mb-4">Order Summary</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${itemGradients[index % itemGradients.length]} flex items-center justify-center shrink-0 relative`}>
                      <span className="text-white/40 text-xs font-bold">
                        {item.product?.name?.substring(0, 1).toUpperCase() || 'P'}
                      </span>
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-rose-500 text-white border-0">
                        {item.quantity}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.product?.name || 'Product'}</p>
                      {item.variant && (
                        <p className="text-xs text-muted-foreground">{item.variant.title}</p>
                      )}
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{cartShipping === 0 ? <span className="text-emerald-600">Free</span> : formatPrice(cartShipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(cartTax)}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatPrice(cartDiscount)}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
