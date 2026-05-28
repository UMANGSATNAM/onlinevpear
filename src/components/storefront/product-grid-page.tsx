'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal,
  X,
  Star,
  ShoppingCart,
  Heart,
  Eye,
  Sparkles,
  LayoutGrid,
  List,
  ChevronRight,
  Package,
  ArrowUpDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  images?: string
  shortDesc?: string | null
  category?: { id: string; name: string; slug: string } | null
  variants?: Array<{ id: string; title: string; price: number; options?: string }>
  inventory?: Array<{ quantity: number; reserved: number }>
  reviews?: Array<{ rating: number }>
  status?: string
  createdAt?: string
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  _count?: { products: number }
}

type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'best-selling' | 'rating'
type ViewMode = 'grid' | 'list'
type AvailabilityFilter = 'all' | 'in-stock' | 'out-of-stock' | 'pre-order'

const gradientPalettes = [
  'from-rose-400 to-orange-300',
  'from-violet-400 to-purple-300',
  'from-emerald-400 to-teal-300',
  'from-amber-400 to-yellow-300',
  'from-sky-400 to-cyan-300',
  'from-fuchsia-400 to-pink-300',
  'from-lime-400 to-green-300',
  'from-indigo-400 to-blue-300',
]

const colorMap: Record<string, string> = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
  black: '#1f2937', white: '#f9fafb', pink: '#ec4899', purple: '#a855f7',
  orange: '#f97316', brown: '#92400e', gray: '#6b7280', grey: '#6b7280',
  navy: '#1e3a5f', teal: '#14b8a6', coral: '#f87171', burgundy: '#7f1d1d',
  olive: '#84cc16', gold: '#d97706', silver: '#9ca3af', beige: '#d2b48c',
  cream: '#fef3c7', khaki: '#a3a066', maroon: '#800000', lavender: '#a78bfa',
}

function getGradient(id: string) {
  const index = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradientPalettes.length
  return gradientPalettes[index]
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}

