'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  ShoppingCart,
  Package,
  AlertTriangle,
  Users,
  DollarSign,
  Bot,
  Tag,
  Megaphone,
  Star,
  Settings,
  Check,
  X,
  Clock,
  Inbox,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

// ============================================================
// Types
// ============================================================

export type NotificationType =
  | 'order'
  | 'product'
  | 'system'
  | 'marketing'
  | 'alert'
  | 'customer'
  | 'payment'
  | 'ai'
  | 'discount'
  | 'review'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  link?: string | null
  isRead: boolean
  createdAt: string
}

interface NotificationsPanelProps {
  open: boolean
  onClose: () => void
  merchantId: string
}

interface NotificationApiResponse {
  notifications: Notification[]
  unreadCount: number
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================================
// Type Config (icon, color, category)
// ============================================================

const typeConfig: Record<string, {
  icon: React.ElementType
  color: string
  bgGradient: string
  iconBg: string
  iconColor: string
  category: 'Orders' | 'Products' | 'System' | 'Marketing'
}> = {
  order: {
    icon: ShoppingCart,
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-500/8 to-teal-500/8',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    category: 'Orders',
  },
  payment: {
    icon: DollarSign,
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-500/8 to-green-500/8',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    category: 'Orders',
  },
  product: {
    icon: Package,
    color: 'text-orange-600',
    bgGradient: 'from-orange-500/8 to-amber-500/8',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    category: 'Products',
  },
  alert: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgGradient: 'from-amber-500/8 to-yellow-500/8',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    category: 'Products',
  },
  customer: {
    icon: Users,
    color: 'text-violet-600',
    bgGradient: 'from-violet-500/8 to-purple-500/8',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    category: 'Orders',
  },
  ai: {
    icon: Bot,
    color: 'text-purple-600',
    bgGradient: 'from-purple-500/8 to-fuchsia-500/8',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    category: 'System',
  },
  discount: {
    icon: Tag,
    color: 'text-rose-600',
    bgGradient: 'from-rose-500/8 to-pink-500/8',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    category: 'Marketing',
  },
  marketing: {
    icon: Megaphone,
    color: 'text-sky-600',
    bgGradient: 'from-sky-500/8 to-cyan-500/8',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    category: 'Marketing',
  },
  review: {
    icon: Star,
    color: 'text-amber-600',
    bgGradient: 'from-amber-500/8 to-yellow-500/8',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    category: 'Products',
  },
  system: {
    icon: Settings,
    color: 'text-slate-600',
    bgGradient: 'from-slate-500/8 to-gray-500/8',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    category: 'System',
  },
  info: {
    icon: Bell,
    color: 'text-slate-600',
    bgGradient: 'from-slate-500/8 to-gray-500/8',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    category: 'System',
  },
  success: {
    icon: Check,
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-500/8 to-green-500/8',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    category: 'System',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgGradient: 'from-amber-500/8 to-yellow-500/8',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    category: 'Products',
  },
  error: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgGradient: 'from-red-500/8 to-rose-500/8',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    category: 'System',
  },
}

// ============================================================
// Mock Data Generator
// ============================================================

