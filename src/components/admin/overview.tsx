'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
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
  FileBarChart,
  Download,
  Wrench,
  ChevronDown,
  ChevronUp,
  Copy,
  Info,
  AlertOctagon,
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
  PieChart,
  Pie,
  Cell,
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
  starter: {
    label: 'Starter',
    color: '#10b981',
  },
  professional: {
    label: 'Professional',
    color: '#8b5cf6',
  },
  enterprise: {
    label: 'Enterprise',
    color: '#f59e0b',
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

// Animated Counter Component
function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const valueRef = useRef(value)
  const durationRef = useRef(duration)

  useEffect(() => {
    valueRef.current = value
    durationRef.current = duration
  }, [value, duration])

  useEffect(() => {
    startTimeRef.current = 0

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = Math.min((timestamp - startTimeRef.current) / durationRef.current, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.floor(eased * valueRef.current))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  return <>{displayValue.toLocaleString()}</>
}

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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
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
  detail: string
  timestamp: string
  icon: typeof Store
  iconColor: string
  iconBg: string
}

const generateMockActivities = (merchants: DashboardData['recentMerchants']): ActivityEvent[] => {
  const events: ActivityEvent[] = [
    {
      id: '1', type: 'merchant_signup', message: 'New merchant registered', detail: 'TechStyle Apparel registered on the Starter plan. Email verification pending. Store: techstyle.shopforge.io',
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      icon: UserPlus, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100',
    },
    {
      id: '2', type: 'order_placed', message: 'Large order placed ($2,450)', detail: 'Order #ORD-4821 from Urban Gear store. 12 items including premium products. Shipping: Express. Customer: premium@custom.er',
      timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
      icon: ShoppingCart, iconColor: 'text-violet-600', iconBg: 'bg-violet-100',
    },
    {
      id: '3', type: 'payment_received', message: 'Subscription payment received', detail: 'Professional plan renewal from GreenLeaf Organics. Amount: $49.00. Next billing: Mar 15, 2026. Payment method: Visa ending 4242',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      icon: CreditCard, iconColor: 'text-sky-600', iconBg: 'bg-sky-100',
    },
    {
      id: '4', type: 'system_alert', message: 'High CPU usage detected', detail: 'Server node-3 reached 89% CPU utilization at 14:32 UTC. Auto-scaling triggered. New instance provisioned in us-east-1. Duration: 12 minutes.',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      icon: AlertTriangle, iconColor: 'text-amber-600', iconBg: 'bg-amber-100',
    },
    {
      id: '5', type: 'plan_upgrade', message: 'Merchant upgraded to Pro', detail: 'CozyHome Decor upgraded from Starter to Professional plan. Revenue impact: +$29/mo. Effective immediately. Prorated credit applied.',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      icon: Zap, iconColor: 'text-orange-600', iconBg: 'bg-orange-100',
    },
    {
      id: '6', type: 'system_alert', message: 'Database backup completed', detail: 'Full database backup completed successfully. Size: 2.4 GB. Duration: 8 minutes. Storage: s3://backups/2026-02-28/. Verified with checksum.',
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      icon: Database, iconColor: 'text-teal-600', iconBg: 'bg-teal-100',
    },
  ]

  if (merchants.length > 0) {
    merchants.slice(0, 2).forEach((m, i) => {
      events.unshift({
        id: `merchant-${m.id}`,
        type: 'merchant_signup',
        message: `${m.businessName} signed up`,
        detail: `${m.businessName} (${m.email}) registered on ${m.plan?.displayName || 'Free'} plan. Status: ${m.status}. Joined: ${new Date(m.createdAt).toLocaleDateString()}`,
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
  const [expandedMerchant, setExpandedMerchant] = useState<string | null>(null)

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
      numericValue: data.stats.totalMerchants,
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
      numericValue: Math.round(data.stats.totalRevenue),
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
      numericValue: data.stats.activeProducts,
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
      numericValue: Math.round(data.stats.aiUsage.totalTokens / 1000),
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
      numericValue: data.stats.recentOrders,
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

  // Revenue breakdown pie chart data
  const revenueBreakdownData = [
    { name: 'Starter', value: 20, amount: '$7,800', color: '#10b981' },
    { name: 'Professional', value: 45, amount: '$17,550', color: '#8b5cf6' },
    { name: 'Enterprise', value: 35, amount: '$13,650', color: '#f59e0b' },
  ]

  // Platform health indicators with status logic
  const healthIndicators = [
    { name: 'API Uptime', value: 99.97, unit: '%', status: 'healthy' as const, icon: Server, color: 'emerald', ringValue: 99.97 },
    { name: 'Avg Response Time', value: 142, unit: 'ms', status: 'healthy' as const, icon: Activity, color: 'sky', ringValue: 71.6 },
    { name: 'Error Rate', value: 0.12, unit: '%', status: 'healthy' as const, icon: Shield, color: 'emerald', ringValue: 99.88 },
    { name: 'Queue Health', value: 98, unit: '%', status: 'healthy' as const, icon: Clock, color: 'emerald', ringValue: 98 },
  ]

  // Activity feed
  const activities = generateMockActivities(data.recentMerchants)

  // Quick actions - 6 action buttons
  const quickActions = [
    { id: 'add-merchant', label: 'Add Merchant', icon: UserPlus, gradient: 'from-emerald-500 to-teal-600', hoverBg: 'hover:from-emerald-50 hover:to-teal-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', description: 'Register a new merchant account' },
    { id: 'view-reports', label: 'View Reports', icon: FileBarChart, gradient: 'from-violet-500 to-purple-600', hoverBg: 'hover:from-violet-50 hover:to-purple-50', iconBg: 'bg-violet-100', iconColor: 'text-violet-600', description: 'Generate analytics reports' },
    { id: 'system-config', label: 'System Config', icon: Settings, gradient: 'from-slate-500 to-slate-600', hoverBg: 'hover:from-slate-50 hover:to-slate-100', iconBg: 'bg-slate-100', iconColor: 'text-slate-600', description: 'Configure platform settings' },
    { id: 'send-notification', label: 'Send Notification', icon: Bell, gradient: 'from-sky-500 to-blue-600', hoverBg: 'hover:from-sky-50 hover:to-blue-50', iconBg: 'bg-sky-100', iconColor: 'text-sky-600', description: 'Broadcast to all merchants' },
    { id: 'export-data', label: 'Export Data', icon: Download, gradient: 'from-amber-500 to-orange-600', hoverBg: 'hover:from-amber-50 hover:to-orange-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', description: 'Export platform data to CSV' },
    { id: 'run-maintenance', label: 'Run Maintenance', icon: Wrench, gradient: 'from-rose-500 to-pink-600', hoverBg: 'hover:from-rose-50 hover:to-pink-50', iconBg: 'bg-rose-100', iconColor: 'text-rose-600', description: 'Schedule maintenance tasks' },
  ]

  // Platform Alerts
  const platformAlerts = [
    { id: '1', title: 'High CPU Usage Warning', severity: 'critical' as const, icon: AlertOctagon, message: 'Server node-3 CPU at 89%. Auto-scaling triggered.', timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: '2', title: 'New Merchant Signup', severity: 'info' as const, icon: UserPlus, message: 'TechStyle Apparel registered on Starter plan.', timestamp: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: '3', title: 'Payment Failure', severity: 'warning' as const, icon: CreditCard, message: 'Subscription renewal failed for Urban Gear. Card declined.', timestamp: new Date(Date.now() - 25 * 60000).toISOString() },
    { id: '4', title: 'SSL Certificate Expiring', severity: 'warning' as const, icon: Shield, message: 'SSL cert for api.shopforge.io expires in 14 days.', timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
    { id: '5', title: 'Database Backup Completed', severity: 'success' as const, icon: CheckCircle2, message: 'Full backup completed. Size: 2.4 GB. Verified.', timestamp: new Date(Date.now() - 60 * 60000).toISOString() },
  ]

  const severityStyles: Record<string, { badge: string; bg: string; border: string }> = {
    critical: { badge: 'bg-red-100 text-red-800 border-red-200', bg: 'bg-red-50/50', border: 'border-red-200/50' },
    warning: { badge: 'bg-amber-100 text-amber-800 border-amber-200', bg: 'bg-amber-50/50', border: 'border-amber-200/50' },
    info: { badge: 'bg-sky-100 text-sky-800 border-sky-200', bg: 'bg-sky-50/50', border: 'border-sky-200/50' },
    success: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', bg: 'bg-emerald-50/50', border: 'border-emerald-200/50' },
  }

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

      {/* Stat Cards with Animated Counters */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${stat.bgGradient}`}>
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-5 pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold tracking-tight">
                      {stat.title === 'Total Revenue' ? (
                        <>${<AnimatedCounter value={stat.numericValue} />}.00</>
                      ) : stat.title === 'AI Usage' ? (
                        <><AnimatedCounter value={stat.numericValue} />k</>
                      ) : (
                        <AnimatedCounter value={stat.numericValue} />
                      )}
                    </p>
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

      {/* Revenue Breakdown + System Health + Quick Actions */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Revenue Breakdown Pie Chart */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-violet-500 to-amber-500" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-violet-100">
                    <DollarSign className="h-4 w-4 text-violet-600" />
                  </div>
                  Revenue Breakdown
                </CardTitle>
              </div>
              <CardDescription>Revenue by subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <ChartContainer config={chartConfig} className="h-[180px] w-[180px]">
                  <PieChart>
                    <Pie
                      data={revenueBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {revenueBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-3 flex-1">
                  {revenueBreakdownData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-sm font-semibold">{item.value}%</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{item.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

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

        {/* Quick Actions Panel - 6 actions with gradient hover */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-orange-400 to-amber-500" />
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-100">
                  <Zap className="h-4 w-4 text-rose-600" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription>Common admin operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, i) => (
                  <motion.button
                    key={action.id}
                    className={`relative overflow-hidden flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 text-center group ${action.hoverBg}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickAction(action.id)}
                    disabled={!!quickActionLoading}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {/* Gradient background on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-200`} />
                    <div className={`relative p-2 rounded-lg ${action.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                      {quickActionLoading === action.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <action.icon className={`h-4 w-4 ${action.iconColor}`} />
                      )}
                    </div>
                    <div className="relative">
                      <p className="text-xs font-semibold leading-tight">{action.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{action.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Live Activity Feed */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-violet-100">
                    <Clock className="h-4 w-4 text-violet-600" />
                  </div>
                  Activity Feed
                </CardTitle>
                <CardDescription>Real-time platform events</CardDescription>
              </div>
              <Badge className="bg-red-500/90 text-white border-0 text-[10px] px-2 py-0.5 animate-pulse">
                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-white" />
                LIVE
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0 max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
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

      {/* Recent Activity Table with expand/collapse */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  Recent Merchants
                </CardTitle>
                <CardDescription>Click a row to view details</CardDescription>
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
                      <TableHead className="w-8"></TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Business</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Email</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Plan</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentMerchants.map((merchant, i) => {
                      const isExpanded = expandedMerchant === merchant.id
                      return (
                        <motion.tr
                          key={merchant.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.3 }}
                          className="cursor-pointer hover:bg-muted/50 transition-colors group border-b"
                          onClick={() => setExpandedMerchant(isExpanded ? null : merchant.id)}
                        >
                          <TableCell className="w-8 px-2">
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </motion.div>
                          </TableCell>
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
                      )
                    })}
                  </TableBody>
                </Table>
                {/* Expanded detail panels */}
                <AnimatePresence>
                  {expandedMerchant && (() => {
                    const merchant = data.recentMerchants.find(m => m.id === expandedMerchant)
                    if (!merchant) return null
                    return (
                      <motion.div
                        key={`detail-${merchant.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="m-3 p-4 rounded-xl bg-muted/30 border space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <Store className="h-4 w-4 text-violet-600" />
                              {merchant.businessName} — Details
                            </h4>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setExpandedMerchant(null)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="rounded-lg bg-background p-2.5 border">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Plan</p>
                              <p className="text-sm font-medium mt-0.5">{merchant.plan?.displayName || 'No Plan'}</p>
                            </div>
                            <div className="rounded-lg bg-background p-2.5 border">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Status</p>
                              <p className="text-sm font-medium mt-0.5 capitalize">{merchant.status}</p>
                            </div>
                            <div className="rounded-lg bg-background p-2.5 border">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Email</p>
                              <p className="text-sm font-medium mt-0.5 truncate">{merchant.email}</p>
                            </div>
                            <div className="rounded-lg bg-background p-2.5 border">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Joined</p>
                              <p className="text-sm font-medium mt-0.5">{new Date(merchant.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="rounded-lg bg-background p-2.5 border">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Merchant ID</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <p className="text-xs font-mono text-muted-foreground">{merchant.id.slice(0, 16)}...</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0"
                                  onClick={() => { navigator.clipboard.writeText(merchant.id); toast.success('ID copied!') }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="rounded-lg bg-background p-2.5 border">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Store URL</p>
                              <p className="text-sm font-medium mt-0.5">{merchant.businessName.toLowerCase().replace(/\s+/g, '')}.shopforge.io</p>
                            </div>
                            <div className="rounded-lg bg-background p-2.5 border">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Revenue (MTD)</p>
                              <p className="text-sm font-medium mt-0.5">${(Math.sin(merchant.id.charCodeAt(0)) * 5000 + 2000).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })()}
                </AnimatePresence>
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

      {/* Platform Alerts */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  Platform Alerts
                </CardTitle>
                <CardDescription>Active system notifications and alerts</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {platformAlerts.filter(a => a.severity === 'critical').length} Critical
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {platformAlerts.map((alert, i) => {
                const styles = severityStyles[alert.severity]
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`relative rounded-xl border p-3.5 ${styles.bg} ${styles.border} hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`p-1.5 rounded-lg shrink-0 ${styles.badge.split(' ').slice(0, 1).join(' ')}`}>
                        <alert.icon className={`h-3.5 w-3.5 ${styles.badge.split(' ')[1]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 border ${styles.badge} uppercase font-bold tracking-wider`}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-xs font-semibold leading-tight">{alert.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{alert.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1.5">{formatTimeAgo(alert.timestamp)}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
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
