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

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
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

  const parseLimitsSafe = (str: string): Record<string, unknown> => {
    try {
      return JSON.parse(str)
    } catch {
      return {}
    }
  }

  if (loading) return <PlansSkeleton />

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Subscription Plans</h2>
            <p className="text-muted-foreground">Manage subscription tiers and pricing</p>
          </div>
        </div>
      </motion.div>

      {/* Plan Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan, i) => {
          const key = plan.name.toLowerCase()
          const colors = planColors[key] || planColors.starter
          const icon = planIcons[key] || <Star className="h-6 w-6" />
          const features = parseJsonSafe(plan.features)
          const revenue = plan._count.merchants * plan.price

          return (
            <motion.div key={plan.id} {...fadeIn} transition={{ duration: 0.4, delay: i * 0.1 }}>
              <Card className={`relative overflow-hidden ${colors.border} border-2`}>
                {!plan.isActive && (
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

                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Subscribers</p>
                      <p className="text-lg font-bold">{plan._count.merchants}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-lg font-bold">${revenue.toLocaleString()}</p>
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

      {/* Plan Comparison Table */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle>Plan Comparison</CardTitle>
            <CardDescription>Side-by-side feature comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    {plans.map((plan) => (
                      <TableHead key={plan.id} className="text-center">{plan.displayName}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Price</TableCell>
                    {plans.map((plan) => (
                      <TableCell key={plan.id} className="text-center">
                        ${plan.price}/{plan.interval}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Subscribers</TableCell>
                    {plans.map((plan) => (
                      <TableCell key={plan.id} className="text-center">
                        {plan._count.merchants}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Revenue</TableCell>
                    {plans.map((plan) => (
                      <TableCell key={plan.id} className="text-center">
                        ${(plan._count.merchants * plan.price).toLocaleString()}
                      </TableCell>
                    ))}
                  </TableRow>
                  {(() => {
                    const allFeatures = new Set<string>()
                    plans.forEach((plan) => {
                      parseJsonSafe(plan.features).forEach((f) => allFeatures.add(f))
                    })
                    return Array.from(allFeatures).map((feature) => (
                      <TableRow key={feature}>
                        <TableCell className="text-sm">{feature}</TableCell>
                        {plans.map((plan) => (
                          <TableCell key={plan.id} className="text-center">
                            {parseJsonSafe(plan.features).includes(feature) ? (
                              <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
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

      {/* Edit Plan Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Plan: {editPlan?.displayName}</DialogTitle>
            <DialogDescription>Update plan pricing, features, and limits</DialogDescription>
          </DialogHeader>
          {editPlan && (
            <div className="space-y-4">
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
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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
              <div className="flex items-center gap-3">
                <Switch
                  checked={editForm.isActive}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePlan}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
