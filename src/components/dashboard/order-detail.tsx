'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  MapPin,
  Mail,
  Phone,
  Loader2,
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

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

export function OrderDetail() {
  const { selectedOrderId, setDashboardPage } = useAppStore()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [addingTracking, setAddingTracking] = useState(false)

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

  const updateStatus = async (status: string) => {
    if (!selectedOrderId) return
    setUpdatingStatus(true)
    try {
      await api.put(`/orders/${selectedOrderId}`, { status })
      toast.success(`Order status updated to ${status}`)
      // Refresh
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

  const parseAddress = (addrStr: string | null) => {
    if (!addrStr) return null
    try {
      return JSON.parse(addrStr)
    } catch {
      return null
    }
  }

  const formatTimeline = () => {
    if (!order) return []
    const events: Array<{ label: string; date: string | null; icon: React.ReactNode; done: boolean }> = [
      { label: 'Order Placed', date: order.placedAt, icon: <Clock className="h-4 w-4" />, done: true },
      { label: 'Confirmed', date: order.confirmedAt, icon: <CheckCircle2 className="h-4 w-4" />, done: !!order.confirmedAt },
      { label: 'Shipped', date: order.shippedAt, icon: <Truck className="h-4 w-4" />, done: !!order.shippedAt },
      { label: 'Delivered', date: order.deliveredAt, icon: <Package className="h-4 w-4" />, done: !!order.deliveredAt },
    ]
    if (order.cancelledAt) {
      events.push({ label: 'Cancelled', date: order.cancelledAt, icon: <XCircle className="h-4 w-4" />, done: true })
    }
    return events
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-60 w-full" /></div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="outline" className="mt-4" onClick={() => setDashboardPage('orders')}>
          Back to Orders
        </Button>
      </div>
    )
  }

  const shippingAddr = parseAddress(order.shippingAddress)
  const billingAddr = parseAddress(order.billingAddress)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setDashboardPage('orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
            <Badge variant="secondary" className={statusColors[order.status] || ''}>
              {order.status}
            </Badge>
            <Badge variant="outline" className={
              order.paymentStatus === 'paid'
                ? 'border-emerald-300 text-emerald-700'
                : 'border-yellow-300 text-yellow-700'
            }>
              {order.paymentStatus.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Placed on {new Date(order.placedAt || order.createdAt).toLocaleString()}
          </p>
        </div>
        <Select onValueChange={updateStatus} disabled={updatingStatus}>
          <SelectTrigger className="w-[180px]">
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
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-10 w-10 rounded object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            {item.variant && (
                              <p className="text-xs text-muted-foreground">{item.variant.title}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{item.sku || '—'}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium">${item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Separator className="my-4" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                {order.shippingTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${order.shippingTotal.toFixed(2)}</span>
                  </div>
                )}
                {order.taxTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${order.taxTotal.toFixed(2)}</span>
                  </div>
                )}
                {order.discountTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span>-${order.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment information</p>
              ) : (
                <div className="space-y-3">
                  {order.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium capitalize">{payment.method.replace('_', ' ')}</p>
                        {payment.gateway && (
                          <p className="text-xs text-muted-foreground">via {payment.gateway}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${payment.amount.toFixed(2)}</p>
                        <Badge variant="outline" className={payment.status === 'completed' || payment.status === 'paid' ? 'border-emerald-300 text-emerald-700' : ''}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.customer ? (
                <div className="space-y-2">
                  <p className="font-medium">{order.customer.name || 'No name'}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" /> {order.customer.email}
                  </div>
                  {order.customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" /> {order.customer.phone}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Guest checkout</p>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shippingAddr ? (
                <div className="text-sm space-y-1">
                  <p>{shippingAddr.name || ''}</p>
                  <p>{shippingAddr.line1 || ''}</p>
                  {shippingAddr.line2 && <p>{shippingAddr.line2}</p>}
                  <p>{[shippingAddr.city, shippingAddr.state, shippingAddr.zip].filter(Boolean).join(', ')}</p>
                  {shippingAddr.country && <p>{shippingAddr.country}</p>}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No shipping address</p>
              )}
            </CardContent>
          </Card>

          {/* Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" /> Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
                <Button size="sm" onClick={addTracking} disabled={addingTracking || !trackingNumber}>
                  {addingTracking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
              {order.shippingMethod && (
                <p className="text-sm text-muted-foreground">Method: {order.shippingMethod}</p>
              )}
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formatTimeline().map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
                      event.done ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                    }`}>
                      {event.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${event.done ? '' : 'text-muted-foreground'}`}>
                        {event.label}
                      </p>
                      {event.date && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Refunds */}
          {order.refunds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Refunds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.refunds.map((refund) => (
                    <div key={refund.id} className="p-3 rounded-lg bg-red-50 border border-red-100">
                      <div className="flex justify-between">
                        <span className="font-medium text-red-700">-${refund.amount.toFixed(2)}</span>
                        <Badge variant="outline" className="border-red-200 text-red-700">{refund.status}</Badge>
                      </div>
                      {refund.reason && <p className="text-xs text-muted-foreground mt-1">{refund.reason}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  )
}
