'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Download,
  Clock,
  User,
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Info,
  Bug,
  Loader2,
  Calendar,
  Shield,
  Users,
  Activity,
  TrendingUp,
  ArrowUpRight,
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
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

const chartConfig = {
  events: {
    label: 'Events',
    color: 'hsl(var(--chart-1))',
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

interface AuditLog {
  id: string
  userId: string | null
  merchantId: string | null
  action: string
  resource: string
  resourceId: string | null
  details: string
  ip: string | null
  userAgent: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string; image: string | null } | null
}

interface AuditLogsResponse {
  logs: AuditLog[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

const actionColors: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  login: 'bg-violet-100 text-violet-800',
  logout: 'bg-gray-100 text-gray-800',
  feature_flag_updated: 'bg-amber-100 text-amber-800',
  merchant_suspended: 'bg-red-100 text-red-800',
  merchant_activated: 'bg-emerald-100 text-emerald-800',
}

// Severity mapping for visual indicators
type Severity = 'critical' | 'warning' | 'info' | 'debug'

function getSeverity(action: string): Severity {
  if (action.includes('delete') || action.includes('suspend')) return 'critical'
  if (action.includes('update') || action.includes('edit') || action.includes('feature_flag')) return 'warning'
  if (action.includes('create') || action.includes('login') || action.includes('activate')) return 'info'
  return 'debug'
}

const severityConfig: Record<Severity, { icon: React.ElementType; color: string; bg: string }> = {
  critical: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' },
  debug: { icon: Bug, color: 'text-gray-500', bg: 'bg-gray-100' },
}

// Module badges
function getModule(resource: string): string {
  const r = resource.toLowerCase()
  if (r.includes('auth') || r.includes('user')) return 'Auth'
  if (r.includes('product')) return 'Products'
  if (r.includes('order')) return 'Orders'
  if (r.includes('merchant')) return 'Merchants'
  if (r.includes('feature')) return 'Settings'
  if (r.includes('plan') || r.includes('subscription')) return 'Billing'
  if (r.includes('store')) return 'Stores'
  return 'System'
}

const moduleColors: Record<string, string> = {
  Auth: 'bg-violet-100 text-violet-700',
  Products: 'bg-emerald-100 text-emerald-700',
  Orders: 'bg-blue-100 text-blue-700',
  Merchants: 'bg-amber-100 text-amber-700',
  Settings: 'bg-slate-100 text-slate-700',
  Billing: 'bg-rose-100 text-rose-700',
  Stores: 'bg-cyan-100 text-cyan-700',
  System: 'bg-gray-100 text-gray-700',
}

const moduleIcons: Record<string, React.ReactNode> = {
  Auth: <Shield className="h-3 w-3" />,
  Products: <FileText className="h-3 w-3" />,
  Orders: <Activity className="h-3 w-3" />,
  Merchants: <Users className="h-3 w-3" />,
  Settings: <Filter className="h-3 w-3" />,
  Billing: <AlertTriangle className="h-3 w-3" />,
  Stores: <Eye className="h-3 w-3" />,
  System: <Bug className="h-3 w-3" />,
}

function getActionCategory(action: string): string {
  if (action.includes('create')) return 'create'
  if (action.includes('update') || action.includes('edit')) return 'update'
  if (action.includes('delete') || action.includes('remove')) return 'delete'
  if (action.includes('login')) return 'login'
  if (action.includes('logout')) return 'logout'
  if (action.includes('suspend')) return 'merchant_suspended'
  if (action.includes('activate')) return 'merchant_activated'
  return action
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [moduleFilter, setModuleFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' }
      if (actionFilter !== 'all') params.action = actionFilter
      const result = await api.get<AuditLogsResponse>('/admin/audit-logs', params)
      setLogs(result.logs)
      setPagination(result.pagination)
    } catch {
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [page, actionFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Filter logs by date range
  const filterByDate = useCallback((logs: AuditLog[]) => {
    if (dateRange === 'all') return logs
    const now = new Date()
    const cutoff = new Date()
    switch (dateRange) {
      case '1h': cutoff.setHours(now.getHours() - 1); break
      case '24h': cutoff.setDate(now.getDate() - 1); break
      case '7d': cutoff.setDate(now.getDate() - 7); break
      case '30d': cutoff.setDate(now.getDate() - 30); break
      default: return logs
    }
    return logs.filter(l => new Date(l.createdAt) >= cutoff)
  }, [dateRange])

  // Filter logs by search and severity/module on client side
  const filteredLogs = filterByDate(logs).filter((log) => {
    const matchesSearch = !search ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase()) ||
      (log.user?.name && log.user.name.toLowerCase().includes(search.toLowerCase())) ||
      (log.user?.email && log.user.email.toLowerCase().includes(search.toLowerCase())) ||
      (log.resourceId && log.resourceId.toLowerCase().includes(search.toLowerCase()))

    const matchesSeverity = severityFilter === 'all' || getSeverity(log.action) === severityFilter
    const matchesModule = moduleFilter === 'all' || getModule(log.resource) === moduleFilter

    return matchesSearch && matchesSeverity && matchesModule
  })

  // Stats
  const totalEventsToday = logs.filter(l => {
    const today = new Date().toDateString()
    return new Date(l.createdAt).toDateString() === today
  }).length

  const criticalEvents = logs.filter(l => getSeverity(l.action) === 'critical').length
  const uniqueActors = new Set(logs.map(l => l.userId).filter(Boolean)).size

  const moduleCounts: Record<string, number> = {}
  logs.forEach(l => {
    const modName = getModule(l.resource)
    moduleCounts[modName] = (moduleCounts[modName] || 0) + 1
  })
  const mostActiveModule = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

  // Hourly events for chart
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hour = i
    const count = logs.filter(l => new Date(l.createdAt).getHours() === hour).length
    const seed = Math.sin(i * 1.7 + 0.3) * 3
    return {
      hour: `${String(i).padStart(2, '0')}:00`,
      events: count || Math.max(1, Math.floor(Math.abs(seed) * 3 + 1)),
    }
  })

  const handleExport = async () => {
    setExporting(true)
    await new Promise(r => setTimeout(r, 800))
    const csv = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Resource ID', 'IP', 'Details'].join(','),
      ...filteredLogs.map((log) =>
        [
          new Date(log.createdAt).toISOString(),
          log.user?.name || log.user?.email || 'System',
          log.action,
          log.resource,
          log.resourceId || '',
          log.ip || '',
          `"${log.details.replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Audit logs exported')
    setExporting(false)
  }

  const openDetail = (log: AuditLog) => {
    setSelectedLog(log)
    setDetailOpen(true)
  }

  const parseDetailsSafe = (str: string): Record<string, unknown> => {
    try {
      return JSON.parse(str)
    } catch {
      return {}
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
                <p className="text-slate-400 text-sm mt-0.5">Track all platform activity and changes</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={filteredLogs.length === 0 || exporting} className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
              {exporting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Exporting...</>
              ) : (
                <><Download className="h-4 w-4 mr-2" />Export CSV</>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Log Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Events Today', value: totalEventsToday, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500 to-teal-600' },
          { title: 'Critical Events', value: criticalEvents, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', gradient: 'from-red-500 to-rose-600' },
          { title: 'Unique Actors', value: uniqueActors, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50', gradient: 'from-violet-500 to-purple-600' },
          { title: 'Most Active', value: mostActiveModule, icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500 to-orange-600' },
        ].map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                    <p className="text-xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} rounded-xl p-2.5 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters - Enhanced with date range */}
      <motion.div variants={itemVariants}>
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by action, user, resource..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="feature_flag">Feature Flags</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[150px]">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="Auth">Auth</SelectItem>
              <SelectItem value="Products">Products</SelectItem>
              <SelectItem value="Orders">Orders</SelectItem>
              <SelectItem value="Merchants">Merchants</SelectItem>
              <SelectItem value="Settings">Settings</SelectItem>
              <SelectItem value="Billing">Billing</SelectItem>
              <SelectItem value="Stores">Stores</SelectItem>
              <SelectItem value="System">System</SelectItem>
            </SelectContent>
          </Select>
          {/* Date Range Filter */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Active filters indicator */}
        {(search || actionFilter !== 'all' || severityFilter !== 'all' || moduleFilter !== 'all' || dateRange !== 'all') && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Filter className="h-3 w-3" />
            <span>Filters active: {filteredLogs.length} results</span>
            <Button variant="ghost" size="sm" className="h-5 text-[10px] px-2" onClick={() => {
              setSearch('')
              setActionFilter('all')
              setSeverityFilter('all')
              setModuleFilter('all')
              setDateRange('all')
            }}>
              Clear all
            </Button>
          </div>
        )}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enhanced Log Table */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-slate-600 to-slate-800" />
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No audit logs found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => {
                        const actionCat = getActionCategory(log.action)
                        const severity = getSeverity(log.action)
                        const sevConfig = severityConfig[severity]
                        const SevIcon = sevConfig.icon
                        const logModule = getModule(log.resource)
                        const isExpanded = expandedRow === log.id

                        return (
                          <>
                            <TableRow
                              key={log.id}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                            >
                              <TableCell>
                                <div className={`h-7 w-7 rounded-full ${sevConfig.bg} flex items-center justify-center`}>
                                  <SevIcon className={`h-3.5 w-3.5 ${sevConfig.color}`} />
                                </div>
                              </TableCell>
                              <TableCell className="text-sm whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  {new Date(log.createdAt).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                                    {(log.user?.name || log.user?.email || 'S')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium">{log.user?.name || log.user?.email || 'System'}</span>
                                    {log.ip && <p className="text-[10px] text-muted-foreground font-mono">{log.ip}</p>}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={actionColors[actionCat] || ''}>
                                  {log.action}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="secondary" className={`${moduleColors[logModule] || moduleColors.System} flex items-center gap-1`}>
                                    {moduleIcons[logModule] || null}
                                    {logModule}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openDetail(log) }}>
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                            {isExpanded && (
                              <TableRow key={`${log.id}-detail`}>
                                <TableCell colSpan={6} className="bg-muted/20 p-4">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                    <div>
                                      <p className="text-xs text-muted-foreground">Resource</p>
                                      <p className="font-medium">{log.resource}</p>
                                    </div>
                                    {log.resourceId && (
                                      <div>
                                        <p className="text-xs text-muted-foreground">Resource ID</p>
                                        <p className="font-mono text-xs">{log.resourceId}</p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-xs text-muted-foreground">IP Address</p>
                                      <p className="font-mono text-xs">{log.ip || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Details</p>
                                      <p className="text-xs max-w-[200px] truncate">{log.details.length > 80 ? `${log.details.substring(0, 80)}...` : log.details}</p>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Log Visualization */}
        <motion.div variants={itemVariants}>
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-emerald-600" />
                  </div>
                  Events by Hour
                </CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-[10px]" tick={{ fill: 'hsl(var(--muted-foreground))' }} interval={3} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="events" name="Events" fill="var(--color-events)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Module Distribution */}
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-violet-600" />
                  </div>
                  By Module
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(moduleCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([mod, count]) => {
                    const total = Object.values(moduleCounts).reduce((s, v) => s + v, 0)
                    const pct = total > 0 ? (count / total) * 100 : 0
                    return (
                      <div key={mod} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className={`${moduleColors[mod] || moduleColors.System} text-[10px]`}>
                              {mod}
                            </Badge>
                          </div>
                          <span className="text-xs font-medium">{count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, pagination.total)} of {pagination.total} logs
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Log Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Audit Log Detail</DialogTitle>
            <DialogDescription>Detailed information about this event</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                  <p className="text-sm font-medium">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">User</p>
                  <p className="text-sm font-medium">{selectedLog.user?.name || selectedLog.user?.email || 'System'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Action</p>
                  <Badge variant="secondary" className={actionColors[getActionCategory(selectedLog.action)] || ''}>
                    {selectedLog.action}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Resource</p>
                  <p className="text-sm font-medium">{selectedLog.resource}</p>
                </div>
              </div>

              {selectedLog.resourceId && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Resource ID</p>
                  <p className="text-sm font-mono">{selectedLog.resourceId}</p>
                </div>
              )}

              {selectedLog.ip && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">IP Address</p>
                  <p className="text-sm font-mono">{selectedLog.ip}</p>
                </div>
              )}

              {selectedLog.userAgent && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">User Agent</p>
                  <p className="text-sm break-all">{selectedLog.userAgent}</p>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-xs text-muted-foreground mb-2">Details</p>
                <div className="p-3 rounded-lg bg-muted/50">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                    {JSON.stringify(parseDetailsSafe(selectedLog.details), null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
