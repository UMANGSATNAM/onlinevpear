'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
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
        accessorKey: 'quantity',
        header: 'Quantity',
        cell: ({ row }) => {
          const status = getStockStatus(row.original)
          return (
            <div className="flex items-center gap-2">
              <span className={`font-bold ${status === 'out_of_stock' ? 'text-red-600' : status === 'low_stock' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {row.original.quantity}
              </span>
              {row.original.reserved > 0 && (
                <span className="text-xs text-muted-foreground">({row.original.reserved} reserved)</span>
              )}
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
            onClick={() => {
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
    [selectedRows, items]
  )

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  })

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Inventory</h2>
          <p className="text-sm text-muted-foreground">{total} items total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchInventory}>
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </Button>
          {selectedRows.size > 0 && (
            <Button size="sm" onClick={() => setBulkAction('set_quantity')}>
              Bulk Update ({selectedRows.size})
            </Button>
          )}
        </div>
      </div>

      <Tabs value={stockFilter} onValueChange={(v) => { setStockFilter(v as StockFilter); setPage(1) }}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="in_stock">In Stock</TabsTrigger>
          <TabsTrigger value="low_stock">Low Stock</TabsTrigger>
          <TabsTrigger value="out_of_stock">Out of Stock</TabsTrigger>
        </TabsList>
      </Tabs>

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
            <div className="text-center py-12">
              <p className="text-muted-foreground">No inventory items found</p>
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
                      <TableRow key={row.id}>
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
