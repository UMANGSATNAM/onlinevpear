'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tags,
  Plus,
  Copy,
  Edit3,
  CopyPlus,
  Trash2,
  Power,
  Search,
  Grid3X3,
  List,
  Clock,
  Calendar,
  Filter,
  X,
  Check,
  ChevronDown,
  ArrowUpDown,
  RefreshCw,
  Gift,
  Percent,
  DollarSign,
  Truck,
  ShoppingCart,
  Users,
  Star,
  Tag,
  Zap,
  AlertCircle,
  TrendingUp,
  BarChart3,
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
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

const chartConfig = {
  redemptions: {
    label: 'Redemptions',
    color: '#8b5cf6',
  },
  revenue: {
    label: 'Revenue Impact',
    color: '#f59e0b',
  },
} satisfies ChartConfig

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// Types
type CouponStatus = 'active' | 'scheduled' | 'expired' | 'draft'
type DiscountType = 'percentage' | 'fixed' | 'free_shipping' | 'buy_x_get_y'

interface Coupon {
  id: string
  code: string
  discountType: DiscountType
  discountValue: number
  minOrderAmount: number
  usageLimit: number
  usedCount: number
  perCustomerLimit: number
  startDate: string
  endDate: string
  status: CouponStatus
  customerEligibility: 'all' | 'new' | 'returning' | 'vip'
  productScope: 'all' | 'categories' | 'products'
  createdAt: string
}

interface Redemption {
  id: string
  code: string
  customer: string
  order: string
  discountAmount: number
  date: string
}

// Mock Data
const mockCoupons: Coupon[] = [
  { id: '1', code: 'SUMMER25', discountType: 'percentage', discountValue: 25, minOrderAmount: 50, usageLimit: 500, usedCount: 342, perCustomerLimit: 3, startDate: '2026-01-15', endDate: '2026-03-31', status: 'active', customerEligibility: 'all', productScope: 'all', createdAt: '2026-01-10' },
  { id: '2', code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrderAmount: 0, usageLimit: 1000, usedCount: 876, perCustomerLimit: 1, startDate: '2025-11-01', endDate: '2026-06-30', status: 'active', customerEligibility: 'new', productScope: 'all', createdAt: '2025-10-28' },
  { id: '3', code: 'FLAT15', discountType: 'fixed', discountValue: 15, minOrderAmount: 75, usageLimit: 200, usedCount: 189, perCustomerLimit: 2, startDate: '2025-12-01', endDate: '2026-02-28', status: 'expired', customerEligibility: 'all', productScope: 'categories', createdAt: '2025-11-25' },
  { id: '4', code: 'FREESHIP', discountType: 'free_shipping', discountValue: 0, minOrderAmount: 25, usageLimit: 2000, usedCount: 1204, perCustomerLimit: 5, startDate: '2026-01-01', endDate: '2026-12-31', status: 'active', customerEligibility: 'all', productScope: 'all', createdAt: '2025-12-28' },
  { id: '5', code: 'BOGO50', discountType: 'buy_x_get_y', discountValue: 50, minOrderAmount: 100, usageLimit: 100, usedCount: 45, perCustomerLimit: 1, startDate: '2026-03-01', endDate: '2026-03-31', status: 'scheduled', customerEligibility: 'returning', productScope: 'products', createdAt: '2026-02-20' },
  { id: '6', code: 'VIP30', discountType: 'percentage', discountValue: 30, minOrderAmount: 150, usageLimit: 50, usedCount: 12, perCustomerLimit: 1, startDate: '2026-02-01', endDate: '2026-04-30', status: 'active', customerEligibility: 'vip', productScope: 'all', createdAt: '2026-01-28' },
  { id: '7', code: 'SPRING20', discountType: 'percentage', discountValue: 20, minOrderAmount: 40, usageLimit: 300, usedCount: 0, perCustomerLimit: 2, startDate: '2026-04-01', endDate: '2026-04-30', status: 'scheduled', customerEligibility: 'all', productScope: 'all', createdAt: '2026-02-25' },
  { id: '8', code: 'DRAFT01', discountType: 'fixed', discountValue: 25, minOrderAmount: 100, usageLimit: 100, usedCount: 0, perCustomerLimit: 1, startDate: '', endDate: '', status: 'draft', customerEligibility: 'all', productScope: 'all', createdAt: '2026-02-27' },
]

