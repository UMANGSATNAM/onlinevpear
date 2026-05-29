'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette,
  Eye,
  Check,
  Sparkles,
  Paintbrush,
  Type,
  Layout,
  Monitor,
  Smartphone,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
  Crown,
  Shield,
  Heart,
  ArrowRight,
  Globe,
  Layers,
  Search,
  SlidersHorizontal,
  Play,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  BookOpen,
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
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────

interface ThemeConfig {
  primaryColor: string
  accentColor: string
  secondaryAccent?: string
  bgColor: string
  textColor: string
  fontFamily: string
  layoutStyle: string
  borderRadius: string
  headerStyle: string
  heroStyle: string
  productCardStyle: string
  buttonStyle: string
}

interface ThemeData {
  id: string
  name: string
  description: string | null
  config: string
  layout: string
  isSystem: boolean
  isActive: boolean
  createdAt: string
}

// ─── 10 Pre-built Theme Definitions (fallback if DB empty) ──────────

const BUILT_IN_THEMES: Array<{
  name: string
  description: string
  category: 'Free' | 'Premium'
  rating: number
  installs: number
  features: string[]
  config: ThemeConfig
  previewGradient: string
  tags: string[]
}> = [
  {
    name: 'Minimal Dawn',
    description: 'A clean, minimalist theme with lots of whitespace and elegant typography. Perfect for modern brands that want their products to speak for themselves.',
    category: 'Free',
    rating: 4.9,
    installs: 12400,
    features: ['Clean Layout', 'White Space Focus', 'Fast Loading', 'Mobile First', 'SEO Optimized'],
    config: {
      primaryColor: '#1a1a2e', accentColor: '#e94560', bgColor: '#ffffff', textColor: '#1a1a2e',
      fontFamily: 'inter', layoutStyle: 'modern', borderRadius: 'rounded', headerStyle: 'minimal',
      heroStyle: 'split', productCardStyle: 'clean', buttonStyle: 'rounded',
    },
    previewGradient: 'from-slate-900 via-slate-800 to-rose-500',
    tags: ['Minimal', 'Modern', 'Fast'],
  },
  {
    name: 'Bold Commerce',
    description: 'Make a statement with bold colors and strong visual hierarchy. Ideal for brands that want to stand out and create an impactful first impression.',
    category: 'Free',
    rating: 4.7,
    installs: 9800,
    features: ['Bold Colors', 'Strong CTAs', 'Dynamic Layout', 'Animated Elements', 'High Contrast'],
    config: {
      primaryColor: '#ff6b35', accentColor: '#004e89', bgColor: '#ffffff', textColor: '#1a1a1a',
      fontFamily: 'montserrat', layoutStyle: 'modern', borderRadius: 'sharp', headerStyle: 'fullwidth',
      heroStyle: 'fullscreen', productCardStyle: 'bold', buttonStyle: 'pill',
    },
    previewGradient: 'from-orange-500 via-orange-600 to-blue-800',
    tags: ['Bold', 'Vibrant', 'Impact'],
  },
  {
    name: 'Elegant Luxe',
    description: 'A luxurious, premium theme with dark accents and sophisticated color palette. Designed for high-end fashion, jewelry, and luxury brands.',
    category: 'Premium',
    rating: 4.8,
    installs: 7600,
    features: ['Luxury Feel', 'Dark Mode Ready', 'Parallax Effects', 'Elegant Typography', 'Premium Animations'],
    config: {
      primaryColor: '#2c003e', accentColor: '#c874b2', bgColor: '#faf5ff', textColor: '#2c003e',
      fontFamily: 'playfair', layoutStyle: 'spacious', borderRadius: 'elegant', headerStyle: 'centered',
      heroStyle: 'parallax', productCardStyle: 'luxury', buttonStyle: 'outlined',
    },
    previewGradient: 'from-purple-900 via-fuchsia-800 to-pink-400',
    tags: ['Luxury', 'Fashion', 'Sophisticated'],
  },
  {
    name: 'Fresh Garden',
    description: 'Nature-inspired theme with earthy greens and organic shapes. Great for eco-friendly, sustainable, organic, and wellness brands.',
    category: 'Free',
    rating: 4.6,
    installs: 6200,
    features: ['Organic Shapes', 'Green Palette', 'Eco Vibe', 'Soft Transitions', 'Nature Icons'],
    config: {
      primaryColor: '#2d6a4f', accentColor: '#95d5b2', bgColor: '#f0fdf4', textColor: '#1b4332',
      fontFamily: 'lora', layoutStyle: 'spacious', borderRadius: 'organic', headerStyle: 'transparent',
      heroStyle: 'image-first', productCardStyle: 'soft', buttonStyle: 'rounded',
    },
    previewGradient: 'from-emerald-800 via-emerald-600 to-green-300',
    tags: ['Eco', 'Nature', 'Organic'],
  },
  {
    name: 'Sunset Glow',
    description: 'Warm, inviting theme with amber and sunset-inspired colors. Perfect for lifestyle, home decor, and artisan brands that want a cozy feel.',
    category: 'Free',
    rating: 4.5,
    installs: 8900,
    features: ['Warm Tones', 'Inviting Layout', 'Storytelling Focus', 'Newsletter Section', 'Instagram Feed'],
    config: {
      primaryColor: '#d97706', accentColor: '#ea580c', bgColor: '#fffbeb', textColor: '#78350f',
      fontFamily: 'poppins', layoutStyle: 'classic', borderRadius: 'soft', headerStyle: 'sticky',
      heroStyle: 'slider', productCardStyle: 'warm', buttonStyle: 'rounded',
    },
    previewGradient: 'from-amber-600 via-orange-500 to-red-400',
    tags: ['Warm', 'Cozy', 'Lifestyle'],
  },
  {
    name: 'Ocean Breeze',
    description: 'Cool, calming blues with a fresh oceanic feel. Ideal for swimwear, beachwear, water sports, and coastal lifestyle brands.',
    category: 'Premium',
    rating: 4.7,
    installs: 5400,
    features: ['Cool Palette', 'Wave Animations', 'Fluid Layout', 'Video Hero', 'Watercolor Effects'],
    config: {
      primaryColor: '#0c4a6e', accentColor: '#06b6d4', bgColor: '#f0f9ff', textColor: '#0c4a6e',
      fontFamily: 'inter', layoutStyle: 'modern', borderRadius: 'fluid', headerStyle: 'floating',
      heroStyle: 'video', productCardStyle: 'wave', buttonStyle: 'pill',
    },
    previewGradient: 'from-sky-900 via-cyan-600 to-cyan-300',
    tags: ['Ocean', 'Cool', 'Fresh'],
  },
  {
    name: 'Midnight Elite',
    description: 'Professional dark mode theme with sleek gradients and modern aesthetics. Built for tech, SaaS, and digital product stores.',
    category: 'Premium',
    rating: 4.9,
    installs: 11200,
    features: ['Dark Mode', 'Sleek Gradients', 'Tech Vibe', 'Glassmorphism', 'Micro-animations'],
    config: {
      primaryColor: '#7c3aed', accentColor: '#a78bfa', bgColor: '#0f0f23', textColor: '#e2e8f0',
      fontFamily: 'inter', layoutStyle: 'modern', borderRadius: 'sharp', headerStyle: 'glass',
      heroStyle: 'gradient', productCardStyle: 'glass', buttonStyle: 'glow',
    },
    previewGradient: 'from-violet-900 via-purple-700 to-indigo-400',
    tags: ['Dark', 'Tech', 'Modern'],
  },
  {
    name: 'Rose Boutique',
    description: 'Feminine and elegant with soft rose tones and delicate details. Designed for fashion, beauty, cosmetics, and jewelry stores.',
    category: 'Free',
    rating: 4.6,
    installs: 7100,
    features: ['Rose Palette', 'Feminine Touch', 'Elegant Details', 'Wishlist Ready', 'Quick View'],
    config: {
      primaryColor: '#be185d', accentColor: '#f9a8d4', bgColor: '#fdf2f8', textColor: '#831843',
      fontFamily: 'playfair', layoutStyle: 'elegant', borderRadius: 'soft', headerStyle: 'elegant',
      heroStyle: 'carousel', productCardStyle: 'boutique', buttonStyle: 'rounded',
    },
    previewGradient: 'from-pink-800 via-rose-500 to-pink-300',
    tags: ['Fashion', 'Beauty', 'Feminine'],
  },
  {
    name: 'Rustic Charm',
    description: 'Earthy, warm theme with handcrafted feel and vintage accents. Perfect for artisan, handmade, craft, and farmhouse-style brands.',
    category: 'Free',
    rating: 4.4,
    installs: 4300,
    features: ['Vintage Feel', 'Handcrafted Vibe', 'Earthy Tones', 'Story Sections', 'Custom Badges'],
    config: {
      primaryColor: '#92400e', accentColor: '#d97706', bgColor: '#fefce8', textColor: '#451a03',
      fontFamily: 'lora', layoutStyle: 'classic', borderRadius: 'worn', headerStyle: 'banner',
      heroStyle: 'storytelling', productCardStyle: 'rustic', buttonStyle: 'solid',
    },
    previewGradient: 'from-amber-900 via-yellow-800 to-amber-500',
    tags: ['Vintage', 'Handmade', 'Earthy'],
  },
  {
    name: 'Neon Pulse',
    description: 'Futuristic, high-energy theme with neon accents and dynamic animations. Built for gaming, streetwear, and youth-culture brands.',
    category: 'Premium',
    rating: 4.8,
    installs: 6800,
    features: ['Neon Accents', 'Glitch Effects', 'Dynamic Animations', 'Countdown Timers', 'Limited Edition Badges'],
    config: {
      primaryColor: '#000000', accentColor: '#22d3ee', secondaryAccent: '#f43f5e', bgColor: '#030712', textColor: '#f1f5f9',
      fontFamily: 'montserrat', layoutStyle: 'modern', borderRadius: 'sharp', headerStyle: 'fixed',
      heroStyle: 'animated', productCardStyle: 'neon', buttonStyle: 'outlined-neon',
    },
    previewGradient: 'from-gray-950 via-cyan-500 to-rose-500',
    tags: ['Neon', 'Gaming', 'Streetwear'],
  },
]

