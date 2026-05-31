'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  Shield,
  BadgeCheck,
  Tag,
  Zap,
  Clock,
  Banknote,
  Wallet,
  Smartphone,
  MapPin,
  Gift,
  PartyPopper,
  Share2,
  Twitter,
  Facebook,
  Link2,
  ChevronDown,
  CheckCheck,
  AlertCircle,
  Calendar,
  ShoppingBag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useAppStore } from '@/lib/store'
import { formatPrice } from '@/components/storefront/product-grid'
import { toast } from 'sonner'

type CheckoutStep = 'information' | 'shipping' | 'payment' | 'confirmation'
type PaymentMethod = 'upi' | 'cod' | 'credit_card' | 'net_banking' | 'emi'

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
  { id: 'information', label: 'Shipping', icon: <Truck className="h-4 w-4" /> },
  { id: 'shipping', label: 'Delivery', icon: <Package className="h-4 w-4" /> },
  { id: 'payment', label: 'Payment', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'confirmation', label: 'Review', icon: <Check className="h-4 w-4" /> },
]

const defaultShippingMethods = [
  { id: 'standard', name: 'Standard Shipping', price: 0, estimatedDays: '5-7 business days', freeAbove: 100 },
  { id: 'express', name: 'Express Shipping', price: 19.99, estimatedDays: '2-3 business days' },
  { id: 'overnight', name: 'Overnight Shipping', price: 39.99, estimatedDays: 'Next business day' },
]

const itemGradients = [
  'from-rose-400 to-orange-300',
  'from-violet-400 to-purple-300',
  'from-emerald-400 to-teal-300',
  'from-amber-400 to-yellow-300',
]

const addressSuggestions = [
  '123 Main St, New York, NY 10001',
  '456 Oak Ave, Los Angeles, CA 90001',
  '789 Pine Rd, Chicago, IL 60601',
  '321 Elm Blvd, Houston, TX 77001',
  '654 Maple Dr, Phoenix, AZ 85001',
]

