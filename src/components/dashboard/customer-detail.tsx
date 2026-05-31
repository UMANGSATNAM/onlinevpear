'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Heart,
  StickyNote,
  Plus,
  MapPin,
  Clock,
  Package,
  Star,
  UserPlus,
  FileText,
  CheckCircle2,
  XCircle,
  Truck,
  AlertCircle,
  MessageSquare,
  Tag,
  X,
  ExternalLink,
  Loader2,
  Copy,
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
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

interface CustomerOrder {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
  items: Array<{ id: string; name: string; quantity: number; price: number }>
}

interface CustomerReview {
  id: string
  rating: number
  title: string | null
  content: string | null
  createdAt: string
  product: { id: string; name: string } | null
}

interface CustomerWishlistItem {
  id: string
  product: { id: string; name: string; price: number; images: string } | null
}

interface CustomerData {
  id: string
  email: string
  name: string | null
  phone: string | null
  avatar: string | null
  tags: string
  notes: string | null
  totalOrders: number
  totalSpent: number
  avgOrderValue: number
  lastOrderAt: string | null
  status: string
  addresses: string
  createdAt: string
  store: { id: string; name: string }
  orders: CustomerOrder[]
  reviews: CustomerReview[]
  wishlistItems: CustomerWishlistItem[]
}

interface TimelineEvent {
  id: string
  type: 'order_placed' | 'order_shipped' | 'order_delivered' | 'account_created' | 'review_posted' | 'note_added' | 'tag_added' | 'order_cancelled'
  title: string
  description: string
  date: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const orderStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  refunded: 'bg-gray-100 text-gray-800 border-gray-200',
}

const orderStatusGradients: Record<string, string> = {
  pending: 'from-yellow-400 to-amber-500',
  confirmed: 'from-blue-400 to-cyan-500',
  processing: 'from-indigo-400 to-violet-500',
  shipped: 'from-purple-400 to-fuchsia-500',
  delivered: 'from-emerald-400 to-teal-500',
  cancelled: 'from-red-400 to-rose-500',
  refunded: 'from-gray-400 to-slate-500',
}

const statusBadgeColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  blocked: 'bg-red-100 text-red-800 border-red-200',
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffWeeks < 4) return `${diffWeeks}w ago`
  if (diffMonths < 12) return `${diffMonths}mo ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function generateTimeline(customer: CustomerData): TimelineEvent[] {
  const events: TimelineEvent[] = []

  // Account created
  events.push({
    id: 'account-created',
    type: 'account_created',
    title: 'Account Created',
    description: `${customer.name || customer.email} joined the store`,
    date: customer.createdAt,
    icon: <UserPlus className="h-4 w-4" />,
    color: 'text-sky-600',
    bgColor: 'bg-sky-100',
  })

  // Parse notes into timeline events
  if (customer.notes) {
    events.push({
      id: 'note-added',
      type: 'note_added',
      title: 'Note Added',
      description: customer.notes.length > 80 ? customer.notes.substring(0, 80) + '...' : customer.notes,
      date: customer.updatedAt || customer.createdAt,
      icon: <StickyNote className="h-4 w-4" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    })
  }

  // Orders
  customer.orders.forEach((order, i) => {
    if (order.status === 'cancelled') {
      events.push({
        id: `order-cancelled-${order.id}`,
        type: 'order_cancelled',
        title: 'Order Cancelled',
        description: `Order ${order.orderNumber} was cancelled`,
        date: order.createdAt,
        icon: <XCircle className="h-4 w-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      })
    } else {
      events.push({
        id: `order-placed-${order.id}`,
        type: 'order_placed',
        title: 'Order Placed',
        description: `Order ${order.orderNumber} — $${order.total.toFixed(2)} (${order.items.length} item${order.items.length !== 1 ? 's' : ''})`,
        date: order.createdAt,
        icon: <ShoppingCart className="h-4 w-4" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
      })

      if (order.status === 'shipped' || order.status === 'delivered') {
        events.push({
          id: `order-shipped-${order.id}`,
          type: 'order_shipped',
          title: 'Order Shipped',
          description: `Order ${order.orderNumber} has been shipped`,
          date: order.createdAt,
          icon: <Truck className="h-4 w-4" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
        })
      }

      if (order.status === 'delivered') {
        events.push({
          id: `order-delivered-${order.id}`,
          type: 'order_delivered',
          title: 'Order Delivered',
          description: `Order ${order.orderNumber} was delivered`,
          date: order.createdAt,
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: 'text-teal-600',
          bgColor: 'bg-teal-100',
        })
      }
    }
  })

  // Reviews
  customer.reviews.forEach((review) => {
    events.push({
      id: `review-${review.id}`,
      type: 'review_posted',
      title: 'Review Posted',
      description: `${review.rating}-star review${review.product ? ` on ${review.product.name}` : ''}`,
      date: review.createdAt,
      icon: <Star className="h-4 w-4" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    })
  })

  // Sort by date descending
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return events
}

interface Address {
  type?: string
  name?: string
  line1?: string
  line2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  phone?: string
  isDefault?: boolean
}

export function CustomerDetail() {
  const { selectedCustomerId, setDashboardPage, setSelectedOrderId } = useAppStore()
  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [activeTab, setActiveTab] = useState('orders')

  useEffect(() => {
    if (!selectedCustomerId) return
    setLoading(true)
    api.get<{ customer: CustomerData }>(`/customers/${selectedCustomerId}`)
      .then((data) => {
        setCustomer(data.customer)
        setNoteText(data.customer.notes || '')
      })
      .catch(() => toast.error('Failed to load customer details'))
      .finally(() => setLoading(false))
  }, [selectedCustomerId])

  const timeline = useMemo(() => {
    if (!customer) return []
    return generateTimeline(customer)
  }, [customer])

  const addresses = useMemo<Address[]>(() => {
    if (!customer) return []
    try {
      return JSON.parse(customer.addresses || '[]')
    } catch {
      return []
    }
  }, [customer])

  const tags = useMemo<string[]>(() => {
    if (!customer) return []
    try {
      return JSON.parse(customer.tags || '[]')
    } catch {
      return []
    }
  }, [customer])

  const lifetimeValue = useMemo(() => {
    if (!customer) return 0
    return customer.totalSpent * 1.2 // Simple LTV estimate
  }, [customer])

  const addNote = async () => {
    if (!customer || !noteText.trim()) return
    setAddingNote(true)
    try {
      await api.put(`/customers/${customer.id}`, { notes: noteText })
      toast.success('Note saved')
      // Refresh customer data
      const data = await api.get<{ customer: CustomerData }>(`/customers/${customer.id}`)
      setCustomer(data.customer)
    } catch {
      toast.error('Failed to save note')
    } finally {
      setAddingNote(false)
    }
  }

  const addTag = async () => {
    if (!customer || !tagInput.trim()) return
    try {
      const currentTags: string[] = JSON.parse(customer.tags || '[]')
      const newTags = [...new Set([...currentTags, tagInput.trim()])]
      await api.put(`/customers/${customer.id}`, { tags: newTags })
      toast.success('Tag added')
      setTagInput('')
      const data = await api.get<{ customer: CustomerData }>(`/customers/${customer.id}`)
      setCustomer(data.customer)
    } catch {
      toast.error('Failed to add tag')
    }
  }

  const removeTag = async (tag: string) => {
    if (!customer) return
    try {
      const currentTags: string[] = JSON.parse(customer.tags || '[]')
      const newTags = currentTags.filter((t) => t !== tag)
      await api.put(`/customers/${customer.id}`, { tags: newTags })
      toast.success('Tag removed')
      const data = await api.get<{ customer: CustomerData }>(`/customers/${customer.id}`)
      setCustomer(data.customer)
    } catch {
      toast.error('Failed to remove tag')
    }
  }

  if (loading) {
    return <CustomerDetailSkeleton />
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">Customer not found</p>
        <Button variant="outline" className="mt-4" onClick={() => setDashboardPage('customers')}>
          Back to Customers
        </Button>
      </div>
    )
  }

  const initials = (customer.name || customer.email).charAt(0).toUpperCase()

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header Card */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-blue-400 to-indigo-500" />
          <CardContent className="p-6 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <Button variant="ghost" size="icon" onClick={() => setDashboardPage('customers')} className="shrink-0 -ml-2 self-start">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              {/* Avatar */}
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg shadow-sky-200">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight">{customer.name || 'No Name'}</h2>
                  <Badge
                    variant="secondary"
                    className={`text-xs px-2.5 py-1 border font-semibold capitalize ${statusBadgeColors[customer.status] || ''}`}
                  >
                    {customer.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Joined {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <div className="flex items-center gap-1">
                    <Input
                      placeholder="Add tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="h-6 w-24 text-xs border-dashed"
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={addTag}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 shrink-0 self-start">
                <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${customer.email}`)}>
                  <Mail className="mr-1.5 h-3.5 w-3.5" /> Email
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setActiveTab('notes') }}>
                  <StickyNote className="mr-1.5 h-3.5 w-3.5" /> Note
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Total Spent',
              value: `$${customer.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              icon: DollarSign,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
              gradient: 'from-emerald-500 to-teal-600',
            },
            {
              label: 'Total Orders',
              value: customer.totalOrders,
              icon: ShoppingCart,
              color: 'text-sky-600',
              bg: 'bg-sky-50',
              gradient: 'from-sky-500 to-blue-600',
            },
            {
              label: 'Avg Order Value',
              value: `$${customer.avgOrderValue.toFixed(2)}`,
              icon: TrendingUp,
              color: 'text-violet-600',
              bg: 'bg-violet-50',
              gradient: 'from-violet-500 to-purple-600',
            },
            {
              label: 'Lifetime Value',
              value: `$${lifetimeValue.toFixed(2)}`,
              icon: Heart,
              color: 'text-rose-600',
              bg: 'bg-rose-50',
              gradient: 'from-rose-500 to-pink-600',
            },
          ].map((stat) => (
            <div key={stat.label} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <Card className="hover:shadow-md transition-all duration-300 pt-1">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} shadow-sm group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="orders" className="text-xs sm:text-sm">
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5 hidden sm:inline" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs sm:text-sm">
              <Clock className="h-3.5 w-3.5 mr-1.5 hidden sm:inline" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs sm:text-sm">
              <StickyNote className="h-3.5 w-3.5 mr-1.5 hidden sm:inline" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="addresses" className="text-xs sm:text-sm">
              <MapPin className="h-3.5 w-3.5 mr-1.5 hidden sm:inline" />
              Addresses
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-4">
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100">
                    <ShoppingCart className="h-4 w-4 text-emerald-600" />
                  </div>
                  Order History
                </CardTitle>
                <CardDescription>
                  {customer.orders.length} order{customer.orders.length !== 1 ? 's' : ''} placed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {customer.orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-muted-foreground font-medium">No orders yet</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">Orders will appear here when this customer makes a purchase</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-2 max-h-96 overflow-y-auto">
                    <style>{`
                      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                      .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.2); border-radius: 3px; }
                      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground) / 0.3); }
                    `}</style>
                    <div className="custom-scrollbar">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs font-semibold uppercase tracking-wider">Order</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider">Date</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider">Items</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customer.orders.map((order) => (
                            <TableRow
                              key={order.id}
                              className="cursor-pointer hover:bg-muted/50 transition-colors group"
                              onClick={() => {
                                setSelectedOrderId(order.id)
                                setDashboardPage('orders')
                              }}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm group-hover:text-primary transition-colors">{order.orderNumber}</span>
                                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${orderStatusColors[order.status] || ''}`}
                                >
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-semibold text-sm">
                                ${order.total.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Timeline Tab */}
          <TabsContent value="timeline" className="mt-4">
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-500" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-violet-100">
                    <Clock className="h-4 w-4 text-violet-600" />
                  </div>
                  Activity Timeline
                </CardTitle>
                <CardDescription>
                  {timeline.length} event{timeline.length !== 1 ? 's' : ''} recorded
                </CardDescription>
              </CardHeader>
              <CardContent>
                {timeline.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-muted-foreground font-medium">No activity yet</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">Activity will appear here as the customer interacts with your store</p>
                  </div>
                ) : (
                  <div className="relative pl-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {timeline.map((event, index) => {
                      const isLast = index === timeline.length - 1
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className="relative flex gap-4"
                        >
                          {/* Connecting line */}
                          {!isLast && (
                            <div className="absolute left-[17px] top-[36px] w-0.5 h-[calc(100%-16px)] border-l-2 border-dashed border-gray-200" />
                          )}

                          {/* Event icon */}
                          <div className={`relative z-10 shrink-0 flex h-9 w-9 items-center justify-center rounded-full ${event.bgColor} shadow-sm`}>
                            <span className={event.color}>{event.icon}</span>
                          </div>

                          {/* Event content */}
                          <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                            <p className="text-sm font-semibold">{event.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                            <p className="text-[11px] text-muted-foreground/60 mt-1">
                              {formatRelativeTime(event.date)}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-4">
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-red-500" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100">
                    <StickyNote className="h-4 w-4 text-amber-600" />
                  </div>
                  Internal Notes
                </CardTitle>
                <CardDescription>
                  Notes are only visible to store staff
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note about this customer..."
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground">
                      {noteText.length} character{noteText.length !== 1 ? 's' : ''}
                    </p>
                    <Button size="sm" onClick={addNote} disabled={addingNote || !noteText.trim()}>
                      {addingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
                      Save Note
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Display current note */}
                {customer.notes ? (
                  <div className="p-4 rounded-lg bg-muted/30 border">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 shrink-0 mt-0.5">
                        <StickyNote className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
                        <p className="text-[11px] text-muted-foreground mt-2">
                          Last updated {formatRelativeTime(customer.updatedAt || customer.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                      <StickyNote className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-muted-foreground font-medium">No notes yet</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">Add a note to keep track of important customer information</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="mt-4">
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-400 to-fuchsia-500" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-100">
                    <MapPin className="h-4 w-4 text-rose-600" />
                  </div>
                  Saved Addresses
                </CardTitle>
                <CardDescription>
                  {addresses.length} address{addresses.length !== 1 ? 'es' : ''} on file
                </CardDescription>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <MapPin className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-muted-foreground font-medium">No addresses saved</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">Addresses will appear here when the customer adds them during checkout</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((addr, index) => (
                      <div key={index} className="p-4 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {addr.type || (index === 0 ? 'Shipping' : 'Billing')}
                            </Badge>
                            {addr.isDefault && (
                              <Badge className="text-[10px] bg-emerald-100 text-emerald-800 border-0">Default</Badge>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                            navigator.clipboard.writeText([
                              addr.name, addr.line1, addr.line2, [addr.city, addr.state, addr.zip].filter(Boolean).join(', '), addr.country
                            ].filter(Boolean).join('\n'))
                            toast.success('Address copied to clipboard')
                          }}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="text-sm space-y-0.5">
                          {addr.name && <p className="font-medium">{addr.name}</p>}
                          {addr.line1 && <p className="text-muted-foreground">{addr.line1}</p>}
                          {addr.line2 && <p className="text-muted-foreground">{addr.line2}</p>}
                          <p className="text-muted-foreground">
                            {[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}
                          </p>
                          {addr.country && <p className="text-muted-foreground">{addr.country}</p>}
                          {addr.phone && (
                            <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                              <Phone className="h-3 w-3" />
                              <span>{addr.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}

function CustomerDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
