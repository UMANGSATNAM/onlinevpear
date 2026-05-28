'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  CreditCard,
  FileText,
  ArrowUpRight,
  Clock,
  AlertCircle,
  Zap,
  Shield,
  HardDrive,
  Wifi,
  Users,
  Star,
  Sparkles,
  Download,
  Calendar,
  Crown,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

interface Plan {
  id: string
  name: string
  displayName: string
  description: string | null
  price: number
  currency: string
  interval: string
  features: string
  limits: string
  isActive: boolean
  sortOrder: number
  _count: { merchants: number }
}

interface Invoice {
  id: string
  amount: number
  currency: string
  status: string
  invoiceNumber: string
  dueDate: string
  paidAt: string | null
  lineItems: string
  createdAt: string
  subscription: {
    plan: { id: string; name: string; displayName: string }
  } | null
}

interface BillingData {
  invoices: Invoice[]
  summary: {
    totalBilled: number
    totalPaid: number
    totalPending: number
    totalOverdue: number
  }
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

const invoiceStatusColors: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export function BillingSubscription() {
  const { selectedMerchantId, currentUser } = useAppStore()
  const [plans, setPlans] = useState<Plan[]>([])
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const plansData = await api.get<{ plans: Plan[] }>('/plans')
        setPlans(plansData.plans)
      } catch {
        // ignore
      }

