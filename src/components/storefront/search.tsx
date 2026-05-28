'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
}

interface Category {
  id: string
  name: string
  slug: string
}

const popularSearches = ['Wireless Headphones', 'Running Shoes', 'Smart Watch', 'Backpack', 'Sunglasses', 'Yoga Mat']
const recentSearches = ['Laptop stand', 'USB-C cable', 'Water bottle']

export function SearchPage() {
  const { globalSearchQuery, setGlobalSearchQuery, selectedStoreId } = useAppStore()
  const [searchInput, setSearchInput] = useState(globalSearchQuery || '')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [minRating, setMinRating] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const storeId = sessionStorage.getItem('shopforge_store_id') || selectedStoreId
        if (!storeId) return
        const res = await fetch(`/api/storefront?storeId=${storeId}`)
        if (res.ok) {
          const data = await res.json()
          setCategories((data.categories || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })))
        }
      } catch {
        // ignore
      }
    }
    fetchCategories()
  }, [selectedStoreId])

  useEffect(() => {
    if (globalSearchQuery) {
      setSearchInput(globalSearchQuery)
      performSearch(globalSearchQuery)
    }
  }, [])

  const performSearch = async (query: string) => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const storeId = sessionStorage.getItem('shopforge_store_id') || selectedStoreId
      const params = new URLSearchParams({ q: query.trim(), type: 'products', limit: '50' })
      if (storeId) params.set('storeId', storeId)

      const res = await fetch(`/api/search?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.results?.products || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setGlobalSearchQuery(searchInput.trim())
      performSearch(searchInput.trim())
    }
  }

  const handleCategoryToggle = (catId: string) => {
    const next = new Set(selectedCategories)
    if (next.has(catId)) next.delete(catId)
    else next.add(catId)
    setSelectedCategories(next)
  }

  // Filter and sort products
  let filteredProducts = products.filter((p) => {
    if (selectedCategories.size > 0 && !selectedCategories.has(p.category?.id || '')) return false
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false
    if (minRating > 0) {
      const avgRating = p.reviews?.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0
      if (avgRating < minRating) return false
    }
    return true
  })

  // Sort
  if (sortBy === 'price-asc') filteredProducts.sort((a, b) => a.price - b.price)
  else if (sortBy === 'price-desc') filteredProducts.sort((a, b) => b.price - a.price)
  else if (sortBy === 'newest') filteredProducts.sort((a, b) => (b as any).createdAt?.localeCompare((a as any).createdAt || '') || 0)

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${cat.id}`}
                  checked={selectedCategories.has(cat.id)}
                  onCheckedChange={() => handleCategoryToggle(cat.id)}
                />
                <Label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer">
                  {cat.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSelectedCategories(new Set())
          setPriceRange([0, 1000])
          setMinRating(0)
        }}
      >
        Clear Filters
      </Button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Search Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Search Products</h1>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button type="submit" size="lg" className="bg-rose-500 hover:bg-rose-600 h-12">
            Search
          </Button>
        </form>
      </div>

      {!searched ? (
        <div className="max-w-xl mx-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Recent Searches</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchInput(term)
                      setGlobalSearchQuery(term)
                      performSearch(term)
                    }}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Popular Searches</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchInput(term)
                    setGlobalSearchQuery(term)
                    performSearch(term)
                  }}
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
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

              <p className="text-sm text-muted-foreground">
                {loading ? 'Searching...' : `${filteredProducts.length} results for "${globalSearchQuery}"`}
              </p>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-56 shrink-0">
              <FilterContent />
            </aside>

            {/* Results Grid */}
            <div className="flex-1">
              {loading ? (
                <ProductGrid products={[]} loading={true} />
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Try adjusting your search or filter criteria.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategories(new Set())
                      setPriceRange([0, 1000])
                      setMinRating(0)
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <ProductGrid products={filteredProducts} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
