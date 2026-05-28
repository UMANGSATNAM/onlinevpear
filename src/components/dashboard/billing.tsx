'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  CreditCard,
  FileText,
  ArrowUpRight,
  Clock,
  AlertCircle,
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

  const currentPlan = plans.find((p) => p.id === currentPlanId)

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Billing & Subscription</h2>
        <p className="text-sm text-muted-foreground">Manage your subscription and invoices</p>
      </div>

      {/* Current Plan Summary */}
      {billingData && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <h3 className="text-xl font-bold">{currentPlan?.displayName || 'Free Trial'}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentPlan ? `$${currentPlan.price}/${currentPlan.interval}` : 'No active subscription'}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total Billed</p>
                  <p className="font-semibold">${billingData.summary.totalBilled.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="font-semibold text-emerald-600">${billingData.summary.totalPaid.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="font-semibold text-amber-600">${billingData.summary.totalPending.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Overdue</p>
                  <p className="font-semibold text-red-600">${billingData.summary.totalOverdue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
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
              >
                <Card className={`h-full relative ${isPopular ? 'border-primary shadow-md' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
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

                    <div className="space-y-2 mb-6">
                      {parseFeatures(plan.features).map((feature, fi) => (
                        <div key={fi} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
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
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Invoices */}
      {billingData && billingData.invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingData.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {invoice.subscription?.plan.displayName || '—'}
                      </TableCell>
                      <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={invoiceStatusColors[invoice.status] || ''}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${invoice.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
