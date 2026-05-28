'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  StickyNote,
  Tag,
  X,
  Plus,
  Download,
  Users,
  UserCheck,
  Loader2,
  Crown,
  UserPlus,
  UserX,
  Filter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'

interface Customer {
  id: string
  email: string
  name: string | null
  phone: string | null
  avatar: string | null
  tags: string
  notes: string | null
  totalOrders: number
  totalSpent: number
  avgOrderValue: number
  lastOrderAt: string | null
  status: string
  createdAt: string
  store: { id: string; name: string }
  _count: { orders: number }
}

interface CustomerDetail {
  id: string
  email: string
  name: string | null
  phone: string | null
  avatar: string | null
  tags: string
  notes: string | null
  totalOrders: number
  totalSpent: number
  avgOrderValue: number
  lastOrderAt: string | null
  status: string
  addresses: string
  orders: Array<{
    id: string
    orderNumber: string
    status: string
    total: number
    createdAt: string
    items: Array<{ id: string; name: string; quantity: number; price: number }>
  }>
  reviews: Array<{ id: string; rating: number; title: string | null; content: string | null; createdAt: string }>
}

interface CustomersResponse {
  customers: Customer[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

// Color palette for name-hash based avatars
const avatarColors = [
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-sky-500 to-blue-600',
  'from-fuchsia-500 to-pink-600',
  'from-lime-500 to-green-600',
  'from-cyan-500 to-teal-600',
]

function nameHashColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

type CustomerFilter = 'all' | 'active' | 'inactive' | 'vip' | 'new'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export function CustomersManagement() {
  const { selectedMerchantId, setSelectedCustomerId } = useAppStore()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [exporting, setExporting] = useState(false)
  const [statusFilter, setStatusFilter] = useState<CustomerFilter>('all')

  const fetchCustomers = async () => {
    if (!selectedMerchantId) return
    setLoading(true)
    try {
      const params: Record<string, string> = {
        merchantId: selectedMerchantId,
        page: String(page),
        limit: '10',
      }
      if (search) params.search = search
      if (statusFilter === 'active') params.status = 'active'
      else if (statusFilter === 'inactive') params.status = 'inactive'
      const data = await api.get<CustomersResponse>('/customers', params)
      setCustomers(data.customers)
      setTotalPages(data.pagination.totalPages)
      setTotal(data.pagination.total)
    } catch {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [selectedMerchantId, page, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchCustomers()
      else setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const openCustomerDetail = async (customerId: string) => {
    setDetailLoading(true)
    setDetailOpen(true)
    try {
      const data = await api.get<{ customer: CustomerDetail }>(`/customers/${customerId}`)
      setSelectedCustomer(data.customer)
      setNoteText(data.customer.notes || '')
      setTagInput('')
    } catch {
      toast.error('Failed to load customer details')
    } finally {
      setDetailLoading(false)
    }
  }

  const addNote = async () => {
    if (!selectedCustomer || !noteText.trim()) return
    try {
      await api.put(`/customers/${selectedCustomer.id}`, { notes: noteText })
      toast.success('Note added')
      openCustomerDetail(selectedCustomer.id)
    } catch {
      toast.error('Failed to add note')
    }
  }

  const addTag = async () => {
    if (!selectedCustomer || !tagInput.trim()) return
    try {
      const currentTags: string[] = JSON.parse(selectedCustomer.tags || '[]')
      const newTags = [...new Set([...currentTags, tagInput.trim()])]
      await api.put(`/customers/${selectedCustomer.id}`, { tags: newTags })
      toast.success('Tag added')
      setTagInput('')
      openCustomerDetail(selectedCustomer.id)
    } catch {
      toast.error('Failed to add tag')
    }
  }

  const removeTag = async (tag: string) => {
    if (!selectedCustomer) return
    try {
      const currentTags: string[] = JSON.parse(selectedCustomer.tags || '[]')
      const newTags = currentTags.filter((t) => t !== tag)
      await api.put(`/customers/${selectedCustomer.id}`, { tags: newTags })
      toast.success('Tag removed')
      openCustomerDetail(selectedCustomer.id)
    } catch {
      toast.error('Failed to remove tag')
    }
  }

  const handleExportCustomers = async (filter: 'all' | 'active' = 'all') => {
    if (!selectedMerchantId) return
    setExporting(true)
    try {
      const params = new URLSearchParams({
        type: 'customers',
        merchantId: selectedMerchantId,
        format: 'csv',
        filter,
      })
      const response = await fetch(`/api/export?${params.toString()}`)
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disposition = response.headers.get('Content-Disposition')
      const match = disposition?.match(/filename="(.+)"/)
      a.download = match?.[1] || 'customers-export.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`${filter === 'all' ? 'All customers' : 'Active customers'} exported successfully`)
    } catch {
      toast.error('Failed to export customers')
    } finally {
      setExporting(false)
    }
  }

  const parseTags = (tagsStr: string): string[] => {
    try {
      return JSON.parse(tagsStr || '[]')
    } catch {
      return []
    }
  }

  // Computed customer stats
  const customerStats = useMemo(() => {
    const totalC = total
    const activeC = customers.filter(c => c.status === 'active').length
    const vipC = customers.filter(c => c.totalSpent > 500).length
    const newThisMonth = customers.filter(c => {
      const created = new Date(c.createdAt)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length
    return { totalC, activeC, vipC, newThisMonth }
  }, [customers, total])

  // Segment data for pie chart
  const segmentData = useMemo(() => {
    const active = customers.filter(c => c.status === 'active').length
    const inactive = customers.filter(c => c.status !== 'active').length
    const vip = customers.filter(c => c.totalSpent > 500).length
    const newCust = customers.filter(c => {
      const d = new Date(c.createdAt)
      const now = new Date()
      return now.getTime() - d.getTime() < 30 * 24 * 60 * 60 * 1000
    }).length
    const returning = Math.max(0, active - newCust - vip)
    return [
      { name: 'New', value: newCust, color: '#10b981' },
      { name: 'Returning', value: returning, color: '#6366f1' },
      { name: 'VIP', value: vip, color: '#f59e0b' },
      { name: 'Inactive', value: inactive, color: '#94a3b8' },
    ].filter(s => s.value > 0)
  }, [customers])

  const filterChips: { key: CustomerFilter; label: string; icon: React.ElementType }[] = [
    { key: 'all', label: 'All', icon: Users },
    { key: 'active', label: 'Active', icon: UserCheck },
    { key: 'inactive', label: 'Inactive', icon: UserX },
    { key: 'vip', label: 'VIP', icon: Crown },
    { key: 'new', label: 'New', icon: UserPlus },
  ]

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        id: 'customer',
        header: 'Customer',
        cell: ({ row }) => {
          const c = row.original
          const displayName = c.name || c.email
          const initial = displayName.charAt(0).toUpperCase()
          const gradient = nameHashColor(displayName)
          return (
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-sm font-semibold text-white shrink-0 shadow-sm`}>
                {initial}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{c.name || 'No name'}</p>
                <p className="text-xs text-muted-foreground truncate">{c.email}</p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'totalOrders',
        header: 'Orders',
        cell: ({ row }) => (
          <span className="font-medium">{row.original._count?.orders ?? row.original.totalOrders}</span>
        ),
      },
      {
        accessorKey: 'totalSpent',
        header: 'Total Spent',
        cell: ({ row }) => (
          <span className="font-medium">${row.original.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const isVip = row.original.totalSpent > 500
          return (
            <div className="flex items-center gap-1.5">
              {isVip && (
                <Crown className="h-3.5 w-3.5 text-amber-500" />
              )}
              <Badge variant={row.original.status === 'active' ? 'secondary' : 'outline'} className={
                row.original.status === 'active' ? 'bg-emerald-100 text-emerald-800' : ''
              }>
                {isVip ? 'VIP' : row.original.status}
              </Badge>
            </div>
          )
        },
      },
      {
        id: 'tags',
        header: 'Tags',
        cell: ({ row }) => {
          const tags = parseTags(row.original.tags)
          if (tags.length === 0) return <span className="text-muted-foreground text-xs">—</span>
          return (
            <div className="flex gap-1 flex-wrap">
              {tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
              {tags.length > 2 && <span className="text-xs text-muted-foreground">+{tags.length - 2}</span>}
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: customers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Customers</h2>
          <p className="text-sm text-muted-foreground">{total} customers total</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={exporting}>
              {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExportCustomers('all')}>
              <Users className="mr-2 h-4 w-4" /> Export All Customers
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportCustomers('active')}>
              <UserCheck className="mr-2 h-4 w-4" /> Export Active Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Customer Stats Bar */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold tracking-tight">{customerStats.totalC}</p>
                </div>
                <div className="bg-violet-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-5 w-5 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                  <p className="text-2xl font-bold tracking-tight">{customerStats.newThisMonth}</p>
                </div>
                <div className="bg-emerald-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold tracking-tight">{customerStats.activeC}</p>
                </div>
                <div className="bg-sky-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="h-5 w-5 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">VIP</p>
                  <p className="text-2xl font-bold tracking-tight">{customerStats.vipC}</p>
                </div>
                <div className="bg-amber-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <Crown className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Customer Segments + Filter Bar */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 lg:grid-cols-4">
          {/* Filter Chips */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <span>Filter:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filterChips.map((chip) => (
                      <motion.button
                        key={chip.key}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setStatusFilter(chip.key); setPage(1) }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                          statusFilter === chip.key
                            ? chip.key === 'vip'
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-sm'
                              : 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        }`}
                      >
                        <chip.icon className="h-3.5 w-3.5" />
                        {chip.label}
                      </motion.button>
                    ))}
                  </div>
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Segments Pie Chart */}
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-2">Segments</p>
              {segmentData.length > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="h-20 w-20 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={segmentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={18}
                          outerRadius={36}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {segmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1">
                    {segmentData.map((seg) => (
                      <div key={seg.name} className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                        <span className="text-xs text-muted-foreground">{seg.name}</span>
                        <span className="text-xs font-semibold">{seg.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">No segment data</p>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Customers Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                ))}
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-4">
                  <Users className="h-10 w-10 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No customers yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                  Start building your customer base. They&apos;ll appear here once they make their first purchase.
                </p>
                <Button variant="outline" onClick={() => fetchCustomers()}>
                  <Users className="mr-2 h-4 w-4" /> Refresh
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((hg) => (
                        <TableRow key={hg.id}>
                          {hg.headers.map((header) => (
                            <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wider">
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors group"
                          onClick={() => openCustomerDetail(row.original.id)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Customer Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : selectedCustomer ? (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="flex items-start gap-4">
                <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${nameHashColor(selectedCustomer.name || selectedCustomer.email)} flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-md`}>
                  {(selectedCustomer.name || selectedCustomer.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedCustomer.name || 'No name'}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                  {selectedCustomer.phone && <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>}
                  <div className="flex gap-4 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Orders</p>
                      <p className="font-semibold">{selectedCustomer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                      <p className="font-semibold">${selectedCustomer.totalSpent.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Order</p>
                      <p className="font-semibold">${selectedCustomer.avgOrderValue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Tags
                </h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {parseTags(selectedCustomer.tags).map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="h-8"
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button size="sm" variant="outline" onClick={addTag}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Notes */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <StickyNote className="h-4 w-4" /> Notes
                </h4>
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note about this customer..."
                  rows={3}
                />
                <Button size="sm" className="mt-2" onClick={addNote}>Save Note</Button>
              </div>

              <Separator />

              {/* Recent Orders */}
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Orders</h4>
                {selectedCustomer.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-sm font-medium">{order.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">${order.total.toFixed(2)}</p>
                          <Badge variant="outline" className="text-xs">{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  if (selectedCustomer.email) {
                    window.open(`mailto:${selectedCustomer.email}`)
                  }
                }}>
                  <Mail className="mr-1 h-3 w-3" /> Send Email
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