function generateMockNotifications(userId: string): Notification[] {
  const now = new Date()
  const minutesAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000).toISOString()
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString()

  return [
    // Today
    {
      id: 'n1',
      userId,
      title: 'New order placed',
      message: 'Order #ORD-12346 — $125.00 from John D. Payment confirmed via credit card.',
      type: 'order',
      isRead: false,
      createdAt: minutesAgo(2),
    },
    {
      id: 'n2',
      userId,
      title: 'Payment received',
      message: 'Payment of $89.50 received for Order #ORD-12340 from Sarah M.',
      type: 'payment',
      isRead: false,
      createdAt: minutesAgo(15),
    },
    {
      id: 'n3',
      userId,
      title: 'Low stock alert',
      message: 'Wireless Headphones has only 3 units left. Consider restocking soon.',
      type: 'alert',
      isRead: false,
      createdAt: minutesAgo(32),
    },
    {
      id: 'n4',
      userId,
      title: 'New customer signup',
      message: 'Emily R. just created an account and added 2 items to their wishlist.',
      type: 'customer',
      isRead: true,
      createdAt: hoursAgo(1),
    },
    {
      id: 'n5',
      userId,
      title: 'AI Assistant suggestion',
      message: 'Based on your sales data, consider adding a "Frequently Bought Together" bundle for your top 3 products.',
      type: 'ai',
      isRead: false,
      createdAt: hoursAgo(2),
    },
    // Yesterday
    {
      id: 'n6',
      userId,
      title: 'Order shipped',
      message: 'Order #ORD-12345 has been shipped via Express Delivery. Tracking: SF-9876543210.',
      type: 'order',
      isRead: true,
      createdAt: hoursAgo(26),
    },
    {
      id: 'n7',
      userId,
      title: 'Discount code used',
      message: 'Coupon code SUMMER20 was used 15 times today, generating $450 in additional revenue.',
      type: 'discount',
      isRead: false,
      createdAt: hoursAgo(28),
    },
    {
      id: 'n8',
      userId,
      title: '5-star review received',
      message: 'Customer Alex T. left a 5-star review on Premium Leather Wallet: "Absolutely love the quality!"',
      type: 'review',
      isRead: true,
      createdAt: hoursAgo(30),
    },
    // Earlier this week
    {
      id: 'n9',
      userId,
      title: 'System update available',
      message: 'ShopForge v2.4.0 is available with new analytics features and performance improvements.',
      type: 'system',
      isRead: true,
      createdAt: daysAgo(2),
    },
    {
      id: 'n10',
      userId,
      title: 'Marketing campaign completed',
      message: 'Your "Summer Sale Blast" email campaign reached 2,450 subscribers with 34% open rate.',
      type: 'marketing',
      isRead: true,
      createdAt: daysAgo(3),
    },
    {
      id: 'n11',
      userId,
      title: 'New order placed',
      message: 'Order #ORD-12330 — $67.80 from Mike L. via PayPal.',
      type: 'order',
      isRead: true,
      createdAt: daysAgo(3),
    },
    // Older
    {
      id: 'n12',
      userId,
      title: 'AI SEO optimization complete',
      message: 'Your product descriptions have been optimized. Estimated traffic increase: 12%.',
      type: 'ai',
      isRead: true,
      createdAt: daysAgo(6),
    },
    {
      id: 'n13',
      userId,
      title: 'Product stock replenished',
      message: 'Bluetooth Speaker inventory has been restocked. 150 units now available.',
      type: 'product',
      isRead: true,
      createdAt: daysAgo(7),
    },
    {
      id: 'n14',
      userId,
      title: 'Weekly analytics report',
      message: 'Your weekly report is ready: Revenue up 8%, Orders up 12%, New customers: 23.',
      type: 'system',
      isRead: true,
      createdAt: daysAgo(8),
    },
    {
      id: 'n15',
      userId,
      title: 'Flash sale campaign launched',
      message: 'Your "Flash Friday" campaign is now live. Monitor performance in the Marketing tab.',
      type: 'marketing',
      isRead: true,
      createdAt: daysAgo(9),
    },
  ]
}

// ============================================================
// Time Helpers
// ============================================================

function getRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7) return `${diffDay} days ago`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) > 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getTimeGroup(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffHr = diffMs / (1000 * 60 * 60)
  const diffDay = diffHr / 24

  // Start of today
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  // Start of yesterday
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  // Start of this week (Monday)
  const weekStart = new Date(todayStart)
  const dayOfWeek = weekStart.getDay()
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  weekStart.setDate(weekStart.getDate() - diffToMonday)

  if (date >= todayStart) return 'Today'
  if (date >= yesterdayStart) return 'Yesterday'
  if (date >= weekStart) return 'Earlier this week'
  return 'Older'
}

// ============================================================
// Animation Variants
// ============================================================

