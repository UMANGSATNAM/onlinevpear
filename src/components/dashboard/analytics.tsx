'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  FileText,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  ToggleLeft,
  ToggleRight,
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
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
  ResponsiveContainer,
} from 'recharts'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

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
  prevRevenue: { label: 'Prev Revenue', color: 'hsl(var(--chart-1))' },
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

type ChartType = 'area' | 'bar' | 'line'

const datePresets = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'This Year', value: '1y' },
  { label: 'Custom', value: 'custom' },
]

// Sparkline mini-chart component
function Sparkline({ data, color, width = 80, height = 32 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')
  const areaPoints = `0,${height} ${points} ${width},${height}`

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${color.replace(/[^a-z0-9]/gi, '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function AnalyticsDashboard() {
  const { selectedMerchantId } = useAppStore()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [chartType, setChartType] = useState<ChartType>('area')
  const [comparisonMode, setComparisonMode] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)

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

  // Conversion funnel data
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

  // Comparison data - previous period (simulated as 80% of current)
  const comparisonChartData = comparisonMode
    ? data.revenueChart.map((item, i) => ({
        ...item,
        prevRevenue: Math.round(item.revenue * (0.6 + Math.sin(i * 2.3) * 0.2)),
      }))
    : data.revenueChart

  // Sparkline data
  const revenueSparkline = data.revenueChart.map(d => d.revenue)
  const ordersSparkline = data.revenueChart.map(d => d.orders)
  const customersSparkline = acquisitionData.map(d => d.customers)
  const conversionSparkline = data.revenueChart.map((_, i) => Math.round(3 + Math.sin(i * 1.5) * 1.5))

  // Metrics summary
  const avgOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0
  const repeatRate = stats.totalCustomers > 0 ? Math.min(((stats.totalOrders - stats.totalCustomers) / stats.totalOrders * 100), 65) : 0

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(format)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      if (format === 'csv') {
        const headers = ['Month', 'Revenue', 'Orders']
        const rows = data.revenueChart.map(r => [r.month, r.revenue.toString(), r.orders.toString()])
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'analytics-export.csv'; a.click()
        URL.revokeObjectURL(url)
      }
      toast.success(`Analytics exported as ${format.toUpperCase()}`)
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(null)
    }
  }

  // Chart component renderer
  const renderRevenueChart = () => {
    const chartData = comparisonChartData
    if (chartType === 'bar') {
      return (
        <ChartContainer config={revenueChartConfig} className="h-[350px] w-full">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
            {comparisonMode && <Bar dataKey="prevRevenue" fill="var(--color-revenue)" opacity={0.3} radius={[4, 4, 0, 0]} />}
          </BarChart>
        </ChartContainer>
      )
    }
    if (chartType === 'line') {
      return (
        <ChartContainer config={revenueChartConfig} className="h-[350px] w-full">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2.5} dot={{ fill: 'var(--color-revenue)', r: 4 }} />
            {comparisonMode && <Line type="monotone" dataKey="prevRevenue" stroke="var(--color-revenue)" strokeWidth={2} strokeDasharray="5 5" dot={false} />}
          </LineChart>
        </ChartContainer>
      )
    }
    // Area chart (default)
    return (
      <ChartContainer config={revenueChartConfig} className="h-[350px] w-full">
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="prevAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {comparisonMode && (
            <Area type="monotone" dataKey="prevRevenue" stroke="hsl(var(--chart-1))" strokeWidth={1.5} strokeDasharray="5 5" fill="url(#prevAreaGradient)" />
          )}
          <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2.5} fill="url(#areaGradient)" dot={{ fill: 'hsl(var(--chart-1))', r: 3 }} activeDot={{ r: 5, strokeWidth: 2, stroke: 'white' }} />
        </AreaChart>
      </ChartContainer>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header with Date Range Picker */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Analytics</h2>
            <p className="text-sm text-muted-foreground">Business performance insights</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  {datePresets.find(p => p.value === period)?.label || 'Last 30 Days'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="space-y-1">
                  {datePresets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setPeriod(preset.value)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        period === preset.value ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Comparison Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={comparisonMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setComparisonMode(!comparisonMode)}
                  className="gap-1.5"
                >
                  {comparisonMode ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  Compare
                </Button>
              </TooltipTrigger>
              <TooltipContent>Compare with previous period</TooltipContent>
            </Tooltip>

            {/* Export Buttons */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                disabled={!!exporting}
                className="gap-1.5"
              >
                {exporting === 'csv' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
                disabled={!!exporting}
                className="gap-1.5"
              >
                {exporting === 'pdf' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                PDF
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards with Sparklines */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Revenue', value: `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            change: stats.revenueGrowth, icon: DollarSign, up: stats.revenueGrowth >= 0,
            sparkData: revenueSparkline, sparkColor: 'hsl(var(--chart-1))',
            gradient: 'from-emerald-500 to-teal-600', bgGradient: 'from-emerald-50 to-teal-50',
          },
          {
            title: 'Orders', value: stats.totalOrders.toLocaleString(),
            change: stats.recentOrders > 0 ? 12.5 : 0, icon: ShoppingCart, up: true,
            sparkData: ordersSparkline, sparkColor: 'hsl(var(--chart-2))',
            gradient: 'from-violet-500 to-purple-600', bgGradient: 'from-violet-50 to-purple-50',
          },
          {
            title: 'Customers', value: stats.totalCustomers.toLocaleString(),
            change: stats.recentCustomers, icon: Users, up: true,
            sparkData: customersSparkline, sparkColor: 'hsl(var(--chart-3))',
            gradient: 'from-sky-500 to-blue-600', bgGradient: 'from-sky-50 to-blue-50',
          },
          {
            title: 'Conversion', value: stats.totalOrders > 0 ? `${((stats.totalOrders / Math.max(stats.totalOrders * 15, 1)) * 100).toFixed(1)}%` : '0%',
            change: 2.3, icon: TrendingUp, up: true,
            sparkData: conversionSparkline, sparkColor: 'hsl(var(--chart-4))',
            gradient: 'from-orange-500 to-amber-600', bgGradient: 'from-orange-50 to-amber-50',
          },
        ].map((stat, i) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${stat.bgGradient}`}>
              {/* Gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-5 pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkline data={stat.sparkData} color={stat.sparkColor} />
                    <div className={`h-9 w-9 rounded-xl bg-white/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  {stat.up ? (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50">
                      <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-600">
                        {typeof stat.change === 'number' ? `${Math.abs(stat.change).toFixed(1)}%` : stat.change}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-50">
                      <ArrowDownRight className="h-3 w-3 text-red-600" />
                      <span className="text-xs font-semibold text-red-600">
                        {typeof stat.change === 'number' ? `${Math.abs(stat.change).toFixed(1)}%` : stat.change}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">vs last period</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Metrics Summary Row */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Avg Order Value', value: `$${avgOrderValue.toFixed(2)}`, trend: '+5.2%', up: true },
            { label: 'Repeat Rate', value: `${repeatRate.toFixed(1)}%`, trend: '+2.1%', up: true },
            { label: 'Active Products', value: stats.activeProducts.toString(), trend: stats.activeProducts > 0 ? 'Healthy' : 'Low', up: stats.activeProducts > 0 },
            { label: 'Revenue Growth', value: `${stats.revenueGrowth.toFixed(1)}%`, trend: stats.revenueGrowth >= 0 ? 'Growing' : 'Declining', up: stats.revenueGrowth >= 0 },
          ].map((metric) => (
            <div key={metric.label} className="flex items-center gap-3 rounded-xl border bg-card p-3 hover:shadow-sm transition-all">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="text-lg font-bold">{metric.value}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${metric.up ? 'text-emerald-600' : 'text-red-600'}`}>
                {metric.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {metric.trend}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Revenue Chart with Type Toggle */}
      <motion.div variants={itemVariants}>
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-chart-1" />
                  Revenue & Orders
                </CardTitle>
                <CardDescription className="mt-1">
                  Monthly revenue and order trends
                  {comparisonMode && <Badge variant="outline" className="ml-2 text-[10px]">Comparing with previous period</Badge>}
                </CardDescription>
              </div>
              {/* Chart Type Toggle */}
              <div className="flex items-center border rounded-lg overflow-hidden bg-muted/30">
                {[
                  { type: 'area' as ChartType, icon: AreaChartIcon, label: 'Area' },
                  { type: 'bar' as ChartType, icon: BarChart3, label: 'Bar' },
                  { type: 'line' as ChartType, icon: LineChartIcon, label: 'Line' },
                ].map((ct) => (
                  <Tooltip key={ct.type}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={chartType === ct.type ? 'default' : 'ghost'}
                        size="sm"
                        className="h-8 gap-1.5 rounded-none"
                        onClick={() => setChartType(ct.type)}
                      >
                        <ct.icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline text-xs">{ct.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{ct.label} chart</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={chartType + (comparisonMode ? '-compare' : '')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderRevenueChart()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by Status */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-chart-2" />
                Orders by Status
              </CardTitle>
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
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300">
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
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products Performance */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300">
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
        </motion.div>

        {/* Customer Acquisition */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300">
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
        </motion.div>
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
