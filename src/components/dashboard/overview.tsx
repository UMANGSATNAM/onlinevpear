'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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

export function OverviewDashboard() {
  const { selectedMerchantId, setDashboardPage, setSelectedOrderId } = useAppStore()
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
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Orders',
      value: data.stats.totalOrders.toLocaleString(),
      change: data.stats.recentOrders,
      changeLabel: 'recent',
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Customers',
      value: data.stats.totalCustomers.toLocaleString(),
      change: data.stats.recentCustomers,
      changeLabel: 'new this month',
      icon: Users,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-50',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
    },
    {
      title: 'Products',
      value: data.stats.totalProducts.toLocaleString(),
      change: data.stats.activeProducts,
      changeLabel: 'active',
      icon: Package,
      gradient: 'from-orange-500 to-amber-600',
      bgGradient: 'from-orange-50 to-amber-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ]

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
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
                    <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</p>
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

      {/* Revenue Chart + Top Products */}
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

        <motion.div variants={itemVariants}>
          <Card className="h-full">
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
                  {data.topProducts.map((tp, i) => (
                    <div key={tp.product?.id || i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${productGradients[i % productGradients.length]} text-white text-sm font-bold shadow-sm`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors" title={tp.product?.name || 'Unknown'}>{tp.product?.name || 'Unknown'}</p>
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

      {/* Recent Orders + Low Stock */}
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

        <motion.div variants={itemVariants}>
          <Card className="h-full">
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
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {data.lowStockProducts.map((item) => {
                    const stockPct = Math.min((item.quantity / item.lowStockThreshold) * 100, 100)
                    const isCritical = item.quantity <= item.lowStockThreshold / 2
                    return (
                      <div key={item.id} className={`p-3 rounded-xl border transition-colors ${
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
      </div>
    </motion.div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
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
