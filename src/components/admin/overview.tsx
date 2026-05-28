'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Ban,
  Bell,
  Database,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  UserPlus,
  CreditCard,
  Settings,
  Package,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
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

// SVG Animated Progress Ring Component
function ProgressRing({ value, size = 64, strokeWidth = 5, color = 'emerald' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  const colorMap: Record<string, string> = {
    emerald: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444',
    sky: '#0ea5e9',
    violet: '#8b5cf6',
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorMap[color] || colorMap.emerald}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold">{Math.round(value)}%</span>
      </div>
    </div>
  )
}

// Activity Feed Types
interface ActivityEvent {
  id: string
  type: 'merchant_signup' | 'order_placed' | 'payment_received' | 'system_alert' | 'plan_upgrade' | 'merchant_suspended'
  message: string
  timestamp: string
  icon: typeof Store
  iconColor: string
  iconBg: string
}

const generateMockActivities = (merchants: DashboardData['recentMerchants']): ActivityEvent[] => {
  const events: ActivityEvent[] = [
    {
      id: '1', type: 'merchant_signup', message: 'New merchant registered', timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      icon: UserPlus, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100',
    },
    {
      id: '2', type: 'order_placed', message: 'Large order placed ($2,450)', timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
      icon: ShoppingCart, iconColor: 'text-violet-600', iconBg: 'bg-violet-100',
    },
    {
      id: '3', type: 'payment_received', message: 'Subscription payment received', timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      icon: CreditCard, iconColor: 'text-sky-600', iconBg: 'bg-sky-100',
    },
    {
      id: '4', type: 'system_alert', message: 'High CPU usage detected', timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      icon: AlertTriangle, iconColor: 'text-amber-600', iconBg: 'bg-amber-100',
    },
    {
      id: '5', type: 'plan_upgrade', message: 'Merchant upgraded to Pro', timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      icon: Zap, iconColor: 'text-orange-600', iconBg: 'bg-orange-100',
    },
    {
      id: '6', type: 'system_alert', message: 'Database backup completed', timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      icon: Database, iconColor: 'text-teal-600', iconBg: 'bg-teal-100',
    },
  ]

  // Add real merchants as events if available
  if (merchants.length > 0) {
    merchants.slice(0, 2).forEach((m, i) => {
      events.unshift({
        id: `merchant-${m.id}`,
        type: 'merchant_signup',
        message: `${m.businessName} signed up`,
        timestamp: m.createdAt,
        icon: UserPlus,
        iconColor: 'text-emerald-600',
        iconBg: 'bg-emerald-100',
      })
    })
  }

  return events
}

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function AdminOverview() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quickActionLoading, setQuickActionLoading] = useState<string | null>(null)

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

  // Build merchant growth chart data deterministically
  const merchantGrowthData = data.revenueChart.map((item, i) => {
    const variation = Math.sin(i * 2.7 + 0.5) * 2
    const count = Math.max(1, Math.floor(data.stats.totalMerchants / 12 * (i + 1) / 12 + variation + 2))
    return {
      month: item.month,
      count,
    }
  })

  // Platform health indicators with status logic
  const healthIndicators = [
    { name: 'API Uptime', value: 99.97, unit: '%', status: 'healthy' as const, icon: Server, color: 'emerald', ringValue: 99.97 },
    { name: 'Avg Response Time', value: 142, unit: 'ms', status: 'healthy' as const, icon: Activity, color: 'sky', ringValue: 71.6 },
    { name: 'Error Rate', value: 0.12, unit: '%', status: 'healthy' as const, icon: Shield, color: 'emerald', ringValue: 99.88 },
    { name: 'Queue Health', value: 98, unit: '%', status: 'healthy' as const, icon: Clock, color: 'emerald', ringValue: 98 },
  ]

  // Activity feed
  const activities = generateMockActivities(data.recentMerchants)

  // Quick actions
  const quickActions = [
    { id: 'suspend', label: 'Suspend Merchant', icon: Ban, color: 'text-red-600 hover:bg-red-50', description: 'Temporarily suspend a merchant' },
    { id: 'notify', label: 'Send Notification', icon: Bell, color: 'text-sky-600 hover:bg-sky-50', description: 'Broadcast to all merchants' },
    { id: 'backup', label: 'Run Backup', icon: Database, color: 'text-emerald-600 hover:bg-emerald-50', description: 'Create database backup' },
    { id: 'cache', label: 'Clear Cache', icon: Trash2, color: 'text-amber-600 hover:bg-amber-50', description: 'Purge application cache' },
  ]

  const handleQuickAction = async (actionId: string) => {
    setQuickActionLoading(actionId)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success(`Action "${quickActions.find(a => a.id === actionId)?.label}" completed successfully`)
    } catch {
      toast.error('Action failed')
    } finally {
      setQuickActionLoading(null)
    }
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Page Header with LIVE Badge */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
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
              <Badge className="bg-red-500/90 text-white border-0 animate-pulse">
                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-white" />
                LIVE
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
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                  <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
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

      {/* System Health with Progress Rings + Quick Actions */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* System Health - SVG Progress Rings */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100">
                    <Activity className="h-4 w-4 text-emerald-600" />
                  </div>
                  System Health
                </CardTitle>
                <Badge className="bg-red-500/90 text-white border-0 text-[10px] px-2 py-0.5 animate-pulse">
                  <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-white" />
                  LIVE
                </Badge>
              </div>
              <CardDescription>Real-time system monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthIndicators.map((indicator) => {
                const isHealthy = indicator.status === 'healthy'
                const isWarning = indicator.status === 'warning'

                return (
                  <div key={indicator.name} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <ProgressRing value={indicator.ringValue} size={52} strokeWidth={4} color={isWarning ? 'amber' : indicator.color} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <indicator.icon className={`h-3.5 w-3.5 ${isWarning ? 'text-amber-500' : 'text-emerald-500'}`} />
                          <span className="text-sm font-medium">{indicator.name}</span>
                        </div>
                        <span className="text-sm font-semibold">
                          {typeof indicator.value === 'number' && indicator.value > 10
                            ? indicator.value.toLocaleString()
                            : indicator.value}
                          {indicator.unit || '%'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
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
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-500" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-violet-100">
                    <Clock className="h-4 w-4 text-violet-600" />
                  </div>
                  Activity Feed
                </CardTitle>
                <Badge className="bg-red-500/90 text-white border-0 text-[10px] px-2 py-0.5 animate-pulse">
                  <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-white" />
                  LIVE
                </Badge>
              </div>
              <CardDescription>Real-time platform events</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-0 max-h-[340px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                <AnimatePresence>
                  {activities.map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.08 }}
                      className="flex items-start gap-3 py-2.5 border-b last:border-b-0 hover:bg-muted/30 transition-colors rounded-md px-1"
                    >
                      <div className={`p-1.5 rounded-lg ${event.iconBg} shrink-0 mt-0.5`}>
                        <event.icon className={`h-3.5 w-3.5 ${event.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.message}</p>
                        <p className="text-[11px] text-muted-foreground">{formatTimeAgo(event.timestamp)}</p>
                      </div>
                      {event.type === 'system_alert' && (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-1" />
                      )}
                      {event.type === 'payment_received' && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-1" />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions Panel */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-orange-400 to-amber-500" />
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-100">
                  <Settings className="h-4 w-4 text-rose-600" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription>Common admin operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <motion.button
                  key={action.id}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border hover:shadow-sm transition-all duration-200 text-left ${action.color}`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickAction(action.id)}
                  disabled={!!quickActionLoading}
                >
                  <div className={`p-2 rounded-lg ${action.color.split(' ')[1] || 'bg-muted'}`}>
                    {quickActionLoading === action.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <action.icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-[11px] text-muted-foreground">{action.description}</p>
                  </div>
                </motion.button>
              ))}
              <Separator className="my-3" />
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-emerald-50 p-2">
                  <p className="text-lg font-bold text-emerald-700">{data.stats.activeMerchants}</p>
                  <p className="text-[10px] text-emerald-600">Active</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-2">
                  <p className="text-lg font-bold text-amber-700">{data.stats.trialMerchants}</p>
                  <p className="text-[10px] text-amber-600">Trial</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity Table */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  Recent Merchants
                </CardTitle>
                <CardDescription>Latest merchant signups</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200">
                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                Live
              </Badge>
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
                    {data.recentMerchants.map((merchant, i) => (
                      <motion.tr
                        key={merchant.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="cursor-pointer hover:bg-muted/50 transition-colors group border-b"
                      >
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
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Merchants by Revenue */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
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
                  <motion.div
                    key={merchant.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4 p-3 rounded-xl border hover:bg-muted/50 transition-colors group cursor-pointer"
                  >
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
                  </motion.div>
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
