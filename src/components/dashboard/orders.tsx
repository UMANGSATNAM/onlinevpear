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
  Download,
  Calendar,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  total: number
  subtotal: number
  currency: string
  createdAt: string
  customer: { id: string; name: string | null; email: string; avatar: string | null } | null
  items: Array<{ id: string; name: string; quantity: number; price: number }>
  payments: Array<{ id: string; method: string; amount: number; status: string }>
}

interface OrdersResponse {
  orders: Order[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

const paymentColors: Record<string, string> = {
  pending: 'border-yellow-300 text-yellow-700',
  paid: 'border-emerald-300 text-emerald-700',
  failed: 'border-red-300 text-red-700',
  refunded: 'border-gray-300 text-gray-700',
  partially_refunded: 'border-orange-300 text-orange-700',
}

const statusTabs = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const

export function OrdersManagement() {
  const { selectedStoreId, setSelectedOrderId, setDashboardPage } = useAppStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState('')

  const fetchOrders = async () => {
    if (!selectedStoreId) return
    setLoading(true)
    try {
      const params: Record<string, string> = {
        storeId: selectedStoreId,
        page: String(page),
        limit: '10',
      }
      if (search) params.search = search
      if (statusTab !== 'all') params.status = statusTab
      const data = await api.get<OrdersResponse>('/orders', params)
      setOrders(data.orders)
      setTotalPages(data.pagination.totalPages)
      setTotal(data.pagination.total)
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [selectedStoreId, page, statusTab])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchOrders()
      else setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleStatusUpdate = async () => {
    if (!statusUpdateId || !newStatus) return
    try {
      await api.put(`/orders/${statusUpdateId}`, { status: newStatus })
      toast.success('Order status updated')
      setStatusUpdateId(null)
      fetchOrders()
    } catch {
      toast.error('Failed to update order status')
    }
  }

  const handleExport = () => {
    if (!orders.length) return
    const headers = ['Order #', 'Customer', 'Status', 'Payment', 'Total', 'Date']
    const rows = orders.map((o) => [
      o.orderNumber,
      o.customer?.name || o.customer?.email || 'Guest',
      o.status,
      o.paymentStatus,
      `$${o.total.toFixed(2)}`,
      new Date(o.createdAt).toLocaleDateString(),
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'orders-export.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Orders exported')
  }

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'orderNumber',
        header: 'Order',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.orderNumber}</span>
        ),
      },
      {
        id: 'customer',
        header: 'Customer',
        cell: ({ row }) => row.original.customer?.name || row.original.customer?.email || 'Guest',
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => (
          <span className="font-medium">
            ${row.original.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={statusColors[row.original.status] || ''}>
              {row.original.status}
            </Badge>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  Change
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-1">
                  {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                    <Button
                      key={s}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => {
                        setStatusUpdateId(row.original.id)
                        setNewStatus(s)
                      }}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ),
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Payment',
        cell: ({ row }) => (
          <Badge variant="outline" className={paymentColors[row.original.paymentStatus] || ''}>
            {row.original.paymentStatus.replace('_', ' ')}
          </Badge>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  })

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-sm text-muted-foreground">{total} orders total</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={!orders.length}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>

      <Tabs value={statusTab} onValueChange={(v) => { setStatusTab(v); setPage(1) }}>
        <TabsList className="flex-wrap h-auto gap-1">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="capitalize text-xs">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No orders found</p>
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
                        onClick={() => {
                          setSelectedOrderId(row.original.id)
                          setDashboardPage('orders')
                        }}
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
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
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

      {/* Status update confirmation */}
      {statusUpdateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setStatusUpdateId(null)}>
          <Card className="w-80" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="text-base">Update Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Change status to: <strong className="capitalize">{newStatus}</strong>
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleStatusUpdate}>Confirm</Button>
                <Button size="sm" variant="outline" onClick={() => setStatusUpdateId(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  )
}
