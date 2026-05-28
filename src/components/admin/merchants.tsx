'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
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
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  trial: 'bg-amber-100 text-amber-800',
  suspended: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

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

export function MerchantManagement() {
  const { setSelectedMerchantAdminId, selectedMerchantAdminId } = useAppStore()
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  const fetchMerchants = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' }
      if (search) params.search = search
      if (statusFilter !== 'all') params.status = statusFilter
      const result = await api.get<MerchantsResponse>('/merchants', params)
      setMerchants(result.merchants)
      setPagination(result.pagination)
    } catch (err) {
      toast.error('Failed to load merchants')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    fetchMerchants()
  }, [fetchMerchants])

  const viewMerchantDetail = async (merchantId: string) => {
    setDetailLoading(true)
    setDetailOpen(true)
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

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Merchant Management</h2>
            <p className="text-muted-foreground">Manage all merchants on the platform</p>
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

      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card>
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
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stores</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {merchants.map((merchant) => (
                      <TableRow
                        key={merchant.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => viewMerchantDetail(merchant.id)}
                      >
                        <TableCell className="font-medium">{merchant.businessName}</TableCell>
                        <TableCell className="text-muted-foreground">{merchant.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{merchant.plan?.displayName || 'No Plan'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusColors[merchant.status] || ''}>
                            {merchant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{merchant._count.stores}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Merchant Details</DialogTitle>
            <DialogDescription>View and manage merchant information</DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="grid grid-cols-2 gap-4 mt-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : selectedMerchant ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedMerchant.businessName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className={statusColors[selectedMerchant.status] || ''}>
                      {selectedMerchant.status}
                    </Badge>
                    <Badge variant="outline">{selectedMerchant.plan?.displayName || 'No Plan'}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedMerchant.status !== 'active' && (
                    <Button size="sm" onClick={() => updateMerchantStatus(selectedMerchant.id, 'active')}>
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

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{selectedMerchant.email}</p>
                  </div>
                </div>
                {selectedMerchant.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{selectedMerchant.phone}</p>
                    </div>
                  </div>
                )}
                {selectedMerchant.domain && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Domain</p>
                      <p className="text-sm font-medium">{selectedMerchant.domain}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-sm font-medium">{new Date(selectedMerchant.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {selectedMerchant.trialEndsAt && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Trial Ends</p>
                      <p className="text-sm font-medium">{new Date(selectedMerchant.trialEndsAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Team Members</p>
                    <p className="text-sm font-medium">{selectedMerchant.users.length}</p>
                  </div>
                </div>
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
                          <p className="text-xs text-muted-foreground">{store.slug}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{store._count.products} products</span>
                          <span className="text-xs text-muted-foreground">{store._count.orders} orders</span>
                          <Badge variant="secondary" className={statusColors[store.status] || ''}>
                            {store.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                          <p className="text-xs text-muted-foreground">
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
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {(mu.user.name || mu.user.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{mu.user.name || mu.user.email}</p>
                            <p className="text-xs text-muted-foreground">{mu.user.email}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">{mu.role}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
