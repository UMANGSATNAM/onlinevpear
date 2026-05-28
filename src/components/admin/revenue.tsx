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
} satisfies ChartConfig

const PLAN_COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

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

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

export function RevenueMonitoring() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [plansData, setPlansData] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly')

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
    return dashboardData.revenueChart.map((item, i) => ({
      month: item.month,
      ltv: dashboardData.stats.totalCustomers > 0
        ? (item.revenue / Math.max(dashboardData.stats.totalCustomers / 12, 1))
        : 0,
    }))
  }, [dashboardData])

  // Revenue forecast (simple linear projection)
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
      })
    }
    return forecast
  }, [dashboardData])

  if (loading) return <RevenueSkeleton />
  if (!dashboardData || !plansData) return <div className="p-6 text-muted-foreground">No data available</div>

  const periodRevenueData = period === 'daily'
    ? dashboardData.revenueChart.map((d) => ({ ...d, revenue: d.revenue / 30 }))
    : period === 'weekly'
      ? dashboardData.revenueChart.map((d) => ({ ...d, revenue: d.revenue / 4 }))
      : dashboardData.revenueChart

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'MRR',
            value: `$${mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            sub: 'Monthly Recurring Revenue',
            icon: DollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            change: dashboardData.growth.merchants,
          },
          {
            title: 'Total Revenue',
            value: `$${dashboardData.stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            sub: `$${dashboardData.stats.recentRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })} last 30d`,
            icon: TrendingUp,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
            change: null,
          },
          {
            title: 'Churn Rate',
            value: `${churnRate.toFixed(1)}%`,
            sub: `${dashboardData.stats.activeMerchants} active merchants`,
            icon: Repeat,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            change: null,
          },
          {
            title: 'Avg LTV',
            value: `$${dashboardData.stats.totalCustomers > 0 ? (dashboardData.stats.totalRevenue / dashboardData.stats.totalCustomers).toFixed(2) : '0.00'}`,
            sub: `${dashboardData.stats.totalCustomers} total customers`,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            change: null,
          },
        ].map((stat, i) => (
          <motion.div key={stat.title} {...fadeIn} transition={{ duration: 0.4, delay: i * 0.08 }}>
            <Card>
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
                <div className="mt-2 text-xs text-muted-foreground">{stat.sub}</div>
                {stat.change !== null && (
                  <div className="mt-1 flex items-center gap-1 text-xs">
                    {stat.change >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-600" />
                    )}
                    <span className={stat.change >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {Math.abs(stat.change).toFixed(1)}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart with Period Toggle */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.3 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Platform revenue over time</CardDescription>
            </div>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <AreaChart data={periodRevenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
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
                  fill="url(#revGrad)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Plan Breakdown */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Plan</CardTitle>
              <CardDescription>Breakdown of revenue across subscription tiers</CardDescription>
            </CardHeader>
            <CardContent>
              {planBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No plan data available</p>
              ) : (
                <>
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <PieChart>
                      <Pie
                        data={planBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
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

        {/* LTV Trend */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.5 }}>
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
      </div>

      {/* Revenue Forecast */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.6 }}>
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
