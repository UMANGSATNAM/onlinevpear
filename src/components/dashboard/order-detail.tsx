'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  Clock,
  Check,
  CheckCircle2,
  XCircle,
  User,
  MapPin,
  Mail,
  Phone,
  Loader2,
  Printer,
  RotateCcw,
  ChevronDown,
  Circle,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

interface OrderDetail {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  subtotal: number
  taxTotal: number
  shippingTotal: number
  discountTotal: number
  total: number
  currency: string
  notes: string | null
  shippingAddress: string | null
  billingAddress: string | null
  shippingMethod: string | null
  trackingNumber: string | null
  placedAt: string
  confirmedAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  createdAt: string
  customer: {
    id: string
    name: string | null
    email: string
    phone: string | null
    avatar: string | null
  } | null
  items: Array<{
    id: string
    name: string
    sku: string | null
    quantity: number
    price: number
    total: number
    image: string | null
    product: { id: string; name: string; images: string } | null
    variant: { id: string; title: string; options: string } | null
  }>
  payments: Array<{
    id: string
    method: string
    gateway: string | null
    amount: number
    status: string
    processedAt: string | null
  }>
  refunds: Array<{
    id: string
    amount: number
    reason: string | null
    status: string
    processedAt: string | null
  }>
  store: { id: string; name: string; currency: string } | null
}

// Timeline step type
interface TimelineStep {
  key: string
  label: string
  description: string
  date: string | null
  icon: React.ReactNode
  status: 'completed' | 'current' | 'future'
  person?: string
  trackingNumber?: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  refunded: 'bg-gray-100 text-gray-800 border-gray-200',
}

