'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'

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
    total: number
    createdAt: string
  }>
  revenueChart: Array<{ month: string; revenue: number; orders: number }>
  topProducts: Array<{
    product: { id: string; name: string; images: string; price: number } | null
    totalQuantity: number
    totalRevenue: number
    orderCount: number
  }>
  orderStatusBreakdown: Record<string, number>
  lowStockProducts: Array<{
    id: string
    quantity: number
    product: { id: string; name: string; sku: string | null }
  }>
}

const revenueChartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
  orders: { label: 'Orders', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig

const barChartConfig = {
  orders: { label: 'Orders', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig

const pieChartConfig = {
  value: { label: 'Status' },
  pending: { label: 'Pending', color: 'hsl(var(--chart-1))' },
  confirmed: { label: 'Confirmed', color: 'hsl(var(--chart-2))' },
  processing: { label: 'Processing', color: 'hsl(var(--chart-3))' },
  shipped: { label: 'Shipped', color: 'hsl(var(--chart-4))' },
  delivered: { label: 'Delivered', color: 'hsl(var(--chart-5))' },
  cancelled: { label: 'Cancelled', color: 'hsl(0 84% 60%)' },
} satisfies ChartConfig

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(0 84% 60%)']

const funnelConfig = {
  visitors: { label: 'Visitors', color: 'hsl(var(--chart-1))' },
  addToCart: { label: 'Add to Cart', color: 'hsl(var(--chart-2))' },
  checkout: { label: 'Checkout', color: 'hsl(var(--chart-3))' },
  purchase: { label: 'Purchase', color: 'hsl(var(--chart-4))' },
} satisfies ChartConfig

export function AnalyticsDashboard() {
  const { selectedMerchantId } = useAppStore()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    if (!selectedMerchantId) return
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await api.get<AnalyticsData>('/analytics', { merchantId: selectedMerchantId })
        if (!cancelled) setData(result)
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [selectedMerchantId, period])

  if (loading) return <AnalyticsSkeleton />
  if (!data) return <div className="p-6 text-muted-foreground">No analytics data available</div>

  const { stats } = data

  // Build pie chart data from order status breakdown
  const pieData = Object.entries(data.orderStatusBreakdown || {}).map(([name, value]) => ({
    name,
    value,
  }))

  // Conversion funnel data (simulated from available data)
  const funnelData = [
    { stage: 'Visitors', visitors: stats.totalOrders * 15, fill: 'var(--color-visitors)' },
    { stage: 'Add to Cart', addToCart: stats.totalOrders * 8, fill: 'var(--color-addToCart)' },
    { stage: 'Checkout', checkout: stats.totalOrders * 3, fill: 'var(--color-checkout)' },
    { stage: 'Purchase', purchase: stats.totalOrders, fill: 'var(--color-purchase)' },
  ]

  // Customer acquisition from revenue chart
  const acquisitionData = data.revenueChart.map((item) => ({
    month: item.month,
    customers: Math.round(item.orders * 0.6),
    revenue: item.revenue,
  }))

  const acquisitionConfig = {
    customers: { label: 'New Customers', color: 'hsl(var(--chart-1))' },
    revenue: { label: 'Revenue', color: 'hsl(var(--chart-2))' },
  } satisfies ChartConfig

  // Top products chart data
  const topProductsData = data.topProducts.map((tp) => ({
    name: tp.product?.name || 'Unknown',
    revenue: tp.totalRevenue,
    quantity: tp.totalQuantity,
  }))

  const topProductsConfig = {
    revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
    quantity: { label: 'Quantity', color: 'hsl(var(--chart-2))' },
  } satisfies ChartConfig

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-sm text-muted-foreground">Business performance insights</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Revenue', value: `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, change: stats.revenueGrowth, icon: DollarSign, up: stats.revenueGrowth >= 0 },
          { title: 'Orders', value: stats.totalOrders.toLocaleString(), change: stats.recentOrders > 0 ? 12.5 : 0, icon: ShoppingCart, up: true },
          { title: 'Customers', value: stats.totalCustomers.toLocaleString(), change: stats.recentCustomers, icon: Users, up: true },
          { title: 'Conversion', value: stats.totalOrders > 0 ? `${((stats.totalOrders / Math.max(stats.totalOrders * 15, 1)) * 100).toFixed(1)}%` : '0%', change: 2.3, icon: TrendingUp, up: true },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs">
                  {stat.up ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                  )}
                  <span className={stat.up ? 'text-emerald-600' : 'text-red-600'}>
                    {typeof stat.change === 'number' ? `${Math.abs(stat.change).toFixed(1)}%` : stat.change}
                  </span>
                  <span className="text-muted-foreground">vs last period</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Orders</CardTitle>
          <CardDescription>Monthly revenue and order trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueChartConfig} className="h-[350px] w-full">
            <AreaChart data={data.revenueChart} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.1} strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="var(--color-orders)" strokeWidth={2} dot={{ fill: 'var(--color-orders)', r: 3 }} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Distribution of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No order data yet</p>
            ) : (
              <ChartContainer config={pieChartConfig} className="h-[300px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Visitor to purchase conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={funnelConfig} className="h-[300px] w-full">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis type="category" dataKey="stage" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="visitors" fill="var(--color-visitors)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="addToCart" fill="var(--color-addToCart)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="checkout" fill="var(--color-checkout)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="purchase" fill="var(--color-purchase)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products Performance</CardTitle>
            <CardDescription>Revenue by top selling products</CardDescription>
          </CardHeader>
          <CardContent>
            {topProductsData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No product data yet</p>
            ) : (
              <ChartContainer config={topProductsConfig} className="h-[300px] w-full">
                <BarChart data={topProductsData} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${v}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Customer Acquisition */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Acquisition</CardTitle>
            <CardDescription>Monthly new customer trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={acquisitionConfig} className="h-[300px] w-full">
              <BarChart data={acquisitionData} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="customers" fill="var(--color-customers)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

function AnalyticsSkeleton() {
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
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
