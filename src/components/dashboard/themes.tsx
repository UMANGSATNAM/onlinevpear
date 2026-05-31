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
  Tablet,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
  Plus,
  RotateCcw,
  Save,
  Upload,
  Timer,
  AlertTriangle,
  ShoppingCart,
  BadgeCheck,
  Activity,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Settings2,
  Megaphone,
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
import { Slider } from '@/components/ui/slider'
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
import {
  THEME_CONFIGS,
  type ThemeLayoutConfig,
  type SectionConfig,
  type SectionType,
  type CROConfig,
  type GridLayout,
  type HeroVariant,
  type ProductCardVariant,
} from '@/lib/theme-configs'

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

// ─── Editor-specific Types ───────────────────────────────────────────

interface EditorSection extends SectionConfig {
  label: string
  icon: React.ReactNode
}

interface EditorColors {
  primary: string
  accent: string
  background: string
  text: string
}

interface EditorTypography {
  fontFamily: string
}

interface EditorLayout {
  borderRadius: number // 0=sharp, 8=rounded, 999=pill
  gridLayout: GridLayout
}

interface EditorButtonStyle {
  style: string // rounded, pill, outlined, solid, glow
}

interface EditorAnimation {
  intensity: string // none, subtle, moderate, high, extreme
}

type EditorCRO = CROConfig

interface EditorState {
  colors: EditorColors
  typography: EditorTypography
  layout: EditorLayout
  buttonStyle: EditorButtonStyle
  animation: EditorAnimation
  sections: EditorSection[]
  cro: EditorCRO
}

// ─── Section Metadata ────────────────────────────────────────────────

const SECTION_META: Record<SectionType, { label: string; icon: React.ReactNode }> = {
  'hero': { label: 'Hero Banner', icon: <Layout className="h-4 w-4" /> },
  'trust-badges': { label: 'Trust Badges', icon: <Shield className="h-4 w-4" /> },
  'trending': { label: 'Trending Products', icon: <TrendingUp className="h-4 w-4" /> },
  'flash-sale': { label: 'Flash Sale', icon: <Timer className="h-4 w-4" /> },
  'brand-values': { label: 'Brand Values', icon: <Heart className="h-4 w-4" /> },
  'collections': { label: 'Collections', icon: <Layers className="h-4 w-4" /> },
  'categories': { label: 'Categories', icon: <Globe className="h-4 w-4" /> },
  'products': { label: 'Product Grid', icon: <ShoppingCart className="h-4 w-4" /> },
  'promo-banner': { label: 'Promo Banner', icon: <Megaphone className="h-4 w-4" /> },
  'testimonials': { label: 'Testimonials', icon: <MessageSquare className="h-4 w-4" /> },
  'newsletter': { label: 'Newsletter', icon: <BookOpen className="h-4 w-4" /> },
  'social-proof': { label: 'Social Proof', icon: <Users className="h-4 w-4" /> },
  'recently-viewed': { label: 'Recently Viewed', icon: <Eye className="h-4 w-4" /> },
  'instagram-feed': { label: 'Instagram Feed', icon: <Camera className="h-4 w-4" /> },
  'lookbook': { label: 'Lookbook', icon: <Sparkles className="h-4 w-4" /> },
}

// Simple camera icon since it's not in the import list
function Camera({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  )
}

// ─── 5 Online Vepar Theme Definitions (fallback if DB empty) ──────────

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
    name: 'Lumia',
    description: 'Luxury jewellery theme with champagne gold accents, editorial photography, and dramatic negative space. Designed for high-end jewellery and premium accessories.',
    category: 'Premium',
    rating: 4.9,
    installs: 8200,
    features: ['Editorial Carousel', 'Luxury Product Cards', 'Certification Badges', 'Delivery Estimator', 'Crossfade Gallery'],
    config: {
      primaryColor: '#0D0D0D', accentColor: '#D4AF37', secondaryAccent: '#F5E6A3', bgColor: '#F8F4EE', textColor: '#0D0D0D',
      fontFamily: 'playfair', layoutStyle: 'spacious', borderRadius: 'elegant', headerStyle: 'elegant',
      heroStyle: 'carousel', productCardStyle: 'luxury', buttonStyle: 'outlined',
    },
    previewGradient: 'from-gray-950 via-yellow-600 to-amber-300',
    tags: ['Luxury', 'Jewellery', 'Editorial'],
  },
  {
    name: 'Blaze',
    description: 'Bold D2C fashion/streetwear theme with electric yellow, brutalist typography, and high-energy motion. Built for limited drops and flash sales.',
    category: 'Free',
    rating: 4.8,
    installs: 14500,
    features: ['Marquee Ticker', 'Real-time Stock Counter', 'Animated Add-to-Cart', 'Urgency Timers', 'Flash Sale Countdown'],
    config: {
      primaryColor: '#000000', accentColor: '#FFE600', bgColor: '#FFFFFF', textColor: '#000000',
      fontFamily: 'montserrat', layoutStyle: 'modern', borderRadius: 'sharp', headerStyle: 'sticky',
      heroStyle: 'animated', productCardStyle: 'bold', buttonStyle: 'pill',
    },
    previewGradient: 'from-black via-yellow-400 to-yellow-200',
    tags: ['Streetwear', 'Fashion', 'Drops'],
  },
  {
    name: 'Glow',
    description: 'Beauty & skincare theme with blush rose and sage green tones. Science-backed trust signals, ingredient-forward design, and skin quiz personalization.',
    category: 'Free',
    rating: 4.7,
    installs: 11800,
    features: ['Skin Quiz CTA', 'Before/After Slider', 'Ingredient Highlights', 'Dermatologist Quotes', 'Routine Builder'],
    config: {
      primaryColor: '#F4B8C1', accentColor: '#A8C5A0', secondaryAccent: '#FFD6DE', bgColor: '#FFF9F5', textColor: '#4A3040',
      fontFamily: 'playfair', layoutStyle: 'spacious', borderRadius: 'soft', headerStyle: 'centered',
      heroStyle: 'slider', productCardStyle: 'soft', buttonStyle: 'rounded',
    },
    previewGradient: 'from-pink-300 via-rose-200 to-green-200',
    tags: ['Beauty', 'Skincare', 'Feminine'],
  },
  {
    name: 'Bolt',
    description: 'Electronics & gadgets theme with deep navy, electric blue accents, and spec-sheet data density. Dark, technical, with EMI calculator and comparison features.',
    category: 'Premium',
    rating: 4.8,
    installs: 9600,
    features: ['Spec Comparison', 'EMI Calculator', 'Warranty Info', 'Competitor Compare', 'Review Aggregator'],
    config: {
      primaryColor: '#0F1629', accentColor: '#0EA5E9', secondaryAccent: '#CBD5E1', bgColor: '#0F1629', textColor: '#E2E8F0',
      fontFamily: 'inter', layoutStyle: 'modern', borderRadius: 'sharp', headerStyle: 'glass',
      heroStyle: 'gradient', productCardStyle: 'neon', buttonStyle: 'glow',
    },
    previewGradient: 'from-slate-950 via-blue-600 to-cyan-400',
    tags: ['Electronics', 'Tech', 'Gadgets'],
  },
  {
    name: 'Bazaar',
    description: 'Multi-category Indian market theme with saffron and teal, flash-sale ready, COD badges, pincode checker, and regional language support. India-first design.',
    category: 'Free',
    rating: 4.9,
    installs: 22000,
    features: ['COD Badge', 'Pincode Checker', 'EMI Breakdown', 'Flash Sale Timer', 'Regional Language'],
    config: {
      primaryColor: '#FF9500', accentColor: '#0D9488', secondaryAccent: '#FCD34D', bgColor: '#FAFAF9', textColor: '#1C1917',
      fontFamily: 'poppins', layoutStyle: 'classic', borderRadius: 'rounded', headerStyle: 'fullwidth',
      heroStyle: 'fullscreen', productCardStyle: 'warm', buttonStyle: 'rounded',
    },
    previewGradient: 'from-orange-500 via-amber-400 to-teal-500',
    tags: ['Indian', 'Marketplace', 'Flash Sale'],
  },
]

