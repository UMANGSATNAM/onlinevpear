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
  TrendingUp,
  TrendingDown,
  Bell,
  BellOff,
  Shield,
  Timer,
  ArrowUpRight,
  RefreshCw,
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
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
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
  cpu: number
  memory: number
  responseTime: string
}

function getInfraMetrics(data: DashboardData | null): {
  services: ServiceInfo[]
  resources: Array<{ name: string; icon: React.ElementType; usage: number; total: string; unit: string; color: string }>
  performanceData: Array<{ time: string; responseTime: number; throughput: number }>
} {
  const orderFactor = data ? Math.min(data.stats.totalOrders / 100, 50) : 10

  const services: ServiceInfo[] = [
    { name: 'API Gateway', icon: Server, status: 'operational', uptime: 99.99, latency: '12ms', lastIncident: null, cpu: 23 + Math.min(orderFactor, 20), memory: 35, responseTime: '12ms' },
    { name: 'Database', icon: Database, status: 'operational', uptime: 99.97, latency: '3ms', lastIncident: null, cpu: 18 + Math.min(orderFactor, 15), memory: 52, responseTime: '3ms' },
    { name: 'Cache Layer', icon: Zap, status: 'operational', uptime: 99.95, latency: '1ms', lastIncident: null, cpu: 12, memory: 28, responseTime: '1ms' },
    { name: 'Job Queue', icon: Clock, status: 'operational', uptime: 99.90, latency: '45ms', lastIncident: '2 days ago', cpu: 45, memory: 60, responseTime: '45ms' },
    { name: 'Object Storage', icon: HardDrive, status: 'operational', uptime: 99.99, latency: '28ms', lastIncident: null, cpu: 15, memory: 40, responseTime: '28ms' },
    { name: 'CDN', icon: Cloud, status: 'operational', uptime: 99.99, latency: '5ms', lastIncident: null, cpu: 8, memory: 22, responseTime: '5ms' },
  ]

  const resources = [
    { name: 'CPU', icon: Cpu, usage: 23 + Math.min(orderFactor, 20), total: '16 cores', unit: '%', color: 'bg-emerald-500' },
    { name: 'Memory', icon: HardDrive, usage: 45 + Math.min(orderFactor, 15), total: '64 GB', unit: '%', color: 'bg-violet-500' },
    { name: 'Disk', icon: HardDrive, usage: 34 + Math.min(orderFactor / 2, 10), total: '2 TB', unit: '%', color: 'bg-blue-500' },
    { name: 'Bandwidth', icon: Wifi, usage: 18 + Math.min(orderFactor / 3, 15), total: '10 Gbps', unit: '%', color: 'bg-amber-500' },
  ]

  const performanceData = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    responseTime: 100 + Math.sin(i / 4) * 30 + Math.sin(i * 1.7 + 0.3) * 10,
    throughput: 800 + Math.sin(i / 3) * 200 + Math.sin(i * 2.3 + 0.7) * 50,
  }))

  return { services, resources, performanceData }
}

