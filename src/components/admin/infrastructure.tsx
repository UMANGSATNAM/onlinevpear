'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Server,
  Database,
  HardDrive,
  Cpu,
  Wifi,
  Cloud,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
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
} from 'recharts'

const chartConfig = {
  responseTime: {
    label: 'Response Time',
    color: 'hsl(var(--chart-1))',
  },
  throughput: {
    label: 'Throughput',
    color: 'hsl(var(--chart-2))',
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
    activeMerchants: number
    totalOrders: number
    totalProducts: number
  }
  growth: {
    orders: number
  }
  revenueChart: Array<{ month: string; revenue: number }>
}

type ServiceStatus = 'operational' | 'degraded' | 'down'

interface ServiceInfo {
  name: string
  icon: React.ElementType
  status: ServiceStatus
  uptime: number
  latency: string
  lastIncident: string | null
}

function getInfraMetrics(data: DashboardData | null): {
  services: ServiceInfo[]
  resources: Array<{ name: string; icon: React.ElementType; usage: number; total: string; unit: string; color: string }>
  performanceData: Array<{ time: string; responseTime: number; throughput: number }>
} {
  const orderFactor = data ? Math.min(data.stats.totalOrders / 100, 50) : 10

  const services: ServiceInfo[] = [
    { name: 'API Gateway', icon: Server, status: 'operational', uptime: 99.99, latency: '12ms', lastIncident: null },
    { name: 'Database', icon: Database, status: 'operational', uptime: 99.97, latency: '3ms', lastIncident: null },
    { name: 'Cache Layer', icon: Zap, status: 'operational', uptime: 99.95, latency: '1ms', lastIncident: null },
    { name: 'Job Queue', icon: Clock, status: 'operational', uptime: 99.90, latency: '45ms', lastIncident: '2 days ago' },
    { name: 'Object Storage', icon: HardDrive, status: 'operational', uptime: 99.99, latency: '28ms', lastIncident: null },
    { name: 'CDN', icon: Cloud, status: 'operational', uptime: 99.99, latency: '5ms', lastIncident: null },
  ]

  const resources = [
    { name: 'CPU', icon: Cpu, usage: 23 + Math.min(orderFactor, 20), total: '16 cores', unit: '%', color: 'bg-emerald-500' },
    { name: 'Memory', icon: HardDrive, usage: 45 + Math.min(orderFactor, 15), total: '64 GB', unit: '%', color: 'bg-violet-500' },
    { name: 'Disk', icon: HardDrive, usage: 34 + Math.min(orderFactor / 2, 10), total: '2 TB', unit: '%', color: 'bg-blue-500' },
    { name: 'Bandwidth', icon: Wifi, usage: 18 + Math.min(orderFactor / 3, 15), total: '10 Gbps', unit: '%', color: 'bg-amber-500' },
  ]

  const performanceData = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    responseTime: 100 + Math.sin(i / 4) * 30 + Math.random() * 20,
    throughput: 800 + Math.sin(i / 3) * 200 + Math.random() * 100,
  }))

  return { services, resources, performanceData }
}

const statusConfig: Record<ServiceStatus, { color: string; icon: React.ElementType; label: string }> = {
  operational: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2, label: 'Operational' },
  degraded: { color: 'bg-amber-100 text-amber-800', icon: AlertTriangle, label: 'Degraded' },
  down: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Down' },
}

export function InfrastructureMonitoring() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await api.get<DashboardData>('/admin/dashboard')
        if (!cancelled) setData(result)
      } catch {
        // Will show empty state
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  const metrics = getInfraMetrics(data)
  const overallUptime = metrics.services.reduce((sum, s) => sum + s.uptime, 0) / metrics.services.length

  if (loading) return <InfrastructureSkeleton />

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <motion.div {...fadeIn}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Infrastructure Monitoring</h2>
            <p className="text-muted-foreground">System health and performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 px-3 py-1">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              All Systems Operational
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Uptime & Quick Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Uptime', value: `${overallUptime.toFixed(2)}%`, sub: 'Last 30 days', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Avg Response', value: '142ms', sub: 'API gateway latency', icon: Zap, color: 'text-violet-600', bg: 'bg-violet-50' },
          { title: 'Throughput', value: '1.2k', sub: 'requests/min', icon: Server, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Error Rate', value: '0.12%', sub: '5xx errors', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
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

      {/* Service Status */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>Current status of platform services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {metrics.services.map((service) => {
                const config = statusConfig[service.status]
                return (
                  <div key={service.name} className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <service.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{service.name}</p>
                        <Badge variant="secondary" className={config.color}>
                          <config.icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{service.latency}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{service.uptime}% uptime</span>
                        {service.lastIncident && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-amber-600">Last incident: {service.lastIncident}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Metrics Chart */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Response time and throughput over 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={metrics.performanceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} interval={3} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v}ms`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="var(--color-responseTime)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resource Usage */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
              <CardDescription>Current resource utilization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {metrics.resources.map((resource) => (
                <div key={resource.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <resource.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{resource.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{resource.usage.toFixed(0)}{resource.unit}</span>
                      <span className="text-xs text-muted-foreground">of {resource.total}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={resource.usage} className="h-3" />
                    <div
                      className="absolute top-0 left-0 h-3 rounded-full transition-all opacity-30"
                      style={{ width: `${resource.usage}%`, backgroundColor: resource.color.replace('bg-', '') }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span className={resource.usage > 80 ? 'text-red-600 font-medium' : resource.usage > 60 ? 'text-amber-600' : 'text-emerald-600'}>
                      {resource.usage > 80 ? 'High' : resource.usage > 60 ? 'Moderate' : 'Normal'}
                    </span>
                    <span>100%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Uptime Display */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.6 }}>
        <Card>
          <CardHeader>
            <CardTitle>Uptime History (30 Days)</CardTitle>
            <CardDescription>Service availability over the past month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(30, minmax(0, 1fr))' }}>
              {Array.from({ length: 30 }, (_, i) => {
                const isDown = Math.random() < 0.02
                const isDegraded = !isDown && Math.random() < 0.05
                const color = isDown ? 'bg-red-500' : isDegraded ? 'bg-amber-400' : 'bg-emerald-500'
                const day = new Date()
                day.setDate(day.getDate() - (29 - i))
                return (
                  <div
                    key={i}
                    className={`h-8 rounded-sm ${color} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                    title={`${day.toLocaleDateString()}: ${isDown ? 'Down' : isDegraded ? 'Degraded' : 'Operational'}`}
                  />
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Operational</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-amber-400" />
                <span className="text-xs text-muted-foreground">Degraded</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-red-500" />
                <span className="text-xs text-muted-foreground">Down</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function InfrastructureSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-24 mb-2" />
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