// ─── Theme Key Mapping ───────────────────────────────────────────────

const THEME_KEY_MAP: Record<string, string> = {
  'Lumia': 'lumia',
  'Blaze': 'blaze',
  'Glow': 'glow',
  'Bolt': 'bolt',
  'Bazaar': 'bazaar',
}

// ─── Border Radius Mapping ───────────────────────────────────────────

const BORDER_RADIUS_MAP: Record<string, number> = {
  'sharp': 0,
  'elegant': 4,
  'rounded': 8,
  'soft': 12,
  'worn': 8,
  'organic': 16,
  'fluid': 24,
  'pill': 999,
}

const BORDER_RADIUS_REVERSE: Record<number, string> = {}
Object.entries(BORDER_RADIUS_MAP).forEach(([k, v]) => { BORDER_RADIUS_REVERSE[v] = k })

// ─── Helper: get layout config for a theme name ──────────────────────

function getThemeLayoutConfig(themeName: string): ThemeLayoutConfig | null {
  const key = THEME_KEY_MAP[themeName]
  if (!key) return null
  return THEME_CONFIGS[key] ?? null
}

// ─── Build initial editor state from theme config ────────────────────

function buildEditorState(themeConfig: ThemeConfig, layoutConfig: ThemeLayoutConfig | null): EditorState {
  const layout = layoutConfig ?? THEME_CONFIGS['bazaar']!

  return {
    colors: {
      primary: themeConfig.primaryColor,
      accent: themeConfig.accentColor,
      background: themeConfig.bgColor,
      text: themeConfig.textColor,
    },
    typography: {
      fontFamily: themeConfig.fontFamily || 'inter',
    },
    layout: {
      borderRadius: BORDER_RADIUS_MAP[themeConfig.borderRadius] ?? 8,
      gridLayout: layout.gridLayout,
    },
    buttonStyle: {
      style: themeConfig.buttonStyle || 'rounded',
    },
    animation: {
      intensity: layout.animationIntensity,
    },
    sections: layout.sections.map(s => ({
      ...s,
      label: SECTION_META[s.id]?.label ?? s.id,
      icon: SECTION_META[s.id]?.icon ?? <Layers className="h-4 w-4" />,
    })),
    cro: { ...layout.cro },
  }
}

// ─── Theme Storefront Preview (Enhanced) ─────────────────────────────

