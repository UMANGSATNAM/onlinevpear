'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Tag,
  Percent,
  Truck,
  Copy,
  ToggleLeft,
  ToggleRight,
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

const typeIcons: Record<string, React.ReactNode> = {
  percentage: <Percent className="h-4 w-4" />,
  fixed_amount: <Tag className="h-4 w-4" />,
  free_shipping: <Truck className="h-4 w-4" />,
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Discounts</h2>
          <p className="text-sm text-muted-foreground">Manage discount codes and promotions</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Discount
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expired">Inactive</TabsTrigger>
        </TabsList>
      </Tabs>

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
        <div className="text-center py-12">
          <p className="text-muted-foreground">No discounts found</p>
          <Button variant="outline" className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create your first discount
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {discounts.map((discount) => (
            <Card key={discount.id} className={`relative ${!discount.isActive || isExpired(discount) ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {typeIcons[discount.type] || <Tag className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-mono font-bold text-sm">{discount.code}</p>
                      <p className="text-xs text-muted-foreground capitalize">{discount.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyCode(discount.code)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Switch
                      checked={discount.isActive}
                      onCheckedChange={() => handleToggle(discount)}
                    />
                  </div>
                </div>

                <div className="text-2xl font-bold mb-3">{formatValue(discount)}</div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Usage</span>
                    <span>{discount.usageCount}{discount.usageLimit ? ` / ${discount.usageLimit}` : ''}</span>
                  </div>
                  {discount.minOrderValue && (
                    <div className="flex justify-between">
                      <span>Min. Order</span>
                      <span>${discount.minOrderValue.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Starts</span>
                    <span>{new Date(discount.startsAt).toLocaleDateString()}</span>
                  </div>
                  {discount.endsAt && (
                    <div className="flex justify-between">
                      <span>Ends</span>
                      <span>{new Date(discount.endsAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <Badge variant={discount.isActive && !isExpired(discount) ? 'secondary' : 'outline'} className={
                    discount.isActive && !isExpired(discount) ? 'bg-emerald-100 text-emerald-800' : ''
                  }>
                    {isExpired(discount) ? 'Expired' : discount.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Discount Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Discount</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Discount Code *</Label>
              <Input
                placeholder="e.g. SUMMER20"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
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
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create Discount'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