// Confetti particle component (CSS-based)
function ConfettiAnimation() {
  const particles = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2 + Math.random() * 2,
      size: 4 + Math.random() * 8,
      color: ['#f43f5e', '#fb923c', '#a78bfa', '#34d399', '#fbbf24', '#38bdf8', '#f472b6'][i % 7],
      rotation: Math.random() * 360,
      drift: (Math.random() - 0.5) * 100,
    }))
  , [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: '-5%',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.size > 8 ? '50%' : '2px',
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) translateX(var(--drift)) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-fall {
          animation-name: confetti-fall;
          animation-timing-function: ease-in;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  )
}

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
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('upi')
  const [upiId, setUpiId] = useState('')
  const [emiEnabled, setEmiEnabled] = useState(false)
  const [selectedBank, setSelectedBank] = useState('')
  const [selectedEmiPlan, setSelectedEmiPlan] = useState('3')
  const [discountCode, setDiscountCode] = useState('')
  const [applyingDiscount, setApplyingDiscount] = useState(false)
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [addressSuggestionOpen, setAddressSuggestionOpen] = useState(false)
  const [addressSuggestions_filtered, setAddressSuggestionsFiltered] = useState<string[]>([])

  // Gift options
  const [giftOptionsOpen, setGiftOptionsOpen] = useState(false)
  const [isGift, setIsGift] = useState(false)
  const [giftMessage, setGiftMessage] = useState('')
  const [giftWrapping, setGiftWrapping] = useState(false)
  const giftWrappingPrice = 4.99

  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

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
  const [selectedShipping, setSelectedShipping] = useState('standard')
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: '',
  })

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false)

  // Generated order number
  const [orderNumber] = useState(() => `SF-${Date.now().toString().slice(-8)}`)

  const sessionId = typeof window !== 'undefined' ? sessionStorage.getItem('vepar_session_id') : null

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
      const storeId = sessionStorage.getItem('vepar_store_id')
      if (!storeId) return
      const res = await fetch(`/api/storefront?storeId=${storeId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.shippingMethods && data.shippingMethods.length > 0) {
          setShippingMethods(data.shippingMethods)
          setSelectedShipping(data.shippingMethods[0].id)
        } else {
          setShippingMethods(defaultShippingMethods)
        }
      } else {
        setShippingMethods(defaultShippingMethods)
      }
    } catch {
      setShippingMethods(defaultShippingMethods)
    }
  }, [])

  useEffect(() => {
    fetchCart()
    fetchShipping()
  }, [fetchCart, fetchShipping])

  const handleAddressInput = (value: string) => {
    setShippingAddress({ ...shippingAddress, address1: value })
    if (value.length > 3) {
      const filtered = addressSuggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      )
      setAddressSuggestionsFiltered(filtered)
      setAddressSuggestionOpen(filtered.length > 0)
    } else {
      setAddressSuggestionOpen(false)
    }
  }

  const selectAddress = (address: string) => {
    const parts = address.split(',').map((p) => p.trim())
    setShippingAddress({
      ...shippingAddress,
      address1: parts[0] || '',
      city: parts[1] || '',
      state: parts[2]?.split(' ')[0] || '',
      zip: parts[2]?.split(' ')[1] || '',
    })
    setAddressSuggestionOpen(false)
  }

  const stepIndex = steps.findIndex((s) => s.id === currentStep)

  // Form validation
  const validateInformation = (): boolean => {
    const errors: Record<string, string> = {}
    if (!contactInfo.email) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) errors.email = 'Invalid email address'
    if (!shippingAddress.firstName) errors.firstName = 'First name is required'
    if (!shippingAddress.lastName) errors.lastName = 'Last name is required'
    if (!shippingAddress.address1) errors.address1 = 'Address is required'
    if (!shippingAddress.city) errors.city = 'City is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePayment = (): boolean => {
    if (selectedPaymentMethod === 'upi' || selectedPaymentMethod === 'cod' || selectedPaymentMethod === 'net_banking' || selectedPaymentMethod === 'emi') return true
    if (selectedPaymentMethod !== 'credit_card') return true
    const errors: Record<string, string> = {}
    if (!paymentInfo.cardNumber) errors.cardNumber = 'Card number is required'
    if (!paymentInfo.cardName) errors.cardName = 'Name on card is required'
    if (!paymentInfo.expiry) errors.expiry = 'Expiry date is required'
    if (!paymentInfo.cvv) errors.cvv = 'CVV is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    setFormErrors({})
    if (currentStep === 'information') {
      if (!validateInformation()) {
        toast.error('Please fill in all required fields')
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
      if (!validatePayment()) {
        toast.error('Please fill in all payment details')
        return
      }
      setCurrentStep('confirmation')
    } else if (currentStep === 'confirmation') {
      handlePlaceOrder()
    }
  }

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true)
      const storeId = sessionStorage.getItem('vepar_store_id')
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
        setOrderPlaced(true)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 4000)
      } else {
        toast.error('Failed to place order')
      }
    } catch {
      toast.error('Failed to place order')
    } finally {
      setPlacingOrder(false)
    }
  }

  const getSelectedShippingPrice = () => {
    const method = shippingMethods.find((m) => m.id === selectedShipping)
    if (!method) return 0
    if (method.freeAbove && cartSubtotal >= method.freeAbove) return 0
    return method.price
  }

  // Estimated delivery date
  const getEstimatedDelivery = () => {
    const method = shippingMethods.find((m) => m.id === selectedShipping)
    const days = method?.estimatedDays?.includes('2-3') ? 3 : method?.estimatedDays?.includes('Next') ? 1 : 7
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  // Validation styling helper
  const getInputClass = (fieldName: string) =>
    formErrors[fieldName]
      ? 'border-red-400 focus-visible:border-red-500 focus-visible:ring-red-200'
      : ''

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
      {/* Confetti */}
      {showConfetti && <ConfettiAnimation />}

      {/* Secure Checkout Badge */}
      {!orderPlaced && (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <Lock className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-sm font-semibold text-emerald-700">Secure Checkout</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Money Back</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5 text-emerald-500" />
            <span>256-bit SSL</span>
          </div>
        </div>
      </div>
      )}

      {/* Step Progress Indicator */}
      {!orderPlaced && (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <motion.div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    i < stepIndex
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : i === stepIndex
                      ? 'bg-rose-500 text-white shadow-md ring-4 ring-rose-100'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  animate={i === stepIndex ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {i < stepIndex ? <Check className="h-4 w-4" /> : step.icon}
                </motion.div>
                <span className={`text-sm font-medium hidden sm:inline ${
                  i <= stepIndex ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="relative w-8 sm:w-16 lg:w-24 h-0.5 mx-2 sm:mx-3">
                  <div className="absolute inset-0 bg-gray-200 rounded-full" />
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: i < stepIndex ? '100%' : '0%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {currentStep === 'information' && (
              <motion.div key="information" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={contactInfo.email}
                      onChange={(e) => { setContactInfo({ ...contactInfo, email: e.target.value }); if (formErrors.email) setFormErrors({ ...formErrors, email: '' }) }}
                      className={getInputClass('email')}
                      required
                    />
                    {formErrors.email && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {formErrors.email}
                      </motion.p>
                    )}
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
                      onChange={(e) => { setShippingAddress({ ...shippingAddress, firstName: e.target.value }); if (formErrors.firstName) setFormErrors({ ...formErrors, firstName: '' }) }}
                      className={getInputClass('firstName')}
                      required
                    />
                    {formErrors.firstName && <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={shippingAddress.lastName}
                      onChange={(e) => { setShippingAddress({ ...shippingAddress, lastName: e.target.value }); if (formErrors.lastName) setFormErrors({ ...formErrors, lastName: '' }) }}
                      className={getInputClass('lastName')}
                      required
                    />
                    {formErrors.lastName && <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>}
                  </div>
                  <div className="col-span-2 relative">
                    <Label htmlFor="address1">Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address1"
                        placeholder="123 Main St"
                        value={shippingAddress.address1}
                        onChange={(e) => { handleAddressInput(e.target.value); if (formErrors.address1) setFormErrors({ ...formErrors, address1: '' }) }}
                        onFocus={() => {
                          if (shippingAddress.address1.length > 3 && addressSuggestions_filtered.length > 0) {
                            setAddressSuggestionOpen(true)
                          }
                        }}
                        onBlur={() => setTimeout(() => setAddressSuggestionOpen(false), 200)}
                        className={`pl-9 ${getInputClass('address1')}`}
                        required
                      />
                    </div>
                    {formErrors.address1 && <p className="text-xs text-red-500 mt-1">{formErrors.address1}</p>}
                    <AnimatePresence>
                      {addressSuggestionOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute z-50 top-full mt-1 w-full bg-white rounded-lg shadow-lg border overflow-hidden"
                        >
                          {addressSuggestions_filtered.map((suggestion, i) => (
                            <button
                              key={i}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                              onClick={() => selectAddress(suggestion)}
                            >
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              {suggestion}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                      onChange={(e) => { setShippingAddress({ ...shippingAddress, city: e.target.value }); if (formErrors.city) setFormErrors({ ...formErrors, city: '' }) }}
                      className={getInputClass('city')}
                      required
                    />
                    {formErrors.city && <p className="text-xs text-red-500 mt-1">{formErrors.city}</p>}
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

                {/* Gift Options (in shipping step) */}
                <div className="mt-8">
                  <Collapsible open={giftOptionsOpen} onOpenChange={setGiftOptionsOpen}>
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors w-full">
                        <Gift className="h-4 w-4" />
                        Gift Options
                        <ChevronDown className={`h-4 w-4 transition-transform ${giftOptionsOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="p-5 mt-3 bg-rose-50/50 border-rose-100">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">This is a gift</p>
                                <p className="text-xs text-muted-foreground">Hide prices on the packing slip</p>
                              </div>
                              <Switch checked={isGift} onCheckedChange={setIsGift} />
                            </div>
                            {isGift && (
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                              >
                                <div>
                                  <Label className="text-sm">Gift Message (optional)</Label>
                                  <Textarea
                                    placeholder="Write a message for the recipient..."
                                    value={giftMessage}
                                    onChange={(e) => setGiftMessage(e.target.value)}
                                    maxLength={300}
                                    className="mt-1 resize-none"
                                    rows={3}
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">{giftMessage.length}/300 characters</p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium">Gift Wrapping</p>
                                    <p className="text-xs text-muted-foreground">Beautiful gift wrap with ribbon</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-rose-500">{formatPrice(giftWrappingPrice)}</span>
                                    <Switch checked={giftWrapping} onCheckedChange={setGiftWrapping} />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </motion.div>
            )}

            {currentStep === 'shipping' && (
              <motion.div key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-xl font-bold mb-6">Shipping Method</h2>
                <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                  <div className="space-y-3">
                    {shippingMethods.map((method) => {
                      const isFree = method.freeAbove && cartSubtotal >= method.freeAbove
                      return (
                        <Label key={method.id} htmlFor={method.id} className="cursor-pointer">
                          <Card className={`p-4 transition-all ${
                            selectedShipping === method.id ? 'border-2 border-rose-500 shadow-sm' : 'hover:border-gray-300'
                          }`}>
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value={method.id} id={method.id} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">{method.name}</span>
                                      {method.id === 'express' && (
                                        <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700">
                                          <Zap className="h-2.5 w-2.5 mr-0.5" /> Popular
                                        </Badge>
                                      )}
                                    </div>
                                    {(method.description || method.estimatedDays) && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        {method.estimatedDays || method.description}
                                      </div>
                                    )}
                                  </div>
                                  <span className="font-semibold text-sm">
                                    {isFree ? (
                                      <span className="text-emerald-600">Free</span>
                                    ) : (
                                      formatPrice(method.price)
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Label>
                      )
                    })}
                  </div>
                </RadioGroup>
              </motion.div>
            )}

            {currentStep === 'payment' && (
              <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Payment Method</h2>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 px-3 py-1">
                    <Lock className="h-3 w-3" />
                    Secure Payment
                  </Badge>
                </div>

                {/* India-first Payment Method Selection: UPI → COD → Cards → Net Banking → EMI */}
                <div className="space-y-3 mb-6">
                  {/* 1. UPI — Most popular in India */}
                  <Card
                    className={`p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === 'upi' ? 'border-2 border-rose-500 shadow-sm' : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod('upi')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === 'upi' ? 'border-rose-500' : 'border-gray-300'
                      }`}>
                        {selectedPaymentMethod === 'upi' && (
                          <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        )}
                      </div>
                      <Smartphone className="h-5 w-5 text-violet-600" />
                      <span className="font-medium text-sm">UPI</span>
                      <Badge variant="secondary" className="text-[10px] bg-violet-50 text-violet-700 border-violet-200 ml-1">
                        Most Popular
                      </Badge>
                      <span className="ml-auto text-xs text-muted-foreground">Google Pay • PhonePe • Paytm • BHIM</span>
                    </div>
                  </Card>

                  {/* 2. Cash on Delivery */}
                  <Card
                    className={`p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === 'cod' ? 'border-2 border-rose-500 shadow-sm' : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod('cod')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === 'cod' ? 'border-rose-500' : 'border-gray-300'
                      }`}>
                        {selectedPaymentMethod === 'cod' && (
                          <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        )}
                      </div>
                      <Banknote className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium text-sm">Cash on Delivery</span>
                      <span className="ml-auto text-xs text-muted-foreground">Pay when you receive</span>
                    </div>
                  </Card>

                  {/* 3. Credit / Debit Card */}
                  <Card
                    className={`p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === 'credit_card' ? 'border-2 border-rose-500 shadow-sm' : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod('credit_card')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === 'credit_card' ? 'border-rose-500' : 'border-gray-300'
                      }`}>
                        {selectedPaymentMethod === 'credit_card' && (
                          <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        )}
                      </div>
                      <CreditCard className="h-5 w-5 text-rose-500" />
                      <span className="font-medium text-sm">Credit / Debit Card</span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <div className="h-6 w-10 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                          <span className="text-white text-[8px] font-bold">VISA</span>
                        </div>
                        <div className="h-6 w-10 rounded bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                          <span className="text-white text-[8px] font-bold">MC</span>
                        </div>
                        <div className="h-6 w-10 rounded bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                          <span className="text-white text-[7px] font-bold">RUPAY</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* 4. Net Banking */}
                  <Card
                    className={`p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === 'net_banking' ? 'border-2 border-rose-500 shadow-sm' : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod('net_banking')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === 'net_banking' ? 'border-rose-500' : 'border-gray-300'
                      }`}>
                        {selectedPaymentMethod === 'net_banking' && (
                          <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        )}
                      </div>
                      <Wallet className="h-5 w-5 text-sky-600" />
                      <span className="font-medium text-sm">Net Banking</span>
                      <span className="ml-auto text-xs text-muted-foreground">All major Indian banks</span>
                    </div>
                  </Card>

                  {/* 5. EMI */}
                  <Card
                    className={`p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === 'emi' ? 'border-2 border-rose-500 shadow-sm' : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod('emi')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === 'emi' ? 'border-rose-500' : 'border-gray-300'
                      }`}>
                        {selectedPaymentMethod === 'emi' && (
                          <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        )}
                      </div>
                      <Calendar className="h-5 w-5 text-amber-600" />
                      <span className="font-medium text-sm">EMI</span>
                      <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 ml-1">
                        No Cost EMI
                      </Badge>
                      <span className="ml-auto text-xs text-muted-foreground">Easy monthly payments</span>
                    </div>
                  </Card>
                </div>

                {/* Payment Method Details Forms */}
                <AnimatePresence mode="wait">
                  {/* UPI Form */}
                  {selectedPaymentMethod === 'upi' && (
                    <motion.div
                      key="upi-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="p-5 border-0 bg-gray-50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Lock className="h-4 w-4 text-emerald-500" />
                          All transactions are secure and encrypted
                        </div>

                        {/* UPI App Shortcuts */}
                        <div className="mb-5">
                          <Label className="text-sm mb-3 block">Pay using UPI App</Label>
                          <div className="grid grid-cols-4 gap-2">
                            <button
                              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 border-transparent hover:border-violet-300 hover:bg-violet-50/50 transition-all"
                              onClick={() => toast.info('Redirecting to PhonePe...')}
                            >
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">P</span>
                              </div>
                              <span className="text-[11px] font-medium text-muted-foreground">PhonePe</span>
                            </button>
                            <button
                              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 border-transparent hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                              onClick={() => toast.info('Redirecting to Google Pay...')}
                            >
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">G</span>
                              </div>
                              <span className="text-[11px] font-medium text-muted-foreground">Google Pay</span>
                            </button>
                            <button
                              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 border-transparent hover:border-sky-300 hover:bg-sky-50/50 transition-all"
                              onClick={() => toast.info('Redirecting to Paytm...')}
                            >
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">₿</span>
                              </div>
                              <span className="text-[11px] font-medium text-muted-foreground">Paytm</span>
                            </button>
                            <button
                              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 border-transparent hover:border-orange-300 hover:bg-orange-50/50 transition-all"
                              onClick={() => toast.info('Redirecting to BHIM...')}
                            >
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">B</span>
                              </div>
                              <span className="text-[11px] font-medium text-muted-foreground">BHIM</span>
                            </button>
                          </div>
                        </div>

                        <Separator className="mb-4" />

                        {/* UPI ID Input */}
                        <div>
                          <Label htmlFor="upiId" className="text-sm">Or enter UPI ID</Label>
                          <div className="relative mt-1.5">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="upiId"
                              placeholder="yourname@upi"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className="pl-9"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            Enter your UPI ID (e.g., name@paytm, name@okicici)
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* COD Form */}
                  {selectedPaymentMethod === 'cod' && (
                    <motion.div
                      key="cod-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="p-5 border-0 bg-emerald-50/50">
                        <div className="flex items-start gap-3">
                          <Banknote className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-emerald-800">Cash on Delivery</p>
                            <p className="text-xs text-emerald-600 mt-1">
                              Pay in cash when your order is delivered at your doorstep. A nominal COD fee of ₹40 may apply.
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200">
                                <Check className="h-3 w-3 mr-0.5" /> COD Available
                              </Badge>
                              <span className="text-xs text-emerald-600">Verification call may be required</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* Credit Card Form */}
                  {selectedPaymentMethod === 'credit_card' && (
                    <motion.div
                      key="cc-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="p-5 border-0 bg-gray-50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Lock className="h-4 w-4 text-emerald-500" />
                          All transactions are secure and encrypted
                        </div>
                        <div className="space-y-4">
                          {/* EMI Toggle */}
                          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                            <div>
                              <p className="text-sm font-medium">Convert to EMI</p>
                              <p className="text-xs text-muted-foreground">Pay in easy monthly installments</p>
                            </div>
                            <Switch checked={emiEnabled} onCheckedChange={setEmiEnabled} />
                          </div>

                          {emiEnabled && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-3"
                            >
                              <Label className="text-sm">Select EMI Plan</Label>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { months: '3', label: '3 months', extra: '₹0', noCost: false },
                                  { months: '6', label: '6 months', extra: '₹0', noCost: true },
                                  { months: '12', label: '12 months', extra: '₹199', noCost: false },
                                ].map((plan) => (
                                  <button
                                    key={plan.months}
                                    onClick={() => setSelectedEmiPlan(plan.months)}
                                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                                      selectedEmiPlan === plan.months
                                        ? 'border-rose-500 bg-rose-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    <p className="text-sm font-semibold">{plan.label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {plan.extra === '₹0' ? 'No extra cost' : `+${plan.extra}`}
                                    </p>
                                    {plan.noCost && (
                                      <Badge className="text-[9px] mt-1 bg-amber-50 text-amber-700 border-amber-200">
                                        No Cost EMI
                                      </Badge>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}

                          <div>
                            <Label htmlFor="cardNumber">Card number</Label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={paymentInfo.cardNumber}
                                onChange={(e) => { setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value }); if (formErrors.cardNumber) setFormErrors({ ...formErrors, cardNumber: '' }) }}
                                className={`pl-9 ${getInputClass('cardNumber')}`}
                              />
                            </div>
                            {formErrors.cardNumber && <p className="text-xs text-red-500 mt-1">{formErrors.cardNumber}</p>}
                          </div>
                          <div>
                            <Label htmlFor="cardName">Name on card</Label>
                            <Input
                              id="cardName"
                              placeholder="John Doe"
                              value={paymentInfo.cardName}
                              onChange={(e) => { setPaymentInfo({ ...paymentInfo, cardName: e.target.value }); if (formErrors.cardName) setFormErrors({ ...formErrors, cardName: '' }) }}
                              className={getInputClass('cardName')}
                            />
                            {formErrors.cardName && <p className="text-xs text-red-500 mt-1">{formErrors.cardName}</p>}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiry">Expiration date</Label>
                              <Input
                                id="expiry"
                                placeholder="MM/YY"
                                value={paymentInfo.expiry}
                                onChange={(e) => { setPaymentInfo({ ...paymentInfo, expiry: e.target.value }); if (formErrors.expiry) setFormErrors({ ...formErrors, expiry: '' }) }}
                                className={getInputClass('expiry')}
                              />
                              {formErrors.expiry && <p className="text-xs text-red-500 mt-1">{formErrors.expiry}</p>}
                            </div>
                            <div>
                              <Label htmlFor="cvv">CVV</Label>
                              <div className="relative">
                                <Input
                                  id="cvv"
                                  placeholder="123"
                                  value={paymentInfo.cvv}
                                  onChange={(e) => { setPaymentInfo({ ...paymentInfo, cvv: e.target.value }); if (formErrors.cvv) setFormErrors({ ...formErrors, cvv: '' }) }}
                                  className={getInputClass('cvv')}
                                />
                                <Shield className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              </div>
                              {formErrors.cvv && <p className="text-xs text-red-500 mt-1">{formErrors.cvv}</p>}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* Net Banking Form */}
                  {selectedPaymentMethod === 'net_banking' && (
                    <motion.div
                      key="netbanking-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="p-5 border-0 bg-gray-50">
                        <Label className="text-sm mb-3 block">Popular Banks</Label>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {[
                            { id: 'sbi', name: 'SBI', color: 'from-blue-600 to-blue-800' },
                            { id: 'hdfc', name: 'HDFC', color: 'from-blue-500 to-red-500' },
                            { id: 'icici', name: 'ICICI', color: 'from-orange-500 to-orange-700' },
                            { id: 'axis', name: 'Axis', color: 'from-red-600 to-red-800' },
                            { id: 'kotak', name: 'Kotak', color: 'from-red-500 to-red-700' },
                            { id: 'pnb', name: 'PNB', color: 'from-blue-700 to-blue-900' },
                          ].map((bank) => (
                            <button
                              key={bank.id}
                              onClick={() => setSelectedBank(bank.id)}
                              className={`p-3 rounded-lg border-2 text-center transition-all ${
                                selectedBank === bank.id
                                  ? 'border-rose-500 bg-rose-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${bank.color} flex items-center justify-center mx-auto mb-1`}>
                                <span className="text-white text-[9px] font-bold">{bank.name.substring(0, 2)}</span>
                              </div>
                              <span className="text-xs font-medium">{bank.name}</span>
                            </button>
                          ))}
                        </div>
                        <Separator className="my-3" />
                        <div>
                          <Label htmlFor="otherBank" className="text-xs">Other Bank</Label>
                          <Input
                            id="otherBank"
                            placeholder="Search for your bank..."
                            className="mt-1.5 text-sm"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                          <Lock className="h-3 w-3 text-emerald-500" />
                          You will be redirected to your bank&apos;s secure login page
                        </p>
                      </Card>
                    </motion.div>
                  )}

                  {/* EMI Form */}
                  {selectedPaymentMethod === 'emi' && (
                    <motion.div
                      key="emi-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="p-5 border-0 bg-amber-50/30">
                        <div className="flex items-center gap-2 mb-4">
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">No Cost EMI Available</Badge>
                          <span className="text-xs text-muted-foreground">on select cards</span>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm">Select EMI Plan</Label>
                          {[
                            { months: '3', emi: Math.round(cartTotal / 3), total: cartTotal, noCost: true, bank: 'HDFC, ICICI, SBI' },
                            { months: '6', emi: Math.round(cartTotal / 6), total: cartTotal, noCost: true, bank: 'HDFC, ICICI' },
                            { months: '9', emi: Math.round((cartTotal * 1.05) / 9), total: Math.round(cartTotal * 1.05), noCost: false, bank: 'All banks' },
                            { months: '12', emi: Math.round((cartTotal * 1.08) / 12), total: Math.round(cartTotal * 1.08), noCost: false, bank: 'All banks' },
                          ].map((plan) => (
                            <button
                              key={plan.months}
                              onClick={() => setSelectedEmiPlan(plan.months)}
                              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                                selectedEmiPlan === plan.months
                                  ? 'border-rose-500 bg-rose-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{plan.months} months</span>
                                    {plan.noCost && (
                                      <Badge className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">
                                        No Cost EMI
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {plan.bank} • {plan.noCost ? 'No extra charge' : `Total: ₹${plan.total.toLocaleString('en-IN')}`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-sm">₹{plan.emi.toLocaleString('en-IN')}/mo</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Discount Code */}
                <div className="mt-6">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Discount Code
                  </h3>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Enter discount code"
                        value={discountCode}
                        onChange={(e) => { setDiscountCode(e.target.value); if (discountApplied) { setDiscountApplied(false); setDiscountAmount(0) } }}
                        className={discountApplied ? 'border-emerald-400 pr-9' : ''}
                        disabled={discountApplied}
                      />
                      {discountApplied && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                      )}
                    </div>
                    {discountApplied ? (
                      <Button
                        variant="outline"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          setDiscountApplied(false)
                          setDiscountAmount(0)
                          setDiscountCode('')
                          toast.info('Discount removed')
                        }}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (!discountCode.trim()) return
                          setApplyingDiscount(true)
                          // Simulate applying a discount code — use "SAVE10" for demo
                          setTimeout(() => {
                            setApplyingDiscount(false)
                            if (discountCode.toUpperCase() === 'SAVE10') {
                              const disc = Math.round(cartSubtotal * 0.1 * 100) / 100
                              setDiscountAmount(disc)
                              setDiscountApplied(true)
                              toast.success(`Discount applied! You save ${formatPrice(disc)}`)
                            } else {
                              toast.error('Invalid discount code. Try "SAVE10" for 10% off!')
                            }
                          }, 1000)
                        }}
                        disabled={applyingDiscount || !discountCode.trim()}
                      >
                        {applyingDiscount ? (
                          <span className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    )}
                  </div>
                  {discountApplied && discountAmount > 0 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-2 text-sm text-emerald-600">
                      <CheckCheck className="h-4 w-4" />
                      <span>Code &quot;{discountCode}&quot; applied — {formatPrice(discountAmount)} off!</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 'confirmation' && !orderPlaced && (
              <motion.div key="confirmation-review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-xl font-bold mb-6">Review Your Order</h2>

                <Card className="p-5 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-rose-500" />
                      Shipping Address
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep('information')} className="text-xs text-rose-500">
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {shippingAddress.firstName} {shippingAddress.lastName}<br />
                    {shippingAddress.address1}
                    {shippingAddress.address2 && `, ${shippingAddress.address2}`}<br />
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
                  </p>
                </Card>

                <Card className="p-5 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Truck className="h-4 w-4 text-rose-500" />
                      Shipping Method
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep('shipping')} className="text-xs text-rose-500">
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {shippingMethods.find((m) => m.id === selectedShipping)?.name || 'Standard Shipping'}
                    {' — '}
                    {getSelectedShippingPrice() === 0 ? (
                      <span className="text-emerald-600 font-medium">Free</span>
                    ) : (
                      formatPrice(getSelectedShippingPrice())
                    )}
                  </p>
                </Card>

                <Card className="p-5 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-rose-500" />
                      Payment Method
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep('payment')} className="text-xs text-rose-500">
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedPaymentMethod === 'credit_card' && `Card ending in ${paymentInfo.cardNumber.slice(-4) || '****'}`}
                    {selectedPaymentMethod === 'upi' && (upiId ? `UPI: ${upiId}` : 'UPI App')}
                    {selectedPaymentMethod === 'cod' && 'Cash on Delivery'}
                    {selectedPaymentMethod === 'net_banking' && (selectedBank ? `Net Banking: ${selectedBank.toUpperCase()}` : 'Net Banking')}
                    {selectedPaymentMethod === 'emi' && `EMI: ${selectedEmiPlan} months`}
                  </p>
                </Card>

                {/* Gift Info Review */}
                {isGift && (
                  <Card className="p-5 mb-4 bg-rose-50/50 border-rose-100">
                    <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                      <Gift className="h-4 w-4 text-rose-500" />
                      Gift Options
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Gift wrapping: {giftWrapping ? `Yes (+${formatPrice(giftWrappingPrice)})` : 'No'}
                    </p>
                    {giftMessage && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Message: &quot;{giftMessage}&quot;
                      </p>
                    )}
                  </Card>
                )}

                <Card className="p-5">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-rose-500" />
                    Order Items ({cartItems.length})
                  </h3>
                  <div className="space-y-3">
                    {cartItems.map((item, index) => (
                      <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${itemGradients[index % itemGradients.length]} flex items-center justify-center shrink-0`}>
                          <span className="text-white/40 text-xs font-bold">
                            {item.product?.name?.substring(0, 1).toUpperCase() || 'P'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{item.product?.name || 'Product'}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-medium whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ============ ENHANCED ORDER SUCCESS SCREEN ============ */}
            {currentStep === 'confirmation' && orderPlaced && (
              <motion.div key="order-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <div className="text-center py-4">
                  {/* Animated Success Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200"
                  >
                    <Check className="h-12 w-12 text-white" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
                    <p className="text-muted-foreground mb-1">
                      Thank you for your purchase. Your order has been placed successfully.
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Order number: <span className="font-semibold text-foreground">{orderNumber}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mb-8">
                      A confirmation email has been sent to <span className="font-medium text-foreground">{contactInfo.email}</span>
                    </p>
                  </motion.div>

                  {/* Estimated Delivery */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Card className="p-5 mb-6 bg-emerald-50 border-emerald-100 max-w-md mx-auto">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <Calendar className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-emerald-800">Estimated Delivery</p>
                          <p className="text-sm text-emerald-700">{getEstimatedDelivery()}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Order Summary Recap */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Card className="p-5 mb-6 max-w-md mx-auto text-left">
                      <h3 className="font-semibold text-sm mb-3">Order Summary</h3>
                      <div className="space-y-2">
                        {cartItems.slice(0, 3).map((item, index) => (
                          <div key={`${item.productId}-recap`} className="flex justify-between text-sm">
                            <span className="text-muted-foreground line-clamp-1 pr-2">
                              {item.product?.name || 'Product'} × {item.quantity}
                            </span>
                            <span className="font-medium whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                        {cartItems.length > 3 && (
                          <p className="text-xs text-muted-foreground">+ {cartItems.length - 3} more items</p>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>{formatPrice(cartTotal)}</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                      <Button onClick={() => setStorefrontPage('home')} className="bg-rose-500 hover:bg-rose-600">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Continue Shopping
                      </Button>
                      <Button variant="outline" onClick={() => setStorefrontPage('account')}>
                        <Package className="mr-2 h-4 w-4" />
                        View Orders
                      </Button>
                    </div>

                    {/* Social Sharing */}
                    <div className="border-t pt-5 max-w-md mx-auto">
                      <p className="text-xs text-muted-foreground mb-3">Share your purchase</p>
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-full"
                          onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }}
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-full"
                          onClick={() => toast.info('Sharing to Twitter...')}
                        >
                          <Twitter className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-full"
                          onClick={() => toast.info('Sharing to Facebook...')}
                        >
                          <Facebook className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
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
                    Review Order
                    <ArrowRight className="ml-2 h-4 w-4" />
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

          {/* Place Order Button */}
          {currentStep === 'confirmation' && !orderPlaced && (
            <div className="mt-8 space-y-4">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('payment')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
              <Button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="w-full h-14 text-base bg-emerald-600 hover:bg-emerald-700 relative overflow-hidden"
              >
                {placingOrder ? (
                  <span className="flex items-center gap-2">
                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing your order...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Place Secure Order — {formatPrice(cartTotal + (giftWrapping ? giftWrappingPrice : 0) - (discountApplied ? discountAmount : 0))}
                  </span>
                )}
              </Button>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-emerald-500" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3 text-emerald-500" />
                  <span>Money Back Guarantee</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="h-3 w-3 text-emerald-500" />
                  <span>Encrypted Payment</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Order Summary Sidebar - STICKY */}
        {currentStep !== 'confirmation' && !orderPlaced && (
          <div className="lg:col-span-2">
            <Card className="p-6 sticky top-24">
              <h3 className="font-bold mb-4">Order Summary</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
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
                {giftWrapping && isGift && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Gift className="h-3 w-3" /> Gift Wrap
                    </span>
                    <span>{formatPrice(giftWrappingPrice)}</span>
                  </div>
                )}
                {discountApplied && discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">
                      <CheckCheck className="h-3 w-3" /> Discount ({discountCode})
                    </span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                {cartDiscount > 0 && !discountApplied && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatPrice(cartDiscount)}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(cartTotal + (giftWrapping && isGift ? giftWrappingPrice : 0) - (discountApplied ? discountAmount : 0))}</span>
              </div>

              {/* Trust Badges in Sidebar */}
              <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  <span>256-bit SSL Encryption</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>30-Day Money Back Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Secure Payment Processing</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

    </div>
  )
}
