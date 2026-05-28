'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  SlidersHorizontal,
  X,
  Star,
  ChevronRight,
  LayoutGrid,
  List,
  Home,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useAppStore } from '@/lib/store'
import { ProductGrid } from '@/components/storefront/product-grid'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  images?: string
  shortDesc?: string | null
  category?: { id: string; name: string; slug: string } | null
  variants?: Array<{ id: string; title: string; price: number }>
  inventory?: Array<{ quantity: number; reserved: number }>
  reviews?: Array<{ rating: number }>
  createdAt?: string
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  _count?: { products: number }
}

const categoryGradients = [
  'from-rose-500 to-pink-400',
  'from-violet-500 to-purple-400',
  'from-emerald-500 to-teal-400',
  'from-amber-500 to-orange-400',
  'from-sky-500 to-blue-400',
]

const ITEMS_PER_PAGE = 12

export function CategoryPage() {
  const { setStorefrontPage, selectedStoreId } = useAppStore()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [minRating, setMinRating] = useState(0)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeId = sessionStorage.getItem('shopforge_store_id') || selectedStoreId
        if (!storeId) return
        const res = await fetch(`/api/storefront?storeId=${storeId}`)
        if (res.ok) {
          const data = await res.json()
          setProducts(data.products || [])
          setCategories(data.categories || [])
          if (data.categories?.length > 0) {
            setSelectedCategory(data.categories[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to fetch:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedStoreId])

  // Filter products
  let filteredProducts = products.filter((p) => {
    if (selectedCategory && p.category?.id !== selectedCategory) return false
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false
    if (minRating > 0) {
      const avgRating = p.reviews?.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0
      if (avgRating < minRating) return false
    }
    if (inStockOnly) {
      const stock = p.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reserved, 0) ?? 0
      if (stock <= 0) return false
    }
    return true
  })

  // Sort
  if (sortBy === 'price-asc') filteredProducts.sort((a, b) => a.price - b.price)
  else if (sortBy === 'price-desc') filteredProducts.sort((a, b) => b.price - a.price)
  else if (sortBy === 'newest') filteredProducts.sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return db - da
  })

  const activeCategory = categories.find((c) => c.id === selectedCategory)
  const totalProducts = filteredProducts.length
  const totalPages = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE))

  // Pagination
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, sortBy, priceRange, minRating, inStockOnly])

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={selectedCategory === cat.id}
                onCheckedChange={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              />
              <Label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer flex-1">
                {cat.name}
              </Label>
              {cat._count && (
                <span className="text-xs text-muted-foreground">({cat._count.products})</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={1000}
          step={10}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Minimum Rating</h3>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button key={i} onClick={() => setMinRating(minRating === i + 1 ? 0 : i + 1)}>
              <Star className={`h-5 w-5 ${i < minRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* In Stock */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="inStock"
          checked={inStockOnly}
          onCheckedChange={(checked) => setInStockOnly(!!checked)}
        />
        <Label htmlFor="inStock" className="text-sm cursor-pointer">
          In stock only
        </Label>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSelectedCategory(categories[0]?.id || null)
          setPriceRange([0, 1000])
          setMinRating(0)
          setInStockOnly(false)
        }}
      >
        Clear Filters
      </Button>
    </div>
  )

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Skeleton className="h-40 w-full mb-8 rounded-xl" />
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="flex gap-8">
          <Skeleton className="hidden lg:block w-56 h-64" />
          <div className="flex-1">
            <ProductGrid products={[]} loading={true} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Category Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="absolute inset-0 opacity-30">
          <motion.div
            className="absolute top-10 right-10 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-5 left-10 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/70 text-xs font-medium mb-4 border border-white/10">
                <Package className="h-3 w-3" />
                {totalProducts} {totalProducts === 1 ? 'product' : 'products'} available
              </span>
            </motion.div>
            <motion.h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {activeCategory?.name || 'All Products'}
            </motion.h1>
            <motion.p
              className="text-neutral-300 text-base sm:text-lg max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {activeCategory?.description || 'Browse our complete collection of premium products curated just for you.'}
            </motion.p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Enhanced Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => setStorefrontPage('home')} className="cursor-pointer flex items-center gap-1.5 hover:text-rose-500 transition-colors">
                <Home className="h-3.5 w-3.5" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">{activeCategory?.name || 'All Products'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Category Pills */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={!selectedCategory ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={!selectedCategory ? 'bg-rose-500 hover:bg-rose-600' : ''}
            >
              All
            </Button>
            {categories.map((cat, i) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={selectedCategory === cat.id ? 'bg-rose-500 hover:bg-rose-600' : ''}
              >
                {cat.name}
                <span className="ml-1.5 text-xs opacity-70">({cat._count?.products || 0})</span>
              </Button>
            ))}
          </div>
        )}

        {/* Results Header with Grid/List Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetTitle className="sr-only">Filters</SheetTitle>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold">Filters</h2>
                    <Button variant="ghost" size="icon" onClick={() => setFilterOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* Product Count Indicator */}
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalProducts)}-{Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)}</span> of <span className="font-medium text-foreground">{totalProducts}</span> products
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Grid/List Toggle */}
            <div className="hidden sm:flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <FilterContent />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {viewMode === 'grid' ? (
              <ProductGrid products={paginatedProducts} />
            ) : (
              /* List View */
              <div className="space-y-3">
                {paginatedProducts.map((product) => (
                  <ListProductCard key={product.id} product={product} />
                ))}
                {paginatedProducts.length === 0 && (
                  <div className="text-center py-16">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(1)}
                  >
                    <Home className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="icon"
                        className={`h-9 w-9 ${currentPage === pageNum ? 'bg-rose-500 hover:bg-rose-600' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// List view product card
function ListProductCard({ product }: { product: Product }) {
  const { setSelectedProductId, setStorefrontPage } = useAppStore()
  const gradientPalettes = [
    'from-rose-400 to-orange-300',
    'from-violet-400 to-purple-300',
    'from-emerald-400 to-teal-300',
    'from-amber-400 to-yellow-300',
    'from-sky-400 to-cyan-300',
  ]
  const idx = product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradientPalettes.length
  const gradient = gradientPalettes[idx]
  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const stock = product.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reserved, 0) ?? 99
  const avgRating = product.reviews?.length ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="flex overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 border-0 shadow-sm"
        onClick={() => { setSelectedProductId(product.id); setStorefrontPage('product') }}
      >
        {/* Image placeholder */}
        <div className="w-32 sm:w-48 shrink-0">
          <div className={`h-full min-h-[120px] bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
            <span className="text-white/40 text-2xl font-bold">{product.name.substring(0, 2).toUpperCase()}</span>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            {hasDiscount && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                SALE
              </span>
            )}
            {stock <= 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white/90 text-gray-800 px-2 py-1 rounded text-xs font-bold">Out of Stock</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            {product.category && (
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{product.category.name}</p>
            )}
            <h3 className="font-medium text-sm sm:text-base group-hover:text-rose-500 transition-colors">{product.name}</h3>
            {product.shortDesc && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.shortDesc}</p>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">${product.comparePrice!.toFixed(2)}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < Math.floor(avgRating || 4.5) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
              ))}
              <span className="text-xs text-muted-foreground ml-1">{(avgRating || 4.5).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
