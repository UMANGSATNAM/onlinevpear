'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  LayoutGrid,
  List,
  Sparkles,
  Copy,
  Archive,
  Package,
  PackageOpen,
  PackageCheck,
  AlertTriangle,
  Download,
  Loader2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  sku: string | null
  price: number
  comparePrice: number | null
  images: string
  status: string
  type: string
  tags: string
  categoryId: string | null
  createdAt: string
  category: { id: string; name: string } | null
  variants: Array<{ id: string; title: string; price: number; isActive: boolean }>
  inventory: Array<{ id: string; quantity: number; reserved: number }>
}

interface ProductsResponse {
  products: Product[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  draft: 'bg-gray-100 text-gray-800',
  archived: 'bg-amber-100 text-amber-800',
}

const statusGradients: Record<string, string> = {
  active: 'from-emerald-500 to-teal-500',
  draft: 'from-gray-400 to-slate-500',
  archived: 'from-amber-400 to-orange-500',
}

const imageGradients = [
  'from-rose-400 via-pink-400 to-fuchsia-500',
  'from-violet-400 via-purple-400 to-indigo-500',
  'from-sky-400 via-cyan-400 to-teal-500',
  'from-emerald-400 via-green-400 to-lime-500',
  'from-amber-400 via-orange-400 to-red-500',
  'from-cyan-400 via-teal-400 to-emerald-500',
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function ProductsManagement() {
  const { selectedStoreId, setDashboardPage, setSelectedProductId } = useAppStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [exporting, setExporting] = useState(false)

  // Stats computation
  const productStats = useMemo(() => {
    const active = products.filter(p => p.status === 'active').length
    const draft = products.filter(p => p.status === 'draft').length
    const archived = products.filter(p => p.status === 'archived').length
    return { active, draft, archived, total: total }
  }, [products, total])

  const fetchProducts = async () => {
    if (!selectedStoreId) return
    setLoading(true)
    try {
      const params: Record<string, string> = {
        storeId: selectedStoreId,
        page: String(page),
        limit: '10',
      }
      if (search) params.search = search
      if (statusFilter !== 'all') params.status = statusFilter
      if (categoryFilter !== 'all') params.category = categoryFilter

      const data = await api.get<ProductsResponse>('/products', params)
      setProducts(data.products)
      setTotalPages(data.pagination.totalPages)
      setTotal(data.pagination.total)
    } catch (err) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    if (!selectedStoreId) return
    try {
      const data = await api.get<{ categories: Array<{ id: string; name: string }> }>('/categories', { storeId: selectedStoreId })
      setCategories(data.categories)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [selectedStoreId])

  useEffect(() => {
    fetchProducts()
  }, [selectedStoreId, page, statusFilter, categoryFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchProducts()
      else setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/products/${deleteId}`)
      toast.success('Product deleted')
      setDeleteId(null)
      fetchProducts()
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const handleDuplicate = async (product: Product) => {
    try {
      await api.post('/products', {
        name: `${product.name} (Copy)`,
        price: product.price,
        comparePrice: product.comparePrice,
        description: product.description,
        storeId: selectedStoreId,
        status: 'draft',
        type: product.type,
        categoryId: product.categoryId,
      })
      toast.success('Product duplicated as draft')
      fetchProducts()
    } catch {
      toast.error('Failed to duplicate product')
    }
  }

  const handleArchive = async (product: Product) => {
    try {
      await api.put(`/products/${product.id}`, {
        status: product.status === 'archived' ? 'active' : 'archived',
      })
      toast.success(product.status === 'archived' ? 'Product restored' : 'Product archived')
      fetchProducts()
    } catch {
      toast.error('Failed to update product')
    }
  }

  const handleExportProducts = async (filter: 'all' | 'active' = 'all') => {
    if (!selectedStoreId) return
    setExporting(true)
    try {
      const params = new URLSearchParams({
        type: 'products',
        storeId: selectedStoreId,
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
      a.download = match?.[1] || 'products-export.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`${filter === 'all' ? 'All products' : 'Active products'} exported successfully`)
    } catch {
      toast.error('Failed to export products')
    } finally {
      setExporting(false)
    }
  }

  const getStockQuantity = (product: Product) => {
    return product.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
  }

  const parseImages = (imagesStr: string): string[] => {
    try {
      return JSON.parse(imagesStr || '[]')
    } catch {
      return []
    }
  }

  const getGradientForProduct = (id: string) => {
    let hash = 0
    for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i)
    return imageGradients[Math.abs(hash) % imageGradients.length]
  }

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Product',
        cell: ({ row }) => {
          const product = row.original
          const images = parseImages(product.images)
          const qty = getStockQuantity(product)
          return (
            <div className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {images[0] ? (
                  <img src={images[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className={`h-full w-full bg-gradient-to-br ${getGradientForProduct(product.id)}`} />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate max-w-[200px]">{product.name}</p>
                {product.sku && <p className="text-xs text-muted-foreground">{product.sku}</p>}
              </div>
              {/* Hover-reveal quick actions */}
              <div className="hidden group-hover:flex items-center gap-1 ml-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelectedProductId(product.id); setDashboardPage('product-new') }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleDuplicate(product) }}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Duplicate</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleArchive(product) }}>
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{product.status === 'archived' ? 'Restore' : 'Archive'}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(product.id) }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ${row.original.price.toFixed(2)}
            </span>
            {row.original.comparePrice && (
              <span className="ml-1 text-xs text-muted-foreground line-through">
                ${row.original.comparePrice.toFixed(2)}
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'inventory',
        header: 'Stock',
        cell: ({ row }) => {
          const qty = getStockQuantity(row.original)
          return (
            <div className="flex items-center gap-1.5">
              {qty <= 0 ? (
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              ) : qty <= 10 ? (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <PackageCheck className="h-3.5 w-3.5 text-emerald-500" />
              )}
              <Badge variant={qty <= 0 ? 'destructive' : qty <= 10 ? 'secondary' : 'outline'} className="text-xs">
                {qty}
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.category?.name || '—'}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant="secondary" className={`${statusColors[row.original.status] || ''} text-xs`}>
            <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${row.original.status === 'active' ? 'bg-emerald-500' : row.original.status === 'draft' ? 'bg-gray-400' : 'bg-amber-500'}`} />
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedProductId(row.original.id)
                  setDashboardPage('product-new')
                }}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedProductId(row.original.id)
                  setDashboardPage('product-new')
                }}
              >
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(row.original)}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleArchive(row.original)}>
                <Archive className="mr-2 h-4 w-4" /> {row.original.status === 'archived' ? 'Restore' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteId(row.original.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [setSelectedProductId, setDashboardPage]
  )

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  })

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Products', value: productStats.total, icon: Package, color: 'text-foreground', bg: 'bg-muted/50' },
          { label: 'Active', value: productStats.active, icon: PackageCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Draft', value: productStats.draft, icon: Pencil, color: 'text-gray-600', bg: 'bg-gray-50' },
          { label: 'Archived', value: productStats.archived, icon: Archive, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <div className={`flex items-center gap-3 rounded-xl border p-3 ${stat.bg} transition-all hover:shadow-sm`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 shadow-sm">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-muted-foreground">{total} products total</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={exporting}>
                {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportProducts('all')}>
                <Package className="mr-2 h-4 w-4" /> Export All Products
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportProducts('active')}>
                <PackageCheck className="mr-2 h-4 w-4" /> Export Active Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => {
              setSelectedProductId(null)
              setDashboardPage('product-new')
            }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
            </motion.span>
            Add Product
          </Button>
        </div>
      </div>

      {/* Glassmorphism Filter Bar */}
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 backdrop-blur-xl shadow-lg dark:bg-slate-900/70 dark:border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-emerald-50/30 dark:from-slate-800/30 dark:to-emerald-950/30" />
        <div className="relative p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/60 dark:bg-slate-800/60 border-white/30 backdrop-blur-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Status Filter Chips */}
              {['all', 'active', 'draft', 'archived'].map((status) => (
                <motion.button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    statusFilter === status
                      ? status === 'all'
                        ? 'bg-foreground text-background border-foreground shadow-sm'
                        : status === 'active'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/25'
                        : status === 'draft'
                        ? 'bg-gray-500 text-white border-gray-500 shadow-sm'
                        : 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/25'
                      : 'bg-white/60 dark:bg-slate-800/60 border-transparent hover:border-muted-foreground/30 text-muted-foreground'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </motion.button>
              ))}
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white/60 dark:bg-slate-800/60 border-white/30">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* View Toggle */}
            <div className="flex items-center border rounded-lg bg-white/60 dark:bg-slate-800/60 overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-32 w-full" />
                  <CardContent className="p-3">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-6">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                  <PackageOpen className="h-10 w-10 text-emerald-400" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-3 w-3 text-white" />
                </motion.div>
              </div>
              <h3 className="text-lg font-semibold mb-1">No products found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                {search || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Start building your catalog by adding your first product.'}
              </p>
              {(search || statusFilter !== 'all' || categoryFilter !== 'all') ? (
                <Button
                  variant="outline"
                  onClick={() => { setSearch(''); setStatusFilter('all'); setCategoryFilter('all') }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  onClick={() => { setSelectedProductId(null); setDashboardPage('product-new') }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add your first product
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {products.map((product) => {
              const images = parseImages(product.images)
              const qty = getStockQuantity(product)
              const gradient = getGradientForProduct(product.id)
              const hasDiscount = product.comparePrice && product.comparePrice > product.price
              const discountPct = hasDiscount ? Math.round((1 - product.price / product.comparePrice!) * 100) : 0

              return (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  layout
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer relative"
                    onClick={() => { setSelectedProductId(product.id); setDashboardPage('product-new') }}
                  >
                    {/* Product Image / Gradient Placeholder */}
                    <div className="relative h-36 overflow-hidden">
                      {images[0] ? (
                        <img src={images[0]} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                          <Package className="h-8 w-8 text-white/60" />
                        </div>
                      )}
                      {/* Status indicator dot */}
                      <div className="absolute top-2 left-2">
                        <span className={`inline-block h-2 w-2 rounded-full ring-2 ring-white ${
                          product.status === 'active' ? 'bg-emerald-500' : product.status === 'draft' ? 'bg-gray-400' : 'bg-amber-500'
                        }`} />
                      </div>
                      {/* Sale badge */}
                      {hasDiscount && discountPct > 0 && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] px-1.5 py-0 border-0">
                            -{discountPct}%
                          </Badge>
                        </div>
                      )}
                      {/* Hover quick actions */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelectedProductId(product.id); setDashboardPage('product-new') }}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleDuplicate(product) }}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Duplicate</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(product.id) }}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium truncate" title={product.name}>{product.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{product.category?.name || 'Uncategorized'}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-sm">${product.price.toFixed(2)}</span>
                          {hasDiscount && (
                            <span className="text-[11px] text-muted-foreground line-through">${product.comparePrice!.toFixed(2)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {qty <= 0 ? (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Out</Badge>
                          ) : qty <= 10 ? (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-800">{qty} left</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{qty}</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* List View (Table) */
        <Card>
          <CardContent className="p-0">
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
                    <TableRow key={row.id} className="group">
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
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
