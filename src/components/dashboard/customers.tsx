'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
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
  }, [selectedMerchantId, page])

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

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        id: 'customer',
        header: 'Customer',
        cell: ({ row }) => {
          const c = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                {c.name ? c.name.charAt(0).toUpperCase() : c.email.charAt(0).toUpperCase()}
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
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'active' ? 'secondary' : 'outline'} className={
            row.original.status === 'active' ? 'bg-emerald-100 text-emerald-800' : ''
          }>
            {row.original.status}
          </Badge>
        ),
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No customers found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((hg) => (
                      <TableRow key={hg.id}>
                        {hg.headers.map((header) => (
                          <TableHead key={header.id}>
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
                        className="cursor-pointer hover:bg-muted/50"
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
              <div className="flex items-center justify-between mt-4">
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
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-xl font-bold shrink-0">
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