function getAverageRating(reviews?: Array<{ rating: number }>) {
  if (!reviews || reviews.length === 0) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

function isNewProduct(createdAt?: string) {
  if (!createdAt) return false
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return new Date(createdAt) > thirtyDaysAgo
}

function extractColorSwatches(variants?: Array<{ id: string; title: string; price: number; options?: string }>) {
  if (!variants || variants.length === 0) return []
  const colors: string[] = []
  variants.forEach((v) => {
    if (v.options) {
      try {
        const opts = JSON.parse(v.options)
        Object.entries(opts).forEach(([key, value]) => {
          if (key.toLowerCase() === 'color' && typeof value === 'string') {
            if (!colors.includes(value)) colors.push(value)
          }
        })
      } catch {
        // ignore
      }
    }
  })
  return colors
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

// Items per page
const ITEMS_PER_PAGE = 12

export function ProductGridPage() {
  const { setStorefrontPage, setSelectedProductId, selectedStoreId } = useAppStore()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [minRating, setMinRating] = useState(0)
  const [availability, setAvailability] = useState<AvailabilityFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('featured')

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterOpen, setFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set())
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  // Fetch products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeId = sessionStorage.getItem('shopforge_store_id') || selectedStoreId
        if (!storeId) {
          setLoading(false)
          return
        }
        const res = await fetch(`/api/storefront?storeId=${storeId}`)
        if (res.ok) {
          const data = await res.json()
          setProducts(data.products || [])
          setCategories(data.categories || [])

          // Set price range based on products
          if (data.products?.length > 0) {
            const maxPrice = Math.max(...data.products.map((p: Product) => p.price))
            setPriceRange([0, Math.ceil(maxPrice / 10) * 10 + 10])
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedStoreId])

  // Load wishlist from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('shopforge_wishlist')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setWishlistItems(new Set(parsed.map((item: any) => item.id)))
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // Category filter
      if (selectedCategories.size > 0 && p.category && !selectedCategories.has(p.category.id)) return false
      // Price filter
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false
      // Rating filter
      if (minRating > 0) {
        const avgRating = getAverageRating(p.reviews)
        if (avgRating < minRating) return false
      }
      // Availability filter
      if (availability !== 'all') {
        const stock = p.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reserved, 0) ?? 99
        if (availability === 'in-stock' && stock <= 0) return false
        if (availability === 'out-of-stock' && stock > 0) return false
      }
      return true
    })

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        result.sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return db - da
        })
        break
      case 'rating':
        result.sort((a, b) => getAverageRating(b.reviews) - getAverageRating(a.reviews))
        break
      case 'best-selling':
        // Mock: sort by review count as a proxy for popularity
        result.sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0))
        break
      case 'featured':
      default:
        // Default order from API
        break
    }

    return result
  }, [products, selectedCategories, priceRange, minRating, availability, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategories, priceRange, minRating, availability, sortBy])

  // Active filter tags
  const activeFilters = useMemo(() => {
    const tags: Array<{ label: string; onRemove: () => void }> = []
    selectedCategories.forEach((catId) => {
      const cat = categories.find((c) => c.id === catId)
      if (cat) {
        tags.push({
          label: cat.name,
          onRemove: () => {
            setSelectedCategories((prev) => {
              const next = new Set(prev)
              next.delete(catId)
              return next
            })
          },
        })
      }
    })
    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      tags.push({
        label: `$${priceRange[0]} - $${priceRange[1]}`,
        onRemove: () => setPriceRange([0, 1000]),
      })
    }
    if (minRating > 0) {
      tags.push({
        label: `${minRating}+ Stars`,
        onRemove: () => setMinRating(0),
      })
    }
    if (availability !== 'all') {
      tags.push({
        label: availability === 'in-stock' ? 'In Stock' : availability === 'out-of-stock' ? 'Out of Stock' : 'Pre-order',
        onRemove: () => setAvailability('all'),
      })
    }
    return tags
  }, [selectedCategories, categories, priceRange, minRating, availability])

  const clearAllFilters = useCallback(() => {
    setSelectedCategories(new Set())
    setPriceRange([0, 1000])
    setMinRating(0)
    setAvailability('all')
  }, [])

  const handleAddToCart = useCallback(async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    setAddingToCart(product.id)
    try {
      const sessionId = sessionStorage.getItem('shopforge_session_id') || `sess_${Date.now()}`
      sessionStorage.setItem('shopforge_session_id', sessionId)
      const storeId = sessionStorage.getItem('shopforge_store_id')
      if (!storeId) {
        toast.error('Store not found')
        return
      }
      const res = await fetch('/api/storefront/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          sessionId,
          items: [{ productId: product.id, quantity: 1, price: product.price }],
        }),
      })
      if (res.ok) {
        toast.success(`${product.name} added to cart`)
      } else {
        toast.error('Failed to add to cart')
      }
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setTimeout(() => setAddingToCart(null), 600)
    }
  }, [])

  const handleToggleWishlist = useCallback((productId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setWishlistItems((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
        toast.success('Removed from wishlist')
      } else {
        next.add(productId)
        toast.success('Added to wishlist')
      }
      return next
    })
  }, [])

  const handleViewProduct = useCallback((productId: string) => {
    setSelectedProductId(productId)
    setStorefrontPage('product')
  }, [setSelectedProductId, setStorefrontPage])

  // Filter sidebar content
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Package className="h-4 w-4 text-rose-500" />
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <Checkbox
                id={`pcat-${cat.id}`}
                checked={selectedCategories.has(cat.id)}
                onCheckedChange={(checked) => {
                  setSelectedCategories((prev) => {
                    const next = new Set(prev)
                    if (checked) next.add(cat.id)
                    else next.delete(cat.id)
                    return next
                  })
                }}
              />
              <Label htmlFor={`pcat-${cat.id}`} className="text-sm cursor-pointer flex-1">
                {cat.name}
              </Label>
              {cat._count && (
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {cat._count.products}
                </span>
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
          className="mb-3"
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            className="h-8 text-xs"
            placeholder="Min"
          />
          <span className="text-muted-foreground text-xs">to</span>
          <Input
            type="number"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="h-8 text-xs"
            placeholder="Max"
          />
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Rating</h3>
        <div className="space-y-2">
          {[
            { value: 4, label: '4 Stars & Up' },
            { value: 3, label: '3 Stars & Up' },
            { value: 2, label: '2 Stars & Up' },
            { value: 1, label: '1 Star & Up' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setMinRating(minRating === option.value ? 0 : option.value)}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors ${
                minRating === option.value
                  ? 'bg-rose-50 text-rose-600'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < option.value
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Availability */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Availability</h3>
        <div className="space-y-2">
          {[
            { value: 'all' as AvailabilityFilter, label: 'All Products' },
            { value: 'in-stock' as AvailabilityFilter, label: 'In Stock' },
            { value: 'out-of-stock' as AvailabilityFilter, label: 'Out of Stock' },
            { value: 'pre-order' as AvailabilityFilter, label: 'Pre-order' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setAvailability(option.value)}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors ${
                availability === option.value
                  ? 'bg-rose-50 text-rose-600 font-medium'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Clear All */}
      {activeFilters.length > 0 && (
        <Button
          variant="outline"
          className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          onClick={clearAllFilters}
        >
          <X className="h-4 w-4 mr-1.5" />
          Clear All Filters
        </Button>
      )}
    </div>
  )

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-8" />
        <div className="flex gap-8">
          <Skeleton className="hidden lg:block w-56 h-96" />
          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-sm">
                  <Skeleton className="aspect-square" />
                  <div className="p-3 sm:p-4 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => setStorefrontPage('home')} className="cursor-pointer">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>All Products</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">All Products</h1>
        <p className="text-muted-foreground mt-1">
          Browse our complete collection of {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Active Filter Tags */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-medium text-muted-foreground">Active Filters:</span>
          {activeFilters.map((filter, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 cursor-pointer gap-1 pl-2.5 pr-1.5 py-0.5"
            >
              {filter.label}
              <button
                onClick={filter.onRemove}
                className="h-4 w-4 rounded-full hover:bg-rose-200 flex items-center justify-center transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFilters.length > 0 && (
                  <Badge className="ml-1.5 h-4 w-4 p-0 flex items-center justify-center bg-rose-500 text-white text-[10px] border-0">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetTitle className="sr-only">Product Filters</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="font-bold text-lg">Filters</h2>
                  <Button variant="ghost" size="icon" onClick={() => setFilterOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <FilterSidebar />
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center border rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-rose-100 text-rose-600' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-rose-100 text-rose-600' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[170px] h-9 text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="best-selling">Best Selling</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        {/* Product Grid/List */}
        <div className="flex-1 min-w-0">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Try adjusting your filters to find what you&apos;re looking for.
              </p>
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                Clear All Filters
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={`grid-page-${currentPage}`}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              {paginatedProducts.map((product) => (
                <ProductGridCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlistItems.has(product.id)}
                  isAddingToCart={addingToCart === product.id}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  onViewProduct={handleViewProduct}
                />
              ))}
            </motion.div>
          ) : (
            /* List View */
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={`list-page-${currentPage}`}
              className="space-y-4"
            >
              {paginatedProducts.map((product) => (
                <ProductListCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlistItems.has(product.id)}
                  isAddingToCart={addingToCart === product.id}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  onViewProduct={handleViewProduct}
                />
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = currentPage <= 3
                  ? i + 1
                  : currentPage >= totalPages - 2
                  ? totalPages - 4 + i
                  : currentPage - 2 + i
                if (page < 1 || page > totalPages) return null
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 p-0 text-sm ${
                      currentPage === page
                        ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-500'
                        : ''
                    }`}
                  >
                    {page}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground ml-2">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Grid Card Component
function ProductGridCard({
  product,
  isWishlisted,
  isAddingToCart,
  onAddToCart,
  onToggleWishlist,
  onViewProduct,
}: {
  product: Product
  isWishlisted: boolean
  isAddingToCart: boolean
  onAddToCart: (product: Product, e: React.MouseEvent) => void
  onToggleWishlist: (id: string, e: React.MouseEvent) => void
  onViewProduct: (id: string) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const gradient = getGradient(product.id)
  const rating = getAverageRating(product.reviews)
  const displayRating = rating > 0 ? rating : 4.5
  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0
  const stock = product.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reserved, 0) ?? 99
  const isOutOfStock = stock <= 0
  const isNew = isNewProduct(product.createdAt)
  const colorSwatches = extractColorSwatches(product.variants)

  return (
    <motion.div variants={itemVariants}>
      <Card
        className="group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onViewProduct(product.id)}
      >
        {/* Image Area */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-110`} />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
            {hasDiscount && discountPct > 0 && (
              <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 text-[10px] font-semibold shadow-sm">
                -{discountPct}% OFF
              </Badge>
            )}
            {isNew && (
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-500 text-[10px] font-semibold shadow-sm">
                <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                New
              </Badge>
            )}
          </div>

          {/* Wishlist Heart */}
          <button
            onClick={(e) => onToggleWishlist(product.id, e)}
            className="absolute top-2.5 right-2.5 z-20 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all hover:scale-110"
          >
            <Heart className={`h-3.5 w-3.5 transition-all ${isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : 'text-gray-600'}`} />
          </button>

          {/* Out of Stock */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
              <span className="bg-white/95 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">Out of Stock</span>
            </div>
          )}

          {/* Product Initials */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white/40 text-xl sm:text-2xl font-bold select-none">
              {product.name.substring(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Quick Add to Cart */}
          <AnimatePresence>
            {isHovered && !isOutOfStock && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 z-20 p-2.5 bg-gradient-to-t from-black/70 via-black/40 to-transparent"
              >
                <Button
                  size="sm"
                  className="w-full h-8 text-xs font-medium bg-rose-500 hover:bg-rose-600 text-white shadow-lg"
                  onClick={(e) => onAddToCart(product, e)}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info */}
        <CardContent className="p-3 sm:p-4">
          {product.category && (
            <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">{product.category.name}</p>
          )}
          <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1 group-hover:text-rose-500 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < Math.floor(displayRating)
                const halfFilled = i === Math.floor(displayRating) && displayRating % 1 >= 0.5
                return (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      filled ? 'fill-amber-400 text-amber-400' : halfFilled ? 'fill-amber-400/50 text-amber-400' : 'text-gray-200'
                    }`}
                  />
                )
              })}
            </div>
            <span className="text-[11px] text-muted-foreground">
              {displayRating.toFixed(1)}
              {product.reviews && product.reviews.length > 0 && <span className="ml-0.5">({product.reviews.length})</span>}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.comparePrice!)}</span>
            )}
          </div>
          {colorSwatches.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {colorSwatches.slice(0, 5).map((color) => (
                <div
                  key={color}
                  className="h-3.5 w-3.5 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: colorMap[color.toLowerCase()] || color.toLowerCase() }}
                  title={color}
                />
              ))}
              {colorSwatches.length > 5 && (
                <span className="text-[10px] text-muted-foreground">+{colorSwatches.length - 5}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// List Card Component
function ProductListCard({
  product,
  isWishlisted,
  isAddingToCart,
  onAddToCart,
  onToggleWishlist,
  onViewProduct,
}: {
  product: Product
  isWishlisted: boolean
  isAddingToCart: boolean
  onAddToCart: (product: Product, e: React.MouseEvent) => void
  onToggleWishlist: (id: string, e: React.MouseEvent) => void
  onViewProduct: (id: string) => void
}) {
  const gradient = getGradient(product.id)
  const rating = getAverageRating(product.reviews)
  const displayRating = rating > 0 ? rating : 4.5
  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0
  const stock = product.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reserved, 0) ?? 99
  const isOutOfStock = stock <= 0
  const isNew = isNewProduct(product.createdAt)

  return (
    <motion.div variants={itemVariants}>
      <Card
        className="group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300"
        onClick={() => onViewProduct(product.id)}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0 overflow-hidden bg-gradient-to-br">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-110`} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white/40 text-xl font-bold select-none">
                {product.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            {/* Badges */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
              {hasDiscount && discountPct > 0 && (
                <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-semibold shadow-sm">
                  -{discountPct}%
                </Badge>
              )}
              {isNew && (
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-semibold shadow-sm">
                  New
                </Badge>
              )}
            </div>
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                <span className="bg-white/95 text-gray-800 px-3 py-1 rounded-lg text-xs font-bold shadow-lg">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Info */}
          <CardContent className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  {product.category && (
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">{product.category.name}</p>
                  )}
                  <h3 className="font-semibold text-base leading-tight group-hover:text-rose-500 transition-colors">
                    {product.name}
                  </h3>
                </div>
                <button
                  onClick={(e) => onToggleWishlist(product.id, e)}
                  className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-rose-50 transition-colors shrink-0"
                >
                  <Heart className={`h-4 w-4 transition-all ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`} />
                </button>
              </div>

              {product.shortDesc && (
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{product.shortDesc}</p>
              )}

              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(displayRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{displayRating.toFixed(1)}</span>
                {product.reviews && product.reviews.length > 0 && (
                  <span className="text-xs text-muted-foreground">({product.reviews.length} reviews)</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">{formatPrice(product.comparePrice!)}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewProduct(product.id)
                  }}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-rose-500 hover:bg-rose-600 text-white"
                  onClick={(e) => onAddToCart(product, e)}
                  disabled={isAddingToCart || isOutOfStock}
                >
                  {isAddingToCart ? (
                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isOutOfStock ? (
                    'Out of Stock'
                  ) : (
                    <>
                      <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  )
}