const mockRedemptions: Redemption[] = [
  { id: '1', code: 'SUMMER25', customer: 'Emma Johnson', order: 'ORD-4821', discountAmount: 42.50, date: '2026-02-28T14:32:00' },
  { id: '2', code: 'WELCOME10', customer: 'James Wilson', order: 'ORD-4820', discountAmount: 12.99, date: '2026-02-28T13:15:00' },
  { id: '3', code: 'FREESHIP', customer: 'Sofia Martinez', order: 'ORD-4819', discountAmount: 8.95, date: '2026-02-28T12:45:00' },
  { id: '4', code: 'SUMMER25', customer: 'Liam Chen', order: 'ORD-4818', discountAmount: 65.00, date: '2026-02-28T11:20:00' },
  { id: '5', code: 'VIP30', customer: 'Olivia Brown', order: 'ORD-4817', discountAmount: 89.97, date: '2026-02-28T10:55:00' },
  { id: '6', code: 'FLAT15', customer: 'Noah Davis', order: 'ORD-4816', discountAmount: 15.00, date: '2026-02-27T22:30:00' },
  { id: '7', code: 'WELCOME10', customer: 'Ava Kim', order: 'ORD-4815', discountAmount: 7.50, date: '2026-02-27T20:10:00' },
  { id: '8', code: 'BOGO50', customer: 'Ethan Taylor', order: 'ORD-4814', discountAmount: 34.99, date: '2026-02-27T18:45:00' },
  { id: '9', code: 'FREESHIP', customer: 'Isabella Lee', order: 'ORD-4813', discountAmount: 12.50, date: '2026-02-27T16:20:00' },
  { id: '10', code: 'SUMMER25', customer: 'Mason White', order: 'ORD-4812', discountAmount: 28.75, date: '2026-02-27T14:05:00' },
]

const performanceData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  redemptions: Math.floor(Math.sin(i * 0.8 + 1) * 5 + 8 + i * 0.3),
  revenue: Math.floor(Math.sin(i * 0.6 + 2) * 150 + 400 + i * 15),
}))

// Helper functions
const getDiscountBadge = (type: DiscountType) => {
  switch (type) {
    case 'percentage': return { label: 'Percentage', variant: 'bg-violet-100 text-violet-800 border-violet-200', icon: Percent }
    case 'fixed': return { label: 'Fixed Amount', variant: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: DollarSign }
    case 'free_shipping': return { label: 'Free Shipping', variant: 'bg-sky-100 text-sky-800 border-sky-200', icon: Truck }
    case 'buy_x_get_y': return { label: 'Buy X Get Y', variant: 'bg-amber-100 text-amber-800 border-amber-200', icon: Gift }
  }
}