const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const listItemVariants = {
  hidden: { opacity: 0, x: 20, scale: 0.97 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    x: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

const groupHeaderVariants = {
  hidden: { opacity: 0, y: -5 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

// ============================================================
// Notification Item Component
// ============================================================

function NotificationItem({
  notification,
  onMarkRead,
  onDismiss,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onDismiss: (id: string) => void
}) {
  const config = typeConfig[notification.type] || typeConfig.info
  const Icon = config.icon
  const isUnread = !notification.isRead

  return (
    <motion.div
      layout
      variants={listItemVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className={`
        group relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer
        hover:shadow-md hover:border-border/80
        ${isUnread
          ? `bg-gradient-to-br ${config.bgGradient} border-primary/15 hover:border-primary/25`
          : 'bg-card border-border/50 hover:bg-muted/30'
        }
      `}
      onClick={() => {
        if (isUnread) onMarkRead(notification.id)
      }}
    >
      {/* Unread dot */}
      {isUnread && (
        <div className="absolute top-3.5 right-3.5">
          <span className="flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
        </div>
      )}

      <div className="flex gap-3">
        {/* Icon */}
        <div className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-lg ${config.iconBg} transition-transform duration-200 group-hover:scale-110`}>
          <Icon className={`h-4.5 w-4.5 ${config.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm leading-snug ${isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
              {notification.title}
            </p>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {notification.message}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
              <Clock className="h-3 w-3" />
              {getRelativeTime(notification.createdAt)}
            </div>
            {isUnread && (
              <Badge className="h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-primary/20 border">
                New
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons (show on hover) */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {isUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] gap-1 text-primary hover:text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation()
              onMarkRead(notification.id)
            }}
          >
            <Check className="h-3 w-3" />
            Read
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[10px] gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation()
            onDismiss(notification.id)
          }}
        >
          <X className="h-3 w-3" />
          Dismiss
        </Button>
      </div>
    </motion.div>
  )
}

// ============================================================
// Empty State
// ============================================================

function EmptyState({ filter }: { filter: string }) {
  const messages: Record<string, { title: string; description: string }> = {
    all: { title: 'No notifications yet', description: 'We\'ll notify you when something important happens.' },
    orders: { title: 'No order notifications', description: 'Order updates will appear here.' },
    products: { title: 'No product notifications', description: 'Product alerts and updates will show up here.' },
    system: { title: 'No system notifications', description: 'System updates and AI suggestions will appear here.' },
    marketing: { title: 'No marketing notifications', description: 'Campaign updates and discount alerts will show up here.' },
  }

  const msg = messages[filter] || messages.all

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      <div className="relative mb-4">
        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
          <Inbox className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border flex items-center justify-center">
          <Sparkles className="h-3 w-3 text-muted-foreground/40" />
        </div>
      </div>
      <p className="text-sm font-medium text-foreground/70">{msg.title}</p>
      <p className="text-xs text-muted-foreground mt-1 text-center">{msg.description}</p>
    </motion.div>
  )
}

// ============================================================
// Main Component
// ============================================================

export function NotificationsPanel({ open, onClose, merchantId }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch notifications
  const fetchNotifications = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!merchantId) return
    setLoading(true)
    try {
      const params: Record<string, string> = {
        userId: merchantId,
        page: String(pageNum),
        limit: '20',
      }

      // Map filter to API type param
      const filterMap: Record<string, string | undefined> = {
        all: undefined,
        orders: 'order',
        products: 'product',
        system: 'system',
        marketing: 'marketing',
      }

      const typeFilter = filterMap[activeFilter]
      if (typeFilter) params.type = typeFilter

      const result = await api.get<NotificationApiResponse>('/notifications', params)

      if (append) {
        setNotifications(prev => [...prev, ...result.notifications])
      } else {
        setNotifications(result.notifications)
      }
      setUnreadCount(result.unreadCount)
      setTotalCount(result.pagination.total)
      setTotalPages(result.pagination.totalPages)
    } catch {
      // Fallback to mock data if API fails
      const mockData = generateMockNotifications(merchantId)
      if (!append) {
        setNotifications(mockData)
        setUnreadCount(mockData.filter(n => !n.isRead).length)
        setTotalCount(mockData.length)
        setTotalPages(1)
      }
    } finally {
      setLoading(false)
    }
  }, [merchantId, activeFilter])

  // Load on open or filter change
  useEffect(() => {
    if (open && merchantId) {
      setPage(1)
      fetchNotifications(1, false)
    }
  }, [open, merchantId, activeFilter, fetchNotifications])

  // Mark single notification as read
  const handleMarkRead = useCallback(async (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      await api.patch(`/notifications/${id}`, { isRead: true })
      toast.success('Marked as read')
    } catch {
      // Silently fail — optimistic update already applied
    }
  }, [])

  // Mark all as read
  const handleMarkAllRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id)
    if (unreadIds.length === 0) return

    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)

    try {
      await api.post('/notifications/mark-all-read', { userId: merchantId })
      toast.success(`Marked ${unreadIds.length} notification${unreadIds.length > 1 ? 's' : ''} as read`)
    } catch {
      toast.error('Failed to mark all as read')
    }
  }, [notifications, merchantId])

  // Dismiss notification
  const handleDismiss = useCallback(async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    const wasUnread = notifications.find(n => n.id === id && !n.isRead)
    if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      await api.delete(`/notifications/${id}`)
      toast.success('Notification dismissed')
    } catch {
      toast.error('Failed to dismiss notification')
    }
  }, [notifications])

  // Load more
  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchNotifications(nextPage, true)
  }, [page, fetchNotifications])

  // Filter notifications by active filter (client-side grouping for categories)
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications

    const categoryMap: Record<string, string[]> = {
      orders: ['order', 'payment', 'customer'],
      products: ['product', 'alert', 'review'],
      system: ['system', 'info', 'success', 'warning', 'error', 'ai'],
      marketing: ['marketing', 'discount'],
    }

    const allowedTypes = categoryMap[activeFilter]
    if (!allowedTypes) return notifications
    return notifications.filter(n => allowedTypes.includes(n.type))
  }, [notifications, activeFilter])

  // Group by time
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {}
    const order = ['Today', 'Yesterday', 'Earlier this week', 'Older']

    filteredNotifications.forEach(n => {
      const group = getTimeGroup(n.createdAt)
      if (!groups[group]) groups[group] = []
      groups[group].push(n)
    })

    return order
      .filter(g => groups[g] && groups[g].length > 0)
      .map(g => ({ label: g, items: groups[g] }))
  }, [filteredNotifications])

  // Count by filter
  const filterCounts = useMemo(() => {
    const categoryMap: Record<string, string[]> = {
      orders: ['order', 'payment', 'customer'],
      products: ['product', 'alert', 'review'],
      system: ['system', 'info', 'success', 'warning', 'error', 'ai'],
      marketing: ['marketing', 'discount'],
    }

    return {
      all: notifications.length,
      orders: notifications.filter(n => categoryMap.orders.includes(n.type)).length,
      products: notifications.filter(n => categoryMap.products.includes(n.type)).length,
      system: notifications.filter(n => categoryMap.system.includes(n.type)).length,
      marketing: notifications.filter(n => categoryMap.marketing.includes(n.type)).length,
    }
  }, [notifications])

  const hasMore = page < totalPages

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg p-0 gap-0 flex flex-col overflow-hidden"
      >
        {/* Gradient Header */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <SheetHeader className="relative p-5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Bell className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-lg font-bold">Notifications</SheetTitle>
                  <SheetDescription className="text-xs mt-0.5">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </SheetDescription>
                </div>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] gap-1.5 border-primary/20 text-primary hover:bg-primary/10 hover:text-primary"
                  onClick={handleMarkAllRead}
                >
                  <Check className="h-3 w-3" />
                  Mark all read
                </Button>
              )}
            </div>
          </SheetHeader>

          {/* Filter Tabs */}
          <div className="relative px-5 pb-3">
            <Tabs value={activeFilter} onValueChange={setActiveFilter}>
              <TabsList className="h-8 w-full bg-muted/60 p-0.5">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'orders', label: 'Orders' },
                  { key: 'products', label: 'Products' },
                  { key: 'system', label: 'System' },
                  { key: 'marketing', label: 'Marketing' },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="h-7 text-[11px] flex-1 gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    {tab.label}
                    {filterCounts[tab.key as keyof typeof filterCounts] > 0 && (
                      <span className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-muted text-[9px] font-semibold px-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                        {filterCounts[tab.key as keyof typeof filterCounts]}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        <Separator className="shrink-0" />

        {/* Notification List */}
        <ScrollArea className="flex-1">
          <style dangerouslySetInnerHTML={{
            __html: `
              [data-slot="scroll-area-viewport"] {
                scrollbar-width: thin;
                scrollbar-color: hsl(var(--border)) transparent;
              }
              [data-slot="scroll-area-viewport"]::-webkit-scrollbar {
                width: 6px;
              }
              [data-slot="scroll-area-viewport"]::-webkit-scrollbar-track {
                background: transparent;
              }
              [data-slot="scroll-area-viewport"]::-webkit-scrollbar-thumb {
                background: hsl(var(--border));
                border-radius: 9999px;
              }
              [data-slot="scroll-area-viewport"]::-webkit-scrollbar-thumb:hover {
                background: hsl(var(--muted-foreground) / 0.3);
              }
            `
          }} />

          {loading && notifications.length === 0 ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3.5 rounded-xl border border-border/50 animate-pulse">
                  <div className="h-9 w-9 rounded-lg bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-1/3 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : groupedNotifications.length === 0 ? (
            <EmptyState filter={activeFilter} />
          ) : (
            <div className="p-4 space-y-5">
              <AnimatePresence mode="popLayout">
                {groupedNotifications.map((group) => (
                  <div key={group.label}>
                    {/* Group Header */}
                    <motion.div
                      variants={groupHeaderVariants}
                      initial="hidden"
                      animate="show"
                      className="flex items-center gap-2 mb-2.5 px-1"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                        {group.label}
                      </span>
                      <div className="flex-1 h-px bg-border/50" />
                      <span className="text-[10px] text-muted-foreground/50">
                        {group.items.length}
                      </span>
                    </motion.div>

                    {/* Notification Items */}
                    <motion.div
                      className="space-y-2"
                      variants={listContainerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      {group.items.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkRead={handleMarkRead}
                          onDismiss={handleDismiss}
                        />
                      ))}
                    </motion.div>
                  </div>
                ))}
              </AnimatePresence>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center pt-2 pb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" />
                        Load more notifications
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* End of list indicator */}
              {!hasMore && filteredNotifications.length > 5 && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50">
                    <div className="h-px w-8 bg-border/40" />
                    You&apos;re all caught up
                    <div className="h-px w-8 bg-border/40" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator className="shrink-0" />
            <div className="shrink-0 px-5 py-3 flex items-center justify-between bg-muted/20">
              <span className="text-[11px] text-muted-foreground">
                Showing {filteredNotifications.length} of {totalCount} notifications
              </span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] gap-1 text-primary hover:text-primary"
                  onClick={handleMarkAllRead}
                >
                  <Check className="h-3 w-3" />
                  Mark all read
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
