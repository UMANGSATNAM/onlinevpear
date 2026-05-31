'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Eye,
  Plus,
  Gift,
  ClipboardList,
  Activity,
  Clock,
  Star,
  CheckCircle2,
  UserPlus,
  CreditCard,
  Sparkles,
  PackagePlus,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
  orders: {
    label: 'Orders',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

interface AnalyticsData {
  stats: {
    totalRevenue: number
    recentRevenue: number
    revenueGrowth: number
    totalOrders: number
    recentOrders: number
    totalCustomers: number
    recentCustomers: number
    totalProducts: number
    activeProducts: number
  }
  recentOrders: Array<{
    id: string
    orderNumber: string
    status: string
    paymentStatus: string
    total: number
    createdAt: string
    customer: { id: string; name: string | null; email: string } | null
  }>
  revenueChart: Array<{ month: string; revenue: number; orders: number }>
  topProducts: Array<{
    product: { id: string; name: string; images: string; price: number } | null
    totalQuantity: number
    totalRevenue: number
    orderCount: number
  }>
  lowStockProducts: Array<{
    id: string
    quantity: number
    lowStockThreshold: number
    product: { id: string; name: string; sku: string | null; images: string }
  }>
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

const productGradients = [
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-sky-500 to-blue-600',
]

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

// Mock activity feed data
const activityFeed = [
  { id: '1', icon: ShoppingCart, iconBg: 'bg-emerald-100 text-emerald-600', title: 'New order received', description: 'Order #1248 — $149.99', time: '2 min ago' },
  { id: '2', icon: UserPlus, iconBg: 'bg-violet-100 text-violet-600', title: 'New customer signed up', description: 'sarah.johnson@email.com', time: '15 min ago' },
  { id: '3', icon: Star, iconBg: 'bg-amber-100 text-amber-600', title: '5-star review received', description: 'Wireless Headphones Pro', time: '1 hour ago' },
  { id: '4', icon: CreditCard, iconBg: 'bg-emerald-100 text-emerald-600', title: 'Payment received', description: '$249.99 from Order #1247', time: '2 hours ago' },
  { id: '5', icon: AlertTriangle, iconBg: 'bg-amber-100 text-amber-600', title: 'Low stock alert', description: 'Mechanical Keyboard — 3 left', time: '3 hours ago' },
  { id: '6', icon: CheckCircle2, iconBg: 'bg-emerald-100 text-emerald-600', title: 'Order shipped', description: 'Order #1245 — Express delivery', time: '5 hours ago' },
  { id: '7', icon: Gift, iconBg: 'bg-rose-100 text-rose-600', title: 'Discount code used', description: 'SUMMER20 — 20% off', time: '6 hours ago' },
]

function PerformanceScore({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference
  const getColor = (s: number) => {
    if (s >= 80) return '#10b981'
    if (s >= 60) return '#f59e0b'
    return '#ef4444'
  }
  const color = getColor(score)

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-36 w-36">
        <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ color }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground font-medium">out of 100</span>
        </div>
      </div>
      <p className="text-sm font-semibold mt-2">Store Health</p>
      <p className="text-xs text-muted-foreground">Based on sales, inventory & engagement</p>
    </div>
  )
}

export function OverviewDashboard() {
  const { selectedMerchantId, setDashboardPage, setSelectedOrderId, currentUser } = useAppStore()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedMerchantId) return
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await api.get<AnalyticsData>('/analytics', { merchantId: selectedMerchantId })
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [selectedMerchantId])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return { text: 'Good morning', message: 'Ready to crush it today?', emoji: '☀️' }
    if (hour < 18) return { text: 'Good afternoon', message: 'Your store is performing well.', emoji: '🌤️' }
    return { text: 'Good evening', message: "Here's your daily wrap-up.", emoji: '🌙' }
  }, [])

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }, [])

  const performanceScore = useMemo(() => {
    if (!data) return 75
    let score = 50
    if (data.stats.revenueGrowth > 0) score += 15
    if (data.stats.activeProducts > 5) score += 10
    if (data.lowStockProducts.length < 3) score += 10
    if (data.stats.totalOrders > 10) score += 10
    if (data.stats.recentCustomers > 0) score += 5
    return Math.min(score, 98)
  }, [data])

  if (loading) return <OverviewSkeleton />
  if (error) return <div className="p-6 text-destructive">Error loading dashboard: {error}</div>
  if (!data) return <div className="p-6 text-muted-foreground">No data available</div>

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${data.stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: data.stats.revenueGrowth,
      changeLabel: 'vs last period',
      icon: DollarSign,
      gradient: 'from-indigo-600 to-[#4338CA]',
      bgGradient: 'from-indigo-50 to-[#4338CA]/5',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-[#4338CA]',
      valueColor: 'text-[#F5A623]',
    },
    {
      title: 'Orders',
      value: data.stats.totalOrders.toLocaleString(),
      change: data.stats.recentOrders,
      changeLabel: 'recent',
      icon: ShoppingCart,
      gradient: 'from-[#4338CA] to-violet-600',
      bgGradient: 'from-violet-50 to-indigo-50',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      valueColor: '',
    },
    {
      title: 'Customers',
      value: data.stats.totalCustomers.toLocaleString(),
      change: data.stats.recentCustomers,
      changeLabel: 'new this month',
      icon: Users,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      valueColor: '',
    },
    {
      title: 'Products',
      value: data.stats.totalProducts.toLocaleString(),
      change: data.stats.activeProducts,
      changeLabel: 'active',
      icon: Package,
      gradient: 'from-[#FF6B6B] to-rose-600',
      bgGradient: 'from-rose-50 to-orange-50',
      iconBg: 'bg-rose-100',
      iconColor: 'text-[#FF6B6B]',
      valueColor: '',
    },
  ]

  const quickActions = [
    { label: 'Add Product', icon: PackagePlus, gradient: 'from-[#FF6B6B] to-rose-600', bg: 'from-[#FF6B6B]/5 to-rose-50/80', action: () => setDashboardPage('product-new') as unknown as void },
    { label: 'Create Discount', icon: Gift, gradient: 'from-[#4338CA] to-indigo-600', bg: 'from-indigo-50/80 to-[#4338CA]/5', action: () => setDashboardPage('discounts') },
    { label: 'View Orders', icon: ClipboardList, gradient: 'from-violet-500 to-purple-600', bg: 'from-violet-50/80 to-purple-50/80', action: () => setDashboardPage('orders') },
    { label: 'Check Analytics', icon: Activity, gradient: 'from-[#F5A623] to-amber-600', bg: 'from-[#F5A623]/5 to-amber-50/80', action: () => setDashboardPage('analytics') },
  ]

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)' }} />
          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {greeting.text}, {currentUser?.name || 'Merchant'}! {greeting.emoji}
                </h1>
                <p className="text-slate-300 mt-1 text-sm sm:text-base">{greeting.message}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">{currentDate}</span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-300 bg-emerald-500/10">
                  <Sparkles className="h-3 w-3 mr-1" />
                  All systems operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Action Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <motion.div
              key={action.label}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer bg-gradient-to-br ${action.bg} border-0 hover:shadow-lg transition-shadow duration-300`}
                onClick={action.action}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-semibold text-sm">{action.label}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted-foreground">Quick access</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              {/* Gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-5 pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className={cn("text-2xl sm:text-3xl font-bold tracking-tight", stat.valueColor || '')}>{stat.value}</p>
                  </div>
                  <div className={`${stat.iconBg} rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  {stat.title === 'Total Revenue' ? (
                    <>
                      {stat.change >= 0 ? (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50">
                          <TrendingUp className="h-3 w-3 text-emerald-600" />
                          <span className="text-xs font-semibold text-emerald-600">{stat.change.toFixed(1)}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-50">
                          <TrendingDown className="h-3 w-3 text-red-600" />
                          <span className="text-xs font-semibold text-red-600">{Math.abs(stat.change).toFixed(1)}%</span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">{stat.changeLabel}</span>
                    </>
                  ) : stat.title === 'Orders' ? (
                    <>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50">
                        <ArrowUpRight className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-600">{stat.change}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{stat.changeLabel}</span>
                    </>
                  ) : stat.title === 'Customers' ? (
                    <>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-50">
                        <TrendingUp className="h-3 w-3 text-violet-600" />
                        <span className="text-xs font-semibold text-violet-600">+{stat.change}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{stat.changeLabel}</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">{stat.change} {stat.changeLabel}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart + Performance Score */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-chart-1" />
                    Revenue Overview
                  </CardTitle>
                  <CardDescription className="mt-1">Monthly revenue for the last 12 months</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <AreaChart data={data.revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    dot={{ fill: 'hsl(var(--chart-1))', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: 'white' }}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Score + Top Products */}
        <motion.div variants={itemVariants} className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <PerformanceScore score={performanceScore} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
              <CardDescription>Best selling by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Package className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm">No product data yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.topProducts.slice(0, 4).map((tp, i) => (
                    <div key={tp.product?.id || i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${productGradients[i % productGradients.length]} text-white text-sm font-bold shadow-sm`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors truncate" title={tp.product?.name || 'Unknown'}>{tp.product?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{tp.totalQuantity} sold · {tp.orderCount} orders</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">${tp.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Orders + Activity Feed */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
                  <CardDescription>Latest orders across your stores</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDashboardPage('orders')}
                  className="gap-1.5"
                >
                  View All
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {data.recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm">No orders yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-2">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Order</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Customer</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Payment</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentOrders.map((order) => (
                        <TableRow
                          key={order.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors group"
                          onClick={() => {
                            setSelectedOrderId(order.id)
                            setDashboardPage('orders')
                          }}
                        >
                          <TableCell className="font-medium text-sm">
                            <span className="group-hover:text-primary transition-colors">{order.orderNumber}</span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {order.customer?.name || order.customer?.email || 'Guest'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[11px] px-2 py-0.5 border ${statusColors[order.status] || ''}`}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-[11px] px-2 py-0.5 ${
                              order.paymentStatus === 'paid'
                                ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                                : order.paymentStatus === 'failed'
                                ? 'border-red-300 text-red-700 bg-red-50'
                                : 'border-yellow-300 text-yellow-700 bg-yellow-50'
                            }`}>
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-sm">
                            ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <Badge variant="outline" className="text-xs">{activityFeed.length} events</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative max-h-[400px] overflow-y-auto pr-1">
                {/* Timeline line */}
                <div className="absolute left-5 top-3 bottom-3 w-px bg-border" />
                <div className="space-y-0">
                  <AnimatePresence>
                    {activityFeed.map((activity, i) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="relative flex items-start gap-3 py-3 group"
                      >
                        {/* Timeline dot */}
                        <div className={`relative z-10 h-10 w-10 rounded-full ${activity.iconBg} flex items-center justify-center shrink-0 ring-4 ring-background`}>
                          <activity.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">{activity.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                          <p className="text-[11px] text-muted-foreground/70 mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.time}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Low Stock Alerts */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Products running low</CardDescription>
          </CardHeader>
          <CardContent>
            {data.lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Package className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm">All products well stocked</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.lowStockProducts.map((item) => {
                  const stockPct = Math.min((item.quantity / item.lowStockThreshold) * 100, 100)
                  const isCritical = item.quantity <= item.lowStockThreshold / 2
                  return (
                    <div key={item.id} className={`p-4 rounded-xl border transition-colors ${
                      isCritical ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium truncate pr-2">{item.product.name}</p>
                        <span className={`text-xs font-bold ${isCritical ? 'text-red-700' : 'text-amber-700'}`}>
                          {item.quantity} left
                        </span>
                      </div>
                      {item.product.sku && (
                        <p className="text-xs text-muted-foreground mb-2">SKU: {item.product.sku}</p>
                      )}
                      <Progress
                        value={stockPct}
                        className={`h-1.5 ${isCritical ? '[&>div]:bg-red-500' : '[&>div]:bg-amber-500'}`}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-10 w-10 rounded-xl mb-3" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
              <Skeleton className="h-4 w-28 mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-28 mb-1.5" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
