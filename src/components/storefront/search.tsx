'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  Clock,
  TrendingUp,
  ArrowRight,
  ShoppingBag,
  BookOpen,
  LayoutGrid,
  Sparkles,
  ChevronRight,
  Hash,
  Loader2,
  PenLine,
  Calendar,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

// --- Types ---
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
  createdAt?: string
}

interface Category {
  id: string
  name: string
  slug: string
}

interface BlogResult {
  id: string
  title: string
  excerpt: string
  category: string
  author: string
  publishedAt: string
  readingTime: number
}

// --- Constants ---
const popularSearches = [
  { term: 'Wireless Headphones', icon: '🎧' },
  { term: 'Running Shoes', icon: '👟' },
  { term: 'Smart Watch', icon: '⌚' },
  { term: 'Backpack', icon: '🎒' },
  { term: 'Sunglasses', icon: '🕶️' },
  { term: 'Yoga Mat', icon: '🧘' },
  { term: 'Laptop Stand', icon: '💻' },
  { term: 'Water Bottle', icon: '💧' },
]

const mockSuggestions = [
  'Wireless headphones',
  'Wireless earbuds',
  'Wireless charger',
  'Wireless mouse',
  'Wireless keyboard',
  'Smart watch',
  'Smart home',
  'Smart speaker',
  'Running shoes',
  'Running jacket',
  'Laptop stand',
  'Laptop bag',
]

const mockBlogResults: BlogResult[] = [
  {
    id: 'blog-1',
    title: '10 Ways AI is Transforming Ecommerce in 2025',
    excerpt: 'From personalized recommendations to automated inventory management, AI is reshaping online stores.',
    category: 'AI & Automation',
    author: 'Sarah Chen',
    publishedAt: '2025-02-28',
    readingTime: 8,
  },
  {
    id: 'blog-2',
    title: 'The Complete Guide to Product Photography',
    excerpt: 'Great product photos can increase conversion rates by up to 30%. Learn professional techniques.',
    category: 'Product',
    author: 'Mike Torres',
    publishedAt: '2025-02-25',
    readingTime: 12,
  },
  {
    id: 'blog-3',
    title: 'How to Reduce Cart Abandonment by 40%',
    excerpt: 'Cart abandonment costs ecommerce businesses billions annually. Here are proven strategies to recover lost sales.',
    category: 'Business',
    author: 'Lisa Park',
    publishedAt: '2025-02-22',
    readingTime: 6,
  },
]

const categoryGradients = [
  'from-rose-400 to-orange-300',
  'from-violet-400 to-purple-300',
  'from-emerald-400 to-teal-300',
  'from-amber-400 to-yellow-300',
  'from-sky-400 to-cyan-300',
  'from-fuchsia-400 to-pink-300',
]

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

// --- Helper Functions ---
function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}

function getGradient(id: string) {
  const index = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % categoryGradients.length
  return categoryGradients[index]
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-rose-200/60 text-rose-900 rounded px-0.5">{part}</mark>
    ) : (
      part
    )
  )
}

// --- Recent Searches Hook ---
function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('shopforge_recent_searches')
      if (stored) return JSON.parse(stored)
    } catch { /* ignore */ }
    return []
  })

  const addSearch = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((t) => t.toLowerCase() !== term.toLowerCase())
      const updated = [term, ...filtered].slice(0, 5)
      try { localStorage.setItem('shopforge_recent_searches', JSON.stringify(updated)) } catch { /* ignore */ }
      return updated
    })
  }, [])

  const clearSearches = useCallback(() => {
    setRecentSearches([])
    try { localStorage.removeItem('shopforge_recent_searches') } catch { /* ignore */ }
  }, [])

  return { recentSearches, addSearch, clearSearches }
}

