'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
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
  Download,
  Clock,
  CheckCircle2,
  Loader2,
  Truck,
  XCircle,
  Package,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  FileDown,
  CheckCheck,
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
import { Checkbox } from '@/components/ui/checkbox'
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
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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

const statusConfig: Record<string, { color: string; icon: typeof Clock; pulse?: boolean; spin?: boolean; gradient: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, pulse: true, gradient: 'from-yellow-400 to-amber-500' },
  confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2, gradient: 'from-blue-400 to-indigo-500' },
  processing: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Loader2, spin: true, gradient: 'from-indigo-400 to-purple-500' },
  shipped: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck, gradient: 'from-purple-400 to-violet-500' },
  delivered: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCheck, gradient: 'from-emerald-400 to-teal-500' },
  cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, gradient: 'from-red-400 to-rose-500' },
  refunded: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle, gradient: 'from-gray-400 to-slate-500' },
}

const paymentColors: Record<string, string> = {
  pending: 'border-yellow-300 text-yellow-700',
  paid: 'border-emerald-300 text-emerald-700',
  failed: 'border-red-300 text-red-700',
  refunded: 'border-gray-300 text-gray-700',
  partially_refunded: 'border-orange-300 text-orange-700',
}

const statusTabs = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

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
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [batchAction, setBatchAction] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const tabsRef = useRef<HTMLDivElement>(null)
  const [activeTabRect, setActiveTabRect] = useState<{ left: number; width: number } | null>(null)

  // Computed stats
  const orderStats = useMemo(() => {
    const pending = orders.filter(o => o.status === 'pending').length
    const processing = orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length
    const deliveredToday = orders.filter(o => o.status === 'delivered' && new Date(o.createdAt).toDateString() === new Date().toDateString()).length
    const revenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0)
    return { pending, processing, deliveredToday, revenue }
  }, [orders])

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

  // Animated tab underline position
  useEffect(() => {
    if (!tabsRef.current) return
    const tabEl = tabsRef.current.querySelector(`[data-tab="${statusTab}"]`) as HTMLElement
    if (tabEl) {
      const parentRect = tabsRef.current.getBoundingClientRect()
      const tabRect = tabEl.getBoundingClientRect()
      setActiveTabRect({
        left: tabRect.left - parentRect.left,
        width: tabRect.width,
      })
    }
  }, [statusTab])

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

  const handleBatchAction = async () => {
    if (!batchAction || selectedOrders.size === 0) return
    try {
      if (batchAction === 'ship') {
        for (const id of selectedOrders) {
          await api.put(`/orders/${id}`, { status: 'shipped' })
        }
        toast.success(`${selectedOrders.size} orders marked as shipped`)
      } else if (batchAction === 'export') {
        const selectedData = orders.filter(o => selectedOrders.has(o.id))
        const headers = ['Order #', 'Customer', 'Status', 'Payment', 'Total', 'Date']
        const rows = selectedData.map((o) => [
          o.orderNumber, o.customer?.name || o.customer?.email || 'Guest',
          o.status, o.paymentStatus, `$${o.total.toFixed(2)}`,
          new Date(o.createdAt).toLocaleDateString(),
        ])
        const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'orders-export.csv'; a.click()
        URL.revokeObjectURL(url)
        toast.success(`${selectedData.length} orders exported`)
      }
      setSelectedOrders(new Set())
      setBatchAction(null)
      fetchOrders()
    } catch {
      toast.error('Batch action failed')
    }
  }

  const handleExportAPI = async (filterType: 'all' | 'filtered' = 'all') => {
    if (!selectedStoreId) return
    setExporting(true)
    try {
      const params = new URLSearchParams({
        type: 'orders',
        storeId: selectedStoreId,
        format: 'csv',
      })
      const response = await fetch(`/api/export?${params.toString()}`)
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disposition = response.headers.get('Content-Disposition')
      const match = disposition?.match(/filename="(.+)"/)
      a.download = match?.[1] || 'orders-export.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`${filterType === 'all' ? 'All orders' : 'Orders'} exported successfully`)
    } catch {
      toast.error('Failed to export orders')
    } finally {
      setExporting(false)
    }
  }

  const isHighValue = (order: Order) => order.total >= 500
  const isOldPending = (order: Order) => {
    if (order.status !== 'pending') return false
    const days = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    return days > 2
  }

  const toggleOrderSelection = (id: string) => {
    const next = new Set(selectedOrders)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedOrders(next)
  }

  const toggleAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(orders.map(o => o.id)))
    }
  }

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={selectedOrders.size === orders.length && orders.length > 0}
            onCheckedChange={toggleAll}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedOrders.has(row.original.id)}
            onCheckedChange={() => toggleOrderSelection(row.original.id)}
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        accessorKey: 'orderNumber',
        header: 'Order',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.original.orderNumber}</span>
            {isHighValue(row.original) && (
              <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[10px] px-1.5 py-0 border-0">
                High Value
              </Badge>
            )}
            {isOldPending(row.original) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-1.5 py-0 border-0">
                    <AlertCircle className="h-3 w-3 mr-0.5" /> Aging
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Pending for over 2 days</TooltipContent>
              </Tooltip>
            )}
          </div>
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
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => (
          <span className={`font-semibold ${isHighValue(row.original) ? 'text-amber-700' : ''}`}>
            ${row.original.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const config = statusConfig[row.original.status]
          const StatusIcon = config?.icon || Clock
          return (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`${config?.color || ''} text-xs flex items-center gap-1.5`}>
                <StatusIcon className={`h-3 w-3 ${config?.spin ? 'animate-spin' : ''} ${config?.pulse ? 'animate-pulse' : ''}`} />
                {row.original.status}
              </Badge>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover:bg-muted">
                    Change
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1.5" align="start">
                  <div className="space-y-0.5">
                    {Object.entries(statusConfig).map(([s, cfg]) => (
                      <button
                        key={s}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md hover:bg-muted transition-colors capitalize"
                        onClick={(e) => {
                          e.stopPropagation()
                          setStatusUpdateId(row.original.id)
                          setNewStatus(s)
                        }}
                      >
                        <cfg.icon className={`h-3 w-3 ${s === row.original.status ? 'text-foreground' : 'text-muted-foreground'}`} />
                        {s}
                        {s === row.original.status && <span className="ml-auto text-muted-foreground">•</span>}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )
        },
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Payment',
        cell: ({ row }) => (
          <Badge variant="outline" className={`${paymentColors[row.original.paymentStatus] || ''} text-xs`}>
            {row.original.paymentStatus.replace('_', ' ')}
          </Badge>
        ),
      },
    ],
    [selectedOrders, orders]
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
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Orders', value: total, icon: ShoppingBag, color: 'text-foreground', bg: 'bg-muted/50', gradient: 'from-slate-500 to-gray-600' },
          { label: 'Pending', value: orderStats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', gradient: 'from-yellow-400 to-amber-500' },
          { label: 'Processing', value: orderStats.processing, icon: Loader2, color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-400 to-purple-500' },
          { label: 'Delivered Today', value: orderStats.deliveredToday, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-400 to-teal-500' },
          { label: 'Revenue', value: `$${orderStats.revenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}`, icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50', gradient: 'from-emerald-500 to-teal-600' },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <div className={`flex items-center gap-3 rounded-xl border p-3 ${stat.bg} transition-all hover:shadow-sm`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 shadow-sm">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-sm text-muted-foreground">{total} orders total</p>
        </div>
        <div className="flex gap-2">
          {selectedOrders.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{selectedOrders.size} selected</Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => { setBatchAction('ship') }}>
                    <Truck className="mr-1.5 h-3.5 w-3.5" /> Mark Shipped
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mark selected orders as shipped</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => { setBatchAction('export') }}>
                    <FileDown className="mr-1.5 h-3.5 w-3.5" /> Export
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export selected orders to CSV</TooltipContent>
              </Tooltip>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={!orders.length || exporting}>
                {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportAPI('all')}>
                <FileDown className="mr-2 h-4 w-4" /> Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportAPI('filtered')}>
                <Download className="mr-2 h-4 w-4" /> Export Current View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filter Tabs with Animated Underline */}
      <div ref={tabsRef} className="relative">
        <div className="flex gap-1 border-b pb-0">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              data-tab={tab}
              onClick={() => { setStatusTab(tab); setPage(1) }}
              className={`relative px-4 py-2 text-sm font-medium transition-colors capitalize ${
                statusTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'all' ? 'All' : tab}
              {tab !== 'all' && (
                <span className="ml-1.5 text-[10px] bg-muted rounded-full px-1.5 py-0.5">
                  {tab === 'pending' ? orderStats.pending : tab === 'processing' ? orderStats.processing : '0'}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Animated underline indicator */}
        {activeTabRect && (
          <motion.div
            className="absolute bottom-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            animate={{ left: activeTabRect.left, width: activeTabRect.width }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders, customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-sm"
        />
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium">No orders found</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Orders will appear here when customers make purchases</p>
            </div>
          ) : (
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
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                        isHighValue(row.original) ? 'border-l-2 border-l-amber-400' : ''
                      } ${isOldPending(row.original) ? 'border-l-2 border-l-orange-400' : ''}`}
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
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && orders.length > 0 && (
        <div className="flex items-center justify-between">
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
      )}

      {/* Status update confirmation */}
      <AnimatePresence>
        {statusUpdateId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setStatusUpdateId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <Card className="w-80" onClick={(e) => e.stopPropagation()}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {newStatus && statusConfig[newStatus] && (
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${statusConfig[newStatus].gradient}`}>
                        {(() => { const Ic = statusConfig[newStatus].icon; return <Ic className="h-3.5 w-3.5 text-white" /> })()}
                      </div>
                    )}
                    Update Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Change status to: <strong className="capitalize">{newStatus}</strong>
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleStatusUpdate} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">Confirm</Button>
                    <Button size="sm" variant="outline" onClick={() => setStatusUpdateId(null)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Batch action confirmation */}
      <AnimatePresence>
        {batchAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setBatchAction(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <Card className="w-80" onClick={(e) => e.stopPropagation()}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {batchAction === 'ship' ? 'Mark as Shipped' : 'Export Orders'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {batchAction === 'ship'
                      ? `Mark ${selectedOrders.size} order(s) as shipped?`
                      : `Export ${selectedOrders.size} order(s) to CSV?`}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleBatchAction} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">Confirm</Button>
                    <Button size="sm" variant="outline" onClick={() => setBatchAction(null)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
