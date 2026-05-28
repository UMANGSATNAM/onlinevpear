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
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
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
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

export function OverviewDashboard() {
  const { selectedMerchantId, selectedStoreId, setDashboardPage, setSelectedOrderId } = useAppStore()
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
      value: `$${data.stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: data.stats.revenueGrowth,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Orders',
      value: data.stats.totalOrders.toLocaleString(),
      change: data.stats.recentOrders > 0 ? ((data.stats.recentOrders / Math.max(data.stats.totalOrders - data.stats.recentOrders, 1)) * 100) : 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Customers',
      value: data.stats.totalCustomers.toLocaleString(),
      change: data.stats.recentCustomers,
      icon: Users,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      title: 'Products',
      value: data.stats.totalProducts.toLocaleString(),
      change: data.stats.activeProducts,
      icon: Package,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.title} {...fadeIn} transition={{ duration: 0.4, delay: i * 0.1 }}>
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} rounded-full p-3`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  {stat.title === 'Total Revenue' ? (
                    <>
                      {stat.change >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={stat.change >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {Math.abs(stat.change).toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground">vs last period</span>
                    </>
                  ) : stat.title === 'Orders' ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-600">{stat.change.toFixed(1)}%</span>
                      <span className="text-muted-foreground">recent</span>
                    </>
                  ) : stat.title === 'Customers' ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-600">+{stat.change}</span>
                      <span className="text-muted-foreground">recent</span>
                    </>
                  ) : (
                    <>
                      <span className="text-muted-foreground">{stat.change} active</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div className="lg:col-span-2" {...fadeIn} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue for the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={data.revenueChart} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-revenue)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best selling products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No product data yet</p>
              ) : (
                <div className="space-y-4">
                  {data.topProducts.map((tp, i) => (
                    <div key={tp.product?.id || i} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-medium">
                        #{i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tp.product?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{tp.totalQuantity} sold</p>
                      </div>
                      <div className="text-sm font-semibold">
                        ${tp.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div className="lg:col-span-2" {...fadeIn} transition={{ duration: 0.4, delay: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders across your stores</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDashboardPage('orders')}
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {data.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentOrders.map((order) => (
                        <TableRow
                          key={order.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setSelectedOrderId(order.id)
                            setDashboardPage('orders')
                          }}
                        >
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>{order.customer?.name || order.customer?.email || 'Guest'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={statusColors[order.status] || ''}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              order.paymentStatus === 'paid'
                                ? 'border-emerald-300 text-emerald-700'
                                : 'border-yellow-300 text-yellow-700'
                            }>
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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

        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.6 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>Products running low on inventory</CardDescription>
            </CardHeader>
            <CardContent>
              {data.lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">All products are well stocked</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {data.lowStockProducts.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        {item.product.sku && (
                          <p className="text-xs text-muted-foreground">SKU: {item.product.sku}</p>
                        )}
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-sm font-bold text-amber-700">{item.quantity}</p>
                        <p className="text-xs text-muted-foreground">of {item.lowStockThreshold}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-3" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
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
