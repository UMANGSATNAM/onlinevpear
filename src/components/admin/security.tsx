'useuse client'

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
  Scan,
  FileKey,
  ScrollText,
  ShieldQuestion,
  ArrowUpRight,
  TrendingUp,
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
  failed: {
    label: 'Failed Logins',
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
  const [animatedScore, setAnimatedScore] = useState(0)

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

  // Animated security score
  const securityScore = 87
  const scoreColor = securityScore >= 70 ? '#10b981' : securityScore >= 40 ? '#f59e0b' : '#ef4444'

  useEffect(() => {
    if (loading) return
    const timer = setTimeout(() => {
      let current = 0
      const interval = setInterval(() => {
        current += 1
        if (current >= securityScore) {
          setAnimatedScore(securityScore)
          clearInterval(interval)
        } else {
          setAnimatedScore(current)
        }
      }, 15)
      return () => clearInterval(interval)
    }, 300)
    return () => clearTimeout(timer)
  }, [loading, securityScore])

  // Threat level
  const threatLevel = 'Low' as 'Low' | 'Medium' | 'High' | 'Critical'
  const threatConfig = {
    Low: { bg: 'bg-emerald-500', text: 'text-emerald-50', pulse: 'animate-pulse', icon: ShieldCheck, gradient: 'from-emerald-500 to-teal-600' },
    Medium: { bg: 'bg-amber-500', text: 'text-amber-50', pulse: 'animate-pulse', icon: ShieldQuestion, gradient: 'from-amber-500 to-orange-600' },
    High: { bg: 'bg-orange-500', text: 'text-orange-50', pulse: 'animate-pulse', icon: ShieldAlert, gradient: 'from-orange-500 to-red-600' },
    Critical: { bg: 'bg-red-600', text: 'text-red-50', pulse: 'animate-pulse', icon: ShieldAlert, gradient: 'from-red-600 to-rose-700' },
  }

  // Security checklist
  const securityChecklist = [
    { label: 'Two-factor authentication', pass: true, icon: Key, category: 'Authentication' },
    { label: 'SSL certificate', pass: true, icon: Lock, category: 'Encryption' },
    { label: 'Password policy', pass: true, icon: Shield, category: 'Authentication' },
    { label: 'IP whitelist', pass: false, icon: Globe, category: 'Network' },
    { label: 'Rate limiting', pass: true, icon: Gauge, category: 'Network' },
    { label: 'Audit logging', pass: true, icon: ScrollText, category: 'Compliance' },
    { label: 'Data encryption', pass: true, icon: Lock, category: 'Encryption' },
    { label: 'Backup enabled', pass: true, icon: ShieldCheck, category: 'Compliance' },
    { label: 'CORS policy', pass: true, icon: Globe, category: 'Network' },
    { label: 'Session timeout', pass: true, icon: Clock, category: 'Authentication' },
  ]

  const passedCount = securityChecklist.filter(s => s.pass).length

  // Failed login attempts (last 7 days)
  const failedLoginData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dayLogs = logs.filter(
      (l) => l.action.includes('login') && new Date(l.createdAt).toDateString() === date.toDateString()
    )
    const seed = Math.sin(i * 2.7 + 0.5) * 2
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      failed: dayLogs.length || Math.max(1, Math.floor(Math.abs(seed) * 4 + 1)),
    }
  })

  // Active sessions
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

  // Recent security timeline
  const recentTimeline = [
    { id: '1', icon: Key, title: 'API Key Rotated', description: 'Production API key rotated by admin', time: '2 min ago', type: 'info' as const },
    { id: '2', icon: ShieldAlert, title: 'Failed Login Attempt', description: '3 failed attempts from 203.0.113.42', time: '15 min ago', type: 'warning' as const },
    { id: '3', icon: Lock, title: 'Password Changed', description: 'Password updated for merchant@example.com', time: '1 hour ago', type: 'info' as const },
    { id: '4', icon: Shield, title: '2FA Enabled', description: 'Two-factor auth enabled for user john@shop.com', time: '3 hours ago', type: 'success' as const },
    { id: '5', icon: ShieldAlert, title: 'Brute Force Detected', description: 'Multiple failed login attempts from 198.51.100.0/24', time: '6 hours ago', type: 'danger' as const },
    { id: '6', icon: Scan, title: 'Security Audit Completed', description: 'Automated security scan completed with 0 critical findings', time: '12 hours ago', type: 'success' as const },
    { id: '7', icon: Globe, title: 'Suspicious IP Blocked', description: 'IP 203.0.113.42 auto-blocked after threshold exceeded', time: '18 hours ago', type: 'warning' as const },
    { id: '8', icon: ShieldCheck, title: 'SSL Certificate Renewed', description: 'Wildcard certificate renewed for *.shopforge.io', time: '1 day ago', type: 'success' as const },
  ]

  // Quick actions
  const quickActions = [
    { icon: Key, title: 'Enable 2FA', description: 'Enforce two-factor authentication for all users', gradient: 'from-violet-500 to-purple-600' },
    { icon: FileKey, title: 'Reset API Keys', description: 'Rotate all API keys across the platform', gradient: 'from-rose-500 to-pink-600' },
    { icon: ScrollText, title: 'Review Access Logs', description: 'Detailed audit of all access attempts', gradient: 'from-cyan-500 to-teal-600' },
    { icon: Scan, title: 'Run Security Audit', description: 'Full platform security vulnerability scan', gradient: 'from-amber-500 to-orange-600' },
  ]

  const addToBlacklist = () => {
    if (newIp && !ipBlacklist.includes(newIp)) {
      setIpBlacklist([...ipBlacklist, newIp])
      setNewIp('')
      toast.success('IP address blocked')
    }
  }

  const removeFromBlacklist = (ip: string) => {
    setIpBlacklist(ipBlacklist.filter((i) => i !== ip))
    toast.success('IP address removed from blacklist')
  }

  if (loading) return <SecuritySkeleton />

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Page Header with gradient */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Security Center</h2>
                <p className="text-slate-400 text-sm mt-0.5">Monitor and manage platform security</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${threatConfig[threatLevel].bg} ${threatConfig[threatLevel].text} px-3 py-1.5 text-sm font-medium`}>
                <div className={`h-2 w-2 rounded-full bg-white/80 mr-2 ${threatConfig[threatLevel].pulse}`} />
                Threat Level: {threatLevel}
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Threat Level Banner - Enhanced */}
      <motion.div variants={itemVariants}>
        <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${threatConfig[threatLevel].gradient} p-5`}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5" />
          {/* Decorative shield pattern */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
            <Shield className="h-32 w-32 text-white" />
          </div>
          <div className="relative flex items-center gap-4">
            <div className={`h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center ${threatConfig[threatLevel].pulse} backdrop-blur-sm`}>
              {(() => {
                const Icon = threatConfig[threatLevel].icon
                return <Icon className="h-7 w-7 text-white" />
              })()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-lg">Current Threat Level: {threatLevel}</h3>
                <ArrowUpRight className="h-4 w-4 text-white/60" />
              </div>
              <p className="text-white/80 text-sm mt-0.5">No active threats detected. All systems operating within normal security parameters.</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-white/70 text-xs">
                  <Activity className="h-3 w-3" />
                  <span>Last scan: 5 min ago</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/70 text-xs">
                  <Shield className="h-3 w-3" />
                  <span>0 active threats</span>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                <CheckCircle2 className="h-3 w-3 mr-1" /> All Clear
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security Score Hero + 2FA + Failed Logins */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Security Score Hero - Enhanced with animated ring */}
        <motion.div variants={itemVariants}>
          <Card className="h-full overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                Security Score
              </CardTitle>
              <CardDescription>Overall platform security rating</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative h-48 w-48">
                {/* Glow effect behind score ring */}
                <div className="absolute inset-4 rounded-full blur-xl opacity-20" style={{ backgroundColor: scoreColor }} />
                <svg className="h-48 w-48 -rotate-90" viewBox="0 0 120 120">
                  {/* Background track */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                  {/* Score arc with rounded caps */}
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={scoreColor}
                    strokeWidth="10"
                    strokeDasharray={`${(securityScore / 100) * 314} 314`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                    style={{ filter: `drop-shadow(0 0 6px ${scoreColor}40)` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
                    className="text-5xl font-bold tabular-nums"
                    style={{ color: scoreColor }}
                  >
                    {animatedScore}
                  </motion.span>
                  <span className="text-xs text-muted-foreground mt-0.5">/ 100</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  {securityScore >= 80 ? 'Excellent' : securityScore >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center max-w-[200px]">
                Your security score is above average. Address the recommendations below to improve further.
              </p>
              {/* Score breakdown mini-bar */}
              <div className="w-full mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Checklist</span>
                  <span className="font-medium">{passedCount}/{securityChecklist.length} passed</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700" style={{ width: `${(passedCount / securityChecklist.length) * 100}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2FA Stats */}
        <motion.div variants={itemVariants}>
          <Card className="h-full overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Key className="h-4 w-4 text-violet-600" />
                </div>
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
                          <div className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full" style={{ width: `${item.pct}%` }} />
                        </div>
                        <span className="text-xs font-medium w-8 text-right">{item.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="w-full text-xs" onClick={() => toast.info('2FA enforcement initiated')}>
                <Shield className="h-3.5 w-3.5 mr-1.5" /> Enforce 2FA for All Users
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Failed Login Chart */}
        <motion.div variants={itemVariants}>
          <Card className="h-full overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-rose-500 to-red-600" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                </div>
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
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span>12% decrease from last week</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Security Checklist - Enhanced */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-teal-600" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                  </div>
                  Security Checklist
                </CardTitle>
                <CardDescription>
                  {passedCount}/{securityChecklist.length} measures enabled
                </CardDescription>
              </div>
              <Badge variant="secondary" className={`${passedCount === securityChecklist.length ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {passedCount === securityChecklist.length ? 'All Passed' : `${securityChecklist.length - passedCount} issues`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {securityChecklist.map((item) => (
                <div
                  key={item.label}
                  className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm group ${
                    item.pass ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'
                  }`}
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                    item.pass ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    <item.icon className={`h-4 w-4 ${item.pass ? 'text-emerald-600' : 'text-red-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.category}</p>
                  </div>
                  {item.pass ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions - Enhanced */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Shield className="h-4 w-4 text-amber-600" />
              </div>
              Quick Actions
            </CardTitle>
            <CardDescription>One-click security operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <button
                  key={action.title}
                  onClick={() => toast.info(`${action.title} initiated`)}
                  className="group relative overflow-hidden rounded-xl border p-5 text-left hover:shadow-lg transition-all duration-300"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-sm">{action.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 absolute top-3 right-3 group-hover:text-foreground transition-colors" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Sessions */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden h-full">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Fingerprint className="h-4 w-4 text-violet-600" />
                  </div>
                  Active Sessions
                </CardTitle>
                <Badge variant="secondary" className="bg-violet-100 text-violet-700 text-[10px]">
                  {activeSessions.length} active
                </Badge>
              </div>
              <CardDescription>Currently active user sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {activeSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No active sessions</p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {activeSessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors group">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-violet-700 border border-violet-200">
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
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden h-full">
            <div className="h-1 bg-gradient-to-r from-red-500 to-rose-600" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <Ban className="h-4 w-4 text-red-600" />
                  </div>
                  IP Blacklist
                </CardTitle>
                <Badge variant="secondary" className="bg-red-100 text-red-700 text-[10px]">
                  {ipBlacklist.length} blocked
                </Badge>
              </div>
              <CardDescription>Blocked IP addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter IP address"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => { if (e.key === 'Enter') addToBlacklist() }}
                />
                <Button onClick={addToBlacklist} size="sm">Block</Button>
              </div>
              {ipBlacklist.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No blocked IPs</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {ipBlacklist.map((ip) => (
                    <div key={ip} className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/30 transition-colors">
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
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <Gauge className="h-4 w-4 text-cyan-600" />
                </div>
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
                        <TableRow key={rule.endpoint} className="hover:bg-muted/30 transition-colors">
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
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  Security Recommendations
                </CardTitle>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px]">
                  {recommendations.filter(r => !r.resolved).length} open
                </Badge>
              </div>
              <CardDescription>Prioritized actions to improve security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/30 ${
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

      {/* Recent Security Events Timeline */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-slate-600 to-slate-800" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-slate-600" />
                </div>
                Recent Security Events
              </CardTitle>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[10px]">
                Live
              </Badge>
            </div>
            <CardDescription>Latest security-related activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-muted via-muted to-transparent" />
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentTimeline.map((event, i) => {
                  const typeConfig = {
                    info: { bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-200', bar: 'border-l-blue-400' },
                    warning: { bg: 'bg-amber-100', text: 'text-amber-600', ring: 'ring-amber-200', bar: 'border-l-amber-400' },
                    success: { bg: 'bg-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-200', bar: 'border-l-emerald-400' },
                    danger: { bg: 'bg-red-100', text: 'text-red-600', ring: 'ring-red-200', bar: 'border-l-red-400' },
                  }
                  const config = typeConfig[event.type]
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`relative flex items-start gap-4 pl-1 border-l-2 ${config.bar} ml-5 py-1`}
                    >
                      <div className={`absolute -left-[21px] z-10 h-10 w-10 rounded-full ${config.bg} flex items-center justify-center ring-4 ${config.ring} ring-background shrink-0`}>
                        <event.icon className={`h-4 w-4 ${config.text}`} />
                      </div>
                      <div className="flex-1 min-w-0 ml-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{event.title}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{event.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
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
