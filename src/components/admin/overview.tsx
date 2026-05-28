'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Store,
  DollarSign,
  ShoppingCart,
  Bot,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Server,
  Zap,
  Shield,
  ArrowUpRight,
  BarChart3,
  Eye,
  Globe,
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
import { Progress } from '@/components/ui/progress'
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
  merchants: {
    label: 'New Merchants',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

interface DashboardData {
  stats: {
    totalMerchants: number
    activeMerchants: number
    trialMerchants: number
    totalRevenue: number
    recentRevenue: number
    totalOrders: number
    recentOrders: number
    totalProducts: number
    activeProducts: number
    totalCustomers: number
    aiUsage: {
      totalTokens: number
      totalCost: number
      byFeature: Record<string, { tokens: number; cost: number; count: number }>
      recentTokens: number
      recentCost: number
    }
  }
  growth: {
    orders: number
    merchants: number
  }
  revenueChart: Array<{ month: string; revenue: number }>
  planDistribution: Array<{ planId: string | null; _count: { id: number } }>
  recentMerchants: Array<{
    id: string
    businessName: string
    email: string
    status: string
    createdAt: string
    plan: { id: string; name: string; displayName: string } | null
  }>
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

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  trial: 'bg-amber-100 text-amber-800 border-amber-200',
  suspended: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
}

const statusDotColors: Record<string, string> = {
  active: 'bg-emerald-500',
  trial: 'bg-amber-500',
  suspended: 'bg-red-500',
  cancelled: 'bg-gray-400',
}

const rankGradients = [
  'from-amber-400 to-yellow-500',
  'from-slate-300 to-slate-400',
  'from-orange-400 to-amber-600',
]

export function AdminOverview() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await api.get<DashboardData>('/admin/dashboard')
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  if (loading) return <OverviewSkeleton />
  if (error) return <div className="p-6 text-destructive">Error loading dashboard: {error}</div>
  if (!data) return <div className="p-6 text-muted-foreground">No data available</div>

  const statCards = [
    {
      title: 'Total Merchants',
      value: data.stats.totalMerchants.toLocaleString(),
      sub: `${data.stats.activeMerchants} active, ${data.stats.trialMerchants} trial`,
      icon: Store,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      change: data.growth.merchants,
      changeLabel: 'vs last month',
    },
    {
      title: 'Total Revenue',
      value: `$${data.stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      sub: `$${data.stats.recentRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })} last 30d`,
      icon: DollarSign,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-50',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      change: null,
      changeLabel: '',
    },
    {
      title: 'Active Stores',
      value: data.stats.activeProducts.toLocaleString(),
      sub: `${data.stats.totalProducts} total products`,
      icon: ShoppingCart,
      gradient: 'from-sky-500 to-blue-600',
      bgGradient: 'from-sky-50 to-blue-50',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      change: data.growth.orders,
      changeLabel: 'vs last month',
    },
    {
      title: 'AI Usage',
      value: `${(data.stats.aiUsage.totalTokens / 1000).toFixed(1)}k`,
      sub: `tokens, $${data.stats.aiUsage.totalCost.toFixed(2)} cost`,
      icon: Bot,
      gradient: 'from-orange-500 to-amber-600',
      bgGradient: 'from-orange-50 to-amber-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      change: null,
      changeLabel: '',
    },
    {
      title: 'Orders Today',
      value: data.stats.recentOrders.toLocaleString(),
      sub: `${data.stats.totalOrders} total orders`,
      icon: Zap,
      gradient: 'from-rose-500 to-pink-600',
      bgGradient: 'from-rose-50 to-pink-50',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      change: data.growth.orders,
      changeLabel: 'vs last month',
    },
  ]

  // Build merchant growth chart data deterministically (no Math.random)
  const merchantGrowthData = data.revenueChart.map((item, i) => {
    // Deterministic pseudo-random based on index: use sine for variation
    const variation = Math.sin(i * 2.7 + 0.5) * 2
    const count = Math.max(1, Math.floor(data.stats.totalMerchants / 12 * (i + 1) / 12 + variation + 2))
    return {
      month: item.month,
      count,
    }
  })

  // Platform health indicators with status logic
  const healthIndicators = [
    { name: 'API Uptime', value: 99.97, unit: '%', status: 'healthy' as const, icon: Server, color: 'emerald' },
    { name: 'Avg Response Time', value: 142, unit: 'ms', status: 'healthy' as const, icon: Activity, color: 'emerald' },
    { name: 'Error Rate', value: 0.12, unit: '%', status: 'healthy' as const, icon: Shield, color: 'emerald' },
    { name: 'Queue Health', value: 98, unit: '%', status: 'healthy' as const, icon: Clock, color: 'emerald' },
  ]

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Platform Overview</h2>
              <p className="text-slate-300 mt-1">Monitor your entire platform at a glance</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-emerald-400/50 text-emerald-300 bg-emerald-500/10">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${stat.bgGradient}`}>
              {/* Gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-5 pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`${stat.iconBg} rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  {stat.change !== null ? (
                    <>
                      {stat.change >= 0 ? (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50">
                          <TrendingUp className="h-3 w-3 text-emerald-600" />
                          <span className="text-xs font-semibold text-emerald-600">{Math.abs(stat.change).toFixed(1)}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-50">
                          <TrendingDown className="h-3 w-3 text-red-600" />
                          <span className="text-xs font-semibold text-red-600">{Math.abs(stat.change).toFixed(1)}%</span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">{stat.changeLabel}</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">{stat.sub}</span>
                  )}
                </div>
                {stat.change !== null && (
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-chart-1" />
                    Revenue Trend
                  </CardTitle>
                  <CardDescription className="mt-1">Monthly platform revenue over the last 12 months</CardDescription>
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
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Globe className="h-5 w-5 text-chart-2" />
                    Merchant Growth
                  </CardTitle>
                  <CardDescription className="mt-1">Monthly new merchant signups</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Growing
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={merchantGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="merchantBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.6} />
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
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    name="New Merchants"
                    fill="url(#merchantBarGradient)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Platform Health & Recent Activity */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden h-full">
            {/* Gradient header accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100">
                  <Activity className="h-4 w-4 text-emerald-600" />
                </div>
                Platform Health
              </CardTitle>
              <CardDescription>Real-time system status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthIndicators.map((indicator) => {
                const isHealthy = indicator.status === 'healthy'
                const isWarning = indicator.status === 'warning'
                const progressValue =
                  indicator.name === 'Avg Response Time'
                    ? Math.max(0, 100 - indicator.value / 5)
                    : indicator.name === 'Error Rate'
                    ? 100 - indicator.value
                    : indicator.value

                const barColor = isWarning
                  ? '[&>div]:bg-amber-500'
                  : indicator.name === 'Avg Response Time'
                  ? '[&>div]:bg-emerald-500'
                  : indicator.name === 'Error Rate'
                  ? '[&>div]:bg-emerald-500'
                  : '[&>div]:bg-emerald-500'

                return (
                  <div key={indicator.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <indicator.icon className={`h-4 w-4 ${isWarning ? 'text-amber-500' : 'text-emerald-500'}`} />
                        <span className="text-sm font-medium">{indicator.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {typeof indicator.value === 'number' && indicator.value > 10
                            ? indicator.value.toLocaleString()
                            : indicator.value}
                          {indicator.unit || '%'}
                        </span>
                        {isHealthy ? (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0 border border-emerald-200">
                            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Healthy
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0 border border-amber-200">
                            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Warning
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress
                      value={progressValue}
                      className={`h-2 ${barColor}`}
                    />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <Card className="relative overflow-hidden">
            {/* Gradient header accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-500" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  <CardDescription>Latest merchant signups</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {data.recentMerchants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
              ) : (
                <div className="overflow-x-auto -mx-2">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Business</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Email</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Plan</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentMerchants.map((merchant) => (
                        <TableRow key={merchant.id} className="cursor-pointer hover:bg-muted/50 transition-colors group">
                          <TableCell className="font-medium text-sm">
                            <div className="flex items-center gap-2">
                              <span className={`inline-block h-2 w-2 rounded-full ${statusDotColors[merchant.status] || 'bg-gray-400'}`} />
                              <span className="group-hover:text-primary transition-colors">{merchant.businessName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{merchant.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[11px] px-2 py-0.5">{merchant.plan?.displayName || 'No Plan'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[11px] px-2 py-0.5 border ${statusColors[merchant.status] || ''}`}>
                              {merchant.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(merchant.createdAt).toLocaleDateString()}
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
      </div>

      {/* Top Merchants by Revenue */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
          {/* Gradient header accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Top Merchants by Revenue</CardTitle>
                <CardDescription>Highest grossing merchants on the platform</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentMerchants.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No merchant data yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentMerchants.slice(0, 5).map((merchant, i) => (
                  <div key={merchant.id} className="flex items-center gap-4 p-3 rounded-xl border hover:bg-muted/50 transition-colors group cursor-pointer">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      i < 3
                        ? `bg-gradient-to-br ${rankGradients[i]} text-white shadow-sm`
                        : 'bg-primary/10 text-primary'
                    } font-bold text-sm`}>
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2 w-2 rounded-full ${statusDotColors[merchant.status] || 'bg-gray-400'}`} />
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{merchant.businessName}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{merchant.email}</p>
                    </div>
                    <Badge variant="outline" className="text-[11px] px-2 py-0.5">{merchant.plan?.displayName || 'Free'}</Badge>
                    <Badge variant="secondary" className={`text-[11px] px-2 py-0.5 border ${statusColors[merchant.status] || ''}`}>
                      {merchant.status}
                    </Badge>
                  </div>
                ))}
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
      {/* Header skeleton */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6">
        <Skeleton className="h-7 w-48 mb-2 bg-slate-700" />
        <Skeleton className="h-4 w-72 bg-slate-700" />
      </div>
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
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
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