function ThemeStorefrontPreview({ config, compact = false, editorState }: { config: ThemeConfig; compact?: boolean; editorState?: EditorState | null }) {
  const isDark = config.bgColor === '#030712' || config.bgColor === '#0f0f23'
  const navTextColor = isDark ? config.textColor : '#ffffff'
  const borderRadius = editorState?.layout.borderRadius ?? (BORDER_RADIUS_MAP[config.borderRadius] ?? 8)
  const buttonStyle = editorState?.buttonStyle.style ?? config.buttonStyle
  const gridCols = editorState?.layout.gridLayout === '2-col' ? 2 : editorState?.layout.gridLayout === '3-col' ? 3 : 4
  const animIntensity = editorState?.animation.intensity ?? 'subtle'
  const sections = editorState?.sections
  const heroAlignment = (sections?.find(s => s.id === 'hero')?.props as Record<string, unknown>)?.alignment as string ?? 'left'
  const showFlashSale = sections?.find(s => s.id === 'flash-sale')?.visible ?? false
  const showNewsletter = sections?.find(s => s.id === 'newsletter')?.visible ?? true

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
            yourstore.vepar.in
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
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor}40)`,
          textAlign: heroAlignment === 'center' ? 'center' : heroAlignment === 'right' ? 'right' : 'left',
        }}
      >
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
              backgroundColor: buttonStyle.includes('outlined') ? 'transparent' : config.accentColor,
              color: buttonStyle.includes('outlined') ? config.accentColor : (isDark ? config.bgColor : '#ffffff'),
              border: buttonStyle.includes('outlined') ? `1px solid ${config.accentColor}` : 'none',
              borderRadius: buttonStyle.includes('pill') ? '999px' : `${Math.min(borderRadius, 20)}px`,
              boxShadow: buttonStyle === 'glow' ? `0 0 8px ${config.accentColor}60` : 'none',
            }}
          >
            Shop Now
          </button>
        </div>
        {/* Decorative shape */}
        <div
          className="absolute -right-2 -bottom-2 w-12 h-12 rounded-full opacity-20"
          style={{
            backgroundColor: config.accentColor,
            animation: animIntensity !== 'none' ? `float 3s ease-in-out infinite` : 'none',
          }}
        />
      </div>

      {/* CRO: Urgency Timer */}
      {editorState?.cro.showUrgencyTimer && (
        <div className="px-2 py-1 flex items-center gap-1" style={{ backgroundColor: `${config.accentColor}15` }}>
          <Timer className="h-2.5 w-2.5" style={{ color: config.accentColor }} />
          <span className="text-[7px] font-medium" style={{ color: config.accentColor }}>
            {editorState.cro.urgencyMessage || '🔥 Sale ends soon!'}
          </span>
        </div>
      )}

      {/* CRO: Live Viewers */}
      {editorState?.cro.showLiveViewers && (
        <div className="px-2 py-0.5 flex items-center gap-1">
          <Activity className="h-2 w-2" style={{ color: config.accentColor }} />
          <span className="text-[6px]" style={{ color: `${config.textColor}80` }}>
            {editorState.cro.viewerCountRange[0]} people viewing
          </span>
        </div>
      )}

      {/* Trust Badges */}
      {editorState?.cro.showTrustBadges && (
        <div className="px-2 py-1 flex items-center gap-1.5" style={{ backgroundColor: isDark ? `${config.primaryColor}20` : `${config.accentColor}08` }}>
          {['🔒 Secure', '🚚 Free Ship', '↩️ Returns'].map(b => (
            <span key={b} className="text-[6px] px-1 py-0.5 rounded" style={{ backgroundColor: isDark ? `${config.textColor}10` : '#f5f5f5', color: `${config.textColor}80` }}>
              {b}
            </span>
          ))}
        </div>
      )}

      {/* Flash Sale Section */}
      {showFlashSale && (
        <div className="px-2 py-1.5" style={{ background: `linear-gradient(90deg, ${config.accentColor}20, ${config.primaryColor}20)` }}>
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-bold" style={{ color: config.accentColor }}>⚡ FLASH SALE</span>
            <div className="flex gap-0.5">
              {['02', '14', '36'].map((t, i) => (
                <span key={i} className="text-[6px] px-1 py-0.5 rounded font-mono font-bold" style={{ backgroundColor: config.primaryColor, color: isDark ? config.accentColor : '#fff' }}>
                  {t}{i < 2 ? ':' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="p-2 gap-1.5" style={{ backgroundColor: config.bgColor, display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
        {Array.from({ length: Math.min(gridCols, 4) }).map((_, i) => (
          <div key={i} className="overflow-hidden" style={{
            borderRadius: `${Math.min(borderRadius, 12)}px`,
            border: isDark ? `1px solid ${config.textColor}15` : `1px solid #e5e7eb`,
          }}>
            <div className="h-8 relative" style={{
              background: `linear-gradient(135deg, ${config.primaryColor}${isDark ? '30' : '15'}, ${config.accentColor}${isDark ? '20' : '10'})`,
            }}>
              {config.productCardStyle === 'neon' && (
                <div className="absolute inset-0 border border-cyan-400/30" style={{ borderRadius: 'inherit' }} />
              )}
              {/* Quick View Overlay */}
              {editorState?.sections.find(s => s.id === 'products')?.props && (editorState.sections.find(s => s.id === 'products')?.props as Record<string, unknown>)?.showQuickView && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 transition-opacity">
                  <span className="text-[6px] text-white font-medium">Quick View</span>
                </div>
              )}
            </div>
            <div className="p-1" style={{ backgroundColor: isDark ? `${config.bgColor}` : '#ffffff' }}>
              <p className="text-[7px] font-medium truncate" style={{ color: config.textColor }}>Product {i + 1}</p>
              <p className="text-[6px] font-semibold" style={{ color: config.accentColor }}>${(29.99 + i * 15).toFixed(2)}</p>
              {config.productCardStyle !== 'clean' && (
                <div className="flex gap-0.5 mt-0.5">
                  {[1,2,3,4,5].map(s => (
                    <div key={s} className="h-1 w-1 rounded-full" style={{ backgroundColor: s <= 4 ? config.accentColor : '#d1d5db' }} />
                  ))}
                </div>
              )}
              {/* Low Stock Warning */}
              {editorState?.cro.showLowStockWarning && i === 0 && (
                <p className="text-[5px] mt-0.5 font-medium" style={{ color: '#ef4444' }}>🔥 Only 3 left!</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CRO: Social Proof */}
      {editorState?.cro.showSocialProofCount && (
        <div className="px-2 py-1" style={{ backgroundColor: config.bgColor }}>
          <span className="text-[6px]" style={{ color: `${config.textColor}60` }}>
            ✅ 12,847 happy customers
          </span>
        </div>
      )}

      {/* Newsletter Section */}
      {showNewsletter && (
        <div className="px-2 py-1.5" style={{ backgroundColor: isDark ? `${config.primaryColor}30` : `${config.accentColor}08` }}>
          <p className="text-[7px] font-bold mb-0.5" style={{ color: config.textColor }}>Stay Updated</p>
          <div className="flex gap-1">
            <div className="flex-1 h-4 rounded flex items-center px-1" style={{ backgroundColor: isDark ? `${config.textColor}10` : '#fff', border: `1px solid ${config.textColor}15` }}>
              <span className="text-[6px]" style={{ color: `${config.textColor}40` }}>Your email</span>
            </div>
            <div className="h-4 px-1.5 rounded flex items-center" style={{ backgroundColor: config.accentColor, borderRadius: `${Math.min(borderRadius, 12)}px` }}>
              <span className="text-[6px] text-white font-medium">Subscribe</span>
            </div>
          </div>
        </div>
      )}

      {/* CRO: Sticky Add to Cart indicator */}
      {editorState?.cro.stickyAddToCart && (
        <div className="px-2 py-1 flex items-center justify-between" style={{ backgroundColor: config.accentColor }}>
          <span className="text-[7px] text-white font-bold">$29.99</span>
          <span className="text-[6px] text-white/80 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>Add to Cart</span>
        </div>
      )}

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

// ─── Section Manager Component ───────────────────────────────────────

function SectionManager({
  sections,
  onChange,
}: {
  sections: EditorSection[]
  onChange: (sections: EditorSection[]) => void
}) {
  const [expandedId, setExpandedId] = useState<SectionType | null>(null)
  const [addDropdownOpen, setAddDropdownOpen] = useState(false)

  const visibleSections = sections.filter(s => s.visible)
  const hiddenSections = sections.filter(s => !s.visible)

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections]
    const visibleIndices = sections.map((s, i) => s.visible ? i : -1).filter(i => i !== -1)
    const currentVisibleIndex = visibleIndices.indexOf(index)

    if (direction === 'up' && currentVisibleIndex > 0) {
      const swapWith = visibleIndices[currentVisibleIndex - 1]!
      const temp = newSections[swapWith]!
      newSections[swapWith] = newSections[index]!
      newSections[index] = temp
    } else if (direction === 'down' && currentVisibleIndex < visibleIndices.length - 1) {
      const swapWith = visibleIndices[currentVisibleIndex + 1]!
      const temp = newSections[swapWith]!
      newSections[swapWith] = newSections[index]!
      newSections[index] = temp
    }
    onChange(newSections)
  }

  const toggleVisibility = (sectionId: SectionType) => {
    onChange(sections.map(s => s.id === sectionId ? { ...s, visible: !s.visible } : s))
  }

  const updateSectionProps = (sectionId: SectionType, props: Record<string, unknown>) => {
    onChange(sections.map(s => s.id === sectionId ? { ...s, props: { ...(s.props || {}), ...props } } : s))
  }

  const addSection = (sectionId: SectionType) => {
    onChange(sections.map(s => s.id === sectionId ? { ...s, visible: true } : s))
    setAddDropdownOpen(false)
  }

  const renderSectionSettings = (section: EditorSection) => {
    const props = (section.props || {}) as Record<string, unknown>

    switch (section.id) {
      case 'hero':
        return (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Alignment</Label>
              <Select value={(props.alignment as string) || 'left'} onValueChange={v => updateSectionProps('hero', { alignment: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Badge</Label>
              <Switch checked={props.showBadge !== false} onCheckedChange={v => updateSectionProps('hero', { showBadge: v })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Primary CTA Text</Label>
              <Input className="h-8 text-xs" value={(props.ctaText as string) || ''} onChange={e => updateSectionProps('hero', { ctaText: e.target.value })} placeholder="Shop Now" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Secondary CTA Text</Label>
              <Input className="h-8 text-xs" value={(props.ctaSecondary as string) || ''} onChange={e => updateSectionProps('hero', { ctaSecondary: e.target.value })} placeholder="Explore" />
            </div>
          </div>
        )
      case 'products':
        return (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Grid Columns</Label>
              <Select value={String(props.gridColumns || 3)} onValueChange={v => updateSectionProps('products', { gridColumns: parseInt(v) })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Quick View</Label>
              <Switch checked={props.showQuickView !== false} onCheckedChange={v => updateSectionProps('products', { showQuickView: v })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Card Variant</Label>
              <Select value={(props.cardVariant as string) || 'default'} onValueChange={v => updateSectionProps('products', { cardVariant: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 'categories':
        return (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Limit: {Number(props.limit || 6)}</Label>
              <Slider value={[Number(props.limit || 6)]} onValueChange={v => updateSectionProps('categories', { limit: v[0] })} min={2} max={12} step={1} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Style</Label>
              <Select value={(props.style as string) || 'icon-grid'} onValueChange={v => updateSectionProps('categories', { style: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="icon-grid">Icon Grid</SelectItem>
                  <SelectItem value="image-overlay">Image Overlay</SelectItem>
                  <SelectItem value="gradient">Gradient Cards</SelectItem>
                  <SelectItem value="bordered">Bordered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 'collections':
        return (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Limit: {Number(props.limit || 3)}</Label>
              <Slider value={[Number(props.limit || 3)]} onValueChange={v => updateSectionProps('collections', { limit: v[0] })} min={2} max={8} step={1} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Style</Label>
              <Select value={(props.style as string) || 'clean-grid'} onValueChange={v => updateSectionProps('collections', { style: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="clean-grid">Clean Grid</SelectItem>
                  <SelectItem value="bold-cards">Bold Cards</SelectItem>
                  <SelectItem value="editorial-spread">Editorial</SelectItem>
                  <SelectItem value="overlay">Overlay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 'flash-sale':
        return (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Countdown Style</Label>
              <Select value={(props.countdownStyle as string) || 'large'} onValueChange={v => updateSectionProps('flash-sale', { countdownStyle: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="large">Large Timer</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="neon">Neon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Urgency Level</Label>
              <Select value={(props.urgencyLevel as string) || 'high'} onValueChange={v => updateSectionProps('flash-sale', { urgencyLevel: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="extreme">Extreme</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 'newsletter':
        return (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Style</Label>
              <Select value={(props.style as string) || 'inline'} onValueChange={v => updateSectionProps('newsletter', { style: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inline">Inline</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="fullwidth">Full Width</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Name Field</Label>
              <Switch checked={props.showName === true} onCheckedChange={v => updateSectionProps('newsletter', { showName: v })} />
            </div>
          </div>
        )
      case 'testimonials':
        return (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Style</Label>
              <Select value={(props.style as string) || 'minimal-cards'} onValueChange={v => updateSectionProps('testimonials', { style: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal-cards">Minimal Cards</SelectItem>
                  <SelectItem value="slider">Slider</SelectItem>
                  <SelectItem value="quote-wall">Quote Wall</SelectItem>
                  <SelectItem value="cards">Cards</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Limit: {Number(props.limit || 3)}</Label>
              <Slider value={[Number(props.limit || 3)]} onValueChange={v => updateSectionProps('testimonials', { limit: v[0] })} min={2} max={8} step={1} />
            </div>
          </div>
        )
      default:
        return (
          <p className="text-xs text-muted-foreground pt-2">No specific settings for this section.</p>
        )
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-violet-600" /> Sections
        </h3>
        <span className="text-[10px] text-muted-foreground">{visibleSections.length} visible</span>
      </div>

      <ScrollArea className="max-h-[calc(100vh-400px)]">
        <div className="space-y-1 pr-2">
          <AnimatePresence initial={false}>
            {sections.filter(s => s.visible).map((section, visIdx) => {
              const isExpanded = expandedId === section.id
              return (
                <motion.div
                  key={section.id}
                  layout
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-1.5 p-2">
                    <div className="flex flex-col gap-0.5">
                      <button
                        className="p-0.5 rounded hover:bg-muted transition-colors disabled:opacity-30"
                        onClick={() => moveSection(sections.indexOf(section), 'up')}
                        disabled={visIdx === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        className="p-0.5 rounded hover:bg-muted transition-colors disabled:opacity-30"
                        onClick={() => moveSection(sections.indexOf(section), 'down')}
                        disabled={visIdx === visibleSections.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="h-6 w-6 rounded flex items-center justify-center bg-muted/60 text-muted-foreground shrink-0">
                      {section.icon}
                    </div>

                    <span className="text-xs font-medium flex-1 truncate">{section.label}</span>

                    <button
                      className="p-1 rounded hover:bg-muted transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : section.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    <Switch
                      checked={section.visible}
                      onCheckedChange={() => toggleVisibility(section.id)}
                      className="scale-75"
                    />
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 border-t">
                          {renderSectionSettings(section)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Hidden Sections / Add Section */}
      {hiddenSections.length > 0 && (
        <div className="mt-3">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8"
              onClick={() => setAddDropdownOpen(!addDropdownOpen)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Section ({hiddenSections.length})
            </Button>

            <AnimatePresence>
              {addDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 right-0 z-20 mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden"
                >
                  <ScrollArea className="max-h-40">
                    {hiddenSections.map(s => (
                      <button
                        key={s.id}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-muted transition-colors"
                        onClick={() => addSection(s.id)}
                      >
                        <span className="text-muted-foreground">{s.icon}</span>
                        {s.label}
                      </button>
                    ))}
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Style Customizer Component ──────────────────────────────────────

function StyleCustomizer({
  editorState,
  onChange,
}: {
  editorState: EditorState
  onChange: (state: EditorState) => void
}) {
  const updateColors = (key: keyof EditorColors, value: string) => {
    onChange({ ...editorState, colors: { ...editorState.colors, [key]: value } })
  }

  const updateTypography = (key: keyof EditorTypography, value: string) => {
    onChange({ ...editorState, typography: { ...editorState.typography, [key]: value } })
  }

  const updateLayout = (key: keyof EditorLayout, value: number | GridLayout) => {
    onChange({ ...editorState, layout: { ...editorState.layout, [key]: value } })
  }

  const radiusLabel = (v: number) => {
    if (v === 0) return 'Sharp'
    if (v <= 4) return 'Subtle'
    if (v <= 8) return 'Rounded'
    if (v <= 16) return 'Soft'
    if (v <= 24) return 'Fluid'
    return 'Pill'
  }

  const animLabel = (v: string) => {
    switch (v) {
      case 'none': return 'None'
      case 'subtle': return 'Subtle'
      case 'moderate': return 'Moderate'
      case 'high': return 'High'
      case 'extreme': return 'Extreme'
      default: return v
    }
  }

  const animValue = (v: string) => {
    switch (v) {
      case 'none': return 0
      case 'subtle': return 1
      case 'moderate': return 2
      case 'high': return 3
      case 'extreme': return 4
      default: return 1
    }
  }

  const animFromValue = (v: number) => {
    const labels = ['none', 'subtle', 'moderate', 'high', 'extreme'] as const
    return labels[Math.min(v, 4)] ?? 'subtle'
  }

  return (
    <div className="space-y-5">
      {/* Colors */}
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
          <div className="h-5 w-5 rounded bg-violet-100 flex items-center justify-center">
            <Paintbrush className="h-3 w-3 text-violet-600" />
          </div>
          Colors
        </h3>
        <div className="space-y-3">
          {([
            { key: 'primary' as const, label: 'Primary Color' },
            { key: 'accent' as const, label: 'Accent Color' },
            { key: 'background' as const, label: 'Background Color' },
            { key: 'text' as const, label: 'Text Color' },
          ]).map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <Label className="text-xs shrink-0">{label}</Label>
              <div className="flex items-center gap-2">
                <div
                  className="h-7 w-7 rounded border cursor-pointer shrink-0"
                  style={{ backgroundColor: editorState.colors[key] }}
                >
                  <input
                    type="color"
                    value={editorState.colors[key]}
                    onChange={e => updateColors(key, e.target.value)}
                    className="opacity-0 w-full h-full cursor-pointer"
                  />
                </div>
                <Input
                  className="h-7 w-20 text-[10px] font-mono"
                  value={editorState.colors[key]}
                  onChange={e => updateColors(key, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Typography */}
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
          <div className="h-5 w-5 rounded bg-violet-100 flex items-center justify-center">
            <Type className="h-3 w-3 text-violet-600" />
          </div>
          Typography
        </h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Font Family</Label>
            <Select value={editorState.typography.fontFamily} onValueChange={v => updateTypography('fontFamily', v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="inter">Inter</SelectItem>
                <SelectItem value="montserrat">Montserrat</SelectItem>
                <SelectItem value="poppins">Poppins</SelectItem>
                <SelectItem value="playfair">Playfair Display</SelectItem>
                <SelectItem value="lora">Lora</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Layout */}
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
          <div className="h-5 w-5 rounded bg-violet-100 flex items-center justify-center">
            <Layout className="h-3 w-3 text-violet-600" />
          </div>
          Layout
        </h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Label className="text-xs">Border Radius</Label>
              <span className="text-[10px] text-muted-foreground">{radiusLabel(editorState.layout.borderRadius)} ({editorState.layout.borderRadius}px)</span>
            </div>
            <Slider
              value={[editorState.layout.borderRadius]}
              onValueChange={v => updateLayout('borderRadius', v[0]!)}
              min={0}
              max={999}
              step={1}
            />
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>Sharp</span>
              <span>Rounded</span>
              <span>Pill</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Grid Layout</Label>
            <Select value={editorState.layout.gridLayout} onValueChange={v => updateLayout('gridLayout', v as GridLayout)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2-col">2 Columns</SelectItem>
                <SelectItem value="3-col">3 Columns</SelectItem>
                <SelectItem value="4-col">4 Columns</SelectItem>
                <SelectItem value="masonry">Masonry</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Button Style */}
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
          <div className="h-5 w-5 rounded bg-violet-100 flex items-center justify-center">
            <Zap className="h-3 w-3 text-violet-600" />
          </div>
          Button Style
        </h3>
        <div className="space-y-1.5">
          <Select value={editorState.buttonStyle.style} onValueChange={v => onChange({ ...editorState, buttonStyle: { style: v } })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rounded">Rounded</SelectItem>
              <SelectItem value="pill">Pill</SelectItem>
              <SelectItem value="outlined">Outlined</SelectItem>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="glow">Glow</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Button Preview */}
        <div className="mt-2 flex items-center justify-center p-3 bg-muted/30 rounded-lg">
          <button
            className="px-4 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: editorState.buttonStyle.style === 'outlined' ? 'transparent' : editorState.colors.accent,
              color: editorState.buttonStyle.style === 'outlined' ? editorState.colors.accent : '#fff',
              border: editorState.buttonStyle.style === 'outlined' ? `2px solid ${editorState.colors.accent}` : 'none',
              borderRadius: editorState.buttonStyle.style === 'pill' ? '999px' : `${Math.min(editorState.layout.borderRadius, 20)}px`,
              boxShadow: editorState.buttonStyle.style === 'glow' ? `0 0 12px ${editorState.colors.accent}60` : 'none',
            }}
          >
            Shop Now
          </button>
        </div>
      </div>

      <Separator />

      {/* Animation Intensity */}
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
          <div className="h-5 w-5 rounded bg-violet-100 flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-violet-600" />
          </div>
          Animation Intensity
        </h3>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label className="text-xs">Intensity</Label>
            <span className="text-[10px] text-muted-foreground">{animLabel(editorState.animation.intensity)}</span>
          </div>
          <Slider
            value={[animValue(editorState.animation.intensity)]}
            onValueChange={v => onChange({ ...editorState, animation: { intensity: animFromValue(v[0]!) } })}
            min={0}
            max={4}
            step={1}
          />
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>None</span>
            <span>Subtle</span>
            <span>Moderate</span>
            <span>High</span>
            <span>Extreme</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CRO Settings Component ──────────────────────────────────────────

function CROSettings({
  editorState,
  onChange,
}: {
  editorState: EditorState
  onChange: (state: EditorState) => void
}) {
  const updateCRO = (key: keyof CROConfig, value: unknown) => {
    onChange({ ...editorState, cro: { ...editorState.cro, [key]: value } })
  }

  const croToggles: Array<{ key: keyof CROConfig; label: string; icon: React.ReactNode }> = [
    { key: 'showUrgencyTimer', label: 'Show Urgency Timer', icon: <Timer className="h-4 w-4 text-orange-500" /> },
    { key: 'showLiveViewers', label: 'Show Live Viewers', icon: <Activity className="h-4 w-4 text-sky-500" /> },
    { key: 'showRecentPurchases', label: 'Show Recent Purchases', icon: <ShoppingCart className="h-4 w-4 text-emerald-500" /> },
    { key: 'showLowStockWarning', label: 'Show Low Stock Warnings', icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
    { key: 'showTrustBadges', label: 'Show Trust Badges', icon: <BadgeCheck className="h-4 w-4 text-violet-500" /> },
    { key: 'showSocialProofCount', label: 'Show Social Proof Count', icon: <Users className="h-4 w-4 text-rose-500" /> },
    { key: 'stickyAddToCart', label: 'Sticky Add to Cart', icon: <ShoppingCart className="h-4 w-4 text-teal-500" /> },
  ]

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold flex items-center gap-1.5">
        <div className="h-5 w-5 rounded bg-violet-100 flex items-center justify-center">
          <TrendingUp className="h-3 w-3 text-violet-600" />
        </div>
        Conversion Optimization (CRO)
      </h3>

      <div className="space-y-3">
        {croToggles.map(({ key, label, icon }) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {icon}
              <Label className="text-xs">{label}</Label>
            </div>
            <Switch
              checked={editorState.cro[key] as boolean}
              onCheckedChange={v => updateCRO(key, v)}
            />
          </div>
        ))}
      </div>

      <Separator />

      {/* CRO Text/Number Inputs */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Urgency Message</Label>
          <Input
            className="h-8 text-xs"
            value={editorState.cro.urgencyMessage || ''}
            onChange={e => updateCRO('urgencyMessage', e.target.value || undefined)}
            placeholder="🔥 Sale ends soon — don't miss out!"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Low Stock Threshold</Label>
          <Input
            type="number"
            className="h-8 text-xs w-24"
            value={editorState.cro.lowStockThreshold}
            onChange={e => updateCRO('lowStockThreshold', parseInt(e.target.value) || 5)}
            min={1}
            max={100}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Viewer Count Range</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="h-8 text-xs w-20"
              value={editorState.cro.viewerCountRange[0]}
              onChange={e => {
                const min = parseInt(e.target.value) || 0
                updateCRO('viewerCountRange', [min, editorState.cro.viewerCountRange[1]])
              }}
              min={0}
              placeholder="Min"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="number"
              className="h-8 text-xs w-20"
              value={editorState.cro.viewerCountRange[1]}
              onChange={e => {
                const max = parseInt(e.target.value) || 0
                updateCRO('viewerCountRange', [editorState.cro.viewerCountRange[0], max])
              }}
              min={0}
              placeholder="Max"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Theme Customization Component ──────────────────────────────

export function ThemeCustomization() {
  const { selectedStoreId } = useAppStore()
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
  const [customizingIdx, setCustomizingIdx] = useState<number | null>(null)
  const [editorState, setEditorState] = useState<EditorState | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [rightPanelTab, setRightPanelTab] = useState('style')

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
  const mergedThemes = useMemo(() => {
    return BUILT_IN_THEMES.map((builtIn, i) => {
      const dbTheme = themes.find(t => t.name === builtIn.name)
      if (dbTheme) {
        let parsedConfig: ThemeConfig = builtIn.config
        let parsedLayout: { category: string; features: string[]; [key: string]: unknown } = { category: builtIn.category, features: builtIn.features }
        try { parsedConfig = { ...builtIn.config, ...JSON.parse(dbTheme.config) } } catch { /* use built-in */ }
        try { parsedLayout = { ...parsedLayout, ...JSON.parse(dbTheme.layout) } } catch { /* use built-in */ }
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
    if (!theme) return

    // If theme is not in DB yet, create it first
    if (theme.id.startsWith('builtin')) {
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

  // Open customization - switch to editor tab
  const openCustomize = (idx: number) => {
    const theme = mergedThemes[idx]
    if (!theme) return

    setCustomizingIdx(idx)

    // Parse existing DB config for any saved customizations
    let parsedConfig: ThemeConfig = theme._config
    try {
      if (theme.config) parsedConfig = { ...theme._config, ...JSON.parse(theme.config) }
    } catch { /* use default */ }

    // Get layout config from THEME_CONFIGS
    const layoutConfig = getThemeLayoutConfig(theme.name)

    // Try to parse any saved sections/cro from DB config
    let savedSections: SectionConfig[] | null = null
    let savedCRO: CROConfig | null = null
    try {
      const parsed = JSON.parse(theme.config)
      if (parsed.sections) savedSections = parsed.sections
      if (parsed.cro) savedCRO = parsed.cro
    } catch { /* no saved data */ }

    const baseState = buildEditorState(parsedConfig, layoutConfig)

    // Merge saved sections/cro if they exist
    if (savedSections) {
      const sectionMap = new Map(savedSections.map(s => [s.id, s]))
      baseState.sections = baseState.sections.map(s => {
        const saved = sectionMap.get(s.id)
        return saved ? { ...s, ...saved, label: s.label, icon: s.icon } : s
      })
    }
    if (savedCRO) {
      baseState.cro = { ...baseState.cro, ...savedCRO }
    }

    setEditorState(baseState)
    setTab('editor')
  }

  // Build a ThemeConfig from the current editorState for the preview
  const editorPreviewConfig = useMemo((): ThemeConfig | null => {
    if (!customizingIdx && customizingIdx !== 0) return null
    const theme = mergedThemes[customizingIdx!]
    if (!theme || !editorState) return null

    const radiusVal = editorState.layout.borderRadius
    const radiusKey = BORDER_RADIUS_REVERSE[radiusVal] ?? 'rounded'

    return {
      ...theme._config,
      primaryColor: editorState.colors.primary,
      accentColor: editorState.colors.accent,
      bgColor: editorState.colors.background,
      textColor: editorState.colors.text,
      fontFamily: editorState.typography.fontFamily,
      borderRadius: radiusKey,
      buttonStyle: editorState.buttonStyle.style,
    }
  }, [customizingIdx, mergedThemes, editorState])

  // Save Draft
  const handleSaveDraft = async () => {
    if (customizingIdx === null || !editorState) return
    const theme = mergedThemes[customizingIdx]
    if (!theme) return

    setSaving(true)
    try {
      const radiusVal = editorState.layout.borderRadius
      const radiusKey = BORDER_RADIUS_REVERSE[radiusVal] ?? 'rounded'

      const configObj = {
        primaryColor: editorState.colors.primary,
        accentColor: editorState.colors.accent,
        bgColor: editorState.colors.background,
        textColor: editorState.colors.text,
        fontFamily: editorState.typography.fontFamily,
        layoutStyle: theme._config.layoutStyle,
        borderRadius: radiusKey,
        headerStyle: theme._config.headerStyle,
        heroStyle: theme._config.heroStyle,
        productCardStyle: theme._config.productCardStyle,
        buttonStyle: editorState.buttonStyle.style,
        sections: editorState.sections.map(s => ({ id: s.id, visible: s.visible, props: s.props })),
        cro: editorState.cro,
      }

      await api.put(`/themes/${theme.id}`, { config: JSON.stringify(configObj) })
      toast.success('Draft saved!', { description: 'Your customization has been saved.' })
      fetchThemes()
    } catch {
      toast.error('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  // Publish with customizations
  const handlePublishWithCustomizations = async () => {
    if (customizingIdx === null || !editorState) return
    const theme = mergedThemes[customizingIdx]
    if (!theme) return

    // First save the customizations
    setSaving(true)
    try {
      const radiusVal = editorState.layout.borderRadius
      const radiusKey = BORDER_RADIUS_REVERSE[radiusVal] ?? 'rounded'

      const configObj = {
        primaryColor: editorState.colors.primary,
        accentColor: editorState.colors.accent,
        bgColor: editorState.colors.background,
        textColor: editorState.colors.text,
        fontFamily: editorState.typography.fontFamily,
        layoutStyle: theme._config.layoutStyle,
        borderRadius: radiusKey,
        headerStyle: theme._config.headerStyle,
        heroStyle: theme._config.heroStyle,
        productCardStyle: theme._config.productCardStyle,
        buttonStyle: editorState.buttonStyle.style,
        sections: editorState.sections.map(s => ({ id: s.id, visible: s.visible, props: s.props })),
        cro: editorState.cro,
      }

      await api.put(`/themes/${theme.id}`, { config: JSON.stringify(configObj) })

      // Then publish
      if (selectedStoreId && !theme.id.startsWith('builtin')) {
        await api.post('/themes/publish', { themeId: theme.id, storeId: selectedStoreId })
      } else {
        if (activeTheme) {
          await api.put(`/themes/${activeTheme.id}`, { isActive: false }).catch(() => {})
        }
        await api.put(`/themes/${theme.id}`, { isActive: true }).catch(() => {})
      }

      toast.success(`"${theme.name}" published with customizations!`)
      fetchThemes()
    } catch {
      toast.error('Failed to publish theme')
    } finally {
      setSaving(false)
    }
  }

  // Reset to Default
  const handleResetToDefault = () => {
    if (customizingIdx === null) return
    const theme = mergedThemes[customizingIdx]
    if (!theme) return

    const layoutConfig = getThemeLayoutConfig(theme.name)
    setEditorState(buildEditorState(theme._config, layoutConfig))
    toast.info('Reset to theme defaults')
  }

  // Container Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  // Preview width based on device
  const previewWidth = previewDevice === 'mobile' ? 'max-w-[375px]' : previewDevice === 'tablet' ? 'max-w-[768px]' : 'max-w-full'

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-fuchsia-400/20 blur-xl" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Palette className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold">Theme Studio</h2>
            </div>
            <p className="text-sm text-white/70 mt-1">Browse themes, customize every detail, and publish to your store</p>
          </div>
          <div className="flex items-center gap-2">
            {activeTheme && (
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1">
                <Check className="h-3 w-3 mr-1" /> {activeTheme.name}
              </Badge>
            )}
          </div>
        </div>

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
      {activeTheme && tab === 'marketplace' && (
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
          <TabsTrigger value="editor" className="gap-1.5">
            <Settings2 className="h-3.5 w-3.5" /> Theme Editor
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
                const layoutConfig = getThemeLayoutConfig(theme.name)

                return (
                  <motion.div key={theme.id} variants={itemVariants}>
                    <Card className={`group overflow-hidden hover:shadow-xl transition-all duration-300 ${isActive ? 'ring-2 ring-emerald-500 shadow-emerald-500/10' : 'hover:-translate-y-1'}`}>
                      {/* Theme Preview */}
                      <div className="relative h-44 overflow-hidden bg-gray-50">
                        <ThemeStorefrontPreview config={theme._config} compact editorState={buildEditorState(theme._config, layoutConfig)} />

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

                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-2.5">
                          {theme.description}
                        </p>

                        {/* Theme Characteristics */}
                        {layoutConfig && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
                              {layoutConfig.heroVariant} hero
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                              {layoutConfig.productCardVariant} cards
                            </span>
                            {layoutConfig.cro.showUrgencyTimer && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                                CRO: Urgency
                              </span>
                            )}
                            {layoutConfig.cro.stickyAddToCart && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-100">
                                CRO: Sticky Cart
                              </span>
                            )}
                          </div>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {builtIn.tags.map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>

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

      {/* ─── Theme Editor Tab ────────────────────────────────────── */}
      {tab === 'editor' && (
        customizingIdx !== null && editorState && editorPreviewConfig ? (
          <div className="space-y-4">
            {/* Editor Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setTab('marketplace')} className="text-xs">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Marketplace
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <div>
                  <h3 className="font-semibold text-sm">
                    Editing: {mergedThemes[customizingIdx]?.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {mergedThemes[customizingIdx]?.isActive ? 'Currently published' : 'Not published'} • Customize colors, layout, sections & CRO
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleResetToDefault}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleSaveDraft} disabled={saving}>
                  {saving ? <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                  Save Draft
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20"
                  onClick={handlePublishWithCustomizations}
                  disabled={saving}
                >
                  {saving ? <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                  Publish
                </Button>
              </div>
            </div>

            {/* Editor Layout: Section Manager | Preview | Style/CRO */}
            <div className="grid gap-4 lg:grid-cols-[280px_1fr_300px]">
              {/* Left Panel: Section Manager */}
              <Card className="border-violet-200 shadow-md">
                <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-t-xl" />
                <CardContent className="p-3">
                  <SectionManager
                    sections={editorState.sections}
                    onChange={(sections) => setEditorState({ ...editorState, sections })}
                  />
                </CardContent>
              </Card>

              {/* Center Panel: Live Preview */}
              <Card className="border-violet-200 shadow-md overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-t-xl" />
                <CardHeader className="pb-2 pt-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-emerald-600" /> Live Preview
                    </CardTitle>
                    <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-0.5">
                      {([
                        { key: 'desktop' as const, icon: <Monitor className="h-3.5 w-3.5" />, label: 'Desktop' },
                        { key: 'tablet' as const, icon: <Tablet className="h-3.5 w-3.5" />, label: 'Tablet' },
                        { key: 'mobile' as const, icon: <Smartphone className="h-3.5 w-3.5" />, label: 'Mobile' },
                      ]).map(device => (
                        <Button
                          key={device.key}
                          variant={previewDevice === device.key ? 'default' : 'ghost'}
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setPreviewDevice(device.key)}
                          title={device.label}
                        >
                          {device.icon}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex justify-center">
                    <motion.div
                      className={`w-full ${previewWidth} transition-all duration-300`}
                      layout
                    >
                      <div className="border rounded-lg overflow-hidden bg-white shadow-inner">
                        <ThemeStorefrontPreview config={editorPreviewConfig} editorState={editorState} />
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Panel: Style Customizer + CRO Settings */}
              <Card className="border-violet-200 shadow-md">
                <div className="h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-t-xl" />
                <CardContent className="p-3">
                  <Tabs value={rightPanelTab} onValueChange={setRightPanelTab}>
                    <TabsList className="w-full mb-3 bg-muted/60">
                      <TabsTrigger value="style" className="flex-1 text-xs gap-1">
                        <Paintbrush className="h-3 w-3" /> Style
                      </TabsTrigger>
                      <TabsTrigger value="cro" className="flex-1 text-xs gap-1">
                        <TrendingUp className="h-3 w-3" /> CRO
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <ScrollArea className="max-h-[calc(100vh-380px)]">
                    {rightPanelTab === 'style' && (
                      <StyleCustomizer editorState={editorState} onChange={setEditorState} />
                    )}
                    {rightPanelTab === 'cro' && (
                      <CROSettings editorState={editorState} onChange={setEditorState} />
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Paintbrush className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Theme Selected</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Go to the Marketplace tab and click &quot;Customize&quot; on any theme to start editing its sections, colors, layout, and CRO settings.
            </p>
            <Button variant="outline" onClick={() => setTab('marketplace')}>
              <Globe className="mr-1.5 h-4 w-4" /> Browse Themes
            </Button>
          </div>
        )
      )}

      {/* ─── Preview Dialog ──────────────────────────────────────── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {previewThemeIdx !== null && mergedThemes[previewThemeIdx]
                ? `Preview: ${mergedThemes[previewThemeIdx].name}`
                : 'Theme Preview'}
            </DialogTitle>
            <DialogDescription>
              Full-size preview of how your store will look with this theme
            </DialogDescription>
          </DialogHeader>

          {previewThemeIdx !== null && mergedThemes[previewThemeIdx] && (
            <div className="space-y-4">
              {/* Device Toggle */}
              <div className="flex items-center justify-center gap-2">
                {([
                  { key: 'desktop' as const, icon: <Monitor className="h-4 w-4" />, label: 'Desktop' },
                  { key: 'tablet' as const, icon: <Tablet className="h-4 w-4" />, label: 'Tablet' },
                  { key: 'mobile' as const, icon: <Smartphone className="h-4 w-4" />, label: 'Mobile' },
                ]).map(device => (
                  <Button
                    key={device.key}
                    variant={previewDevice === device.key ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setPreviewDevice(device.key)}
                  >
                    {device.icon} {device.label}
                  </Button>
                ))}
              </div>

              {/* Preview */}
              <div className="flex justify-center">
                <motion.div
                  className={`w-full ${previewDevice === 'mobile' ? 'max-w-[375px]' : previewDevice === 'tablet' ? 'max-w-[768px]' : 'max-w-full'} transition-all duration-300`}
                  layout
                >
                  <div className="border rounded-xl overflow-hidden shadow-lg bg-white">
                    <ThemeStorefrontPreview
                      config={mergedThemes[previewThemeIdx]._config}
                      editorState={buildEditorState(
                        mergedThemes[previewThemeIdx]._config,
                        getThemeLayoutConfig(mergedThemes[previewThemeIdx].name)
                      )}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <ColorPalette config={mergedThemes[previewThemeIdx]._config} size="md" />
                  <span className="text-sm text-muted-foreground">{mergedThemes[previewThemeIdx].name}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPreviewOpen(false)
                      openCustomize(previewThemeIdx)
                    }}
                  >
                    <Paintbrush className="mr-1 h-3.5 w-3.5" /> Customize
                  </Button>
                  {!mergedThemes[previewThemeIdx].isActive && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      onClick={() => {
                        setPreviewOpen(false)
                        setPublishConfirmIdx(previewThemeIdx)
                      }}
                    >
                      <Globe className="mr-1 h-3.5 w-3.5" /> Publish
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Publish Confirmation Dialog ─────────────────────────── */}
      <Dialog open={publishConfirmIdx !== null} onOpenChange={(open) => { if (!open) setPublishConfirmIdx(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-600" />
              Publish Theme
            </DialogTitle>
            <DialogDescription>
              {publishConfirmIdx !== null && mergedThemes[publishConfirmIdx]
                ? `Are you sure you want to publish "${mergedThemes[publishConfirmIdx].name}" as your active theme? This will replace your current theme.`
                : 'Are you sure you want to publish this theme?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setPublishConfirmIdx(null)}>Cancel</Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              onClick={() => publishConfirmIdx !== null && handlePublish(publishConfirmIdx)}
              disabled={publishingIdx !== null}
            >
              {publishingIdx !== null ? (
                <><div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" /> Publishing...</>
              ) : (
                <><Globe className="mr-1 h-3.5 w-3.5" /> Publish Now</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