      if (selectedMerchantId) {
        try {
          const data = await api.get<BillingData>('/billing', { merchantId: selectedMerchantId })
          setBillingData(data)
        } catch {
          // ignore
        }
      }
      setLoading(false)
    }
    loadData()
  }, [selectedMerchantId])

  const handlePlanChange = (planId: string) => {
    setCurrentPlanId(planId)
    toast.success('Plan change requested! This would redirect to a payment flow.')
  }

  const parseFeatures = (featuresStr: string): string[] => {
    try {
      return JSON.parse(featuresStr || '[]')
    } catch {
      return []
    }
  }

  const parseLimits = (limitsStr: string): Record<string, number | string> => {
    try {
      return JSON.parse(limitsStr || '{}')
    } catch {
      return {}
    }
  }

  const currentPlan = plans.find((p) => p.id === currentPlanId)
  const highestPlan = plans.length > 0 ? plans[plans.length - 1] : null
  const isHighestPlan = currentPlanId === highestPlan?.id

  // Mock usage data (would come from API in production)
  const usageMeters = useMemo(() => {
    const limits = currentPlan ? parseLimits(currentPlan.limits) : {}
    return [
      { label: 'Products', used: 12, limit: typeof limits.maxProducts === 'number' ? limits.maxProducts : 50, icon: HardDrive, color: 'text-emerald-600', barColor: '[&>div]:bg-emerald-500' },
      { label: 'Staff Accounts', used: 3, limit: typeof limits.maxStaff === 'number' ? limits.maxStaff : 5, icon: Users, color: 'text-violet-600', barColor: '[&>div]:bg-violet-500' },
      { label: 'Storage', used: 2.4, limit: typeof limits.maxStorage === 'number' ? limits.maxStorage : 5, unit: 'GB', icon: HardDrive, color: 'text-sky-600', barColor: '[&>div]:bg-sky-500' },
      { label: 'Bandwidth', used: 15, limit: typeof limits.maxBandwidth === 'number' ? limits.maxBandwidth : 50, unit: 'GB', icon: Wifi, color: 'text-amber-600', barColor: '[&>div]:bg-amber-500' },
    ]
  }, [currentPlan])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold">Billing & Subscription</h2>
        <p className="text-sm text-muted-foreground">Manage your subscription and invoices</p>
      </motion.div>

      {/* Current Plan Card */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)' }} />
          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
                  <Crown className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{currentPlan?.displayName || 'Free Trial'}</h3>
                    {currentPlan && (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Active</Badge>
                    )}
                  </div>
                  <p className="text-slate-300 mt-1">
                    {currentPlan ? `$${currentPlan.price}/${currentPlan.interval === 'monthly' ? 'mo' : 'yr'}` : 'No active subscription'}
                  </p>
                  {currentPlan?.description && (
                    <p className="text-slate-400 text-sm mt-1">{currentPlan.description}</p>
                  )}
                </div>
              </div>

              {/* Billing Summary */}
              {billingData && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-400">Total Billed</p>
                    <p className="font-semibold text-white">${billingData.summary.totalBilled.toFixed(2)}</p>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-400">Paid</p>
                    <p className="font-semibold text-emerald-400">${billingData.summary.totalPaid.toFixed(2)}</p>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-400">Pending</p>
                    <p className="font-semibold text-amber-400">${billingData.summary.totalPending.toFixed(2)}</p>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-400">Overdue</p>
                    <p className="font-semibold text-red-400">${billingData.summary.totalOverdue.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Usage Meters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Plan Usage
            </CardTitle>
            <CardDescription>Current resource utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              {usageMeters.map((meter) => {
                const pct = meter.limit > 0 ? Math.min((meter.used / meter.limit) * 100, 100) : 0
                const isWarning = pct >= 80
                const isCritical = pct >= 95
                return (
                  <div key={meter.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <meter.icon className={`h-4 w-4 ${meter.color}`} />
                        <span className="text-sm font-medium">{meter.label}</span>
                      </div>
                      <span className={`text-sm font-semibold ${isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-foreground'}`}>
                        {meter.used}{meter.unit ? ` ${meter.unit}` : ''} / {meter.limit}{meter.unit ? ` ${meter.unit}` : ''}
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      className={`h-2.5 ${isCritical ? '[&>div]:bg-red-500' : isWarning ? '[&>div]:bg-amber-500' : meter.barColor}`}
                    />
                    {isCritical && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Limit almost reached
                      </p>
                    )}
                    {isWarning && !isCritical && (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Approaching limit
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Method Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Method
              </CardTitle>
              <Button variant="outline" size="sm">Update</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-5 text-white max-w-sm">
              {/* Card decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-12 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                      <span className="text-[10px] font-bold tracking-widest">VISA</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-6 w-6 rounded-full bg-red-500/80" />
                    <div className="h-6 w-6 rounded-full bg-yellow-500/60 -ml-3" />
                  </div>
                </div>
                <p className="font-mono text-lg tracking-[0.25em] mb-4">•••• •••• •••• 4242</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Card Holder</p>
                    <p className="text-sm font-medium">{currentUser?.name || 'Merchant User'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Expires</p>
                    <p className="text-sm font-medium">12/27</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Comparison */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Available Plans</h3>
          {!isHighestPlan && (
            <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              Upgrade Available
            </Badge>
          )}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const isCurrentPlan = plan.id === currentPlanId
            const isPopular = i === 1 // Middle plan is popular
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className={`h-full relative ${isPopular ? 'border-primary shadow-md' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''} transition-shadow duration-300 hover:shadow-lg`}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-bold">{plan.displayName}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/{plan.interval === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                    </div>

                    {/* Features Checklist */}
                    <div className="space-y-2.5 mb-6">
                      {parseFeatures(plan.features).map((feature, fi) => (
                        <div key={fi} className="flex items-center gap-2 text-sm">
                          <div className={`h-5 w-5 rounded-full ${isCurrentPlan ? 'bg-primary/10' : 'bg-emerald-50'} flex items-center justify-center shrink-0`}>
                            <Check className={`h-3 w-3 ${isCurrentPlan ? 'text-primary' : 'text-emerald-600'}`} />
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? 'secondary' : isPopular ? 'default' : 'outline'}
                      onClick={() => handlePlanChange(plan.id)}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                      {!isCurrentPlan && <ArrowUpRight className="ml-1 h-4 w-4" />}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Upgrade CTA */}
      {!isHighestPlan && highestPlan && (
        <motion.div variants={itemVariants}>
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 overflow-hidden relative">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)' }} />
            <CardContent className="relative p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Unlock {highestPlan.displayName}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Get unlimited products, advanced analytics, priority support, and more.</p>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white shadow-lg whitespace-nowrap"
                    onClick={() => handlePlanChange(highestPlan.id)}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade Now — ${highestPlan.price}/mo
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Invoices */}
      {billingData && billingData.invoices.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Invoice History
                </CardTitle>
                <Badge variant="outline" className="text-xs">{billingData.invoices.length} invoices</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Invoice</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Plan</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Date</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Due Date</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingData.invoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-muted/50 transition-colors group">
                        <TableCell className="font-medium text-sm">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="group-hover:text-primary transition-colors">{invoice.invoiceNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {invoice.subscription?.plan.displayName || '—'}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={invoiceStatusColors[invoice.status] || ''}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm">
                          ${invoice.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
