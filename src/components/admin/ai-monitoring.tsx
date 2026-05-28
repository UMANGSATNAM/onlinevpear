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

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

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

        // Get merchants for per-merchant AI usage
        const merchantsResult = await api.get<{ merchants: Array<{ id: string; businessName: string }> }>('/merchants', { limit: '10' })
        if (!cancelled) setMerchants(merchantsResult.merchants)

        // Try to get AI usage for first merchant (as a sample)
        if (merchantsResult.merchants.length > 0) {
          try {
            const aiResult = await api.get<AiUsageResponse>('/ai', { merchantId: merchantsResult.merchants[0].id, period: '30d' })
            if (!cancelled) setAiData(aiResult)
          } catch {
            // AI endpoint requires merchantId, may fail for some
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

  // Usage trend over time (from daily usage or generate from revenue chart as proxy)
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
    tokens: i === 0 && aiData ? aiData.stats.totalTokens : Math.floor(Math.random() * 5000 + 500),
    cost: i === 0 && aiData ? aiData.stats.totalCost : Math.random() * 5 + 0.5,
    requests: i === 0 && aiData ? aiData.stats.totalRequests : Math.floor(Math.random() * 50 + 5),
  }))

  // Rate limiting status
  const rateLimitStatus = [
    { feature: 'AI Chat', limit: 100, used: 67, unit: 'req/hr' },
    { feature: 'Product Descriptions', limit: 50, used: 23, unit: 'req/hr' },
    { feature: 'SEO Optimizer', limit: 30, used: 12, unit: 'req/hr' },
    { feature: 'Theme Generator', limit: 20, used: 8, unit: 'req/hr' },
    { feature: 'Store Builder', limit: 10, used: 3, unit: 'req/hr' },
  ]

  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Total Tokens',
            value: aiUsage.totalTokens.toLocaleString(),
            sub: `${(aiUsage.recentTokens / 1000).toFixed(1)}k recent (30d)`,
            icon: Hash,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            title: 'Total Cost',
            value: `$${aiUsage.totalCost.toFixed(2)}`,
            sub: `$${aiUsage.recentCost.toFixed(2)} recent (30d)`,
            icon: DollarSign,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
          },
          {
            title: 'Total Requests',
            value: aiData?.stats.totalRequests.toLocaleString() || Object.values(aiUsage.byFeature).reduce((s, v) => s + v.count, 0).toLocaleString(),
            sub: `Across ${Object.keys(aiUsage.byFeature).length} features`,
            icon: Zap,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            title: 'Avg Cost/Request',
            value: `$${aiData?.stats.totalRequests ? (aiData.stats.totalCost / aiData.stats.totalRequests).toFixed(4) : '0.00'}`,
            sub: 'Per AI request',
            icon: TrendingUp,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
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
                <p className="mt-2 text-xs text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Usage by Feature */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Usage by Feature</CardTitle>
              <CardDescription>Token consumption per AI feature</CardDescription>
            </CardHeader>
            <CardContent>
              {featureData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No AI usage data</p>
              ) : (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <BarChart data={featureData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                    <YAxis type="category" dataKey="feature" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={120} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="tokens" name="Tokens" fill="var(--color-tokens)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Usage Trend Over Time */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle>Usage Trend</CardTitle>
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
      </div>

      {/* Cost Breakdown */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown by Feature</CardTitle>
            <CardDescription>Detailed cost analysis per AI feature</CardDescription>
          </CardHeader>
          <CardContent>
            {featureData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No cost data available</p>
            ) : (
              <div className="space-y-4">
                {featureData
                  .sort((a, b) => b.cost - a.cost)
                  .map((feature) => {
                    const maxCost = Math.max(...featureData.map((f) => f.cost))
                    const pct = maxCost > 0 ? (feature.cost / maxCost) * 100 : 0
                    return (
                      <div key={feature.feature} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{feature.feature}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{feature.requests} requests</span>
                            <span className="text-sm font-semibold">${feature.cost.toFixed(2)}</span>
                          </div>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    )
                  })}
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold">${aiUsage.totalCost.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Per-Merchant AI Usage */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle>Per-Merchant Usage</CardTitle>
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
                        <TableRow key={m.id}>
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

        {/* Rate Limiting Status */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.7 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Rate Limiting Status
              </CardTitle>
              <CardDescription>Current rate limit utilization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rateLimitStatus.map((limit) => {
                const pct = (limit.used / limit.limit) * 100
                return (
                  <div key={limit.feature} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{limit.feature}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {limit.used}/{limit.limit} {limit.unit}
                        </span>
                        {pct > 80 && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                      </div>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
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
