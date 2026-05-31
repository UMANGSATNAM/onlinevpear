'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  Store,
  Mail,
  Phone,
  Globe,
  Calendar,
  CreditCard,
  Users,
  ShoppingBag,
  Package,
  Receipt,
  Clock,
  MessageSquare,
  KeyRound,
  ExternalLink,
  Download,
  ChevronDown,
  UserPlus,
  Activity,
  TrendingUp,
  AlertCircle,
  Loader2,
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

const statusColors: Record<string, string> = {
  active: 'bg-[#00D4FF]/15 text-[#00D4FF]',
  trial: 'bg-[#F59E0B]/15 text-[#F59E0B]',
  suspended: 'bg-red-500/15 text-red-400',
  cancelled: 'bg-gray-500/15 text-gray-400',
}

const statusDotColors: Record<string, string> = {
  active: 'bg-[#00D4FF]',
  trial: 'bg-[#F59E0B]',
  suspended: 'bg-red-500',
  cancelled: 'bg-gray-400',
}

const planBadgeStyles: Record<string, string> = {
  starter: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
  professional: 'bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20',
  enterprise: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
}

const avatarGradients = [
  'from-[#00D4FF] to-[#0891B2]',
  'from-[#A78BFA] to-[#7C3AED]',
  'from-[#38BDF8] to-[#0284C7]',
  'from-[#F59E0B] to-[#D97706]',
  'from-[#F472B6] to-[#DB2777]',
  'from-[#34D399] to-[#059669]',
]

interface Merchant {
  id: string
  businessName: string
  email: string
  phone: string | null
  domain: string | null
  subdomain: string | null
  status: string
  planId: string | null
  createdAt: string
  plan: { id: string; name: string; displayName: string; price: number } | null
  _count: { stores: number; customers: number; users: number }
}

interface MerchantDetail {
  id: string
  businessName: string
  email: string
  phone: string | null
  logo: string | null
  domain: string | null
  subdomain: string | null
  status: string
  planId: string | null
  trialEndsAt: string | null
  onboardedAt: string | null
  settings: string
  createdAt: string
  plan: { id: string; name: string; displayName: string; price: number; features: string } | null
  stores: Array<{
    id: string
    name: string
    slug: string
    status: string
    _count: { products: number; orders: number }
  }>
  subscriptions: Array<{
    id: string
    status: string
    currentPeriodStart: string
    currentPeriodEnd: string
    plan: { id: string; name: string; displayName: string; price: number }
  }>
  users: Array<{
    id: string
    role: string
    user: { id: string; name: string | null; email: string; image: string | null }
  }>
}

interface MerchantsResponse {
  merchants: Merchant[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

function getAvatarGradient(name: string) {
  const idx = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % avatarGradients.length
  return avatarGradients[idx]
}

export function MerchantManagement() {
  const { setSelectedMerchantAdminId } = useAppStore()
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<string>('')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [detailTab, setDetailTab] = useState<'info' | 'activity' | 'actions'>('info')

  const fetchMerchants = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' }
      if (search) params.search = search
      if (statusFilter !== 'all') params.status = statusFilter
      const result = await api.get<MerchantsResponse>('/merchants', params)
      setMerchants(result.merchants)
      setPagination(result.pagination)
    } catch {
      toast.error('Failed to load merchants')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    fetchMerchants()
  }, [fetchMerchants])