// ─── Theme Preview Component ────────────────────────────────────────

function ThemeStorefrontPreview({ config, compact = false }: { config: ThemeConfig; compact?: boolean }) {
  const isDark = config.bgColor === '#030712' || config.bgColor === '#0f0f23'
  const navTextColor = isDark ? config.textColor : '#ffffff'

  return (
    <div className="w-full overflow-hidden" style={{ fontFamily: config.fontFamily !== 'inter' ? config.fontFamily : 'system-ui, sans-serif' }}>
      {/* Browser Chrome */}
      {!compact && (
        <div className="bg-gray-100 px-3 py-1.5 flex items-center gap-2 border-b">
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <div className="h-2 w-2 rounded-full bg-yellow-400" />
            <div className="h-2 w-2 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded px-2 py-0.5 text-[9px] text-gray-400 mx-2">
            yourstore.shopforge.io
          </div>
        </div>
      )}

      {/* Store Header */}
      <div className="px-3 py-2 flex items-center justify-between" style={{ backgroundColor: config.primaryColor }}>
        <span className="font-bold text-xs" style={{ color: navTextColor }}>MyStore</span>
        <div className="flex gap-2" style={{ color: isDark ? config.accentColor : `${navTextColor}99` }}>
          <span className="text-[8px]">Home</span>
          <span className="text-[8px]">Shop</span>
          <span className="text-[8px]">About</span>
          <span className="text-[8px]">Cart</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor}40)` }}>
        <div className="p-3">
          <p className="text-[7px] font-medium mb-0.5" style={{ color: config.accentColor }}>NEW COLLECTION</p>
          <h2 className={`${compact ? 'text-[10px]' : 'text-xs'} font-bold mb-1`} style={{ color: isDark ? config.textColor : '#ffffff' }}>
            {config.heroStyle === 'fullscreen' ? 'Discover Bold' : config.heroStyle === 'parallax' ? 'Timeless Elegance' : config.heroStyle === 'animated' ? 'Level Up Your Game' : config.heroStyle === 'carousel' ? 'Beautiful & You' : config.heroStyle === 'storytelling' ? 'Handcrafted With Love' : config.heroStyle === 'video' ? 'Dive Into Fresh' : config.heroStyle === 'split' ? 'Pure & Simple' : config.heroStyle === 'gradient' ? 'Next Gen Store' : config.heroStyle === 'image-first' ? 'Naturally Better' : 'Welcome to Our Store'}
          </h2>
          <p className={`text-[7px] mb-1.5 ${compact ? 'hidden' : ''}`} style={{ color: isDark ? `${config.textColor}aa` : '#ffffffaa' }}>
            Curated collection of amazing products
          </p>
          <button
            className="text-[7px] px-2 py-0.5 font-medium"
            style={{
              backgroundColor: config.buttonStyle.includes('outlined') ? 'transparent' : config.accentColor,
              color: config.buttonStyle.includes('outlined') ? config.accentColor : (isDark ? config.bgColor : '#ffffff'),
              border: config.buttonStyle.includes('outlined') ? `1px solid ${config.accentColor}` : 'none',
              borderRadius: config.buttonStyle.includes('pill') ? '999px' : config.borderRadius === 'sharp' ? '2px' : '4px',
            }}
          >
            Shop Now
          </button>
        </div>
        {/* Decorative shape */}
        <div className="absolute -right-2 -bottom-2 w-12 h-12 rounded-full opacity-20" style={{ backgroundColor: config.accentColor }} />
      </div>

      {/* Products Grid */}
      <div className="p-2 grid grid-cols-3 gap-1.5" style={{ backgroundColor: config.bgColor }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="overflow-hidden" style={{
            borderRadius: config.borderRadius === 'sharp' ? '2px' : config.borderRadius === 'organic' ? '12px' : '6px',
            border: isDark ? `1px solid ${config.textColor}15` : `1px solid #e5e7eb`,
          }}>
            <div className="h-8 relative" style={{
              background: `linear-gradient(135deg, ${config.primaryColor}${isDark ? '30' : '15'}, ${config.accentColor}${isDark ? '20' : '10'})`,
            }}>
              {config.productCardStyle === 'neon' && (
                <div className="absolute inset-0 border border-cyan-400/30" style={{ borderRadius: 'inherit' }} />
              )}
            </div>
            <div className="p-1" style={{ backgroundColor: isDark ? `${config.bgColor}` : '#ffffff' }}>
              <p className="text-[7px] font-medium truncate" style={{ color: config.textColor }}>Product {i}</p>
              <p className="text-[6px] font-semibold" style={{ color: config.accentColor }}>${(29.99 + i * 15).toFixed(2)}</p>
              {config.productCardStyle !== 'clean' && (
                <div className="flex gap-0.5 mt-0.5">
                  {[1,2,3,4,5].map(s => (
                    <div key={s} className="h-1 w-1 rounded-full" style={{ backgroundColor: s <= 4 ? config.accentColor : '#d1d5db' }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Strip */}
      <div className="px-3 py-1.5" style={{ backgroundColor: isDark ? `${config.primaryColor}40` : `${config.primaryColor}10` }}>
        <div className="flex justify-between items-center">
          <span className="text-[6px]" style={{ color: `${config.textColor}60` }}>© 2025 MyStore</span>
          <div className="flex gap-1.5">
            <span className="text-[6px]" style={{ color: `${config.textColor}60` }}>Privacy</span>
            <span className="text-[6px]" style={{ color: `${config.textColor}60` }}>Terms</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Color Palette Display ──────────────────────────────────────────

function ColorPalette({ config, size = 'sm' }: { config: ThemeConfig; size?: 'sm' | 'md' }) {
  const colors = [config.primaryColor, config.accentColor, config.bgColor, config.textColor, config.secondaryAccent || config.accentColor]
  const s = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'

  return (
    <div className="flex items-center gap-1">
      {colors.slice(0, 4).map((color, i) => (
        <div
          key={i}
          className={`${s} rounded-full border border-white/40 shadow-sm cursor-pointer hover:scale-110 transition-transform`}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  )
}

// ─── Star Rating ────────────────────────────────────────────────────

function StarRating({ rating, size = 'xs' }: { rating: number; size?: 'xs' | 'sm' }) {
  const s = size === 'xs' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${s} ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}

// ─── Main Theme Marketplace Component ───────────────────────────────

export function ThemeCustomization() {
  const { selectedStoreId, selectedMerchantId } = useAppStore()
  const [themes, setThemes] = useState<ThemeData[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [tab, setTab] = useState('marketplace')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewThemeIdx, setPreviewThemeIdx] = useState<number | null>(null)
  const [publishingIdx, setPublishingIdx] = useState<number | null>(null)
  const [publishConfirmIdx, setPublishConfirmIdx] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<'all' | 'Free' | 'Premium'>('all')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [customizingIdx, setCustomizingIdx] = useState<number | null>(null)

  // Customization state
  const [customPrimary, setCustomPrimary] = useState('')
  const [customAccent, setCustomAccent] = useState('')
  const [customFont, setCustomFont] = useState('inter')
  const [customLayout, setCustomLayout] = useState('modern')
  const [customSaving, setCustomSaving] = useState(false)

  const fetchThemes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<{ themes: ThemeData[] }>('/themes', { limit: '50' })
      setThemes(data.themes)
    } catch {
      toast.error('Failed to load themes')
    } finally {
      setLoading(false)
    }
  }, [])

  // Seed themes on first load if none exist
  useEffect(() => {
    const initThemes = async () => {
      try {
        const data = await api.get<{ themes: ThemeData[] }>('/themes', { limit: '50' })
        if (data.themes.length === 0) {
          setSeeding(true)
          try {
            await api.post('/themes/seed', {})
            toast.success('10 themes loaded into your store!')
          } catch {
            // Seeding might fail, will use built-in data as fallback
          }
          setSeeding(false)
        }
        setThemes(data.themes.length > 0 ? data.themes : [])
      } catch {
        // Use built-in themes as fallback
      } finally {
        setLoading(false)
      }
    }
    initThemes()
  }, [])

  // Merge DB themes with built-in definitions for rich display
  // Always use the 10 BUILT_IN_THEMES as the source of truth, enriching with DB data
  const mergedThemes = useMemo(() => {
    return BUILT_IN_THEMES.map((builtIn, i) => {
      const dbTheme = themes.find(t => t.name === builtIn.name)
      if (dbTheme) {
        let parsedConfig: ThemeConfig = builtIn.config
        let parsedLayout: any = { category: builtIn.category, features: builtIn.features }
        try { parsedConfig = { ...builtIn.config, ...JSON.parse(dbTheme.config) } } catch {}
        try { parsedLayout = { ...parsedLayout, ...JSON.parse(dbTheme.layout) } } catch {}
        return { ...dbTheme, _builtIn: builtIn, _config: parsedConfig, _layout: parsedLayout }
      }
      return {
        id: `builtin-${i}`,
        name: builtIn.name,
        description: builtIn.description,
        config: JSON.stringify(builtIn.config),
        layout: JSON.stringify({ category: builtIn.category, features: builtIn.features }),
        isSystem: true,
        isActive: false,
        createdAt: new Date().toISOString(),
        _builtIn: builtIn,
        _config: builtIn.config,
        _layout: { category: builtIn.category, features: builtIn.features },
      }
    })
  }, [themes])

  // Filter themes
  const filteredThemes = useMemo(() => {
    return mergedThemes.filter(t => {
      const matchesSearch = !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t._builtIn.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = filterCategory === 'all' || t._layout.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [mergedThemes, searchQuery, filterCategory])

  const activeTheme = useMemo(() => mergedThemes.find(t => t.isActive), [mergedThemes])

  // Publish (activate) a theme
  const handlePublish = async (themeIdx: number) => {
    const theme = mergedThemes[themeIdx]
    if (!selectedStoreId || !theme.id.startsWith('c')) {
      // If built-in theme (not in DB yet), create it first
      try {
        const created = await api.post('/themes', {
          name: theme.name,
          description: theme.description,
          config: theme.config,
          layout: theme.layout,
          isSystem: true,
          isActive: false,
        })
        theme.id = created.theme.id
      } catch {
        // Theme may already exist
      }
    }

    setPublishingIdx(themeIdx)
    try {
      if (selectedStoreId && theme.id && !theme.id.startsWith('builtin')) {
        await api.post('/themes/publish', { themeId: theme.id, storeId: selectedStoreId })
      } else {
        // Fallback: just activate
        if (activeTheme) {
          await api.put(`/themes/${activeTheme.id}`, { isActive: false }).catch(() => {})
        }
        await api.put(`/themes/${theme.id}`, { isActive: true }).catch(() => {})
      }
      toast.success(`"${theme.name}" theme published!`, {
        description: 'Your storefront is now using this theme.',
      })
      fetchThemes()
    } catch {
      toast.error('Failed to publish theme')
    } finally {
      setPublishingIdx(null)
      setPublishConfirmIdx(null)
    }
  }

  // Open customization
  const openCustomize = (idx: number) => {
    const theme = mergedThemes[idx]
    setCustomizingIdx(idx)
    setCustomPrimary(theme._config.primaryColor)
    setCustomAccent(theme._config.accentColor)
    setCustomFont(theme._config.fontFamily)
    setCustomLayout(theme._config.layoutStyle)
    setTab('customize')
  }

  // Save customization
  const handleSaveCustomization = async () => {
    if (customizingIdx === null) return
    const theme = mergedThemes[customizingIdx]
    setCustomSaving(true)
    try {
      const newConfig = { ...theme._config, primaryColor: customPrimary, accentColor: customAccent, fontFamily: customFont, layoutStyle: customLayout }
      await api.put(`/themes/${theme.id}`, { config: JSON.stringify(newConfig) })
      toast.success('Theme customization saved!')
      fetchThemes()
    } catch {
      toast.error('Failed to save customization')
    } finally {
      setCustomSaving(false)
    }
  }

  // ─── Container Animations ──────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-xl">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-fuchsia-400/20 blur-xl" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Palette className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold">Theme Marketplace</h2>
            </div>
            <p className="text-sm text-white/70 mt-1">Browse 10 professionally designed themes and publish one to your store</p>
          </div>
          <div className="flex items-center gap-2">
            {activeTheme && (
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1">
                <Check className="h-3 w-3 mr-1" /> {activeTheme.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/15">
          {[
            { label: 'Themes Available', value: '10', icon: <Layers className="h-4 w-4" /> },
            { label: 'Free Themes', value: '6', icon: <Zap className="h-4 w-4" /> },
            { label: 'Premium Themes', value: '4', icon: <Crown className="h-4 w-4" /> },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="text-white/70">{stat.icon}</div>
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-white/50">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Active Theme Banner ─────────────────────────────────── */}
      {activeTheme && (
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Currently Published: {activeTheme.name}</p>
                  <p className="text-xs text-emerald-600/70">{activeTheme.description?.slice(0, 80)}...</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50" onClick={() => openCustomize(mergedThemes.findIndex(t => t.isActive))}>
                <Paintbrush className="mr-1.5 h-3.5 w-3.5" /> Customize
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Tabs ────────────────────────────────────────────────── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/60">
          <TabsTrigger value="marketplace" className="gap-1.5">
            <Globe className="h-3.5 w-3.5" /> Marketplace
          </TabsTrigger>
          <TabsTrigger value="customize" className="gap-1.5">
            <Paintbrush className="h-3.5 w-3.5" /> Customize
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ─── Marketplace Tab ─────────────────────────────────────── */}
      {tab === 'marketplace' && (
        <>
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search themes by name, tag, or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-background"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'Free', 'Premium'] as const).map(cat => (
                <Button
                  key={cat}
                  variant={filterCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCategory(cat)}
                  className={filterCategory === cat && cat === 'Premium' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                >
                  {cat === 'Premium' && <Crown className="mr-1 h-3 w-3" />}
                  {cat === 'Free' && <Zap className="mr-1 h-3 w-3" />}
                  {cat === 'all' ? 'All' : cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Theme Grid */}
          {loading || seeding ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-44 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-28 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredThemes.map((theme, index) => {
                const isActive = theme.isActive
                const isPremium = theme._layout.category === 'Premium'
                const builtIn = theme._builtIn

                return (
                  <motion.div key={theme.id} variants={itemVariants}>
                    <Card className={`group overflow-hidden hover:shadow-xl transition-all duration-300 ${isActive ? 'ring-2 ring-emerald-500 shadow-emerald-500/10' : 'hover:-translate-y-1'}`}>
                      {/* Theme Preview */}
                      <div className="relative h-44 overflow-hidden bg-gray-50">
                        <ThemeStorefrontPreview config={theme._config} compact />

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 shadow-lg"
                              onClick={() => { setPreviewThemeIdx(index); setPreviewOpen(true) }}
                            >
                              <Eye className="mr-1 h-3.5 w-3.5" /> Preview
                            </Button>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex gap-1.5">
                          {isActive && (
                            <Badge className="bg-emerald-500 text-white shadow-md text-[10px]">
                              <Check className="h-2.5 w-2.5 mr-0.5" /> Published
                            </Badge>
                          )}
                          {isPremium && !isActive && (
                            <Badge className="bg-amber-500 text-white shadow-md text-[10px]">
                              <Crown className="h-2.5 w-2.5 mr-0.5" /> Premium
                            </Badge>
                          )}
                          {!isPremium && !isActive && (
                            <Badge className="bg-emerald-600 text-white shadow-md text-[10px]">
                              <Zap className="h-2.5 w-2.5 mr-0.5" /> Free
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <CardContent className="p-3.5">
                        {/* Name + Rating */}
                        <div className="flex items-start justify-between mb-1.5">
                          <div>
                            <h3 className="font-semibold text-sm leading-tight">{theme.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <StarRating rating={builtIn.rating} />
                              <span className="text-[10px] text-muted-foreground">{builtIn.rating}</span>
                            </div>
                          </div>
                          <ColorPalette config={theme._config} />
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-2.5">
                          {theme.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {builtIn.tags.map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Features Mini */}
                        <div className="grid grid-cols-2 gap-1 mb-3">
                          {builtIn.features.slice(0, 4).map(f => (
                            <div key={f} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                              <Check className="h-2.5 w-2.5 text-emerald-500 shrink-0" /> {f}
                            </div>
                          ))}
                        </div>

                        {/* Install Count */}
                        <div className="flex items-center gap-1 mb-3 text-[10px] text-muted-foreground">
                          <Users className="h-3 w-3" /> {(builtIn.installs / 1000).toFixed(1)}k stores
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {isActive ? (
                            <>
                              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => openCustomize(index)}>
                                <Paintbrush className="mr-1 h-3 w-3" /> Customize
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => { setPreviewThemeIdx(index); setPreviewOpen(true) }}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                className="flex-1 h-8 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20"
                                onClick={() => setPublishConfirmIdx(index)}
                                disabled={publishingIdx === index}
                              >
                                {publishingIdx === index ? (
                                  <><div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" /> Publishing...</>
                                ) : (
                                  <><Globe className="mr-1 h-3 w-3" /> Publish</>
                                )}
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => openCustomize(index)}>
                                <Paintbrush className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => { setPreviewThemeIdx(index); setPreviewOpen(true) }}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {filteredThemes.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Palette className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-1">No themes match your search</p>
              <p className="text-sm text-muted-foreground">Try a different search term or filter</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(''); setFilterCategory('all') }}>
                Clear Filters
              </Button>
            </div>
          )}
        </>
      )}

      {/* ─── Customize Tab ───────────────────────────────────────── */}
      {tab === 'customize' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Customization Panel */}
          <Card className="border-violet-200 shadow-md">
            <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-t-xl" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paintbrush className="h-5 w-5 text-violet-600" />
                Theme Settings
              </CardTitle>
              <CardDescription>
                {customizingIdx !== null
                  ? `Customizing "${mergedThemes[customizingIdx]?.name}"`
                  : 'Select a theme from the marketplace to customize'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Colors */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-violet-100 flex items-center justify-center">
                    <Paintbrush className="h-3 w-3 text-violet-600" />
                  </div> Colors
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customPrimary}
                        onChange={(e) => setCustomPrimary(e.target.value)}
                        className="h-9 w-9 rounded-lg border-2 cursor-pointer"
                      />
                      <Input value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} className="flex-1 h-9 text-xs" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customAccent}
                        onChange={(e) => setCustomAccent(e.target.value)}
                        className="h-9 w-9 rounded-lg border-2 cursor-pointer"
                      />
                      <Input value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="flex-1 h-9 text-xs" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-blue-100 flex items-center justify-center">
                    <Type className="h-3 w-3 text-blue-600" />
                  </div> Typography
                </h4>
                <Select value={customFont} onValueChange={setCustomFont}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter — Modern & Clean</SelectItem>
                    <SelectItem value="roboto">Roboto — Professional</SelectItem>
                    <SelectItem value="poppins">Poppins — Friendly</SelectItem>
                    <SelectItem value="playfair">Playfair Display — Elegant</SelectItem>
                    <SelectItem value="montserrat">Montserrat — Bold</SelectItem>
                    <SelectItem value="lora">Lora — Classic Serif</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">
                  Preview: <span style={{ fontFamily: customFont !== 'inter' ? customFont : 'system-ui' }} className="font-medium">The quick brown fox jumps over the lazy dog</span>
                </p>
              </div>

              {/* Layout */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-emerald-100 flex items-center justify-center">
                    <Layout className="h-3 w-3 text-emerald-600" />
                  </div> Layout Style
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'modern', label: 'Modern', desc: 'Clean & spacious' },
                    { value: 'classic', label: 'Classic', desc: 'Traditional layout' },
                    { value: 'compact', label: 'Compact', desc: 'More content, less space' },
                    { value: 'spacious', label: 'Spacious', desc: 'Breathing room' },
                  ].map(layout => (
                    <button
                      key={layout.value}
                      onClick={() => setCustomLayout(layout.value)}
                      className={`p-2.5 rounded-lg border-2 text-left transition-all ${customLayout === layout.value ? 'border-violet-500 bg-violet-50' : 'border-muted hover:border-violet-200'}`}
                    >
                      <p className="text-xs font-medium">{layout.label}</p>
                      <p className="text-[10px] text-muted-foreground">{layout.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {customizingIdx !== null && (
                <Button
                  onClick={handleSaveCustomization}
                  disabled={customSaving}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  {customSaving ? 'Saving...' : 'Save Customization'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Monitor className="h-4 w-4" /> Live Preview
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`mx-auto border rounded-lg overflow-hidden shadow-inner ${previewDevice === 'mobile' ? 'max-w-[280px]' : 'w-full'}`}>
                <ThemeStorefrontPreview
                  config={{
                    ...((customizingIdx !== null ? mergedThemes[customizingIdx]?._config : BUILT_IN_THEMES[0].config) || BUILT_IN_THEMES[0].config),
                    primaryColor: customPrimary || BUILT_IN_THEMES[0].config.primaryColor,
                    accentColor: customAccent || BUILT_IN_THEMES[0].config.accentColor,
                    fontFamily: customFont,
                    layoutStyle: customLayout,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Preview Dialog ──────────────────────────────────────── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {previewThemeIdx !== null && mergedThemes[previewThemeIdx] && (
            <>
              <DialogHeader className="p-4 pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                      {mergedThemes[previewThemeIdx].name}
                      <Badge variant={mergedThemes[previewThemeIdx]._layout.category === 'Premium' ? 'default' : 'secondary'} className={mergedThemes[previewThemeIdx]._layout.category === 'Premium' ? 'bg-amber-500' : 'bg-emerald-600 text-white'}>
                        {mergedThemes[previewThemeIdx]._layout.category}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {mergedThemes[previewThemeIdx].description}
                    </DialogDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPreviewDevice('desktop')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPreviewDevice('mobile')}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="px-4 py-2">
                {/* Theme Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <StarRating rating={mergedThemes[previewThemeIdx]._builtIn.rating} size="sm" />
                    <span className="font-medium">{mergedThemes[previewThemeIdx]._builtIn.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {mergedThemes[previewThemeIdx]._builtIn.installs.toLocaleString()} stores
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Updated recently
                  </div>
                </div>

                {/* Preview */}
                <div className={`mx-auto border rounded-xl overflow-hidden shadow-lg ${previewDevice === 'mobile' ? 'max-w-[320px]' : 'w-full'}`}>
                  <ThemeStorefrontPreview config={mergedThemes[previewThemeIdx]._config} />
                </div>

                {/* Features */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {mergedThemes[previewThemeIdx]._builtIn.features.map(f => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>

                {/* Color Palette */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xs font-medium">Color Palette:</span>
                  <ColorPalette config={mergedThemes[previewThemeIdx]._config} size="md" />
                  <span className="text-[10px] text-muted-foreground">
                    {mergedThemes[previewThemeIdx]._config.fontFamily} · {mergedThemes[previewThemeIdx]._config.layoutStyle}
                  </span>
                </div>
              </div>

              <DialogFooter className="p-4 pt-2 border-t">
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
                {!mergedThemes[previewThemeIdx].isActive ? (
                  <Button
                    onClick={() => { setPublishConfirmIdx(previewThemeIdx); setPreviewOpen(false) }}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    <Globe className="mr-2 h-4 w-4" /> Publish This Theme
                  </Button>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-800 px-3 py-1">
                    <Check className="mr-1 h-3 w-3" /> Currently Published
                  </Badge>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Publish Confirmation Dialog ──────────────────────────── */}
      <Dialog open={publishConfirmIdx !== null} onOpenChange={(open) => { if (!open) setPublishConfirmIdx(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-600" />
              Publish Theme
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to publish &quot;{publishConfirmIdx !== null ? mergedThemes[publishConfirmIdx]?.name : ''}&quot;?
            </DialogDescription>
          </DialogHeader>

          {publishConfirmIdx !== null && mergedThemes[publishConfirmIdx] && (
            <div className="space-y-3">
              {/* Preview mini */}
              <div className="border rounded-lg overflow-hidden">
                <ThemeStorefrontPreview config={mergedThemes[publishConfirmIdx]._config} compact />
              </div>

              {/* What happens */}
              <div className="bg-emerald-50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-emerald-800">What happens when you publish:</p>
                <div className="space-y-1">
                  {[
                    'Your current theme will be deactivated',
                    'The new theme will be applied to your storefront',
                    'Changes take effect immediately',
                    'You can switch themes anytime',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-1.5 text-[11px] text-emerald-700">
                      <Check className="h-3 w-3 text-emerald-500 shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              </div>

              {activeTheme && (
                <div className="bg-amber-50 rounded-lg p-3 flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-amber-100 flex items-center justify-center shrink-0">
                    <Paintbrush className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-amber-800">Replacing: {activeTheme.name}</p>
                    <p className="text-[10px] text-amber-600">Your current theme will be deactivated</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishConfirmIdx(null)}>Cancel</Button>
            <Button
              onClick={() => publishConfirmIdx !== null && handlePublish(publishConfirmIdx)}
              disabled={publishingIdx !== null}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {publishingIdx !== null ? (
                <><div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" /> Publishing...</>
              ) : (
                <><Globe className="mr-1.5 h-4 w-4" /> Publish Theme</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
