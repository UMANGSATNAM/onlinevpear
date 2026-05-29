'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  Crown,
  Rocket,
  Building2,
  Edit,
  Users,
  DollarSign,
  Star,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
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
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const PLAN_COLORS = ['#10b981', '#8b5cf6', '#f59e0b']

const planChartConfig = {
  starter: { label: 'Starter', color: '#10b981' },
  professional: { label: 'Professional', color: '#8b5cf6' },
  enterprise: { label: 'Enterprise', color: '#f59e0b' },
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

interface PlansResponse {
  plans: Plan[]
}

const planIcons: Record<string, React.ReactNode> = {
  starter: <Rocket className="h-6 w-6" />,
  professional: <Crown className="h-6 w-6" />,
  enterprise: <Building2 className="h-6 w-6" />,
}

const planColors: Record<string, { icon: string; border: string; bg: string }> = {
  starter: { icon: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50' },
  professional: { icon: 'text-violet-600', border: 'border-violet-200', bg: 'bg-violet-50' },
  enterprise: { icon: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50' },
}

export function PlanControl() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editPlan, setEditPlan] = useState<Plan | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    price: 0,
    displayName: '',
    description: '',
    features: '',
    limits: '',
    isActive: true,
  })

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.get<PlansResponse>('/plans')
      setPlans(result.plans)
    } catch {
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const openEditDialog = (plan: Plan) => {
    setEditPlan(plan)
    setEditForm({
      price: plan.price,
      displayName: plan.displayName,
      description: plan.description || '',
      features: plan.features,
      limits: plan.limits,
      isActive: plan.isActive,
    })
    setEditDialogOpen(true)
  }

  const handleSavePlan = async () => {
    if (!editPlan) return
    try {
      await api.put(`/merchants/${editPlan.id}`, {
        price: editForm.price,
        displayName: editForm.displayName,
        description: editForm.description,
        features: editForm.features,
        limits: editForm.limits,
        isActive: editForm.isActive,
      })
      toast.success('Plan updated successfully')
      setEditDialogOpen(false)
      fetchPlans()
    } catch {
      toast.error('Failed to update plan')
    }
  }

  const parseJsonSafe = (str: string): string[] => {
    try {
      return JSON.parse(str)
    } catch {
      return []
    }
  }

  // Distribution data for donut chart
  const distributionData = plans.map((plan, i) => ({
    name: plan.displayName,
    value: plan._count.merchants,
    color: PLAN_COLORS[i % PLAN_COLORS.length],
  }))

  // Revenue data for bar chart
  const revenueData = plans.map((plan, i) => ({
    name: plan.displayName,
    revenue: plan._count.merchants * plan.price,
    subscribers: plan._count.merchants,
    color: PLAN_COLORS[i % PLAN_COLORS.length],
  }))

  if (loading) return <PlansSkeleton />

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-amber-900/20 to-slate-900 p-6">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          <div className="relative flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Subscription Plans</h2>
              <p className="text-slate-400 text-sm">Manage subscription tiers and pricing</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Plan Cards - Enhanced */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan, i) => {
          const key = plan.name.toLowerCase()
          const colors = planColors[key] || planColors.starter
          const icon = planIcons[key] || <Star className="h-6 w-6" />
          const features = parseJsonSafe(plan.features)
          const revenue = plan._count.merchants * plan.price
          const totalMerchants = plans.reduce((sum, p) => sum + p._count.merchants, 0)
          const sharePct = totalMerchants > 0 ? Math.round((plan._count.merchants / totalMerchants) * 100) : 0

          return (
            <motion.div key={plan.id} variants={itemVariants}>
              <Card className={`relative overflow-hidden ${colors.border} border-2 hover:shadow-xl transition-all duration-300`}>
                <div className={`h-1.5 bg-gradient-to-r ${
                  key === 'starter' ? 'from-emerald-500 to-teal-600' :
                  key === 'professional' ? 'from-violet-500 to-purple-600' :
                  'from-amber-500 to-orange-600'
                }`} />
                {/* Popular badge for middle plan */}
                {key === 'professional' && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] px-3 py-1 rounded-bl-lg font-semibold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Most Popular
                  </div>
                )}
                {!plan.isActive && key !== 'professional' && (
                  <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-bl">
                    Inactive
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto ${colors.bg} rounded-full p-3 w-fit ${colors.icon}`}>
                    {icon}
                  </div>
                  <CardTitle className="mt-3">{plan.displayName}</CardTitle>
                  <CardDescription>{plan.description || `${plan.displayName} plan`}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mt-2">
                    <span className="text-4xl font-bold">
                      ${plan.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Subscribers</p>
                      <p className="text-lg font-bold">{plan._count.merchants}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-lg font-bold">${revenue.toLocaleString()}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Share</p>
                      <p className="text-lg font-bold">{sharePct}%</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2 text-left">
                    {features.length > 0 ? (
                      features.map((feature, fi) => (
                        <div key={fi} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No features listed</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => openEditDialog(plan)}
                  >
                    <Edit className="h-4 w-4 mr-2" />Edit Plan
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Distribution + Revenue Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Distribution Donut - Enhanced */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-violet-600" />
                </div>
                Merchant Distribution
              </CardTitle>
              <CardDescription>Merchants across plan tiers</CardDescription>
            </CardHeader>
            <CardContent>
              {distributionData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data</p>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <ChartContainer config={planChartConfig} className="h-[180px] w-[180px]">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold">{plans.reduce((sum, p) => sum + p._count.merchants, 0)}</span>
                      <span className="text-[10px] text-muted-foreground">total</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    {distributionData.map((item) => {
                      const total = distributionData.reduce((s, d) => s + d.value, 0)
                      const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
                      return (
                        <div key={item.name} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                          <div className="h-5 w-5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <div className="flex-1">
                            <span className="text-sm font-medium">{item.name}</span>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                              <div className="h-full rounded-full" style={{ backgroundColor: item.color, width: `${pct}%` }} />
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold">{item.value}</span>
                            <p className="text-[10px] text-muted-foreground">{pct}%</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue per Plan - Enhanced */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </div>
                Revenue per Plan
              </CardTitle>
              <CardDescription>Monthly revenue contribution by tier</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data</p>
              ) : (
                <>
                  <ChartContainer config={planChartConfig} className="h-[200px] w-full">
                    <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${v}`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                        {revenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-3 gap-3">
                    {revenueData.map((item) => (
                      <div key={item.name} className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-[10px] text-muted-foreground">{item.name}</p>
                        <p className="text-sm font-bold">${item.revenue.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">{item.subscribers} merchants</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Plan Comparison Table - Enhanced */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-slate-600 to-slate-800" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-slate-600" />
              </div>
              Plan Comparison
            </CardTitle>
            <CardDescription>Side-by-side feature comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Feature</TableHead>
                    {plans.map((plan) => {
                      const key = plan.name.toLowerCase()
                      return (
                        <TableHead key={plan.id} className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className={`h-8 w-8 rounded-full ${planColors[key]?.bg || 'bg-muted'} flex items-center justify-center ${planColors[key]?.icon || 'text-muted-foreground'}`}>
                              {planIcons[key] || <Star className="h-4 w-4" />}
                            </div>
                            <span className="font-semibold">{plan.displayName}</span>
                            <Badge variant="secondary" className="text-[10px]">${plan.price}/{plan.interval}</Badge>
                          </div>
                        </TableHead>
                      )
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Subscribers</TableCell>
                    {plans.map((plan) => (
                      <TableCell key={plan.id} className="text-center">
                        <span className="font-semibold">{plan._count.merchants}</span>
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Revenue</TableCell>
                    {plans.map((plan) => (
                      <TableCell key={plan.id} className="text-center">
                        <span className="font-semibold">${(plan._count.merchants * plan.price).toLocaleString()}</span>
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Price</TableCell>
                    {plans.map((plan) => (
                      <TableCell key={plan.id} className="text-center">
                        <span className="font-bold">${plan.price}/{plan.interval}</span>
                      </TableCell>
                    ))}
                  </TableRow>
                  {(() => {
                    const allFeatures = new Set<string>()
                    plans.forEach((plan) => {
                      parseJsonSafe(plan.features).forEach((f) => allFeatures.add(f))
                    })
                    return Array.from(allFeatures).map((feature) => (
                      <TableRow key={feature} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-sm">{feature}</TableCell>
                        {plans.map((plan) => (
                          <TableCell key={plan.id} className="text-center">
                            {parseJsonSafe(plan.features).includes(feature) ? (
                              <div className="flex justify-center">
                                <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center">
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                                  <span className="text-muted-foreground text-xs">—</span>
                                </div>
                              </div>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  })()}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Plan Dialog - Enhanced */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Plan: {editPlan?.displayName}
            </DialogTitle>
            <DialogDescription>Update plan pricing, features, and limits</DialogDescription>
          </DialogHeader>
          {editPlan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price ({editPlan.currency})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Features (JSON array)</Label>
                <Textarea
                  value={editForm.features}
                  onChange={(e) => setEditForm({ ...editForm, features: e.target.value })}
                  rows={5}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label>Limits (JSON object)</Label>
                <Textarea
                  value={editForm.limits}
                  onChange={(e) => setEditForm({ ...editForm, limits: e.target.value })}
                  rows={4}
                  className="font-mono text-xs"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label className="text-sm font-medium">Active Status</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {editForm.isActive ? 'Plan is visible and available for new signups' : 'Plan is hidden from new signups'}
                  </p>
                </div>
                <Switch
                  checked={editForm.isActive}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePlan} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

function PlansSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="text-center">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <Skeleton className="h-6 w-24 mx-auto mt-3" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Skeleton className="h-10 w-28 mx-auto" />
              <Skeleton className="h-16 w-full" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