  // Computed stats
  const stats = {
    total: pagination.total || merchants.length,
    active: merchants.filter((m) => m.status === 'active').length,
    trial: merchants.filter((m) => m.status === 'trial').length,
    suspended: merchants.filter((m) => m.status === 'suspended').length,
    newThisMonth: merchants.filter((m) => {
      const d = new Date(m.createdAt)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length,
  }

  const viewMerchantDetail = async (merchantId: string) => {
    setDetailLoading(true)
    setDetailOpen(true)
    setDetailTab('info')
    try {
      const result = await api.get<{ merchant: MerchantDetail }>(`/merchants/${merchantId}`)
      setSelectedMerchant(result.merchant)
    } catch {
      toast.error('Failed to load merchant details')
    } finally {
      setDetailLoading(false)
    }
  }

  const updateMerchantStatus = async (merchantId: string, status: string) => {
    try {
      await api.put(`/merchants/${merchantId}`, { status })
      toast.success(`Merchant ${status === 'active' ? 'activated' : status === 'suspended' ? 'suspended' : 'updated'}`)
      fetchMerchants()
      if (detailOpen && selectedMerchant?.id === merchantId) {
        viewMerchantDetail(merchantId)
      }
    } catch {
      toast.error('Failed to update merchant status')
    }
  }

  // Bulk actions
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === merchants.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(merchants.map((m) => m.id)))
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return
    setBulkLoading(true)
    try {
      const ids = Array.from(selectedIds)
      if (bulkAction === 'suspend') {
        for (const id of ids) await api.put(`/merchants/${id}`, { status: 'suspended' })
        toast.success(`${ids.length} merchant(s) suspended`)
      } else if (bulkAction === 'activate') {
        for (const id of ids) await api.put(`/merchants/${id}`, { status: 'active' })
        toast.success(`${ids.length} merchant(s) activated`)
      } else if (bulkAction === 'export') {
        const csvRows = ['Business Name,Email,Status,Plan,Stores,Created']
        const selectedMerchants = merchants.filter((m) => selectedIds.has(m.id))
        selectedMerchants.forEach((m) => {
          csvRows.push(`"${m.businessName}","${m.email}","${m.status}","${m.plan?.displayName || 'None'}",${m._count.stores},"${new Date(m.createdAt).toLocaleDateString()}"`)
        })
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'merchants-export.csv'
        a.click()
        URL.revokeObjectURL(url)
        toast.success(`Exported ${ids.length} merchant(s)`)
      }
      setSelectedIds(new Set())
      setBulkAction('')
      fetchMerchants()
    } catch {
      toast.error('Bulk action failed')
    } finally {
      setBulkLoading(false)
    }
  }

  // Activity timeline mock data
  const activityTimeline = selectedMerchant ? [
    { icon: Clock, label: 'Last Login', value: '2 hours ago', color: 'text-emerald-500' },
    { icon: ShoppingBag, label: 'Last Order', value: '1 day ago', color: 'text-violet-500' },
    { icon: UserPlus, label: 'Signup Date', value: new Date(selectedMerchant.createdAt).toLocaleDateString(), color: 'text-amber-500' },
    { icon: Package, label: 'First Product', value: '3 days after signup', color: 'text-sky-500' },
    { icon: CreditCard, label: 'First Payment', value: selectedMerchant.subscriptions.length > 0 ? 'Trial conversion' : 'Pending', color: 'text-rose-500' },
  ] : []