const getStatusBadge = (status: CouponStatus) => {
  switch (status) {
    case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'scheduled': return 'bg-sky-100 text-sky-800 border-sky-200'
    case 'expired': return 'bg-red-100 text-red-800 border-red-200'
    case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getDiscountDisplay = (coupon: Coupon) => {
  switch (coupon.discountType) {
    case 'percentage': return `${coupon.discountValue}% OFF`
    case 'fixed': return `$${coupon.discountValue} OFF`
    case 'free_shipping': return 'FREE SHIP'
    case 'buy_x_get_y': return `${coupon.discountValue}% OFF 2nd`
  }
}

const getCountdown = (endDate: string) => {
  if (!endDate) return null
  const now = new Date()
  const end = new Date(endDate)
  const diff = end.getTime() - now.getTime()
  if (diff <= 0) return 'Expired'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 30) return `${Math.floor(days / 30)}mo ${days % 30}d left`
  if (days > 0) return `${days}d left`
  const hours = Math.floor(diff / (1000 * 60 * 60))
  return `${hours}h left`
}

const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function CouponBuilder() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons)
  const [filterTab, setFilterTab] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [redemptionSearch, setRedemptionSearch] = useState('')

  // Create coupon form state
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage' as DiscountType,
    discountValue: '',
    minOrderAmount: '',
    usageLimit: '',
    perCustomerLimit: '',
    startDate: '',
    endDate: '',
    customerEligibility: 'all' as 'all' | 'new' | 'returning' | 'vip',
    productScope: 'all' as 'all' | 'categories' | 'products',
  })
  const [conditionGroups, setConditionGroups] = useState<Array<{
    id: string
    logic: 'AND' | 'OR'
    conditions: Array<{ id: string; field: string; operator: string; value: string }>
  }>>([])

  // Stats
  const stats = useMemo(() => {
    const activeCoupons = coupons.filter(c => c.status === 'active').length
    const totalRedemptions = coupons.reduce((sum, c) => sum + c.usedCount, 0)
    const revenueImpact = totalRedemptions * 15.50 // avg discount
    const avgDiscountRate = coupons.filter(c => c.discountType === 'percentage').reduce((sum, c) => sum + c.discountValue, 0) / Math.max(coupons.filter(c => c.discountType === 'percentage').length, 1)
    return { activeCoupons, totalRedemptions, revenueImpact, avgDiscountRate }
  }, [coupons])

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    let result = coupons
    if (filterTab !== 'all') {
      result = result.filter(c => c.status === filterTab)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c => c.code.toLowerCase().includes(q))
    }
    return result
  }, [coupons, filterTab, searchQuery])

  // Filtered redemptions
  const filteredRedemptions = useMemo(() => {
    if (!redemptionSearch) return mockRedemptions
    const q = redemptionSearch.toLowerCase()
    return mockRedemptions.filter(r =>
      r.code.toLowerCase().includes(q) ||
      r.customer.toLowerCase().includes(q) ||
      r.order.toLowerCase().includes(q)
    )
  }, [redemptionSearch])

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied "${code}" to clipboard`)
  }

  const handleDeactivate = (id: string) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, status: 'expired' as CouponStatus } : c))
    toast.success('Coupon deactivated')
  }

  const handleDuplicate = (coupon: Coupon) => {
    const newId = String(Date.now())
    const newCode = generateCode()
    setCoupons(prev => [...prev, { ...coupon, id: newId, code: newCode, usedCount: 0, status: 'draft' as CouponStatus }])
    toast.success(`Duplicated as ${newCode}`)
  }

  const handleDelete = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id))
    toast.success('Coupon deleted')
  }

  const handleAutoGenerate = () => {
    setNewCoupon(prev => ({ ...prev, code: generateCode() }))
  }

  const addConditionGroup = () => {
    setConditionGroups(prev => [...prev, {
      id: String(Date.now()),
      logic: 'AND',
      conditions: [{ id: String(Date.now()) + '-0', field: 'cart_total', operator: '>', value: '' }],
    }])
  }

  const removeConditionGroup = (groupId: string) => {
    setConditionGroups(prev => prev.filter(g => g.id !== groupId))
  }

  const addCondition = (groupId: string) => {
    setConditionGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, conditions: [...g.conditions, { id: String(Date.now()), field: 'cart_total', operator: '>', value: '' }] }
        : g
    ))
  }

  const removeCondition = (groupId: string, conditionId: string) => {
    setConditionGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, conditions: g.conditions.filter(c => c.id !== conditionId) }
        : g
    ))
  }

  const updateCondition = (groupId: string, conditionId: string, field: string, value: string) => {
    setConditionGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, conditions: g.conditions.map(c => c.id === conditionId ? { ...c, [field]: value } : c) }
        : g
    ))
  }

  const updateGroupLogic = (groupId: string, logic: 'AND' | 'OR') => {
    setConditionGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, logic } : g
    ))
  }

  const handleSaveCoupon = (asDraft: boolean) => {
    if (!newCoupon.code) {
      toast.error('Please enter a coupon code')
      return
    }
    if (!newCoupon.discountValue) {
      toast.error('Please enter a discount value')
      return
    }
    const coupon: Coupon = {
      id: String(Date.now()),
      code: newCoupon.code,
      discountType: newCoupon.discountType,
      discountValue: Number(newCoupon.discountValue),
      minOrderAmount: Number(newCoupon.minOrderAmount) || 0,
      usageLimit: Number(newCoupon.usageLimit) || 100,
      usedCount: 0,
      perCustomerLimit: Number(newCoupon.perCustomerLimit) || 1,
      startDate: newCoupon.startDate,
      endDate: newCoupon.endDate,
      status: asDraft ? 'draft' : 'active',
      customerEligibility: newCoupon.customerEligibility,
      productScope: newCoupon.productScope,
      createdAt: new Date().toISOString(),
    }
    setCoupons(prev => [...prev, coupon])
    setCreateDialogOpen(false)
    setNewCoupon({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      usageLimit: '',
      perCustomerLimit: '',
      startDate: '',
      endDate: '',
      customerEligibility: 'all',
      productScope: 'all',
    })
    setConditionGroups([])
    toast.success(asDraft ? 'Coupon saved as draft' : 'Coupon activated!')
  }

  const filterCounts = useMemo(() => ({
    all: coupons.length,
    active: coupons.filter(c => c.status === 'active').length,
    scheduled: coupons.filter(c => c.status === 'scheduled').length,
    expired: coupons.filter(c => c.status === 'expired').length,
    draft: coupons.filter(c => c.status === 'draft').length,
  }), [coupons])

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Gradient Header */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-6 text-white">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                <Tags className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight">Coupon Builder</h2>
                  <Badge className="bg-emerald-400/90 text-white border-0 text-[10px] px-2">
                    <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    Active
                  </Badge>
                </div>
                <p className="text-white/70 mt-0.5">Create and manage discount coupons & rules</p>
              </div>
            </div>
            <Button
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create Coupon
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Active Coupons', value: stats.activeCoupons, icon: Tags, gradient: 'from-emerald-500 to-teal-600', bgGradient: 'from-emerald-50 to-teal-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', sub: `of ${coupons.length} total` },
          { title: 'Total Redemptions', value: stats.totalRedemptions.toLocaleString(), icon: ShoppingCart, gradient: 'from-violet-500 to-purple-600', bgGradient: 'from-violet-50 to-purple-50', iconBg: 'bg-violet-100', iconColor: 'text-violet-600', sub: 'lifetime' },
          { title: 'Revenue Impact', value: `$${stats.revenueImpact.toLocaleString('en-US', { minimumFractionDigits: 0 })}`, icon: DollarSign, gradient: 'from-amber-500 to-orange-600', bgGradient: 'from-amber-50 to-orange-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', sub: 'discount value' },
          { title: 'Avg Discount Rate', value: `${stats.avgDiscountRate.toFixed(1)}%`, icon: Percent, gradient: 'from-rose-500 to-pink-600', bgGradient: 'from-rose-50 to-pink-50', iconBg: 'bg-rose-100', iconColor: 'text-rose-600', sub: 'across all coupons' },
        ].map((stat, i) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${stat.bgGradient}`}>
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-5 pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`${stat.iconBg} rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Coupon List Section */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-500" />
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-violet-100">
                    <Tags className="h-4 w-4 text-violet-600" />
                  </div>
                  Coupon List
                </CardTitle>
                <CardDescription className="mt-1">Manage your discount coupons</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search coupons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 w-48"
                  />
                </div>
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 w-8 p-0 rounded-r-none"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 w-8 p-0 rounded-l-none"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
            {/* Filter Tabs */}
            <div className="flex gap-1 mt-3">
              {(['all', 'active', 'scheduled', 'expired', 'draft'] as const).map((tab) => (
                <Button
                  key={tab}
                  variant={filterTab === tab ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs capitalize"
                  onClick={() => setFilterTab(tab)}
                >
                  {tab}
                  <Badge variant="secondary" className="ml-1.5 text-[10px] px-1 py-0 h-4">
                    {filterCounts[tab]}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {filteredCoupons.length === 0 ? (
              <div className="text-center py-12">
                <Tags className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No coupons found</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence>
                  {filteredCoupons.map((coupon, i) => {
                    const badge = getDiscountBadge(coupon.discountType)
                    const usagePercent = coupon.usageLimit > 0 ? (coupon.usedCount / coupon.usageLimit) * 100 : 0
                    const countdown = getCountdown(coupon.endDate)
                    return (
                      <motion.div
                        key={coupon.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="group hover:shadow-md transition-all duration-200 border">
                          <CardContent className="p-4">
                            {/* Code + Copy */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-mono font-bold tracking-wider bg-muted px-2 py-1 rounded">{coupon.code}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleCopyCode(coupon.code)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 border capitalize ${getStatusBadge(coupon.status)}`}>
                                {coupon.status}
                              </Badge>
                            </div>

                            {/* Discount Value */}
                            <div className="mb-3">
                              <span className="text-xl font-bold">{getDiscountDisplay(coupon)}</span>
                              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ml-2 border ${badge.variant}`}>
                                <badge.icon className="h-2.5 w-2.5 mr-0.5" />
                                {badge.label}
                              </Badge>
                            </div>

                            {/* Usage Progress */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Usage</span>
                                <span>{coupon.usedCount} / {coupon.usageLimit}</span>
                              </div>
                              <Progress
                                value={Math.min(usagePercent, 100)}
                                className="h-1.5"
                              />
                            </div>

                            {/* Date Range + Countdown */}
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-3">
                              <Calendar className="h-3 w-3" />
                              {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString() : 'TBD'} — {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString() : 'TBD'}
                            </div>
                            {countdown && coupon.status === 'active' && (
                              <div className={`text-[11px] font-medium mb-3 ${countdown === 'Expired' ? 'text-red-500' : countdown.includes('d left') && parseInt(countdown) < 7 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                <Clock className="h-3 w-3 inline mr-1" />
                                {countdown}
                              </div>
                            )}

                            {/* Min Order + Eligibility */}
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3">
                              {coupon.minOrderAmount > 0 && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  Min ${coupon.minOrderAmount}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                                {coupon.customerEligibility === 'all' ? 'All Customers' : coupon.customerEligibility === 'new' ? 'New Only' : coupon.customerEligibility === 'returning' ? 'Returning' : 'VIP'}
                              </Badge>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center gap-1 pt-2 border-t">
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => toast.info('Edit coming soon')}>
                                <Edit3 className="h-3 w-3 mr-1" /> Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleDuplicate(coupon)}>
                                <CopyPlus className="h-3 w-3 mr-1" /> Duplicate
                              </Button>
                              {coupon.status === 'active' && (
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-amber-600" onClick={() => handleDeactivate(coupon.id)}>
                                  <Power className="h-3 w-3 mr-1" /> Deactivate
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600 ml-auto" onClick={() => handleDelete(coupon.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            ) : (
              /* List View */
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Code</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Discount</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Usage</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Expires</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCoupons.map((coupon, i) => {
                      const badge = getDiscountBadge(coupon.discountType)
                      const usagePercent = coupon.usageLimit > 0 ? (coupon.usedCount / coupon.usageLimit) * 100 : 0
                      return (
                        <motion.tr
                          key={coupon.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono font-bold">{coupon.code}</code>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => handleCopyCode(coupon.code)}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{getDiscountDisplay(coupon)}</span>
                              <Badge variant="secondary" className={`text-[9px] px-1 py-0 border ${badge.variant}`}>
                                {badge.label}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="w-24">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>{coupon.usedCount}/{coupon.usageLimit}</span>
                              </div>
                              <Progress value={Math.min(usagePercent, 100)} className="h-1" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 border capitalize ${getStatusBadge(coupon.status)}`}>
                              {coupon.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString() : 'TBD'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toast.info('Edit coming soon')}>
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDuplicate(coupon)}>
                                <CopyPlus className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => handleDelete(coupon.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Chart */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-amber-500 to-fuchsia-500" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-violet-600" />
                  Coupon Performance
                </CardTitle>
                <CardDescription className="mt-1">Redemptions and revenue impact over 30 days</CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                  <span className="text-muted-foreground">Redemptions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">Revenue ($)</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
                <XAxis
                  dataKey="day"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  tickFormatter={(v) => `$${v}`}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar yAxisId="left" dataKey="redemptions" fill="#8b5cf6" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ChartContainer>
            <div className="mt-2">
              <ChartContainer config={chartConfig} className="h-[120px] w-full">
                <LineChart data={performanceData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
                  <XAxis dataKey="day" tick={false} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Redemption History */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100">
                    <ShoppingCart className="h-4 w-4 text-emerald-600" />
                  </div>
                  Redemption History
                </CardTitle>
                <CardDescription className="mt-1">Recent coupon redemptions</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by code, customer, order..."
                  value={redemptionSearch}
                  onChange={(e) => setRedemptionSearch(e.target.value)}
                  className="pl-8 h-9 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Code</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Customer</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Order</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Discount</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRedemptions.map((redemption, i) => (
                    <motion.tr
                      key={redemption.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <code className="text-xs font-mono font-semibold bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded">{redemption.code}</code>
                      </TableCell>
                      <TableCell className="text-sm">{redemption.customer}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{redemption.order}</TableCell>
                      <TableCell className="text-sm font-semibold text-emerald-600">-${redemption.discountAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(redemption.date).toLocaleString()}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Coupon Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-100">
                <Tags className="h-4 w-4 text-violet-600" />
              </div>
              Create New Coupon
            </DialogTitle>
            <DialogDescription>Configure your discount coupon and rules</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Coupon Code */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Coupon Code</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. SUMMER25"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="font-mono tracking-wider"
                />
                <Button variant="outline" onClick={handleAutoGenerate} className="shrink-0">
                  <Zap className="h-4 w-4 mr-1.5" />
                  Auto-Generate
                </Button>
              </div>
            </div>

            {/* Discount Type + Value */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Discount Type</Label>
                <Select
                  value={newCoupon.discountType}
                  onValueChange={(v) => setNewCoupon(prev => ({ ...prev, discountType: v as DiscountType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      <div className="flex items-center gap-2">
                        <Percent className="h-3.5 w-3.5" /> Percentage
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5" /> Fixed Amount
                      </div>
                    </SelectItem>
                    <SelectItem value="free_shipping">
                      <div className="flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5" /> Free Shipping
                      </div>
                    </SelectItem>
                    <SelectItem value="buy_x_get_y">
                      <div className="flex items-center gap-2">
                        <Gift className="h-3.5 w-3.5" /> Buy X Get Y
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {newCoupon.discountType === 'percentage' ? 'Discount %' : newCoupon.discountType === 'fixed' ? 'Discount $' : newCoupon.discountType === 'free_shipping' ? 'Shipping Value' : '2nd Item Discount %'}
                </Label>
                <Input
                  type="number"
                  placeholder={newCoupon.discountType === 'percentage' ? '25' : newCoupon.discountType === 'fixed' ? '10' : '0'}
                  value={newCoupon.discountValue}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, discountValue: e.target.value }))}
                />
              </div>
            </div>

            {/* Minimum Order + Usage Limits */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Min. Order Amount</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newCoupon.minOrderAmount}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Total Usage Limit</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={newCoupon.usageLimit}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, usageLimit: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Per Customer Limit</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={newCoupon.perCustomerLimit}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, perCustomerLimit: e.target.value }))}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Start Date</Label>
                <Input
                  type="date"
                  value={newCoupon.startDate}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">End Date</Label>
                <Input
                  type="date"
                  value={newCoupon.endDate}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            {/* Rules Engine Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100">
                  <Filter className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Rules Engine</h4>
                  <p className="text-[11px] text-muted-foreground">Define conditions for coupon eligibility</p>
                </div>
              </div>

              {/* Customer Eligibility */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider">Customer Eligibility</Label>
                <Select
                  value={newCoupon.customerEligibility}
                  onValueChange={(v) => setNewCoupon(prev => ({ ...prev, customerEligibility: v as 'all' | 'new' | 'returning' | 'vip' }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="new">New Customers Only</SelectItem>
                    <SelectItem value="returning">Returning Customers</SelectItem>
                    <SelectItem value="vip">VIP Tier Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Product Scope */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider">Product Scope</Label>
                <Select
                  value={newCoupon.productScope}
                  onValueChange={(v) => setNewCoupon(prev => ({ ...prev, productScope: v as 'all' | 'categories' | 'products' }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="categories">Specific Categories</SelectItem>
                    <SelectItem value="products">Specific Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Condition Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Conditions</Label>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addConditionGroup}>
                    <Plus className="h-3 w-3 mr-1" /> Add Group
                  </Button>
                </div>

                {conditionGroups.length === 0 && (
                  <div className="text-center py-4 border border-dashed rounded-lg text-muted-foreground text-xs">
                    No conditions defined. Click &quot;Add Group&quot; to create rules.
                  </div>
                )}

                <AnimatePresence>
                  {conditionGroups.map((group, gi) => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border rounded-lg p-3 space-y-2 bg-muted/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">Group {gi + 1}</span>
                          <Select
                            value={group.logic}
                            onValueChange={(v) => updateGroupLogic(group.id, v as 'AND' | 'OR')}
                          >
                            <SelectTrigger className="h-6 w-16 text-[10px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AND">AND</SelectItem>
                              <SelectItem value="OR">OR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => removeConditionGroup(group.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      {group.conditions.map((condition, ci) => (
                        <div key={condition.id} className="flex items-center gap-2">
                          {ci > 0 && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0">{group.logic}</Badge>
                          )}
                          <Select
                            value={condition.field}
                            onValueChange={(v) => updateCondition(group.id, condition.id, 'field', v)}
                          >
                            <SelectTrigger className="h-8 text-xs flex-1">
                              <SelectValue placeholder="Field" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cart_total">Cart Total</SelectItem>
                              <SelectItem value="category">Contains Category</SelectItem>
                              <SelectItem value="customer_tag">Customer Has Tag</SelectItem>
                              <SelectItem value="order_count">Number of Orders</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            value={condition.operator}
                            onValueChange={(v) => updateCondition(group.id, condition.id, 'operator', v)}
                          >
                            <SelectTrigger className="h-8 text-xs w-20">
                              <SelectValue placeholder="Op" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value=">">&gt;</SelectItem>
                              <SelectItem value=">=">&ge;</SelectItem>
                              <SelectItem value="<">&lt;</SelectItem>
                              <SelectItem value="=">=</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Value"
                            value={condition.value}
                            onChange={(e) => updateCondition(group.id, condition.id, 'value', e.target.value)}
                            className="h-8 text-xs flex-1"
                          />
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onClick={() => removeCondition(group.id, condition.id)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}

                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground" onClick={() => addCondition(group.id)}>
                        <Plus className="h-2.5 w-2.5 mr-1" /> Add Condition
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleSaveCoupon(true)} className="text-amber-700 border-amber-200 hover:bg-amber-50">
              <Clock className="h-4 w-4 mr-1.5" />
              Save as Draft
            </Button>
            <Button onClick={() => handleSaveCoupon(false)} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
              <Check className="h-4 w-4 mr-1.5" />
              Activate Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
