'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Tag,
  Percent,
  Truck,
  Copy,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Clock,
  TrendingUp,
  CalendarClock,
  Zap,
  Edit,
  CopyIcon,
  Ban,
  Gift,
  ArrowRight,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

interface Discount {
  id: string
  code: string
  type: string
  value: number
  minOrderValue: number | null
  maxDiscount: number | null
  usageLimit: number | null
  usageCount: number
  perCustomerLimit: number | null
  startsAt: string
  endsAt: string | null
  isActive: boolean
  createdAt: string
}

interface DiscountsResponse {
  discounts: Discount[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

const typeConfig: Record<string, { icon: React.ElementType; gradient: string; bg: string; label: string }> = {
  percentage: { icon: Percent, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-100', label: 'Percentage' },
  fixed_amount: { icon: Tag, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-100', label: 'Fixed Amount' },
  free_shipping: { icon: Truck, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-100', label: 'Free Shipping' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export function DiscountsManagement() {
  const { selectedStoreId } = useAppStore()
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formCode, setFormCode] = useState('')
  const [formType, setFormType] = useState('percentage')
  const [formValue, setFormValue] = useState('')
  const [formMinOrder, setFormMinOrder] = useState('')
  const [formMaxDiscount, setFormMaxDiscount] = useState('')
  const [formUsageLimit, setFormUsageLimit] = useState('')
  const [formStartsAt, setFormStartsAt] = useState('')
  const [formEndsAt, setFormEndsAt] = useState('')

  const fetchDiscounts = async () => {
    if (!selectedStoreId) return
    setLoading(true)
    try {
      const params: Record<string, string> = { storeId: selectedStoreId, limit: '50' }
      if (tab === 'active') params.isActive = 'true'
      else if (tab === 'expired') params.isActive = 'false'
      const data = await api.get<DiscountsResponse>('/discounts', params)
      setDiscounts(data.discounts)
    } catch {
      toast.error('Failed to load discounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiscounts()
  }, [selectedStoreId, tab])

  const handleToggle = async (discount: Discount) => {
    try {
      await api.put(`/discounts/${discount.id}`, { isActive: !discount.isActive })
      toast.success(discount.isActive ? 'Discount disabled' : 'Discount enabled')
      fetchDiscounts()
    } catch {
      toast.error('Failed to toggle discount')
    }
  }

  const handleCreate = async () => {
    if (!selectedStoreId || !formCode || !formValue || !formStartsAt) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      await api.post('/discounts', {
        storeId: selectedStoreId,
        code: formCode.toUpperCase(),
        type: formType,
        value: parseFloat(formValue),
        minOrderValue: formMinOrder ? parseFloat(formMinOrder) : null,
        maxDiscount: formMaxDiscount ? parseFloat(formMaxDiscount) : null,
        usageLimit: formUsageLimit ? parseInt(formUsageLimit) : null,
        startsAt: formStartsAt,
        endsAt: formEndsAt || null,
        isActive: true,
      })
      toast.success('Discount created')
      setCreateOpen(false)
      resetForm()
      fetchDiscounts()
    } catch {
      toast.error('Failed to create discount')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormCode('')
    setFormType('percentage')
    setFormValue('')
    setFormMinOrder('')
    setFormMaxDiscount('')
    setFormUsageLimit('')
    setFormStartsAt('')
    setFormEndsAt('')
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard')
  }

  const formatValue = (discount: Discount) => {
    if (discount.type === 'percentage') return `${discount.value}%`
    if (discount.type === 'fixed_amount') return `$${discount.value.toFixed(2)}`
    if (discount.type === 'free_shipping') return 'Free Shipping'
    return discount.value.toString()
  }

  const isExpired = (discount: Discount) => {
    if (!discount.endsAt) return false
    return new Date(discount.endsAt) < new Date()
  }

  const isScheduled = (discount: Discount) => {
    return new Date(discount.startsAt) > new Date()
  }

  const getDiscountStatus = (discount: Discount): 'active' | 'expired' | 'scheduled' | 'inactive' => {
    if (isExpired(discount)) return 'expired'
    if (isScheduled(discount)) return 'scheduled'
    if (discount.isActive) return 'active'
    return 'inactive'
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    expired: { label: 'Expired', className: 'bg-red-100 text-red-800 border-red-200' },
    scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  }

  // Computed stats
  const discountStats = useMemo(() => {
    const active = discounts.filter(d => d.isActive && !isExpired(d) && !isScheduled(d)).length
    const totalSavings = discounts.reduce((sum, d) => {
      if (d.type === 'fixed_amount') return sum + (d.usageCount * d.value)
      return sum
    }, 0)
    const mostPopular = discounts.length > 0
      ? discounts.reduce((max, d) => d.usageCount > max.usageCount ? d : max, discounts[0])
      : null
    const expiringSoon = discounts.filter(d => {
      if (!d.endsAt || !d.isActive) return false
      const daysLeft = (new Date(d.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      return daysLeft > 0 && daysLeft <= 7
    }).length
    return { active, totalSavings, mostPopular, expiringSoon }
  }, [discounts])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Discounts</h2>
          <p className="text-sm text-muted-foreground">Manage discount codes and promotions</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Create Discount
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            />
          </Button>
        </motion.div>
      </motion.div>

      {/* Discount Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Discounts</p>
                  <p className="text-2xl font-bold">{discountStats.active}</p>
                </div>
                <div className="bg-emerald-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Savings Given</p>
                  <p className="text-2xl font-bold">${discountStats.totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-violet-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Most Popular</p>
                  <p className="text-lg font-bold truncate">{discountStats.mostPopular?.code || '—'}</p>
                </div>
                <div className="bg-rose-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <Gift className="h-5 w-5 text-rose-600" />
                </div>
              </div>
              {discountStats.mostPopular && (
                <p className="text-xs text-muted-foreground mt-1">{discountStats.mostPopular.usageCount} uses</p>
              )}
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                  <p className="text-2xl font-bold">{discountStats.expiringSoon}</p>
                </div>
                <div className="bg-amber-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <CalendarClock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Within 7 days</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Tab Filters */}
      <motion.div variants={itemVariants}>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All ({discounts.length})</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expired">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Discount Cards Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-24 mb-3" />
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : discounts.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-4">
                <Gift className="h-10 w-10 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No discounts yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                Create your first discount code to attract customers and boost sales.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Your First Discount
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {discounts.map((discount, i) => {
              const tc = typeConfig[discount.type] || typeConfig.percentage!
              const status = getDiscountStatus(discount)
              const sc = statusConfig[status]
              const usagePercent = discount.usageLimit
                ? Math.min((discount.usageCount / discount.usageLimit) * 100, 100)
                : 0
              const TypeIcon = tc.icon

              return (
                <motion.div
                  key={discount.id}
                  variants={itemVariants}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${status === 'expired' || status === 'inactive' ? 'opacity-70' : ''}`}>
                    {/* Gradient accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tc.gradient}`} />

                    <CardContent className="p-5 pt-6">
                      {/* Header: Code + Status */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${tc.gradient} flex items-center justify-center text-white shadow-sm`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-mono font-bold text-lg tracking-wider">{discount.code}</p>
                            <Badge variant="outline" className="text-[10px] mt-0.5 px-1.5 py-0">
                              {tc.label}
                            </Badge>
                          </div>
                        </div>
                        <Badge className={`text-[11px] px-2 py-0.5 border ${sc.className}`}>
                          {sc.label}
                        </Badge>
                      </div>

                      {/* Value */}
                      <div className="text-3xl font-bold mb-4">
                        {formatValue(discount)}
                      </div>

                      {/* Usage Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">Usage</span>
                          <span className="font-semibold">
                            {discount.usageCount}{discount.usageLimit ? ` / ${discount.usageLimit}` : ' / ∞'}
                          </span>
                        </div>
                        {discount.usageLimit && (
                          <Progress
                            value={usagePercent}
                            className={`h-2 ${
                              usagePercent >= 90 ? '[&>div]:bg-red-500' :
                              usagePercent >= 70 ? '[&>div]:bg-amber-500' :
                              '[&>div]:bg-emerald-500'
                            }`}
                          />
                        )}
                        {!discount.usageLimit && (
                          <div className="h-2 rounded-full bg-muted">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(discount.usageCount * 5, 100)}%` }} />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                        {discount.minOrderValue && (
                          <div className="flex justify-between">
                            <span>Min. Order</span>
                            <span className="font-medium text-foreground">${discount.minOrderValue.toFixed(2)}</span>
                          </div>
                        )}
                        {discount.maxDiscount && (
                          <div className="flex justify-between">
                            <span>Max Discount</span>
                            <span className="font-medium text-foreground">${discount.maxDiscount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span>Starts</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(discount.startsAt).toLocaleDateString()}
                          </span>
                        </div>
                        {discount.endsAt && (
                          <div className="flex justify-between items-center">
                            <span>Ends</span>
                            <span className="flex items-center gap-1">
                              <CalendarClock className="h-3 w-3" />
                              {new Date(discount.endsAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyCode(discount.code)}
                            title="Copy code"
                          >
                            <CopyIcon className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyCode(discount.code)}
                            title="Duplicate"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggle(discount)}
                            title={discount.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {discount.isActive ? (
                              <Ban className="h-3.5 w-3.5 text-red-500" />
                            ) : (
                              <Zap className="h-3.5 w-3.5 text-emerald-500" />
                            )}
                          </Button>
                        </div>
                        <Switch
                          checked={discount.isActive}
                          onCheckedChange={() => handleToggle(discount)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create Discount Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              Create Discount
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Discount Code *</Label>
              <Input
                placeholder="e.g. SUMMER20"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                className="font-mono tracking-wider"
              />
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={formType === 'percentage' ? '20' : '10.00'}
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label>Min Order Value</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="No minimum"
                  value={formMinOrder}
                  onChange={(e) => setFormMinOrder(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Discount</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="No limit"
                  value={formMaxDiscount}
                  onChange={(e) => setFormMaxDiscount(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Usage Limit</Label>
              <Input
                type="number"
                placeholder="Unlimited"
                value={formUsageLimit}
                onChange={(e) => setFormUsageLimit(e.target.value)}
              />
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label>Starts At *</Label>
                <Input
                  type="datetime-local"
                  value={formStartsAt}
                  onChange={(e) => setFormStartsAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ends At</Label>
                <Input
                  type="datetime-local"
                  value={formEndsAt}
                  onChange={(e) => setFormEndsAt(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
              {saving ? 'Creating...' : 'Create Discount'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