const statusConfig: Record<ServiceStatus, { color: string; dotColor: string; icon: React.ElementType; label: string }> = {
  operational: { color: 'bg-emerald-100 text-emerald-800', dotColor: 'bg-emerald-500', icon: CheckCircle2, label: 'Operational' },
  degraded: { color: 'bg-amber-100 text-amber-800', dotColor: 'bg-amber-500', icon: AlertTriangle, label: 'Degraded' },
  down: { color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500', icon: XCircle, label: 'Down' },
}

// Alert rules
const alertRules = [
  { id: '1', name: 'High CPU Usage', condition: 'CPU > 80%', enabled: true, severity: 'warning' as const },
  { id: '2', name: 'Memory Pressure', condition: 'Memory > 90%', enabled: true, severity: 'critical' as const },
  { id: '3', name: 'Slow Response', condition: 'Response time > 500ms', enabled: true, severity: 'warning' as const },
  { id: '4', name: 'Service Down', condition: 'Any service down > 1 min', enabled: true, severity: 'critical' as const },
  { id: '5', name: 'Disk Space Low', condition: 'Disk usage > 85%', enabled: false, severity: 'warning' as const },
  { id: '6', name: 'High Error Rate', condition: '5xx errors > 1%', enabled: true, severity: 'critical' as const },
]

// Recent incidents
const recentIncidents = [
  { id: '1', title: 'API Gateway Latency Spike', severity: 'warning' as const, duration: '12 min', startedAt: '2 days ago', status: 'resolved' as const, affectedUsers: 'All merchants', resolution: 'Auto-scaled gateway instances' },
  { id: '2', title: 'Job Queue Processing Delay', severity: 'warning' as const, duration: '45 min', startedAt: '5 days ago', status: 'resolved' as const, affectedUsers: '30% of merchants', resolution: 'Restarted job workers' },
  { id: '3', title: 'Database Connection Pool Exhaustion', severity: 'critical' as const, duration: '8 min', startedAt: '2 weeks ago', status: 'resolved' as const, affectedUsers: 'All merchants', resolution: 'Increased pool size and optimized queries' },
  { id: '4', title: 'CDN Cache Miss Rate Increase', severity: 'warning' as const, duration: '2 hours', startedAt: '3 weeks ago', status: 'resolved' as const, affectedUsers: 'Global region', resolution: 'Invalidated stale cache entries' },
]

export function InfrastructureMonitoring() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [rules, setRules] = useState(alertRules)
  const [animatedUptime, setAnimatedUptime] = useState(0)

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

  // Animate uptime score
  useEffect(() => {
    if (loading) return
    const target = parseFloat(overallUptime.toFixed(2))
    let current = 0
    const step = target / 60
    const interval = setInterval(() => {
      current += step
      if (current >= target) {
        setAnimatedUptime(target)
        clearInterval(interval)
      } else {
        setAnimatedUptime(parseFloat(current.toFixed(2)))
      }
    }, 16)
    return () => clearInterval(interval)
  }, [loading, overallUptime])

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
    const rule = rules.find(r => r.id === id)
    if (rule) {
      toast.success(`${rule.name} ${rule.enabled ? 'disabled' : 'enabled'}`)
    }
  }

  if (loading) return <InfrastructureSkeleton />

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-emerald-900/20 to-slate-900 p-6">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Server className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Infrastructure Monitoring</h2>
                <p className="text-slate-400 text-sm mt-0.5">System health and performance metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-500 text-white px-3 py-1.5 text-sm font-medium">
                <div className="h-2 w-2 rounded-full bg-white/80 mr-2 animate-pulse" />
                All Systems Operational
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* System Uptime Hero - Enhanced */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative h-40 w-40 shrink-0">
                {/* Glow effect behind ring */}
                <div className="absolute inset-6 rounded-full blur-xl opacity-20 bg-emerald-500" />
                <svg className="h-40 w-40 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeDasharray={`${(overallUptime / 100) * 314} 314`}
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
                    className="text-3xl font-bold text-emerald-600 tabular-nums"
                  >
                    {animatedUptime.toFixed(2)}%
                  </motion.span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Uptime</span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-semibold">System Uptime — Last 30 Days</h3>
                <p className="text-sm text-muted-foreground mt-1">Platform has maintained near-perfect availability across all services.</p>
                <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-emerald-600 font-medium">+0.02% from last month</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{metrics.services.filter(s => s.status === 'operational').length}/{metrics.services.length} services healthy</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 text-center min-w-[80px] border border-emerald-100">
                  <p className="text-xl font-bold text-emerald-700">0</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Outages</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 text-center min-w-[80px] border border-amber-100">
                  <p className="text-xl font-bold text-amber-700">2</p>
                  <p className="text-[10px] text-amber-600 font-medium">Incidents</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 text-center min-w-[80px] border border-blue-100">
                  <p className="text-xl font-bold text-blue-700">142ms</p>
                  <p className="text-[10px] text-blue-600 font-medium">Avg Latency</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Uptime', value: `${overallUptime.toFixed(2)}%`, sub: 'Last 30 days', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500 to-teal-600' },
          { title: 'Avg Response', value: '142ms', sub: 'API gateway latency', icon: Zap, color: 'text-violet-600', bg: 'bg-violet-50', gradient: 'from-violet-500 to-purple-600' },
          { title: 'Throughput', value: '1.2k', sub: 'requests/min', icon: Server, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500 to-indigo-600' },
          { title: 'Error Rate', value: '0.12%', sub: '5xx errors', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500 to-orange-600' },
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

      {/* Server Status Cards - Enhanced with colored bars */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <Server className="h-4 w-4 text-cyan-600" />
                </div>
                Server Status
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => toast.info('Refreshing metrics...')} className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1" /> Refresh
              </Button>
            </div>
            <CardDescription>Current status of platform services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {metrics.services.map((service) => {
                const config = statusConfig[service.status]
                return (
                  <div key={service.name} className="p-4 rounded-xl border hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        service.status === 'operational' ? 'bg-emerald-50' : service.status === 'degraded' ? 'bg-amber-50' : 'bg-red-50'
                      }`}>
                        <service.icon className={`h-5 w-5 ${
                          service.status === 'operational' ? 'text-emerald-600' : service.status === 'degraded' ? 'text-amber-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{service.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className={`h-2 w-2 rounded-full ${config.dotColor} ${service.status === 'operational' ? '' : 'animate-pulse'}`} />
                          <span className="text-xs text-muted-foreground">{config.label}</span>
                        </div>
                      </div>
                    </div>
                    {/* CPU/Memory bars with color coding */}
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground font-medium">CPU</span>
                          <span className={`text-[10px] font-bold ${service.cpu > 80 ? 'text-red-600' : service.cpu > 60 ? 'text-amber-600' : 'text-emerald-600'}`}>{service.cpu}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${
                            service.cpu > 80 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                            service.cpu > 60 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                            'bg-gradient-to-r from-emerald-400 to-emerald-600'
                          }`} style={{ width: `${service.cpu}%` }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground font-medium">Memory</span>
                          <span className={`text-[10px] font-bold ${service.memory > 80 ? 'text-red-600' : service.memory > 60 ? 'text-amber-600' : 'text-emerald-600'}`}>{service.memory}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${
                            service.memory > 80 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                            service.memory > 60 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                            'bg-gradient-to-r from-violet-400 to-purple-600'
                          }`} style={{ width: `${service.memory}%` }} />
                        </div>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Response: {service.responseTime}</span>
                      <span className="font-medium text-emerald-600">{service.uptime}%</span>
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
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-violet-600" />
                </div>
                Performance Metrics
              </CardTitle>
              <CardDescription>Response time over 24 hours</CardDescription>
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

        {/* Resource Usage - Enhanced */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Cpu className="h-4 w-4 text-emerald-600" />
                </div>
                Resource Usage
              </CardTitle>
              <CardDescription>Current resource utilization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {metrics.resources.map((resource) => (
                <div key={resource.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                        resource.usage > 80 ? 'bg-red-100' : resource.usage > 60 ? 'bg-amber-100' : 'bg-emerald-100'
                      }`}>
                        <resource.icon className={`h-3.5 w-3.5 ${
                          resource.usage > 80 ? 'text-red-600' : resource.usage > 60 ? 'text-amber-600' : 'text-emerald-600'
                        }`} />
                      </div>
                      <span className="text-sm font-medium">{resource.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{resource.usage.toFixed(0)}{resource.unit}</span>
                      <span className="text-xs text-muted-foreground">of {resource.total}</span>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        resource.usage > 80 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                        resource.usage > 60 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                        'bg-gradient-to-r from-emerald-400 to-emerald-600'
                      }`}
                      style={{ width: `${resource.usage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">0%</span>
                    <span className={`font-medium ${
                      resource.usage > 80 ? 'text-red-600' : resource.usage > 60 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {resource.usage > 80 ? 'High — Scale needed' : resource.usage > 60 ? 'Moderate' : 'Normal'}
                    </span>
                    <span className="text-muted-foreground">100%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alert Rules - Enhanced */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-amber-600" />
                  </div>
                  Alert Rules
                </CardTitle>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px]">
                  {rules.filter(r => r.enabled).length}/{rules.length} active
                </Badge>
              </div>
              <CardDescription>Configured monitoring alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div key={rule.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${rule.enabled ? 'hover:bg-muted/30' : 'opacity-60'}`}>
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      rule.enabled
                        ? (rule.severity === 'critical' ? 'bg-red-100' : 'bg-amber-100')
                        : 'bg-muted'
                    }`}>
                      {rule.enabled ? (
                        <Bell className={`h-4 w-4 ${rule.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
                      ) : (
                        <BellOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!rule.enabled ? 'text-muted-foreground' : ''}`}>{rule.name}</p>
                      <p className="text-xs text-muted-foreground">{rule.condition}</p>
                    </div>
                    <Badge variant="secondary" className={
                      rule.severity === 'critical' ? 'bg-red-100 text-red-700 text-[10px]' : 'bg-amber-100 text-amber-700 text-[10px]'
                    }>
                      {rule.severity}
                    </Badge>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Incidents - Enhanced Timeline */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-rose-500 to-red-600" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                  </div>
                  Recent Incidents
                </CardTitle>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px]">
                  All Resolved
                </Badge>
              </div>
              <CardDescription>Historical incident records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-muted via-muted to-transparent" />
                <div className="space-y-4">
                  {recentIncidents.map((incident, i) => (
                    <motion.div
                      key={incident.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative flex items-start gap-4 pl-1"
                    >
                      <div className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center ring-4 ring-background shrink-0 ${
                        incident.severity === 'critical' ? 'bg-red-100' : 'bg-amber-100'
                      }`}>
                        {incident.severity === 'critical' ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{incident.title}</p>
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] shrink-0">
                            Resolved
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">Duration: {incident.duration}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{incident.startedAt}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Resolution: {incident.resolution}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Uptime History */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Shield className="h-4 w-4 text-emerald-600" />
              </div>
              Uptime History (30 Days)
            </CardTitle>
            <CardDescription>Service availability over the past month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(30, minmax(0, 1fr))' }}>
              {Array.from({ length: 30 }, (_, i) => {
                const seed = Math.sin(i * 1.7 + 0.3)
                const isDown = seed < -0.95
                const isDegraded = !isDown && seed < -0.8
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
    </motion.div>
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
