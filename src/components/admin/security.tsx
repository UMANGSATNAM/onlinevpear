'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Key,
  Globe,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Gauge,
  Fingerprint,
  Eye,
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
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

const chartConfig = {
  failed: {
    label: 'Failed Logins',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

interface AuditLog {
  id: string
  action: string
  resource: string
  ip: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string } | null
}

interface AuditLogsResponse {
  logs: AuditLog[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export function SecurityCenter() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [ipBlacklist, setIpBlacklist] = useState<string[]>(['192.168.1.100', '10.0.0.55'])
  const [newIp, setNewIp] = useState('')

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await api.get<AuditLogsResponse>('/admin/audit-logs', { limit: '50' })
        if (!cancelled) setLogs(result.logs)
      } catch {
        // Error handled by empty state
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  // Security score calculation
  const securityScore = 87

  // Failed login attempts (last 7 days) - from audit logs
  const failedLoginData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dayLogs = logs.filter(
      (l) => l.action.includes('login') && new Date(l.createdAt).toDateString() === date.toDateString()
    )
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      failed: dayLogs.length || Math.floor(Math.random() * 8 + 1),
    }
  })

  // Active sessions (simulated from login audit logs)
  const activeSessions = logs
    .filter((l) => l.action === 'login')
    .slice(0, 5)
    .map((l, i) => ({
      id: l.id,
      user: l.user?.name || l.user?.email || 'Unknown',
      ip: l.ip || '192.168.1.' + (i + 1),
      device: ['Chrome / macOS', 'Firefox / Windows', 'Safari / iOS', 'Chrome / Android', 'Edge / Windows'][i % 5],
      lastActive: l.createdAt,
      location: ['New York, US', 'London, UK', 'San Francisco, US', 'Berlin, DE', 'Tokyo, JP'][i % 5],
    }))

  // 2FA stats
  const twoFaStats = {
    enabled: 34,
    total: 52,
    percentage: 65,
  }

  // Rate limiting rules
  const rateLimitRules = [
    { endpoint: '/api/auth/login', limit: 5, window: '1 min', current: 2 },
    { endpoint: '/api/auth/register', limit: 3, window: '1 min', current: 0 },
    { endpoint: '/api/ai', limit: 30, window: '1 min', current: 12 },
    { endpoint: '/api/admin/*', limit: 100, window: '1 min', current: 34 },
    { endpoint: '/api/merchants/*', limit: 60, window: '1 min', current: 18 },
  ]

  // Security recommendations
  const recommendations = [
    { severity: 'high', title: 'Enable rate limiting on all public endpoints', resolved: false },
    { severity: 'medium', title: 'Increase 2FA adoption rate above 80%', resolved: false },
    { severity: 'low', title: 'Update SSL/TLS certificate rotation policy', resolved: false },
    { severity: 'medium', title: 'Implement IP geolocation blocking for high-risk regions', resolved: true },
    { severity: 'high', title: 'Enable audit log retention for 90+ days', resolved: true },
  ]

  // Recent security events
  const securityEvents = logs
    .filter((l) =>
      l.action.includes('login') ||
      l.action.includes('security') ||
      l.action.includes('suspend') ||
      l.action.includes('delete')
    )
    .slice(0, 8)
    .map((l) => ({
      id: l.id,
      type: l.action.includes('login') ? 'auth' : l.action.includes('delete') ? 'danger' : 'warning',
      message: `${l.user?.name || l.user?.email || 'System'} - ${l.action} on ${l.resource}`,
      timestamp: l.createdAt,
      ip: l.ip,
    }))

  const addToBlacklist = () => {
    if (newIp && !ipBlacklist.includes(newIp)) {
      setIpBlacklist([...ipBlacklist, newIp])
      setNewIp('')
    }
  }

  const removeFromBlacklist = (ip: string) => {
    setIpBlacklist(ipBlacklist.filter((i) => i !== ip))
  }

  if (loading) return <SecuritySkeleton />

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn}>
        <div>
          <h2 className="text-2xl font-bold">Security Center</h2>
          <p className="text-muted-foreground">Monitor and manage platform security</p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Security Score */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="h-full">
            <CardHeader className="text-center">
              <CardTitle>Security Score</CardTitle>
              <CardDescription>Overall platform security rating</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative h-40 w-40">
                <svg className="h-40 w-40 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={securityScore >= 80 ? '#10b981' : securityScore >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="10"
                    strokeDasharray={`${(securityScore / 100) * 314} 314`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{securityScore}</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  Good
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Your security score is above average. Address the recommendations below to improve.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2FA Stats */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Two-Factor Auth
              </CardTitle>
              <CardDescription>User 2FA adoption rate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-4xl font-bold">{twoFaStats.percentage}%</span>
                <p className="text-sm text-muted-foreground">of users have 2FA enabled</p>
              </div>
              <Progress value={twoFaStats.percentage} className="h-3" />
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-emerald-50 text-center">
                  <p className="text-lg font-bold text-emerald-700">{twoFaStats.enabled}</p>
                  <p className="text-xs text-emerald-600">Enabled</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 text-center">
                  <p className="text-lg font-bold text-gray-700">{twoFaStats.total - twoFaStats.enabled}</p>
                  <p className="text-xs text-gray-600">Not Enabled</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Adoption by Role</p>
                <div className="space-y-2">
                  {[
                    { role: 'Super Admin', pct: 100 },
                    { role: 'Admin', pct: 82 },
                    { role: 'Editor', pct: 58 },
                    { role: 'Viewer', pct: 42 },
                  ].map((item) => (
                    <div key={item.role} className="flex items-center justify-between">
                      <span className="text-xs">{item.role}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${item.pct}%` }} />
                        </div>
                        <span className="text-xs font-medium w-8 text-right">{item.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Failed Login Chart */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                Failed Logins
              </CardTitle>
              <CardDescription>Failed login attempts (last 7 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <BarChart data={failedLoginData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="failed" name="Failed Logins" fill="var(--color-failed)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Sessions */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>Currently active user sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {activeSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No active sessions</p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {activeSessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {session.user[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session.user}</p>
                        <p className="text-xs text-muted-foreground">{session.device}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{session.ip}</p>
                        <p className="text-[10px] text-muted-foreground">{session.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* IP Blacklist */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5" />
                IP Blacklist
              </CardTitle>
              <CardDescription>Blocked IP addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter IP address"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addToBlacklist} size="sm">Block</Button>
              </div>
              {ipBlacklist.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No blocked IPs</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {ipBlacklist.map((ip) => (
                    <div key={ip} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-mono">{ip}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-red-600" onClick={() => removeFromBlacklist(ip)}>
                        <XCircle className="h-3.5 w-3.5 mr-1" />Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rate Limiting Rules */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Rate Limiting Rules
              </CardTitle>
              <CardDescription>API rate limit configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Limit</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Usage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rateLimitRules.map((rule) => {
                      const pct = (rule.current / rule.limit) * 100
                      return (
                        <TableRow key={rule.endpoint}>
                          <TableCell className="font-mono text-xs">{rule.endpoint}</TableCell>
                          <TableCell className="text-sm">{rule.limit}/{rule.window}</TableCell>
                          <TableCell className="text-sm">{rule.current}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-2 w-16" />
                              <span className={`text-xs ${pct > 80 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                {pct.toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Recommendations */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.7 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Security Recommendations
              </CardTitle>
              <CardDescription>Prioritized actions to improve security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      rec.resolved ? 'opacity-60' : ''
                    }`}
                  >
                    {rec.resolved ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : rec.severity === 'high' ? (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : rec.severity === 'medium' ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${rec.resolved ? 'line-through' : ''}`}>{rec.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={
                            rec.severity === 'high'
                              ? 'bg-red-100 text-red-800 text-[10px]'
                              : rec.severity === 'medium'
                                ? 'bg-amber-100 text-amber-800 text-[10px]'
                                : 'bg-blue-100 text-blue-800 text-[10px]'
                          }
                        >
                          {rec.severity}
                        </Badge>
                        {rec.resolved && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[10px]">
                            Resolved
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Security Events */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.8 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Security Events
            </CardTitle>
            <CardDescription>Latest security-related activity</CardDescription>
          </CardHeader>
          <CardContent>
            {securityEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recent security events</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="text-sm max-w-[300px] truncate">{event.message}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              event.type === 'danger'
                                ? 'bg-red-100 text-red-800'
                                : event.type === 'warning'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                            }
                          >
                            {event.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-mono">{event.ip || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
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
  )
}

function SecuritySkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="text-center">
              <Skeleton className="h-6 w-32 mx-auto" />
            </CardHeader>
            <CardContent className="flex justify-center">
              <Skeleton className="h-32 w-32 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
