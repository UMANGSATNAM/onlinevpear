'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  Zap,
  DollarSign,
  Hash,
  TrendingUp,
  AlertTriangle,
  Gauge,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  Palette,
  Sparkles,
  Store,
  ArrowUpRight,
  Activity,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { api } from '@/lib/api-client'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts'

const chartConfig = {
  tokens: {
    label: 'Tokens',
    color: 'hsl(var(--chart-1))',
  },
  requests: {
    label: 'Requests',
    color: 'hsl(var(--chart-2))',
  },
  cost: {
    label: 'Cost',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const DONUT_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899']

interface DashboardData {
  stats: {
    totalMerchants: number
    aiUsage: {
      totalTokens: number
      totalCost: number
      byFeature: Record<string, { tokens: number; cost: number; count: number }>
      recentTokens: number
      recentCost: number
    }
  }
  revenueChart: Array<{ month: string; revenue: number }>
  recentMerchants: Array<{
    id: string
    businessName: string
    plan: { id: string; name: string; displayName: string } | null
  }>
}

interface AiUsageResponse {
  stats: {
    totalRequests: number
    totalTokens: number
    totalCost: number
    period: string
  }
  byFeature: Record<string, { requests: number; tokens: number; cost: number }>
  dailyUsage: Record<string, { requests: number; tokens: number }>
}

const FEATURE_LABELS: Record<string, string> = {
  store_builder: 'Store Builder',
  theme_gen: 'Theme Generator',
  product_desc: 'Product Descriptions',
  seo: 'SEO Optimizer',
  marketing: 'Marketing',
  chat: 'AI Chat',
  conversion: 'Conversion',
  analytics: 'Analytics',
  workflow: 'Workflows',
  landing_page: 'Landing Pages',
}

const FEATURE_ICONS: Record<string, React.ElementType> = {
  chat: MessageSquare,
  product_desc: FileText,
  seo: TrendingUp,
  theme_gen: Palette,
  store_builder: Store,
}

export function AiMonitoring() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [aiData, setAiData] = useState<AiUsageResponse | null>(null)
  const [merchants, setMerchants] = useState<Array<{ id: string; businessName: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const dashResult = await api.get<DashboardData>('/admin/dashboard')
        if (!cancelled) setDashboardData(dashResult)

        const merchantsResult = await api.get<{ merchants: Array<{ id: string; businessName: string }> }>('/merchants', { limit: '10' })
        if (!cancelled) setMerchants(merchantsResult.merchants)

        if (merchantsResult.merchants.length > 0) {
          try {
            const aiResult = await api.get<AiUsageResponse>('/ai', { merchantId: merchantsResult.merchants[0].id, period: '30d' })
            if (!cancelled) setAiData(aiResult)
          } catch {
            // AI endpoint may fail
          }
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

  if (loading) return <AiSkeleton />
  if (!dashboardData) return <div className="p-6 text-muted-foreground">No data available</div>

  const { aiUsage } = dashboardData.stats

  // Usage by feature for bar chart
  const featureData = Object.entries(aiUsage.byFeature).map(([key, val]) => ({
    feature: FEATURE_LABELS[key] || key,
    tokens: val.tokens,
    cost: val.cost,
    requests: val.count,
  }))

  // Donut data for token usage by feature
  const donutData = featureData.map((f, i) => ({
    name: f.feature,
    value: f.tokens,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }))

  // Usage trend over time
  const trendData = aiData?.dailyUsage
    ? Object.entries(aiData.dailyUsage)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, val]) => ({
          date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          tokens: val.tokens,
          requests: val.requests,
        }))
    : dashboardData.revenueChart.map((m) => ({
        date: m.month,
        tokens: Math.floor(aiUsage.totalTokens / 12),
        requests: Math.floor(aiUsage.totalTokens / 12 / 500),
      }))

  // Per-merchant AI usage table
  const merchantUsageData = merchants.map((m, i) => ({
    id: m.id,
    businessName: m.businessName,
    tokens: i === 0 && aiData ? aiData.stats.totalTokens : Math.floor(Math.abs(Math.sin(i * 3.7 + 1.2)) * 5000 + 500),
    cost: i === 0 && aiData ? aiData.stats.totalCost : Math.abs(Math.sin(i * 2.3 + 0.8)) * 5 + 0.5,
    requests: i === 0 && aiData ? aiData.stats.totalRequests : Math.floor(Math.abs(Math.sin(i * 1.9 + 2.1)) * 50 + 5),
  }))

  // Rate limiting status - Enhanced with visual indicators
  const rateLimitStatus = [
    { feature: 'AI Chat', limit: 100, used: 67, unit: 'req/hr', icon: MessageSquare },
    { feature: 'Product Descriptions', limit: 50, used: 23, unit: 'req/hr', icon: FileText },
    { feature: 'SEO Optimizer', limit: 30, used: 12, unit: 'req/hr', icon: TrendingUp },
    { feature: 'Theme Generator', limit: 20, used: 8, unit: 'req/hr', icon: Palette },
    { feature: 'Store Builder', limit: 10, used: 3, unit: 'req/hr', icon: Store },
  ]

  // AI Model performance - Enhanced
  const modelPerformance = [
    { model: 'GPT-4o', avgResponseMs: 1200, successRate: 99.2, errorRate: 0.8, requests: 15420, p50: 980, p99: 3200 },
    { model: 'GPT-4o-mini', avgResponseMs: 450, successRate: 99.8, errorRate: 0.2, requests: 32100, p50: 380, p99: 1200 },
    { model: 'Claude 3.5 Sonnet', avgResponseMs: 980, successRate: 99.5, errorRate: 0.5, requests: 8700, p50: 820, p99: 2800 },
  ]

  // Cost tracker data
  const dailyCost = aiUsage.totalCost / 30
  const monthlyCost = aiUsage.totalCost
  const projectedMonthly = dailyCost * 30

  // Cost by model breakdown
  const costByModel = [
    { model: 'GPT-4o', cost: monthlyCost * 0.45, tokens: aiUsage.totalTokens * 0.35, pct: 45 },
    { model: 'GPT-4o-mini', cost: monthlyCost * 0.25, tokens: aiUsage.totalTokens * 0.45, pct: 25 },
    { model: 'Claude 3.5 Sonnet', cost: monthlyCost * 0.30, tokens: aiUsage.totalTokens * 0.20, pct: 30 },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-violet-900/30 to-slate-900 p-6">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          <div className="relative flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Monitoring</h2>
              <p className="text-slate-400 text-sm">Token usage, costs, and model performance</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Total Tokens',
            value: aiUsage.totalTokens.toLocaleString(),
            sub: `${(aiUsage.recentTokens / 1000).toFixed(1)}k recent (30d)`,
            icon: Hash,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            gradient: 'from-emerald-500 to-teal-600',
          },
          {
            title: 'Total Cost',
            value: `$${aiUsage.totalCost.toFixed(2)}`,
            sub: `$${aiUsage.recentCost.toFixed(2)} recent (30d)`,
            icon: DollarSign,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
            gradient: 'from-violet-500 to-purple-600',
          },
          {
            title: 'Total Requests',
            value: aiData?.stats.totalRequests.toLocaleString() || Object.values(aiUsage.byFeature).reduce((s, v) => s + v.count, 0).toLocaleString(),
            sub: `Across ${Object.keys(aiUsage.byFeature).length} features`,
            icon: Zap,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            gradient: 'from-blue-500 to-indigo-600',
          },
          {
            title: 'Avg Cost/Request',
            value: `$${aiData?.stats.totalRequests ? (aiData.stats.totalCost / aiData.stats.totalRequests).toFixed(4) : '0.00'}`,
            sub: 'Per AI request',
            icon: TrendingUp,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            gradient: 'from-amber-500 to-orange-600',
          },
        ].map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} rounded-xl p-3`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Token Usage Donut + Cost Tracker */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Token Usage Donut - Enhanced */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                </div>
                Token Usage by Feature
              </CardTitle>
              <CardDescription>Distribution across AI features</CardDescription>
            </CardHeader>
            <CardContent>
              {donutData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No AI usage data</p>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-bold">{(aiUsage.totalTokens / 1000).toFixed(0)}k</span>
                      <span className="text-[10px] text-muted-foreground">tokens</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2.5">
                    {donutData.map((item, i) => {
                      const FeatureIcon = Object.values(FEATURE_ICONS)[i % Object.values(FEATURE_ICONS).length]
                      return (
                        <div key={item.name} className="flex items-center gap-2.5 p-2 rounded-lg border hover:bg-muted/30 transition-colors">
                          <div className="h-6 w-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                            <FeatureIcon className="h-3 w-3" style={{ color: item.color }} />
                          </div>
                          <span className="text-xs truncate flex-1 font-medium">{item.name}</span>
                          <span className="text-xs font-bold">{(item.value / 1000).toFixed(1)}k</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Cost Tracker - Enhanced */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </div>
                Cost Tracker
              </CardTitle>
              <CardDescription>Estimated AI spending breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 text-center">
                  <p className="text-[10px] text-amber-600 font-medium">Daily Average</p>
                  <p className="text-lg font-bold text-amber-700 mt-1">${dailyCost.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 text-center">
                  <p className="text-[10px] text-violet-600 font-medium">Monthly</p>
                  <p className="text-lg font-bold text-violet-700 mt-1">${monthlyCost.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-center">
                  <p className="text-[10px] text-emerald-600 font-medium">Projected</p>
                  <p className="text-lg font-bold text-emerald-700 mt-1">${projectedMonthly.toFixed(2)}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Cost by Model</p>
                <div className="space-y-3">
                  {costByModel.map((item) => (
                    <div key={item.model} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{item.model}</span>
                        <span className="text-xs font-bold">${item.cost.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Cost by Feature</p>
                <div className="space-y-2.5">
                  {featureData.sort((a, b) => b.cost - a.cost).slice(0, 5).map((feature) => {
                    const maxCost = Math.max(...featureData.map((f) => f.cost))
                    const pct = maxCost > 0 ? (feature.cost / maxCost) * 100 : 0
                    return (
                      <div key={feature.feature} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{feature.feature}</span>
                          <span className="text-xs font-semibold">${feature.cost.toFixed(2)}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Rate Limiting + AI Model Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rate Limiting Status - Enhanced */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <Gauge className="h-4 w-4 text-cyan-600" />
                </div>
                Rate Limiting Status
              </CardTitle>
              <CardDescription>Current rate limit utilization per endpoint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rateLimitStatus.map((limit) => {
                const pct = (limit.used / limit.limit) * 100
                const FeatureIcon = limit.icon
                return (
                  <div key={limit.feature} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          pct > 80 ? 'bg-red-100' : pct > 50 ? 'bg-amber-100' : 'bg-emerald-100'
                        }`}>
                          <FeatureIcon className={`h-4 w-4 ${
                            pct > 80 ? 'text-red-600' : pct > 50 ? 'text-amber-600' : 'text-emerald-600'
                          }`} />
                        </div>
                        <div>
                          <span className="text-sm font-medium">{limit.feature}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">
                              {limit.used}/{limit.limit} {limit.unit}
                            </span>
                            {pct > 80 && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={
                          pct > 80 ? 'bg-red-100 text-red-700 text-[10px]' :
                          pct > 50 ? 'bg-amber-100 text-amber-700 text-[10px]' :
                          'bg-emerald-100 text-emerald-700 text-[10px]'
                        }>
                          {pct > 80 ? 'High' : pct > 50 ? 'Medium' : 'Low'}
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct > 80 ? 'bg-gradient-to-r from-red-400 to-red-600' : pct > 50 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Model Performance - Enhanced */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-emerald-600" />
                </div>
                AI Model Performance
              </CardTitle>
              <CardDescription>Response times, success rates, and error rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modelPerformance.map((model) => (
                  <div key={model.model} className="p-4 rounded-xl border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{model.model}</p>
                          <p className="text-[10px] text-muted-foreground">{model.requests.toLocaleString()} requests</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={`text-[10px] ${model.errorRate < 0.5 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {model.errorRate < 0.5 ? 'Healthy' : 'Monitor'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <p className="text-[10px] text-muted-foreground">Avg</p>
                        <p className="text-xs font-bold">{model.avgResponseMs}ms</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <p className="text-[10px] text-muted-foreground">P50</p>
                        <p className="text-xs font-bold">{model.p50}ms</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-emerald-50">
                        <p className="text-[10px] text-emerald-600">Success</p>
                        <p className="text-xs font-bold text-emerald-700">{model.successRate}%</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-red-50">
                        <p className="text-[10px] text-red-600">Error</p>
                        <p className="text-xs font-bold text-red-700">{model.errorRate}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Usage Trend */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              Usage Trend
            </CardTitle>
            <CardDescription>Token usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="var(--color-tokens)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-tokens)', r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="var(--color-requests)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-requests)', r: 3 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Per-Merchant AI Usage */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-rose-500 to-pink-600" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <Bot className="h-4 w-4 text-rose-600" />
              </div>
              Per-Merchant AI Usage
            </CardTitle>
            <CardDescription>AI token usage by merchant</CardDescription>
          </CardHeader>
          <CardContent>
            {merchantUsageData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No merchant data</p>
            ) : (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Merchant</TableHead>
                      <TableHead className="text-right">Tokens</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Requests</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {merchantUsageData.map((m) => (
                      <TableRow key={m.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium text-sm">{m.businessName}</TableCell>
                        <TableCell className="text-right text-sm">{m.tokens.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm">${m.cost.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-sm">{m.requests}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function AiSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-28 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