const statusBadgeGradients: Record<string, string> = {
  pending: 'from-yellow-400 to-amber-500',
  confirmed: 'from-blue-400 to-cyan-500',
  processing: 'from-indigo-400 to-violet-500',
  shipped: 'from-purple-400 to-fuchsia-500',
  delivered: 'from-emerald-400 to-teal-500',
  cancelled: 'from-red-400 to-rose-500',
  refunded: 'from-gray-400 to-slate-500',
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const timelineItemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function generateTimelineSteps(order: OrderDetail): TimelineStep[] {
  const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
  const currentStatusIdx = statusOrder.indexOf(order.status)

  // Helper to generate mock dates for steps that have timestamps
  const getStepDate = (stepKey: string): string | null => {
    switch (stepKey) {
      case 'placed':
        return order.placedAt || order.createdAt
      case 'confirmed':
        return order.confirmedAt
      case 'processing': {
        // Derive from confirmedAt or placedAt + offset
        if (currentStatusIdx >= 2 || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
          return order.confirmedAt || order.placedAt
        }
        return null
      }
      case 'shipped':
        return order.shippedAt
      case 'delivered':
        return order.deliveredAt
      default:
        return null
    }
  }

  const steps: TimelineStep[] = [
    {
      key: 'placed',
      label: 'Order Placed',
      description: 'Customer submitted the order',
      date: getStepDate('placed'),
      icon: <Check className="h-4 w-4" />,
      status: 'completed',
      person: order.customer?.name || undefined,
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      description: 'Order verified and confirmed',
      date: getStepDate('confirmed'),
      icon: <CheckCircle2 className="h-4 w-4" />,
      status: currentStatusIdx >= 1 ? (currentStatusIdx > 1 ? 'completed' : 'current') : 'future',
    },
    {
      key: 'processing',
      label: 'Processing',
      description: 'Items being prepared for shipment',
      date: getStepDate('processing'),
      icon: <Package className="h-4 w-4" />,
      status: currentStatusIdx >= 2 ? (currentStatusIdx > 2 ? 'completed' : 'current') : 'future',
    },
    {
      key: 'shipped',
      label: 'Shipped',
      description: 'Package dispatched for delivery',
      date: getStepDate('shipped'),
      icon: <Truck className="h-4 w-4" />,
      status: currentStatusIdx >= 3 ? (currentStatusIdx > 3 ? 'completed' : 'current') : 'future',
      trackingNumber: order.trackingNumber || undefined,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      description: 'Package delivered to customer',
      date: getStepDate('delivered'),
      icon: <Check className="h-4 w-4" />,
      status: currentStatusIdx >= 4 ? 'completed' : 'future',
    },
  ]

  // Handle cancelled orders
  if (order.status === 'cancelled' && order.cancelledAt) {
    // Show placed as completed, then cancelled as the final step
    return [
      { ...steps[0], status: 'completed' },
      {
        key: 'cancelled',
        label: 'Cancelled',
        description: 'Order was cancelled',
        date: order.cancelledAt,
        icon: <XCircle className="h-4 w-4" />,
        status: 'completed',
      },
    ]
  }

  // Handle refunded orders - show all steps up to delivered, then refunded
  if (order.status === 'refunded') {
    return steps.map((s) => ({ ...s, status: 'completed' as const })).concat([
      {
        key: 'refunded',
        label: 'Refunded',
        description: 'Order has been refunded',
        date: order.refunds[0]?.processedAt || null,
        icon: <RotateCcw className="h-4 w-4" />,
        status: 'completed' as const,
      },
    ])
  }

  return steps
}

export function OrderDetail() {
  const { selectedOrderId, setDashboardPage } = useAppStore()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [addingTracking, setAddingTracking] = useState(false)
  const [refunding, setRefunding] = useState(false)

  useEffect(() => {
    if (!selectedOrderId) return
    setLoading(true)
    api.get<{ order: OrderDetail }>(`/orders/${selectedOrderId}`)
      .then((data) => {
        setOrder(data.order)
        setTrackingNumber(data.order.trackingNumber || '')
      })
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false))
  }, [selectedOrderId])

  const timelineSteps = useMemo(() => {
    if (!order) return []
    return generateTimelineSteps(order)
  }, [order])

  const updateStatus = async (status: string) => {
    if (!selectedOrderId) return
    setUpdatingStatus(true)
    try {
      await api.put(`/orders/${selectedOrderId}`, { status })
      toast.success(`Order status updated to ${status}`)
      const data = await api.get<{ order: OrderDetail }>(`/orders/${selectedOrderId}`)
      setOrder(data.order)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const addTracking = async () => {
    if (!selectedOrderId || !trackingNumber) return
    setAddingTracking(true)
    try {
      await api.put(`/orders/${selectedOrderId}`, { trackingNumber })
      toast.success('Tracking number added')
      const data = await api.get<{ order: OrderDetail }>(`/orders/${selectedOrderId}`)
      setOrder(data.order)
    } catch {
      toast.error('Failed to add tracking')
    } finally {
      setAddingTracking(false)
    }
  }

  const handleRefund = async () => {
    if (!selectedOrderId || !order) return
    setRefunding(true)
    try {
      await api.put(`/orders/${selectedOrderId}`, { status: 'refunded' })
      toast.success('Refund initiated for order')
      const data = await api.get<{ order: OrderDetail }>(`/orders/${selectedOrderId}`)
      setOrder(data.order)
    } catch {
      toast.error('Failed to process refund')
    } finally {
      setRefunding(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const parseAddress = (addrStr: string | null) => {
    if (!addrStr) return null
    try {
      return JSON.parse(addrStr)
    } catch {
      return null
    }
  }

  if (loading) {
    return <OrderDetailSkeleton />
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="outline" className="mt-4" onClick={() => setDashboardPage('orders')}>
          Back to Orders
        </Button>
      </div>
    )
  }

  const shippingAddr = parseAddress(order.shippingAddress)
  const billingAddr = parseAddress(order.billingAddress)
  const paymentMethod = order.payments[0]?.method || 'Unknown'
  const paymentGateway = order.payments[0]?.gateway || null
  const paymentTransactionId = order.payments[0]?.id || null

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header with Order Summary */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${statusBadgeGradients[order.status] || 'from-gray-400 to-slate-500'}`} />
          <CardContent className="p-6 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setDashboardPage('orders')} className="shrink-0 -ml-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h2>
                  <Badge
                    variant="secondary"
                    className={`text-xs px-2.5 py-1 border font-semibold capitalize ${statusColors[order.status] || ''}`}
                  >
                    {order.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs px-2.5 py-1 ${
                      order.paymentStatus === 'paid'
                        ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                        : order.paymentStatus === 'failed'
                        ? 'border-red-300 text-red-700 bg-red-50'
                        : 'border-yellow-300 text-yellow-700 bg-yellow-50'
                    }`}
                  >
                    {order.paymentStatus.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Placed on {formatDate(order.placedAt || order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Select onValueChange={updateStatus} disabled={updatingStatus}>
                  <SelectTrigger className="w-[180px]">
                    {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={handlePrint} title="Print Order">
                  <Printer className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefund}
                  disabled={refunding || order.status === 'refunded' || order.status === 'cancelled'}
                  title="Refund Order"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {refunding ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Timeline */}
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100">
                    <Clock className="h-4 w-4 text-emerald-600" />
                  </div>
                  Order Status Timeline
                </CardTitle>
                <CardDescription>Track the progression of this order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative pl-2">
                  {timelineSteps.map((step, index) => {
                    const isLast = index === timelineSteps.length - 1
                    const lineStatus = step.status === 'completed' && index < timelineSteps.length - 1
                      ? 'next-completed'
                      : step.status === 'current'
                      ? 'next-current'
                      : 'future'

                    return (
                      <motion.div
                        key={step.key}
                        variants={timelineItemVariants}
                        className="relative flex gap-4"
                      >
                        {/* Connecting line */}
                        {!isLast && (
                          <div className="absolute left-[17px] top-[36px] w-0.5 h-[calc(100%-20px)]">
                            {lineStatus === 'next-completed' ? (
                              <div className="w-full h-full bg-emerald-400" />
                            ) : (
                              <div className="w-full h-full border-l-2 border-dashed border-gray-300" />
                            )}
                          </div>
                        )}

                        {/* Step icon */}
                        <div className="relative z-10 shrink-0">
                          {step.status === 'completed' ? (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-200">
                              <Check className="h-4 w-4" />
                            </div>
                          ) : step.status === 'current' ? (
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white shadow-md shadow-amber-200">
                              <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-40" />
                              <span className="relative z-10">{step.icon}</span>
                            </div>
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-400">
                              <Circle className="h-3 w-3" />
                            </div>
                          )}
                        </div>

                        {/* Step content */}
                        <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
                          <p className={`text-sm font-semibold ${
                            step.status === 'completed' ? 'text-emerald-700' :
                            step.status === 'current' ? 'text-amber-700' :
                            'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                          {step.date && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(step.date)}
                            </p>
                          )}
                          <p className={`text-xs mt-1 ${
                            step.status === 'future' ? 'text-gray-400' : 'text-muted-foreground'
                          }`}>
                            {step.description}
                          </p>
                          {step.person && (
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <User className="h-3 w-3" /> {step.person}
                            </p>
                          )}
                          {step.trackingNumber && (
                            <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-50 border border-purple-200 w-fit">
                              <Truck className="h-3 w-3 text-purple-600" />
                              <span className="text-xs font-medium text-purple-700">{step.trackingNumber}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Items Table */}
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-500" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-violet-100">
                    <Package className="h-4 w-4 text-violet-600" />
                  </div>
                  Order Items
                </CardTitle>
                <CardDescription>{order.items.length} item{order.items.length !== 1 ? 's' : ''} in this order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-2">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Product</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">SKU</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Price</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Qty</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/50 transition-colors group">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                                  <Package className="h-4 w-4 text-violet-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-sm group-hover:text-primary transition-colors">{item.name}</p>
                                {item.variant && (
                                  <p className="text-xs text-muted-foreground">{item.variant.title}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm font-mono">{item.sku || '—'}</TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right font-semibold">${item.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Order Totals */}
                <Separator className="my-4" />
                <div className="flex justify-end">
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    {order.shippingTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>${order.shippingTotal.toFixed(2)}</span>
                      </div>
                    )}
                    {order.shippingTotal === 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-emerald-600 font-medium">Free</span>
                      </div>
                    )}
                    {order.taxTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>${order.taxTotal.toFixed(2)}</span>
                      </div>
                    )}
                    {order.discountTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="text-emerald-600">-${order.discountTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-blue-400 to-indigo-500" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-1.5 rounded-lg bg-sky-100">
                    <User className="h-4 w-4 text-sky-600" />
                  </div>
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.customer ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {(order.customer.name || order.customer.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{order.customer.name || 'No name'}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{order.customer.email}</span>
                      </div>
                      {order.customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{order.customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4 text-muted-foreground">
                    <User className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-sm">Guest checkout</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Shipping Info Card */}
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-400 to-fuchsia-500" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-1.5 rounded-lg bg-rose-100">
                    <MapPin className="h-4 w-4 text-rose-600" />
                  </div>
                  Shipping
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shippingAddr ? (
                  <div className="text-sm space-y-1.5 bg-muted/30 p-3 rounded-lg">
                    {shippingAddr.name && <p className="font-medium">{shippingAddr.name}</p>}
                    <p>{shippingAddr.line1 || ''}</p>
                    {shippingAddr.line2 && <p>{shippingAddr.line2}</p>}
                    <p>{[shippingAddr.city, shippingAddr.state, shippingAddr.zip].filter(Boolean).join(', ')}</p>
                    {shippingAddr.country && <p>{shippingAddr.country}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No shipping address</p>
                )}
                {order.shippingMethod && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Method:</span>
                    <span className="font-medium">{order.shippingMethod}</span>
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracking Number</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter tracking number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="text-sm"
                    />
                    <Button size="sm" onClick={addTracking} disabled={addingTracking || !trackingNumber} className="shrink-0">
                      {addingTracking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Info Card */}
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-red-500" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-1.5 rounded-lg bg-amber-100">
                    <CreditCard className="h-4 w-4 text-amber-600" />
                  </div>
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.payments.length === 0 ? (
                  <div className="flex flex-col items-center py-4 text-muted-foreground">
                    <CreditCard className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-sm">No payment information</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {order.payments.map((payment) => (
                      <div key={payment.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold capitalize">{payment.method.replace('_', ' ')}</span>
                          <Badge
                            variant="outline"
                            className={`text-[11px] px-2 py-0.5 ${
                              payment.status === 'completed' || payment.status === 'paid'
                                ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                                : payment.status === 'failed'
                                ? 'border-red-300 text-red-700 bg-red-50'
                                : 'border-yellow-300 text-yellow-700 bg-yellow-50'
                            }`}
                          >
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-bold">${payment.amount.toFixed(2)}</span>
                        </div>
                        {payment.gateway && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Gateway</span>
                            <span className="font-medium text-xs">{payment.gateway}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Transaction ID</span>
                          <span className="font-mono text-xs text-muted-foreground truncate ml-2">{payment.id.slice(0, 12)}...</span>
                        </div>
                        {payment.processedAt && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Processed</span>
                            <span className="text-xs text-muted-foreground">{formatDate(payment.processedAt)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Refunds Card */}
          <AnimatePresence>
            {order.refunds.length > 0 && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="show"
              >
                <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-red-100">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-400 to-pink-500" />
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className="p-1.5 rounded-lg bg-red-100">
                        <RotateCcw className="h-4 w-4 text-red-600" />
                      </div>
                      Refunds
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.refunds.map((refund) => (
                        <div key={refund.id} className="p-3 rounded-lg bg-red-50 border border-red-100 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-red-700">-${refund.amount.toFixed(2)}</span>
                            <Badge variant="outline" className="border-red-200 text-red-700 text-[11px]">{refund.status}</Badge>
                          </div>
                          {refund.reason && <p className="text-xs text-muted-foreground">{refund.reason}</p>}
                          {refund.processedAt && (
                            <p className="text-xs text-muted-foreground">{formatDate(refund.processedAt)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Order Notes */}
          {order.notes && (
            <motion.div variants={itemVariants}>
              <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 via-gray-400 to-zinc-500" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