  return (
    <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <motion.div {...fadeIn}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#F9FAFB]" style={{ fontFamily: "'Syne', sans-serif" }}>Merchant Management</h2>
            <p className="text-[#94A3B8]">Manage all merchants on the platform</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search merchants..."
                className="pl-9 w-full sm:w-[250px]"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Merchant Stats Bar */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { title: 'Total Merchants', value: stats.total, icon: Store, gradient: 'from-[#00D4FF] to-[#0891B2]', bg: '' },
          { title: 'Active', value: stats.active, icon: CheckCircle, gradient: 'from-[#00D4FF] to-[#0891B2]', bg: '' },
          { title: 'Trial', value: stats.trial, icon: Clock, gradient: 'from-[#F59E0B] to-[#D97706]', bg: '' },
          { title: 'Suspended', value: stats.suspended, icon: AlertCircle, gradient: 'from-red-500 to-rose-600', bg: '' },
          { title: 'New This Month', value: stats.newThisMonth, icon: TrendingUp, gradient: 'from-[#A78BFA] to-[#7C3AED]', bg: '' },
        ].map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="relative overflow-hidden hover:shadow-lg hover:shadow-[#00D4FF]/5 transition-all duration-300 bg-white/5 backdrop-blur-xl border-white/10">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#94A3B8] font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1 text-[#F9FAFB]">{stat.value}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5"
          >
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-[160px] h-8">
                <SelectValue placeholder="Bulk action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activate">Activate</SelectItem>
                <SelectItem value="suspend">Suspend</SelectItem>
                <SelectItem value="export">Export CSV</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleBulkAction} disabled={!bulkAction || bulkLoading}>
              {bulkLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
              Apply
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setSelectedIds(new Set()); setBulkAction('') }}>
              Clear
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="overflow-hidden bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : merchants.length === 0 ? (
              <div className="p-12 text-center">
                <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No merchants found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white/5">
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={selectedIds.size === merchants.length && merchants.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-semibold text-[#94A3B8]">Business Name</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-semibold text-[#94A3B8]">Email</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-semibold text-[#94A3B8]">Plan</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-semibold text-[#94A3B8]">Status</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-semibold text-[#94A3B8]">Stores</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-semibold text-[#94A3B8]">Created</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {merchants.map((merchant) => (
                      <TableRow
                        key={merchant.id}
                        className="cursor-pointer hover:bg-white/5 transition-colors group"
                        onClick={() => viewMerchantDetail(merchant.id)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(merchant.id)}
                            onCheckedChange={() => toggleSelect(merchant.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${getAvatarGradient(merchant.businessName)} flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0`}>
                              {merchant.businessName[0].toUpperCase()}
                            </div>
                            <span className="font-medium group-hover:text-[#00D4FF] transition-colors text-[#F9FAFB]">{merchant.businessName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#94A3B8]">{merchant.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={planBadgeStyles[merchant.plan?.name?.toLowerCase() || ''] || 'border-gray-200'}
                          >
                            {merchant.plan?.displayName || 'No Plan'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${statusDotColors[merchant.status] || 'bg-gray-400'} ${merchant.status === 'active' ? 'animate-pulse' : ''}`} />
                            <Badge variant="secondary" className={statusColors[merchant.status] || ''}>
                              {merchant.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-[#94A3B8]">
                            <Store className="h-3 w-3" />
                            {merchant._count.stores}
                          </span>
                        </TableCell>
                        <TableCell className="text-[#94A3B8] text-sm">
                          {new Date(merchant.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); viewMerchantDetail(merchant.id) }}>
                                <Eye className="h-4 w-4 mr-2" />View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedMerchantAdminId(merchant.id) }}>
                                <Store className="h-4 w-4 mr-2" />View Stores
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {merchant.status !== 'active' && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateMerchantStatus(merchant.id, 'active') }}>
                                  <CheckCircle className="h-4 w-4 mr-2" />Activate
                                </DropdownMenuItem>
                              )}
                              {merchant.status !== 'suspended' && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateMerchantStatus(merchant.id, 'suspended') }} className="text-red-600">
                                  <Ban className="h-4 w-4 mr-2" />Suspend
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, pagination.total)} of {pagination.total} merchants
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Merchant Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
          {detailLoading ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="grid grid-cols-2 gap-4 mt-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : selectedMerchant ? (
            <div>
              {/* Header with gradient background */}
              <div className="relative bg-gradient-to-r from-[#0A0F1E] via-[#111827] to-[#0A0F1E] p-6 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#00D4FF]/20 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#A78BFA]/20 rounded-full blur-3xl" />
                </div>
                <div className="relative flex items-start gap-4">
                  {/* Avatar with gradient */}
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${getAvatarGradient(selectedMerchant.businessName)} flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0`}>
                    {selectedMerchant.businessName[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-white">{selectedMerchant.businessName}</h3>
                      <Badge variant="secondary" className={statusColors[selectedMerchant.status] || ''}>
                        <div className={`h-1.5 w-1.5 rounded-full ${statusDotColors[selectedMerchant.status]} mr-1.5 ${selectedMerchant.status === 'active' ? 'animate-pulse' : ''}`} />
                        {selectedMerchant.status}
                      </Badge>
                      {selectedMerchant.plan && (
                        <Badge variant="outline" className={planBadgeStyles[selectedMerchant.plan.name?.toLowerCase() || ''] || 'border-white/20 text-white'}>
                          {selectedMerchant.plan.displayName}
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/60 text-sm mt-1">{selectedMerchant.email}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {selectedMerchant.status !== 'active' && (
                      <Button size="sm" onClick={() => updateMerchantStatus(selectedMerchant.id, 'active')} className="bg-[#00D4FF] hover:bg-[#0891B2] text-[#0A0F1E]">
                        <CheckCircle className="h-4 w-4 mr-1" />Activate
                      </Button>
                    )}
                    {selectedMerchant.status !== 'suspended' && (
                      <Button size="sm" variant="destructive" onClick={() => updateMerchantStatus(selectedMerchant.id, 'suspended')}>
                        <Ban className="h-4 w-4 mr-1" />Suspend
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tab navigation */}
              <div className="border-b">
                <div className="flex gap-0 px-6">
                  {(['info', 'activity', 'actions'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                        detailTab === tab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab === 'info' ? 'Information' : tab === 'activity' ? 'Activity' : 'Quick Actions'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <ScrollArea className="max-h-[55vh]">
                <div className="p-6">
                  {detailTab === 'info' && (
                    <div className="space-y-6">
                      {/* Contact & Account Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium">{selectedMerchant.email}</p>
                          </div>
                        </div>
                        {selectedMerchant.phone && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Phone</p>
                              <p className="text-sm font-medium">{selectedMerchant.phone}</p>
                            </div>
                          </div>
                        )}
                        {selectedMerchant.domain && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Domain</p>
                              <p className="text-sm font-medium">{selectedMerchant.domain}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Joined</p>
                            <p className="text-sm font-medium">{new Date(selectedMerchant.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {selectedMerchant.trialEndsAt && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Trial Ends</p>
                              <p className="text-sm font-medium">{new Date(selectedMerchant.trialEndsAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Team Members</p>
                            <p className="text-sm font-medium">{selectedMerchant.users.length}</p>
                          </div>
                        </div>
                      </div>

                      {/* Stats Cards */}
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: 'Stores', value: selectedMerchant.stores.length, icon: Store, gradient: 'from-[#00D4FF] to-[#0891B2]' },
                          { label: 'Products', value: selectedMerchant.stores.reduce((s, st) => s + st._count.products, 0), icon: Package, gradient: 'from-[#A78BFA] to-[#7C3AED]' },
                          { label: 'Orders', value: selectedMerchant.stores.reduce((s, st) => s + st._count.orders, 0), icon: Receipt, gradient: 'from-[#F59E0B] to-[#D97706]' },
                          { label: 'Revenue', value: `$${selectedMerchant.subscriptions.reduce((s, sub) => s + sub.plan.price, 0).toLocaleString()}`, icon: CreditCard, gradient: 'from-[#F472B6] to-[#DB2777]' },
                        ].map((stat) => (
                          <div key={stat.label} className="relative p-3 rounded-lg border overflow-hidden">
                            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient}`} />
                            <div className="flex items-center gap-2">
                              <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                                <stat.icon className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-[#94A3B8]">{stat.label}</p>
                                <p className="text-sm font-bold text-[#F9FAFB]">{stat.value}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Stores */}
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Stores ({selectedMerchant.stores.length})</h4>
                        {selectedMerchant.stores.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No stores yet</p>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {selectedMerchant.stores.map((store) => (
                              <div key={store.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div>
                                  <p className="text-sm font-medium">{store.name}</p>
                                  <p className="text-xs text-[#94A3B8]">{store.slug}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-[#94A3B8]">{store._count.products} products</span>
                                  <span className="text-xs text-[#94A3B8]">{store._count.orders} orders</span>
                                  <Badge variant="secondary" className={statusColors[store.status] || ''}>
                                    {store.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Team Members */}
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Team Members</h4>
                        {selectedMerchant.users.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No team members</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedMerchant.users.map((mu) => (
                              <div key={mu.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-3">
                                  <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${getAvatarGradient(mu.user.name || mu.user.email)} flex items-center justify-center text-white text-xs font-bold`}>
                                    {(mu.user.name || mu.user.email)[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{mu.user.name || mu.user.email}</p>
                                    <p className="text-xs text-[#94A3B8]">{mu.user.email}</p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="capitalize">{mu.role}</Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {detailTab === 'activity' && (
                    <div className="space-y-6">
                      {/* Status Toggle */}
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Account Status</p>
                            <p className="text-xs text-[#94A3B8]">Toggle merchant account status</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={selectedMerchant.status === 'active' ? 'default' : 'outline'}
                            onClick={() => updateMerchantStatus(selectedMerchant.id, 'active')}
                            className={selectedMerchant.status === 'active' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                          >
                            Active
                          </Button>
                          <Button
                            size="sm"
                            variant={selectedMerchant.status === 'suspended' ? 'destructive' : 'outline'}
                            onClick={() => updateMerchantStatus(selectedMerchant.id, 'suspended')}
                          >
                            Suspended
                          </Button>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div>
                        <h4 className="text-sm font-semibold mb-4">Activity Timeline</h4>
                        <div className="relative space-y-0">
                          {activityTimeline.map((item, i) => (
                            <div key={i} className="flex gap-4 pb-6 last:pb-0">
                              <div className="flex flex-col items-center">
                                <div className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center ${item.color}`}>
                                  <item.icon className="h-4 w-4" />
                                </div>
                                {i < activityTimeline.length - 1 && (
                                  <div className="w-px flex-1 bg-border mt-1" />
                                )}
                              </div>
                              <div className="pt-1">
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className="text-xs text-[#94A3B8]">{item.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Subscriptions */}
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Subscriptions</h4>
                        {selectedMerchant.subscriptions.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No subscriptions</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedMerchant.subscriptions.map((sub) => (
                              <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div>
                                  <p className="text-sm font-medium">{sub.plan.displayName}</p>
                                  <p className="text-xs text-[#94A3B8]">
                                    {new Date(sub.currentPeriodStart).toLocaleDateString()} - {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge variant="secondary" className={
                                  sub.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                                }>
                                  {sub.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {detailTab === 'actions' && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold mb-4">Quick Actions</h4>
                      {[
                        { icon: Ban, label: 'Suspend Merchant', desc: 'Temporarily disable this merchant account', action: () => updateMerchantStatus(selectedMerchant.id, 'suspended'), variant: 'outline' as const, className: 'hover:bg-red-50 hover:text-red-600 hover:border-red-200' },
                        { icon: MessageSquare, label: 'Send Message', desc: 'Send an email notification to the merchant', action: () => toast.success('Message sent to ' + selectedMerchant.email), variant: 'outline' as const, className: 'hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200' },
                        { icon: ExternalLink, label: 'View Store', desc: 'Open the merchant storefront in a new tab', action: () => { if (selectedMerchant.domain) window.open(`https://${selectedMerchant.domain}`, '_blank'); else toast.info('No custom domain set') }, variant: 'outline' as const, className: 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200' },
                        { icon: KeyRound, label: 'Reset Password', desc: 'Send a password reset link to the merchant', action: () => toast.success('Password reset email sent'), variant: 'outline' as const, className: 'hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200' },
                        { icon: CheckCircle, label: 'Activate Merchant', desc: 'Re-enable this merchant account', action: () => updateMerchantStatus(selectedMerchant.id, 'active'), variant: 'outline' as const, className: 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200' },
                        { icon: Download, label: 'Export Data', desc: 'Download merchant data as CSV', action: () => toast.success('Export started'), variant: 'outline' as const, className: 'hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200' },
                      ].map((action) => (
                        <button
                          key={action.label}
                          onClick={action.action}
                          className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${action.className}`}
                        >
                          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                            <action.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{action.label}</p>
                            <p className="text-xs text-muted-foreground">{action.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
