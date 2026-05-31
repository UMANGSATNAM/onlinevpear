'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import {
  Search,
  X,
  Star,
  ShoppingCart,
  Check,
  ArrowLeft,
  ArrowRight,
  Package,
  Truck,
  RotateCcw,
  Plus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Ruler,
  Weight,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// Mock product data with full comparison attributes
interface CompareProduct {
  id: string
  name: string
  price: number
  salePrice?: number
  rating: number
  reviewCount: number
  availability: 'in-stock' | 'low-stock' | 'out-of-stock'
  category: string
  brand: string
  image: string
  features: string[]
  specs: {
    dimensions: string
    weight: string
    material: string
  }
  shipping: ('free' | 'standard' | 'express')[]
  returnPolicy: string
}

const mockProducts: CompareProduct[] = [
  {
    id: '1',
    name: 'Pro Wireless Headphones',
    price: 299.99,
    salePrice: 249.99,
    rating: 4.8,
    reviewCount: 2341,
    availability: 'in-stock',
    category: 'Audio',
    brand: 'SoundMax',
    image: '/products/headphones.png',
    features: ['Active Noise Cancellation', '40hr Battery Life', 'Bluetooth 5.3', 'Hi-Res Audio', 'Multipoint Connection'],
    specs: { dimensions: '7.5 x 6.8 x 3.2 in', weight: '250g', material: 'Premium Aluminum + Protein Leather' },
    shipping: ['free', 'standard', 'express'],
    returnPolicy: '30-Day Free Returns',
  },
  {
    id: '2',
    name: 'Mechanical Gaming Keyboard',
    price: 179.99,
    rating: 4.6,
    reviewCount: 1892,
    availability: 'in-stock',
    category: 'Peripherals',
    brand: 'KeyForge',
    image: '/products/keyboard.png',
    features: ['Cherry MX Switches', 'RGB Backlighting', 'USB-C Connection', 'N-Key Rollover', 'Detachable Wrist Rest'],
    specs: { dimensions: '17.5 x 5.5 x 1.5 in', weight: '980g', material: 'Aircraft-grade Aluminum' },
    shipping: ['free', 'standard'],
    returnPolicy: '30-Day Free Returns',
  },
  {
    id: '3',
    name: 'Smart Fitness Watch',
    price: 349.99,
    salePrice: 299.99,
    rating: 4.7,
    reviewCount: 3102,
    availability: 'low-stock',
    category: 'Wearables',
    brand: 'FitTech',
    image: '/products/smartwatch.png',
    features: ['Heart Rate Monitor', 'GPS Tracking', '7-Day Battery', 'Water Resistant 50m', 'AMOLED Display'],
    specs: { dimensions: '1.8 x 1.8 x 0.5 in', weight: '52g', material: 'Titanium + Sapphire Glass' },
    shipping: ['free', 'standard', 'express'],
    returnPolicy: '15-Day Free Returns',
  },
  {
    id: '4',
    name: 'Portable Bluetooth Speaker',
    price: 129.99,
    rating: 4.5,
    reviewCount: 987,
    availability: 'in-stock',
    category: 'Audio',
    brand: 'BoomBox',
    image: '/products/speaker.png',
    features: ['360° Sound', 'IPX7 Waterproof', '24hr Battery', 'Stereo Pairing', 'Built-in Microphone'],
    specs: { dimensions: '3.5 x 3.5 x 7.0 in', weight: '680g', material: 'Rugged Rubber + Fabric' },
    shipping: ['standard', 'express'],
    returnPolicy: '30-Day Free Returns',
  },
  {
    id: '5',
    name: 'Premium Phone Case',
    price: 49.99,
    rating: 4.3,
    reviewCount: 5643,
    availability: 'in-stock',
    category: 'Accessories',
    brand: 'ShieldPro',
    image: '/products/phonecase.png',
    features: ['Military Drop Protection', 'MagSafe Compatible', 'Anti-Yellowing', 'Wireless Charging', 'Slim Profile'],
    specs: { dimensions: '6.3 x 3.1 x 0.5 in', weight: '35g', material: 'Polycarbonate + TPU' },
    shipping: ['free', 'standard'],
    returnPolicy: '60-Day Free Returns',
  },
  {
    id: '6',
    name: 'USB-C Charging Dock',
    price: 89.99,
    salePrice: 74.99,
    rating: 4.4,
    reviewCount: 432,
    availability: 'out-of-stock',
    category: 'Accessories',
    brand: 'ChargeHub',
    image: '/products/dock.png',
    features: ['100W Power Delivery', 'Triple Display', '12-in-1 Hub', 'Ethernet Port', 'SD Card Reader'],
    specs: { dimensions: '4.5 x 3.0 x 1.2 in', weight: '210g', material: 'Anodized Aluminum' },
    shipping: ['standard'],
    returnPolicy: '30-Day Free Returns',
  },
  {
    id: '7',
    name: 'Ergonomic Office Chair',
    price: 599.99,
    salePrice: 499.99,
    rating: 4.9,
    reviewCount: 756,
    availability: 'low-stock',
    category: 'Furniture',
    brand: 'ErgoMax',
    image: '',
    features: ['Lumbar Support', 'Adjustable Armrests', 'Mesh Back', 'Tilt Lock', 'Headrest Included'],
    specs: { dimensions: '27 x 27 x 48 in', weight: '45lbs', material: 'Breathable Mesh + Steel Frame' },
    shipping: ['free'],
    returnPolicy: '60-Day Free Returns',
  },
  {
    id: '8',
    name: '4K Webcam Pro',
    price: 199.99,
    rating: 4.6,
    reviewCount: 1123,
    availability: 'in-stock',
    category: 'Peripherals',
    brand: 'ClearView',
    image: '',
    features: ['4K Ultra HD', 'Auto Focus', 'Noise Cancelling Mic', 'Privacy Cover', 'Low Light Correction'],
    specs: { dimensions: '4.0 x 2.2 x 2.0 in', weight: '140g', material: 'Premium Plastic + Glass Lens' },
    shipping: ['free', 'standard', 'express'],
    returnPolicy: '30-Day Free Returns',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={cn(
              'h-3.5 w-3.5',
              s <= Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : s - 0.5 <= rating
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-gray-300'
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">({count.toLocaleString()})</span>
    </div>
  )
}

function AvailabilityBadge({ status }: { status: CompareProduct['availability'] }) {
  const config = {
    'in-stock': { label: 'In Stock', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'low-stock': { label: 'Low Stock', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    'out-of-stock': { label: 'Out of Stock', className: 'bg-red-50 text-red-700 border-red-200' },
  }
  const c = config[status]
  return <Badge variant="outline" className={cn('text-xs', c.className)}>{c.label}</Badge>
}

function ShippingBadges({ shipping }: { shipping: CompareProduct['shipping'] }) {
  const config = {
    free: { label: 'Free', className: 'bg-emerald-50 text-emerald-700' },
    standard: { label: 'Standard', className: 'bg-blue-50 text-blue-700' },
    express: { label: 'Express', className: 'bg-violet-50 text-violet-700' },
  }
  return (
    <div className="flex flex-wrap gap-1">
      {shipping.map((s) => (
        <Badge key={s} variant="secondary" className={cn('text-[10px] px-1.5 py-0', config[s].className)}>
          {config[s].label}
        </Badge>
      ))}
    </div>
  )
}

export function ProductComparison() {
  const { setStorefrontPage } = useAppStore()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [mobileIndex, setMobileIndex] = useState(0)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const selectedProducts = useMemo(
    () => mockProducts.filter((p) => selectedIds.includes(p.id)),
    [selectedIds]
  )

  const searchResults = useMemo(
    () =>
      mockProducts.filter(
        (p) =>
          !selectedIds.includes(p.id) &&
          (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [selectedIds, searchQuery]
  )

  const addProduct = (id: string) => {
    if (selectedIds.length < 4 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id])
      setSearchQuery('')
      setShowSearch(false)
    }
  }

  const removeProduct = (id: string) => {
    setSelectedIds(selectedIds.filter((sid) => sid !== id))
  }

  const clearAll = () => {
    setSelectedIds([])
    setMobileIndex(0)
  }

  const toggleRow = (row: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(row)) next.delete(row)
      else next.add(row)
      return next
    })
  }

  // Find "best" values for highlighting
  const bestPrice = selectedProducts.length > 0
    ? Math.min(...selectedProducts.map((p) => p.salePrice ?? p.price))
    : 0
  const bestRating = selectedProducts.length > 0
    ? Math.max(...selectedProducts.map((p) => p.rating))
    : 0

  // Comparison rows definition
  const comparisonRows = [
    {
      key: 'price',
      label: 'Price',
      icon: <ShoppingCart className="h-4 w-4" />,
      render: (p: CompareProduct) => (
        <div>
          {p.salePrice ? (
            <div className="flex items-center gap-2">
              <span className={cn('font-bold text-lg', (p.salePrice) === bestPrice && selectedProducts.length > 1 ? 'text-emerald-600' : '')}>
                ${p.salePrice.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground line-through">${p.price.toFixed(2)}</span>
              <Badge className="bg-red-100 text-red-700 text-[10px]">-{Math.round((1 - p.salePrice / p.price) * 100)}%</Badge>
            </div>
          ) : (
            <span className={cn('font-bold text-lg', p.price === bestPrice && selectedProducts.length > 1 ? 'text-emerald-600' : '')}>
              ${p.price.toFixed(2)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      icon: <Star className="h-4 w-4" />,
      render: (p: CompareProduct) => (
        <div className={cn(p.rating === bestRating && selectedProducts.length > 1 ? 'bg-emerald-50 -mx-2 px-2 rounded-md' : '')}>
          <div className="font-bold text-lg">{p.rating}</div>
          <StarRating rating={p.rating} count={p.reviewCount} />
        </div>
      ),
    },
    {
      key: 'availability',
      label: 'Availability',
      icon: <Package className="h-4 w-4" />,
      render: (p: CompareProduct) => <AvailabilityBadge status={p.availability} />,
    },
    {
      key: 'category',
      label: 'Category',
      icon: <Layers className="h-4 w-4" />,
      render: (p: CompareProduct) => <span className="text-sm font-medium">{p.category}</span>,
    },
    {
      key: 'brand',
      label: 'Brand',
      icon: <Sparkles className="h-4 w-4" />,
      render: (p: CompareProduct) => <span className="text-sm font-medium">{p.brand}</span>,
    },
    {
      key: 'features',
      label: 'Features',
      icon: <Check className="h-4 w-4" />,
      render: (p: CompareProduct) => (
        <ul className="space-y-1">
          {p.features.map((f, i) => (
            <li key={i} className="flex items-start gap-1.5 text-sm">
              <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: 'specs-dimensions',
      label: 'Dimensions',
      icon: <Ruler className="h-4 w-4" />,
      render: (p: CompareProduct) => <span className="text-sm">{p.specs.dimensions}</span>,
    },
    {
      key: 'specs-weight',
      label: 'Weight',
      icon: <Weight className="h-4 w-4" />,
      render: (p: CompareProduct) => <span className="text-sm">{p.specs.weight}</span>,
    },
    {
      key: 'specs-material',
      label: 'Material',
      icon: <Layers className="h-4 w-4" />,
      render: (p: CompareProduct) => <span className="text-sm">{p.specs.material}</span>,
    },
    {
      key: 'shipping',
      label: 'Shipping',
      icon: <Truck className="h-4 w-4" />,
      render: (p: CompareProduct) => <ShippingBadges shipping={p.shipping} />,
    },
    {
      key: 'returns',
      label: 'Returns',
      icon: <RotateCcw className="h-4 w-4" />,
      render: (p: CompareProduct) => <span className="text-sm">{p.returnPolicy}</span>,
    },
  ]

  // Empty state
  if (selectedProducts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[70vh] flex items-center justify-center p-6"
      >
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative mx-auto mb-6"
          >
            <div className="h-32 w-32 mx-auto rounded-full bg-gradient-to-br from-rose-100 via-orange-50 to-amber-50 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-rose-200 to-amber-200 flex items-center justify-center">
                <Package className="h-10 w-10 text-rose-500" />
              </div>
            </div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"
            >
              <Plus className="h-4 w-4 text-white" />
            </motion.div>
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Select Products to Compare</h2>
          <p className="text-muted-foreground mb-6">
            Add up to 4 products side-by-side to compare features, pricing, and specifications.
          </p>
          <Button
            onClick={() => setShowSearch(true)}
            className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Product
          </Button>
          <div className="mt-4">
            <Button variant="ghost" onClick={() => setStorefrontPage('products')}>
              Browse Products
            </Button>
          </div>
        </div>

        {/* Search overlay for empty state */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20 p-4"
              onClick={() => { setShowSearch(false); setSearchQuery('') }}
            >
              <motion.div
                initial={{ scale: 0.95, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: -20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-xl shadow-2xl border w-full max-w-lg overflow-hidden"
              >
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products by name, brand, or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.length === 0 && searchQuery ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">No products found</div>
                  ) : (
                    searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addProduct(product.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-rose-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.brand} · {product.category}</div>
                        </div>
                        <div className="text-sm font-bold">${(product.salePrice ?? product.price).toFixed(2)}</div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 sm:p-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Compare Products</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {selectedProducts.length} of 4 products selected
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedProducts.length < 4 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSearch(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive">
            <X className="h-3.5 w-3.5 mr-1" />
            Clear All
          </Button>
        </div>
      </motion.div>

      {/* Selected product thumbnails */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex flex-wrap gap-3">
          {selectedProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group"
            >
              <Card className="overflow-hidden border-2 hover:border-primary/30 transition-colors">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-5 w-5 text-rose-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate max-w-[140px]">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.brand}</div>
                  </div>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="ml-1 h-6 w-6 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {selectedProducts.length < 4 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSearch(true)}
              className="h-full min-h-[60px] flex items-center gap-2 px-4 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Add Product</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Desktop Comparison Table */}
      <motion.div variants={itemVariants} className="hidden md:block">
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Sticky header row */}
              <thead>
                <tr className="bg-muted/30 border-b">
                  <th className="sticky left-0 bg-muted/30 z-10 w-40 p-4 text-left text-sm font-medium text-muted-foreground">
                    Product
                  </th>
                  {selectedProducts.map((product) => (
                    <th key={product.id} className="p-4 text-center min-w-[200px]">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-xl" />
                          ) : (
                            <Package className="h-8 w-8 text-rose-400" />
                          )}
                        </div>
                        <div className="font-semibold text-sm text-center">{product.name}</div>
                        <StarRating rating={product.rating} count={product.reviewCount} />
                        <AvailabilityBadge status={product.availability} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, rowIdx) => (
                  <tr
                    key={row.key}
                    className={cn(
                      'border-b last:border-b-0 transition-colors',
                      rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted/20'
                    )}
                  >
                    <td className="sticky left-0 z-10 p-4">
                      <button
                        onClick={() => toggleRow(row.key)}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {row.icon}
                        <span>{row.label}</span>
                        {row.key === 'features' && (
                          expandedRows.has(row.key) ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )
                        )}
                      </button>
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4 text-center">
                        <div className="flex justify-center">
                          {row.key === 'features' && !expandedRows.has(row.key)
                            ? (
                              <div className="text-sm text-muted-foreground">
                                {product.features.length} features
                                <button onClick={() => toggleRow(row.key)} className="ml-1 text-primary hover:underline text-xs">
                                  View
                                </button>
                              </div>
                            )
                            : row.render(product)
                          }
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Mobile Swipeable Cards */}
      <motion.div variants={itemVariants} className="md:hidden">
        <div className="relative">
          {/* Card indicator dots */}
          <div className="flex justify-center gap-2 mb-4">
            {selectedProducts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setMobileIndex(idx)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  idx === mobileIndex
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-muted-foreground/30'
                )}
              />
            ))}
          </div>

          {/* Swipeable card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mobileIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              {selectedProducts[mobileIndex] && (
                <Card className="overflow-hidden">
                  {/* Product header card */}
                  <div className="bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-6 text-center border-b">
                    <div className="h-24 w-24 mx-auto rounded-xl bg-white shadow-md flex items-center justify-center overflow-hidden mb-3">
                      {selectedProducts[mobileIndex].image ? (
                        <img
                          src={selectedProducts[mobileIndex].image}
                          alt={selectedProducts[mobileIndex].name}
                          className="h-full w-full object-cover rounded-xl"
                        />
                      ) : (
                        <Package className="h-10 w-10 text-rose-400" />
                      )}
                    </div>
                    <h3 className="font-bold text-lg">{selectedProducts[mobileIndex].name}</h3>
                    <div className="mt-1">
                      <StarRating
                        rating={selectedProducts[mobileIndex].rating}
                        count={selectedProducts[mobileIndex].reviewCount}
                      />
                    </div>
                    <div className="mt-2">
                      <AvailabilityBadge status={selectedProducts[mobileIndex].availability} />
                    </div>
                  </div>

                  {/* Comparison details */}
                  <div className="divide-y">
                    {comparisonRows.map((row) => (
                      <div key={row.key} className="px-4 py-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1.5">
                          {row.icon}
                          {row.label}
                        </div>
                        <div className="pl-6">
                          {row.render(selectedProducts[mobileIndex])}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileIndex(Math.max(0, mobileIndex - 1))}
              disabled={mobileIndex === 0}
              className="gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              {mobileIndex + 1} / {selectedProducts.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileIndex(Math.min(selectedProducts.length - 1, mobileIndex + 1))}
              disabled={mobileIndex === selectedProducts.length - 1}
              className="gap-1"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Search overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20 p-4"
            onClick={() => { setShowSearch(false); setSearchQuery('') }}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl shadow-2xl border w-full max-w-lg overflow-hidden"
            >
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name, brand, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {searchResults.length === 0 && searchQuery ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">No products found</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">All products already added</div>
                ) : (
                  searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addProduct(product.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-lg" />
                        ) : (
                          <Package className="h-4 w-4 text-rose-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.brand} · {product.category}</div>
                      </div>
                      <div className="text-sm font-bold">
                        ${(product.salePrice ?? product.price).toFixed(2)}
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))
                )}
              </div>
              {selectedIds.length >= 4 && (
                <div className="p-3 border-t bg-muted/30 text-center text-sm text-muted-foreground">
                  Maximum 4 products can be compared at once
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