// --- Main Component ---
export function SearchPage() {
  const { globalSearchQuery, setGlobalSearchQuery, selectedStoreId, setSelectedProductId, setStorefrontPage, setSelectedCategoryId } = useAppStore()
  const { recentSearches, addSearch, clearSearches } = useRecentSearches()
  const [searchInput, setSearchInput] = useState(globalSearchQuery || '')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [activeTab, setActiveTab] = useState('products')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [minRating, setMinRating] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Fetch categories
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
      } catch { /* ignore */ }
    }
    fetchCategories()
  }, [selectedStoreId])

  // Perform initial search if query exists
  useEffect(() => {
    if (globalSearchQuery) {
      setSearchInput(globalSearchQuery)
      performSearch(globalSearchQuery)
    }
  }, [])

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const performSearch = async (query: string) => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    setShowSuggestions(false)
    try {
      const storeId = sessionStorage.getItem('shopforge_store_id') || selectedStoreId
      const params = new URLSearchParams({ q: query.trim(), type: 'products', limit: '50' })
      if (storeId) params.set('storeId', storeId)

      const res = await fetch(`/api/search?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.results?.products || [])
      }
    } catch { /* ignore */ }
    finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      const query = searchInput.trim()
      setGlobalSearchQuery(query)
      addSearch(query)
      performSearch(query)
    }
  }

  const handleSuggestionClick = (term: string) => {
    setSearchInput(term)
    setGlobalSearchQuery(term)
    addSearch(term)
    performSearch(term)
  }

  const handleCategoryToggle = (catId: string) => {
    const next = new Set(selectedCategories)
    if (next.has(catId)) next.delete(catId)
    else next.add(catId)
    setSelectedCategories(next)
  }

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      if (selectedCategories.size > 0 && !selectedCategories.has(p.category?.id || '')) return false
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false
      if (minRating > 0) {
        const avgRating = p.reviews?.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0
        if (avgRating < minRating) return false
      }
      return true
    })
    if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price)
    else if (sortBy === 'newest') filtered.sort((a, b) => (b as any).createdAt?.localeCompare((a as any).createdAt || '') || 0)
    return filtered
  }, [products, selectedCategories, priceRange, minRating, sortBy])

  // Suggestions based on current input
  const suggestions = useMemo(() => {
    if (!searchInput.trim() || searchInput.length < 2) return []
    const q = searchInput.toLowerCase()
    return mockSuggestions.filter((s) => s.toLowerCase().includes(q)).slice(0, 5)
  }, [searchInput])

  // Blog results based on search query
  const blogResults = useMemo(() => {
    if (!searchInput.trim()) return []
    const q = searchInput.toLowerCase()
    return mockBlogResults.filter(
      (b) => b.title.toLowerCase().includes(q) || b.excerpt.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)
    )
  }, [searchInput])

  // Category results based on search query
  const categoryResults = useMemo(() => {
    if (!searchInput.trim()) return []
    const q = searchInput.toLowerCase()
    return categories.filter((c) => c.name.toLowerCase().includes(q))
  }, [searchInput, categories])

  const totalResults = filteredProducts.length + blogResults.length + categoryResults.length

  const FilterContent = () => (
    <div className="space-y-6">
      {categories.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer group/cat">
                <input
                  type="checkbox"
                  checked={selectedCategories.has(cat.id)}
                  onChange={() => handleCategoryToggle(cat.id)}
                  className="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                />
                <span className="text-sm group-hover/cat:text-rose-500 transition-colors">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <Separator />
      <div>
        <h3 className="font-semibold text-sm mb-3">Price Range</h3>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            className="h-9 text-sm"
            placeholder="Min"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="h-9 text-sm"
            placeholder="Max"
          />
        </div>
      </div>
      <Separator />
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
        className="w-full border-rose-200 text-rose-500 hover:bg-rose-50"
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
      {/* ====== Search Header ====== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">
          {searched ? (
            <>
              Results for &quot;{globalSearchQuery}&quot;
            </>
          ) : (
            'Search'
          )}
        </h1>

        {/* Search Input with Glass Morphism */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <div className="relative">
            <motion.div
              animate={loading ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            </motion.div>
            <Input
              ref={searchInputRef}
              placeholder="Search for products, articles, categories..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                setShowSuggestions(e.target.value.length >= 2)
              }}
              onFocus={() => {
                if (searchInput.length >= 2) setShowSuggestions(true)
              }}
              className="pl-12 pr-12 h-14 bg-white/70 backdrop-blur-lg border-2 border-rose-100 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 rounded-2xl text-base shadow-lg shadow-rose-100/30"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); setShowSuggestions(false); searchInputRef.current?.focus() }}
                className="absolute right-14 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-rose-500 hover:bg-rose-600 h-10 px-5 rounded-xl shadow-md"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-lg border border-rose-100 rounded-xl shadow-xl z-50 overflow-hidden"
              >
                {suggestions.map((suggestion, i) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-rose-50 transition-colors ${i < suggestions.length - 1 ? 'border-b border-rose-50' : ''}`}
                  >
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">{highlightMatch(suggestion, searchInput)}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      {/* ====== Pre-Search State ====== */}
      {!searched ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Recent Searches</h3>
                </div>
                <button
                  onClick={clearSearches}
                  className="text-xs text-muted-foreground hover:text-rose-500 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSuggestionClick(term)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm bg-muted/80 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                  >
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-rose-500" />
              <h3 className="font-semibold text-sm">Popular Searches</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {popularSearches.map((item) => (
                <motion.button
                  key={item.term}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestionClick(item.term)}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-gray-100 hover:border-rose-200 hover:shadow-md transition-all text-left shadow-sm"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.term}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Browse Categories */}
          {categories.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-2 mb-3">
                <LayoutGrid className="h-4 w-4 text-rose-500" />
                <h3 className="font-semibold text-sm">Browse Categories</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (setSelectedCategoryId) setSelectedCategoryId(cat.id)
                      setStorefrontPage('category')
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 hover:border-rose-300 hover:shadow-sm transition-all"
                  >
                    <Hash className="h-3.5 w-3.5 text-rose-400" />
                    {cat.name}
                    <ChevronRight className="h-3 w-3 text-rose-300" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        /* ====== Search Results ====== */
        <div>
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden border-rose-200">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {(selectedCategories.size > 0 || minRating > 0 || priceRange[0] > 0 || priceRange[1] < 1000) && (
                      <Badge className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center bg-rose-500 text-white text-[10px]">
                        !
                      </Badge>
                    )}
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

              {!loading && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{totalResults}</span> result{totalResults !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Result Count Badges per Tab */}
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  {filteredProducts.length} products
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {blogResults.length} articles
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <LayoutGrid className="h-3 w-3 mr-1" />
                  {categoryResults.length} categories
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-56 shrink-0">
              <Card className="p-4 border-0 shadow-sm sticky top-6">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-rose-500" />
                  Filters
                </h3>
                <FilterContent />
              </Card>
            </aside>

            {/* Results Area */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="space-y-4">
                  <div className="flex gap-2 mb-6">
                    {['Products', 'Blog', 'Categories'].map((tab) => (
                      <Skeleton key={tab} className="h-9 w-24 rounded-lg" />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="overflow-hidden border-0 shadow-sm">
                        <Skeleton className="aspect-square" />
                        <div className="p-3 space-y-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : totalResults === 0 ? (
                /* ====== Empty State ====== */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center">
                    <Search className="h-12 w-12 text-rose-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No results found</h3>
                  <p className="text-muted-foreground text-sm mb-2 max-w-sm mx-auto">
                    We couldn&apos;t find anything matching &quot;{globalSearchQuery}&quot;
                  </p>
                  <p className="text-muted-foreground text-xs mb-6">
                    Try checking your spelling, using more general terms, or browse categories.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCategories(new Set())
                        setPriceRange([0, 1000])
                        setMinRating(0)
                      }}
                      className="border-rose-200 text-rose-500 hover:bg-rose-50"
                    >
                      Clear Filters
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchInput('')
                        setSearched(false)
                        setGlobalSearchQuery('')
                      }}
                    >
                      New Search
                    </Button>
                  </div>

                  {/* Suggestion chips */}
                  <div className="mt-8">
                    <p className="text-xs text-muted-foreground mb-3">Popular searches you might try:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {popularSearches.slice(0, 4).map((item) => (
                        <button
                          key={item.term}
                          onClick={() => handleSuggestionClick(item.term)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-muted hover:bg-rose-100 hover:text-rose-700 transition-colors"
                        >
                          <span>{item.icon}</span>
                          {item.term}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ====== Tabbed Results ====== */
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6 bg-muted/50 p-1">
                    <TabsTrigger value="products" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Products
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{filteredProducts.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="blog" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <BookOpen className="h-3.5 w-3.5" />
                      Blog
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{blogResults.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <LayoutGrid className="h-3.5 w-3.5" />
                      Categories
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{categoryResults.length}</Badge>
                    </TabsTrigger>
                  </TabsList>

                  {/* Products Tab */}
                  <TabsContent value="products">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="products-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {/* Sort Bar */}
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-xs text-muted-foreground">
                            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Sort:</span>
                            {['relevance', 'price-asc', 'price-desc', 'newest'].map((val) => (
                              <button
                                key={val}
                                onClick={() => setSortBy(val)}
                                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                                  sortBy === val
                                    ? 'bg-rose-100 text-rose-700 font-medium'
                                    : 'text-muted-foreground hover:bg-muted'
                                }`}
                              >
                                {val === 'relevance' ? 'Relevance' : val === 'price-asc' ? 'Price ↑' : val === 'price-desc' ? 'Price ↓' : 'Newest'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {filteredProducts.length === 0 ? (
                          <div className="text-center py-12">
                            <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No products match your filters</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 text-rose-500"
                              onClick={() => {
                                setSelectedCategories(new Set())
                                setPriceRange([0, 1000])
                                setMinRating(0)
                              }}
                            >
                              Clear filters
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                            {filteredProducts.map((product) => {
                              const rating = product.reviews?.length
                                ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
                                : 4.5
                              const hasDiscount = product.comparePrice && product.comparePrice > product.price
                              const gradient = getGradient(product.id)

                              return (
                                <motion.div key={product.id} variants={itemVariants}>
                                  <Card
                                    className="group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                                    onClick={() => {
                                      setSelectedProductId(product.id)
                                      setStorefrontPage('product')
                                    }}
                                  >
                                    {/* Image */}
                                    <div className="relative aspect-square overflow-hidden">
                                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-110`} />
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-white/50 text-xl sm:text-2xl font-bold select-none">
                                          {product.name.substring(0, 2).toUpperCase()}
                                        </span>
                                      </div>
                                      {hasDiscount && (
                                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-semibold shadow-sm">
                                          SALE
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-3 sm:p-4">
                                      {product.category && (
                                        <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">{product.category.name}</p>
                                      )}
                                      <h3 className="font-medium text-xs sm:text-sm leading-tight line-clamp-2 mb-2 group-hover:text-rose-500 transition-colors">
                                        {highlightMatch(product.name, globalSearchQuery)}
                                      </h3>
                                      <div className="flex items-center gap-1 mb-2">
                                        <div className="flex items-center gap-0.5">
                                          {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                              key={i}
                                              className={`h-2.5 w-2.5 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">{rating.toFixed(1)}</span>
                                      </div>
                                      <div className="flex items-baseline gap-1.5">
                                        <span className="font-bold text-sm">{formatPrice(product.price)}</span>
                                        {hasDiscount && (
                                          <span className="text-xs text-muted-foreground line-through">{formatPrice(product.comparePrice!)}</span>
                                        )}
                                      </div>
                                    </div>
                                  </Card>
                                </motion.div>
                              )
                            })}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </TabsContent>

                  {/* Blog Tab */}
                  <TabsContent value="blog">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="blog-list"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {blogResults.length === 0 ? (
                          <div className="text-center py-12">
                            <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No articles match your search</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {blogResults.map((post) => (
                              <motion.div key={post.id} variants={itemVariants}>
                                <Card className="p-4 sm:p-5 hover:shadow-md transition-all duration-200 cursor-pointer group border-0 shadow-sm">
                                  <div className="flex gap-4">
                                    {/* Image Placeholder */}
                                    <div className="hidden sm:block w-28 h-28 shrink-0 rounded-xl bg-gradient-to-br from-rose-400 via-pink-400 to-orange-300 flex items-center justify-center">
                                      <PenLine className="h-8 w-8 text-white/30" />
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-600">
                                          {post.category}
                                        </Badge>
                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          {formatDate(post.publishedAt)}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {post.readingTime} min read
                                        </span>
                                      </div>
                                      <h3 className="font-bold text-sm sm:text-base mb-1.5 group-hover:text-rose-500 transition-colors line-clamp-2">
                                        {highlightMatch(post.title, globalSearchQuery)}
                                      </h3>
                                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
                                        {highlightMatch(post.excerpt, globalSearchQuery)}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                          <AvatarFallback className="text-[8px] bg-rose-100 text-rose-600">
                                            {post.author.split(' ').map((n) => n[0]).join('')}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-muted-foreground">{post.author}</span>
                                        <ArrowRight className="h-3 w-3 text-rose-400 ml-auto group-hover:translate-x-1 transition-transform" />
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </TabsContent>

                  {/* Categories Tab */}
                  <TabsContent value="categories">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="categories-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {categoryResults.length === 0 ? (
                          <div className="text-center py-12">
                            <LayoutGrid className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No categories match your search</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {categoryResults.map((cat, i) => (
                              <motion.div key={cat.id} variants={itemVariants}>
                                <Card
                                  className="overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                                  onClick={() => {
                                    if (setSelectedCategoryId) setSelectedCategoryId(cat.id)
                                    setStorefrontPage('category')
                                  }}
                                >
                                  <div className={`aspect-[3/2] bg-gradient-to-br ${categoryGradients[i % categoryGradients.length]} flex items-center justify-center relative`}>
                                    <span className="text-white/30 text-4xl font-bold">
                                      {cat.name.substring(0, 2).toUpperCase()}
                                    </span>
                                    <div className="absolute bottom-2 right-2">
                                      <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 text-[10px]">
                                        <Tag className="h-2.5 w-2.5 mr-1" />
                                        Browse
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="p-3">
                                    <h3 className="font-semibold text-sm group-hover:text-rose-500 transition-colors">
                                      {highlightMatch(cat.name, globalSearchQuery)}
                                    </h3>
                                  </div>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* Show all categories if search has some matches */}
                        {categories.length > 0 && categoryResults.length < categories.length && (
                          <div className="mt-8">
                            <Separator className="mb-6" />
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-rose-500" />
                              All Categories
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {categories.map((cat, i) => (
                                <motion.button
                                  key={cat.id}
                                  variants={itemVariants}
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() => {
                                    if (setSelectedCategoryId) setSelectedCategoryId(cat.id)
                                    setStorefrontPage('category')
                                  }}
                                  className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${categoryGradients[i % categoryGradients.length]} text-white font-medium text-sm shadow-sm hover:shadow-md transition-all`}
                                >
                                  <Hash className="h-4 w-4" />
                                  {cat.name}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
