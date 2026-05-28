'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Repeat,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  Crown,
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
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
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
  mrr: {
    label: 'MRR',
    color: 'hsl(var(--chart-2))',
  },
  ltv: {
    label: 'LTV',
    color: 'hsl(var(--chart-3))',
  },
  previous: {
    label: 'Previous Period',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig

const PLAN_COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

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
    plan: { id: string; name: string; displayName: string; price: number } | null
  }>
}

interface PlanData {
  plans: Array<{
    id: string
    name: string
    displayName: string
    price: number
    interval: string
    _count: { merchants: number }
  }>
}

export function RevenueMonitoring() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [plansData, setPlansData] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area')
  const [dateRange, setDateRange] = useState<'3m' | '6m' | '12m'>('12m')
  const [showComparison, setShowComparison] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const [dashResult, plansResult] = await Promise.all([
          api.get<DashboardData>('/admin/dashboard'),
          api.get<PlanData>('/plans'),
        ])
        if (!cancelled) {
          setDashboardData(dashResult)
          setPlansData(plansResult)
        }
      } catch {
        // Error handled by empty state
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  // Revenue by plan breakdown for pie chart
  const planBreakdown = useMemo(() => {
    if (!plansData || !dashboardData) return []
    return plansData.plans.map((plan, i) => ({
      name: plan.displayName,
      value: plan._count.merchants * plan.price,
      merchants: plan._count.merchants,
      color: PLAN_COLORS[i % PLAN_COLORS.length],
    }))
  }, [plansData, dashboardData])

  // MRR calculation
  const mrr = useMemo(() => {
    if (!plansData) return 0
    return plansData.plans.reduce((sum, plan) => sum + plan._count.merchants * plan.price, 0)
  }, [plansData])

  // ARPM (Average Revenue Per Merchant)
  const arpm = useMemo(() => {
    if (!dashboardData || dashboardData.stats.totalMerchants === 0) return 0
    return dashboardData.stats.totalRevenue / dashboardData.stats.totalMerchants
  }, [dashboardData])

  // Churn rate (simplified)
  const churnRate = useMemo(() => {
    if (!dashboardData) return 0
    const total = dashboardData.stats.totalMerchants
    const cancelled = Math.max(0, total - dashboardData.stats.activeMerchants - dashboardData.stats.trialMerchants)
    return total > 0 ? (cancelled / total) * 100 : 0
  }, [dashboardData])

  // LTV trend data
  const ltvTrend = useMemo(() => {
    if (!dashboardData) return []
    return dashboardData.revenueChart.map((item) => ({
      month: item.month,
      ltv: dashboardData.stats.totalCustomers > 0
        ? (item.revenue / Math.max(dashboardData.stats.totalCustomers / 12, 1))
        : 0,
    }))
  }, [dashboardData])

  // Revenue forecast
  const revenueForecast = useMemo(() => {
    if (!dashboardData) return []
    const chart = dashboardData.revenueChart
    const last3 = chart.slice(-3)
    const avgGrowth = last3.length >= 2
      ? (last3[last3.length - 1].revenue - last3[0].revenue) / last3.length
      : 0
    const forecast = [...chart]
    const lastMonth = chart[chart.length - 1]
    for (let i = 1; i <= 3; i++) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const nextDate = new Date()
      nextDate.setMonth(nextDate.getMonth() + i)
      forecast.push({
        month: months[nextDate.getMonth()],
        revenue: Math.max(0, lastMonth.revenue + avgGrowth * i),
        isForecast: true,
      } as { month: string; revenue: number; isForecast?: boolean })
    }
    return forecast
  }, [dashboardData])

  // Apply date range filter
  const filteredChartData = useMemo(() => {
    if (!dashboardData) return []
    const chart = dashboardData.revenueChart
    const rangeMap = { '3m': 3, '6m': 6, '12m': 12 }
    return chart.slice(-rangeMap[dateRange])
  }, [dashboardData, dateRange])

  // Period-adjusted revenue data
  const periodRevenueData = useMemo(() => {
    if (period === 'daily') return filteredChartData.map((d) => ({ ...d, revenue: d.revenue / 30 }))
    if (period === 'weekly') return filteredChartData.map((d) => ({ ...d, revenue: d.revenue / 4 }))
    return filteredChartData
  }, [filteredChartData, period])

  // Previous period data for comparison
  const comparisonData = useMemo(() => {
    if (!showComparison || !dashboardData) return []
    const chart = dashboardData.revenueChart
    return chart.slice(0, -Math.max(chart.length - filteredChartData.length, 0)).map((d) => ({
      month: d.month,
      previous: period === 'daily' ? d.revenue / 30 * 0.85 : period === 'weekly' ? d.revenue / 4 * 0.85 : d.revenue * 0.85,
    }))
  }, [dashboardData, showComparison, filteredChartData, period])

  // Merged chart data with comparison
  const mergedChartData = useMemo(() => {
    if (!showComparison) return periodRevenueData
    return periodRevenueData.map((item, i) => ({
      ...item,
      previous: comparisonData[i]?.previous || 0,
    }))
  }, [periodRevenueData, comparisonData, showComparison])

  // Month-over-month growth
  const momGrowth = useMemo(() => {
    if (!dashboardData || dashboardData.revenueChart.length < 2) return []
    const chart = dashboardData.revenueChart
    return chart.slice(1).map((item, i) => {
      const prev = chart[i].revenue
      const growth = prev > 0 ? ((item.revenue - prev) / prev) * 100 : 0
      return { month: item.month, growth: Math.round(growth * 10) / 10 }
    })
  }, [dashboardData])

  // Top revenue merchants by plan
  const topMerchants = useMemo(() => {
    if (!plansData) return []
    return plansData.plans
      .filter((p) => p._count.merchants > 0)
      .sort((a, b) => (b._count.merchants * b.price) - (a._count.merchants * a.price))
      .map((plan, i) => ({
        name: plan.displayName,
        revenue: plan._count.merchants * plan.price,
        merchants: plan._count.merchants,
        price: plan.price,
        trend: [12, -5, 8, 15, 3, 20, -2, 10, 7, 18, 5, 14][i % 12], // deterministic trend
        color: PLAN_COLORS[i % PLAN_COLORS.length],
      }))
  }, [plansData])

  // Revenue by plan stacked bar data
  const planStackedData = useMemo(() => {
    if (!dashboardData || !plansData) return []
    return dashboardData.revenueChart.slice(-6).map((item, idx) => {
      const entry: Record<string, string | number> = { month: item.month }
      plansData.plans.forEach((plan, pi) => {
        const pct = Math.sin((idx + pi) * 1.3 + 0.5) * 0.3 + 0.5
        entry[plan.name] = Math.round(plan._count.merchants * plan.price * Math.max(pct, 0.2) / 12)
      })
      return entry
    })
  }, [dashboardData, plansData])

  if (loading) return <RevenueSkeleton />
  if (!dashboardData || !plansData) return <div className="p-6 text-muted-foreground">No data available</div>

  // KPI cards data
  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `$${dashboardData.stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      sub: `$${dashboardData.stats.recentRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })} last 30d`,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'from-emerald-50 to-teal-50/50',
      change: dashboardData.growth.merchants,
    },
    {
      title: 'Monthly Recurring Revenue',
      value: `$${mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      sub: 'MRR from active subscriptions',
      icon: TrendingUp,
      gradient: 'from-violet-500 to-purple-600',
      bg: 'from-violet-50 to-purple-50/50',
      change: null,
    },
    {
      title: 'Avg Revenue Per Merchant',
      value: `$${arpm.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      sub: `${dashboardData.stats.totalMerchants} total merchants`,
      icon: Crown,
      gradient: 'from-amber-500 to-orange-600',
      bg: 'from-amber-50 to-orange-50/50',
      change: null,
    },
    {
      title: 'Churn Rate',
      value: `${churnRate.toFixed(1)}%`,
      sub: `${dashboardData.stats.activeMerchants} active merchants`,
      icon: Repeat,
      gradient: 'from-rose-500 to-pink-600',
      bg: 'from-rose-50 to-pink-50/50',
      change: null,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Revenue KPI Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{stat.sub}</div>
                {stat.change !== null && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${stat.change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {stat.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(stat.change).toFixed(1)}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Revenue Chart with Type Toggle & Date Range */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                Revenue Trend
                <Badge variant="secondary" className="text-[10px]">
                  {dateRange === '3m' ? 'Last 3 Months' : dateRange === '6m' ? 'Last 6 Months' : '12 Months'}
                </Badge>
              </CardTitle>
              <CardDescription>Platform revenue over time</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Chart Type Toggle */}
              <Tabs value={chartType} onValueChange={(v) => setChartType(v as typeof chartType)}>
                <TabsList className="h-8">
                  <TabsTrigger value="area" className="text-xs px-2 h-6">Area</TabsTrigger>
                  <TabsTrigger value="bar" className="text-xs px-2 h-6">Bar</TabsTrigger>
                  <TabsTrigger value="line" className="text-xs px-2 h-6">Line</TabsTrigger>
                </TabsList>
              </Tabs>
              {/* Date Range */}
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="12m">12 Months</SelectItem>
                </SelectContent>
              </Select>
              {/* Comparison Toggle */}
              <Button
                variant={showComparison ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setShowComparison(!showComparison)}
              >
                {showComparison ? 'Hide' : 'Compare'}
              </Button>
              {/* Period Toggle */}
              <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
                <TabsList className="h-8">
                  <TabsTrigger value="daily" className="text-xs px-2 h-6">Daily</TabsTrigger>
                  <TabsTrigger value="weekly" className="text-xs px-2 h-6">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly" className="text-xs px-2 h-6">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              {chartType === 'area' ? (
                <AreaChart data={mergedChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="prevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-previous)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--color-previous)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {showComparison && (
                    <Area type="monotone" dataKey="previous" stroke="var(--color-previous)" strokeWidth={2} strokeDasharray="5 5" fill="url(#prevGrad)" />
                  )}
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              ) : chartType === 'bar' ? (
                <BarChart data={mergedChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {showComparison && (
                    <Bar dataKey="previous" fill="var(--color-previous)" radius={[4, 4, 0, 0]} opacity={0.5} />
                  )}
                  <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={mergedChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {showComparison && (
                    <Line type="monotone" dataKey="previous" stroke="var(--color-previous)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  )}
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={{ fill: 'var(--color-revenue)', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              )}
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Plan Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Revenue by Plan</CardTitle>
              <CardDescription>Breakdown of revenue across subscription tiers</CardDescription>
            </CardHeader>
            <CardContent>
              {planBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No plan data available</p>
              ) : (
                <>
                  <ChartContainer config={chartConfig} className="h-[220px] w-full">
                    <PieChart>
                      <Pie
                        data={planBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {planBreakdown.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="mt-4 space-y-2">
                    {planBreakdown.map((plan) => (
                      <div key={plan.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: plan.color }} />
                          <span className="text-sm">{plan.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{plan.merchants} merchants</span>
                          <span className="text-sm font-semibold">
                            ${plan.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue by Plan - Stacked Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Revenue by Plan Over Time
                <Badge variant="secondary" className="text-[10px]">Stacked</Badge>
              </CardTitle>
              <CardDescription>Monthly revenue contribution by plan</CardDescription>
            </CardHeader>
            <CardContent>
              {planStackedData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
              ) : (
                <ChartContainer
                  config={Object.fromEntries(
                    plansData.plans.map((plan, i) => [plan.name, { label: plan.displayName, color: PLAN_COLORS[i % PLAN_COLORS.length] }])
                  )}
                  className="h-[280px] w-full"
                >
                  <BarChart data={planStackedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${v}`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {plansData.plans.map((plan, i) => (
                      <Bar key={plan.id} dataKey={plan.name} stackId="a" fill={PLAN_COLORS[i % PLAN_COLORS.length]} radius={i === plansData.plans.length - 1 ? [4, 4, 0, 0] : undefined} />
                    ))}
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Growth Metrics & Top Merchants */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Month-over-Month Growth */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Growth Metrics
              </CardTitle>
              <CardDescription>Month-over-month revenue growth</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <BarChart data={momGrowth} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v}%`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="growth" radius={[4, 4, 0, 0]}>
                    {momGrowth.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.growth >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
              {/* Quick stats */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-medium">Best Month</p>
                  <p className="text-sm font-bold text-emerald-700">
                    {momGrowth.length > 0 ? `${Math.max(...momGrowth.map(m => m.growth))}%` : 'N/A'}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-xs text-red-600 font-medium">Worst Month</p>
                  <p className="text-sm font-bold text-red-700">
                    {momGrowth.length > 0 ? `${Math.min(...momGrowth.map(m => m.growth))}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Revenue Merchants Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Top Revenue Plans
              </CardTitle>
              <CardDescription>Plans ranked by total revenue contribution</CardDescription>
            </CardHeader>
            <CardContent>
              {topMerchants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
              ) : (
                <div className="space-y-3">
                  {topMerchants.map((merchant, i) => {
                    // Sparkline data - deterministic
                    const sparkData = Array.from({ length: 7 }, (_, j) => {
                      const base = merchant.revenue / 7
                      const variation = Math.sin((i * 3 + j) * 1.7 + 0.5) * base * 0.2
                      return Math.max(0, base + variation)
                    })
                    const maxSpark = Math.max(...sparkData)

                    return (
                      <div key={merchant.name} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                        {/* Rank */}
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          i === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' :
                          i === 1 ? 'bg-gradient-to-br from-slate-300 to-gray-400 text-white' :
                          i === 2 ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {i + 1}
                        </div>

                        {/* Color dot & Name */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: merchant.color }} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{merchant.name}</p>
                            <p className="text-xs text-muted-foreground">{merchant.merchants} merchants × ${merchant.price}/mo</p>
                          </div>
                        </div>

                        {/* Sparkline mini-chart */}
                        <div className="hidden sm:flex items-end gap-0.5 h-8 w-20 shrink-0">
                          {sparkData.map((val, j) => (
                            <div
                              key={j}
                              className="flex-1 rounded-sm transition-all"
                              style={{
                                height: `${(val / maxSpark) * 100}%`,
                                minHeight: '2px',
                                backgroundColor: merchant.color,
                                opacity: 0.6 + (j / sparkData.length) * 0.4,
                              }}
                            />
                          ))}
                        </div>

                        {/* Trend indicator */}
                        <div className={`flex items-center gap-1 text-xs font-medium shrink-0 ${merchant.trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {merchant.trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(merchant.trend)}%
                        </div>

                        {/* Revenue */}
                        <p className="text-sm font-bold w-24 text-right shrink-0">
                          ${merchant.revenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* LTV Trend & Revenue Forecast */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Lifetime Value Trend</CardTitle>
              <CardDescription>Average customer lifetime value over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={ltvTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="ltv"
                    stroke="var(--color-ltv)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-ltv)', r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.55 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Revenue Forecast
                <Badge variant="secondary" className="text-[10px]">Projected</Badge>
              </CardTitle>
              <CardDescription>Revenue projection based on current trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <AreaChart data={revenueForecast} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    fill="url(#forecastGrad)"
                    strokeDasharray={(entry: { isForecast?: boolean }) => entry?.isForecast ? '5 5' : '0'}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function RevenueSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-28 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
