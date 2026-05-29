'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Save,
  Minus,
  Plus,
  ShoppingCart,
  Download,
  ArrowRight,
  PackageX,
  TrendingDown,
  Package,
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
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface InventoryItem {
  id: string
  quantity: number
  reserved: number
  location: string | null
  lowStockThreshold: number
  trackStock: boolean
  product: { id: string; name: string; sku: string | null; storeId: string; images: string }
  variant: { id: string; title: string; sku: string | null; options: string } | null
}

interface InventoryResponse {
  items: InventoryItem[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export function InventoryManagement() {
  const { selectedStoreId } = useAppStore()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [editThreshold, setEditThreshold] = useState('')
  const [saving, setSaving] = useState(false)
  const [bulkAction, setBulkAction] = useState<string | null>(null)
  const [bulkValue, setBulkValue] = useState('')
  const [inlineEdits, setInlineEdits] = useState<Record<string, number>>({})

  const fetchInventory = async () => {
    if (!selectedStoreId) return
    setLoading(true)
    try {
      const params: Record<string, string> = {
        storeId: selectedStoreId,
        page: String(page),
        limit: '15',
      }
      if (stockFilter === 'low_stock') params.lowStock = 'true'
      const data = await api.get<InventoryResponse>('/inventory', params)

      // Client-side filter for out_of_stock and in_stock
      let filtered = data.items
      if (stockFilter === 'out_of_stock') {
        filtered = data.items.filter((i) => i.quantity <= 0)
      } else if (stockFilter === 'in_stock') {
        filtered = data.items.filter((i) => i.quantity > i.lowStockThreshold)
      }

      setItems(filtered)
      setTotalPages(data.pagination.totalPages)
      setTotal(data.pagination.total)
    } catch {
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [selectedStoreId, page, stockFilter])

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= 0) return 'out_of_stock'
    if (item.quantity <= item.lowStockThreshold) return 'low_stock'
    return 'in_stock'
  }

  const handleQuickUpdate = async () => {
    if (!editItem) return
    setSaving(true)
    try {
      await api.put('/inventory', {
        id: editItem.id,
        quantity: parseInt(editQuantity),
        lowStockThreshold: parseInt(editThreshold),
      })
      toast.success('Inventory updated')
      setEditItem(null)
      fetchInventory()
    } catch {
      toast.error('Failed to update inventory')
    } finally {
      setSaving(false)
    }
  }

  const handleInlineStockChange = async (itemId: string, delta: number) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return
    const newQty = Math.max(0, item.quantity + delta)
    setInlineEdits(prev => ({ ...prev, [itemId]: newQty }))
    try {
      await api.put('/inventory', { id: itemId, quantity: newQty })
      toast.success(`Stock updated to ${newQty}`)
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i))
    } catch {
      toast.error('Failed to update stock')
      setInlineEdits(prev => {
        const next = { ...prev }
        delete next[itemId]
        return next
      })
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedRows.size === 0) return
    setSaving(true)
    try {
      const updates = Array.from(selectedRows).map((id) => {
        const item = items.find((i) => i.id === id)
        if (!item) return null
        if (bulkAction === 'set_quantity') {
          return { id, quantity: parseInt(bulkValue) }
        }
        if (bulkAction === 'adjust_quantity') {
          return { id, quantity: item.quantity + parseInt(bulkValue) }
        }
        return null
      }).filter(Boolean)

      await Promise.all(updates.map((u) => api.put('/inventory', u)))
      toast.success(`Updated ${updates.length} items`)
      setSelectedRows(new Set())
      setBulkAction(null)
      setBulkValue('')
      fetchInventory()
    } catch {
      toast.error('Bulk update failed')
    } finally {
      setSaving(false)
    }
  }

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedRows.size === items.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(items.map((i) => i.id)))
    }
  }

  // Computed inventory stats
  const inventoryStats = useMemo(() => {
    const inStock = items.filter(i => i.quantity > i.lowStockThreshold).length
    const lowStock = items.filter(i => i.quantity > 0 && i.quantity <= i.lowStockThreshold).length
    const outOfStock = items.filter(i => i.quantity <= 0).length
    return { inStock, lowStock, outOfStock }
  }, [items])

  // Stock distribution chart data
  const stockChartData = useMemo(() => [
    { name: 'In Stock', value: inventoryStats.inStock, color: '#10b981' },
    { name: 'Low Stock', value: inventoryStats.lowStock, color: '#f59e0b' },
    { name: 'Out of Stock', value: inventoryStats.outOfStock, color: '#ef4444' },
  ], [inventoryStats])

  // Reorder items (critical low stock)
  const reorderItems = useMemo(() => {
    return items.filter(i => i.quantity > 0 && i.quantity <= i.lowStockThreshold / 2)
  }, [items])

  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={selectedRows.size === items.length && items.length > 0}
            onCheckedChange={toggleAll}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedRows.has(row.original.id)}
            onCheckedChange={() => toggleRow(row.original.id)}
          />
        ),
      },
      {
        id: 'product',
        header: 'Product',
        cell: ({ row }) => {
          const item = row.original
          const images: string[] = (() => { try { return JSON.parse(item.product.images || '[]') } catch { return [] } })()
          return (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {images[0] ? (
                  <img src={images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate max-w-[200px]">{item.product.name}</p>
                {item.variant && <p className="text-xs text-muted-foreground">{item.variant.title}</p>}
                {item.product.sku && <p className="text-xs text-muted-foreground">SKU: {item.product.sku}</p>}
              </div>
            </div>
          )
        },
      },
      {
        id: 'stockLevel',
        header: 'Stock Level',
        cell: ({ row }) => {
          const item = row.original
          const status = getStockStatus(item)
          const qty = inlineEdits[item.id] ?? item.quantity
          const maxVal = Math.max(item.lowStockThreshold * 2, item.quantity)
          const pct = Math.min((item.quantity / maxVal) * 100, 100)
          const barColor = status === 'out_of_stock'
            ? '[&>div]:bg-red-500'
            : status === 'low_stock'
            ? '[&>div]:bg-amber-500'
            : '[&>div]:bg-emerald-500'

          return (
            <div className="min-w-[120px]">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold ${
                  status === 'out_of_stock' ? 'text-red-600' :
                  status === 'low_stock' ? 'text-amber-600' :
                  'text-emerald-600'
                }`}>
                  {qty}
                </span>
                <span className="text-[10px] text-muted-foreground">/ {maxVal}</span>
              </div>
              <Progress value={pct} className={`h-2 ${barColor}`} />
            </div>
          )
        },
      },
      {
        id: 'inlineEdit',
        header: 'Quick Update',
        cell: ({ row }) => {
          const item = row.original
          const currentQty = inlineEdits[item.id] ?? item.quantity
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => { e.stopPropagation(); handleInlineStockChange(item.id, -1) }}
                disabled={currentQty <= 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm font-semibold">{currentQty}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => { e.stopPropagation(); handleInlineStockChange(item.id, 1) }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = getStockStatus(row.original)
          const config: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
            in_stock: { label: 'In Stock', icon: <CheckCircle2 className="h-3 w-3" />, className: 'bg-emerald-100 text-emerald-800' },
            low_stock: { label: 'Low Stock', icon: <AlertTriangle className="h-3 w-3" />, className: 'bg-amber-100 text-amber-800' },
            out_of_stock: { label: 'Out of Stock', icon: <XCircle className="h-3 w-3" />, className: 'bg-red-100 text-red-800' },
          }
          const s = config[status]
          return (
            <Badge variant="secondary" className={s.className}>
              {s.icon} <span className="ml-1">{s.label}</span>
            </Badge>
          )
        },
      },
      {
        id: 'threshold',
        header: 'Threshold',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.lowStockThreshold}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setEditItem(row.original)
              setEditQuantity(String(row.original.quantity))
              setEditThreshold(String(row.original.lowStockThreshold))
            }}
          >
            Edit
          </Button>
        ),
      },
    ],
    [selectedRows, items, inlineEdits]
  )

  const table = useReactTable({
    data: items,
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
          <h2 className="text-2xl font-bold">Inventory</h2>
          <p className="text-sm text-muted-foreground">{total} items total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchInventory}>
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </Button>
          {selectedRows.size > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Button size="sm" onClick={() => setBulkAction('set_quantity')} className="bg-primary">
                Bulk Update ({selectedRows.size})
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Reorder Alert Panel */}
      {reorderItems.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-red-100 rounded-xl p-2 shrink-0">
                  <PackageX className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-red-800">Reorder Alert</h3>
                    <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50">
                      {reorderItems.length} item{reorderItems.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {reorderItems.map(item => (
                      <div key={item.id} className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-red-200 text-sm">
                        <span className="font-medium">{item.product.name}</span>
                        <span className="text-red-600 font-bold">{item.quantity} left</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Inventory Summary + Stock Distribution */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Stock</p>
                  <p className="text-2xl font-bold text-emerald-600">{inventoryStats.inStock}</p>
                </div>
                <div className="bg-emerald-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-amber-600">{inventoryStats.lowStock}</p>
                </div>
                <div className="bg-amber-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</p>
                </div>
                <div className="bg-red-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Stock Distribution Horizontal Bar */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground mb-3">Distribution</p>
              {items.length > 0 ? (
                <div className="space-y-2">
                  <div className="h-6 rounded-full bg-muted overflow-hidden flex">
                    {inventoryStats.inStock > 0 && (
                      <motion.div
                        className="bg-emerald-500 h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(inventoryStats.inStock / items.length) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    )}
                    {inventoryStats.lowStock > 0 && (
                      <motion.div
                        className="bg-amber-500 h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(inventoryStats.lowStock / items.length) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                      />
                    )}
                    {inventoryStats.outOfStock > 0 && (
                      <motion.div
                        className="bg-red-500 h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(inventoryStats.outOfStock / items.length) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                      />
                    )}
                  </div>
                  <div className="flex gap-3 text-[10px]">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">In Stock</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-muted-foreground">Low</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-muted-foreground">Out</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No data</p>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedRows.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-semibold">{selectedRows.size} selected</Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setBulkAction('set_quantity')}>
                        <Package className="mr-1 h-3 w-3" /> Update Stock
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toast.info('Export feature coming soon')}>
                        <Download className="mr-1 h-3 w-3" /> Export
                      </Button>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRows(new Set())}>
                    Clear Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Filters */}
      <motion.div variants={itemVariants}>
        <Tabs value={stockFilter} onValueChange={(v) => { setStockFilter(v as StockFilter); setPage(1) }}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="in_stock">In Stock</TabsTrigger>
            <TabsTrigger value="low_stock">Low Stock</TabsTrigger>
            <TabsTrigger value="out_of_stock">Out of Stock</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-4">
                  <Package className="h-10 w-10 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No inventory items</h3>
                <p className="text-sm text-muted-foreground">Items will appear here once you add products.</p>
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
                        <TableRow key={row.id} className="hover:bg-muted/50 transition-colors">
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

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Inventory</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{editItem.product.name}</p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Low Stock Threshold</label>
                <Input
                  type="number"
                  value={editThreshold}
                  onChange={(e) => setEditThreshold(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleQuickUpdate} disabled={saving}>
              {saving ? 'Saving...' : <><Save className="mr-1 h-4 w-4" /> Save</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={!!bulkAction} onOpenChange={() => setBulkAction(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Bulk Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{selectedRows.size} items selected</p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={bulkAction || 'set_quantity'} onValueChange={setBulkAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set_quantity">Set quantity to</SelectItem>
                  <SelectItem value="adjust_quantity">Adjust quantity by</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Value</label>
              <Input
                type="number"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder="Enter value"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkAction(null)}>Cancel</Button>
            <Button onClick={handleBulkAction} disabled={saving || !bulkValue}>
              {saving ? 'Updating...' : 'Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
