'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette,
  Eye,
  Sparkles,
  Type,
  Layout,
  Monitor,
  Smartphone,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
  Shield,
  Heart,
  Layers,
  Timer,
  AlertTriangle,
  ShoppingCart,
  Activity,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Save,
  Upload,
  Users,
  BookOpen,
  Megaphone,
  Globe,
  Settings2,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Code,
  FileText,
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
  type HeaderVariant,
  type ProductCardVariant,
  type FooterVariant,
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

// ─── Editor State Types ───────────────────────────────────────────

interface EditorColors {
  primary: string
  accent: string
  secondaryAccent: string
  background: string
  text: string
}

interface EditorTypography {
  headingFont: string
  bodyFont: string
  fontSizeScale: number
}

interface EditorLayout {
  headerStyle: HeaderVariant
  productCardStyle: ProductCardVariant
  gridLayout: GridLayout
  footerStyle: FooterVariant
}

interface EditorSection extends SectionConfig {
  label: string
  icon: React.ReactNode
}

interface EditorCRO {
  showUrgencyTimer: boolean
  showLiveViewers: boolean
  showRecentPurchases: boolean
  showLowStockWarning: boolean
  showTrustBadges: boolean
  stickyAddToCart: boolean
  urgencyMessage: string
  lowStockThreshold: number
}

interface EditorAdvanced {
  customCSS: string
  heroTitle: string
  heroSubtitle: string
  heroCtaText: string
  heroCtaSecondary: string
}

interface EditorState {
  colors: EditorColors
  typography: EditorTypography
  layout: EditorLayout
  sections: EditorSection[]
  cro: EditorCRO
  advanced: EditorAdvanced
}

// ─── Constants ────────────────────────────────────────────────────

const SECTION_META: Record<SectionType, { label: string; icon: React.ReactNode }> = {
  'hero': { label: 'Hero Banner', icon: <Layout className="h-4 w-4" /> },
  'trust-badges': { label: 'Trust Badges', icon: <Shield className="h-4 w-4" /> },
  'trending': { label: 'Trending Products', icon: <Zap className="h-4 w-4" /> },
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

function Camera({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  )
}

const HEADING_FONTS = [
  'Cormorant Garamond', 'Archivo Black', 'Playfair Display', 'Oxanium',
  'Mukta', 'Inter', 'Montserrat', 'Poppins', 'Lora',
]

const BODY_FONTS = [
  'Montserrat', 'Barlow', 'Nunito', 'IBM Plex Sans', 'Lato', 'Inter', 'system-ui',
]

const HEADER_STYLES: HeaderVariant[] = [
  'minimal', 'fullwidth', 'centered', 'transparent', 'sticky', 'floating', 'glass', 'elegant', 'banner', 'fixed',
]

const PRODUCT_CARD_STYLES: ProductCardVariant[] = [
  'clean', 'bold', 'luxury', 'soft', 'warm', 'wave', 'glass', 'boutique', 'rustic', 'neon',
]

const GRID_LAYOUTS: GridLayout[] = ['2-col', '3-col', '4-col', 'masonry', 'mixed']

const FOOTER_STYLES: FooterVariant[] = ['minimal', 'full', 'compact', 'social', 'newsletter-focus']

const THEME_KEY_MAP: Record<string, string> = {
  'Lumia': 'lumia', 'Blaze': 'blaze', 'Glow': 'glow', 'Bolt': 'bolt', 'Bazaar': 'bazaar',
}

const BORDER_RADIUS_MAP: Record<string, number> = {
  'sharp': 0, 'elegant': 4, 'rounded': 8, 'soft': 12,
  'worn': 8, 'organic': 16, 'fluid': 24, 'pill': 999,
}

// ─── Helper: build editor state from theme data ──────────────────

function buildEditorState(themeConfig: ThemeConfig, layoutConfig: ThemeLayoutConfig | null): EditorState {
  const layout = layoutConfig ?? THEME_CONFIGS['bazaar']!

  return {
    colors: {
      primary: themeConfig.primaryColor,
      accent: themeConfig.accentColor,
      secondaryAccent: themeConfig.secondaryAccent || themeConfig.accentColor,
      background: themeConfig.bgColor,
      text: themeConfig.textColor,
    },
    typography: {
      headingFont: layoutConfig?.name === 'Lumia' ? 'Cormorant Garamond'
        : layoutConfig?.name === 'Blaze' ? 'Archivo Black'
        : layoutConfig?.name === 'Glow' ? 'Playfair Display'
        : layoutConfig?.name === 'Bolt' ? 'Oxanium'
        : 'Mukta',
      bodyFont: layoutConfig?.name === 'Lumia' ? 'Montserrat'
        : layoutConfig?.name === 'Blaze' ? 'Barlow'
        : layoutConfig?.name === 'Glow' ? 'Nunito'
        : layoutConfig?.name === 'Bolt' ? 'IBM Plex Sans'
        : 'Lato',
      fontSizeScale: 1.0,
    },
    layout: {
      headerStyle: layout.headerVariant,
      productCardStyle: layout.productCardVariant,
      gridLayout: layout.gridLayout,
      footerStyle: layout.footerVariant,
    },
    sections: layout.sections.map(s => ({
      ...s,
      label: SECTION_META[s.id]?.label ?? s.id,
      icon: SECTION_META[s.id]?.icon ?? <Layers className="h-4 w-4" />,
    })),
    cro: {
      showUrgencyTimer: layout.cro.showUrgencyTimer,
      showLiveViewers: layout.cro.showLiveViewers,
      showRecentPurchases: layout.cro.showRecentPurchases,
      showLowStockWarning: layout.cro.showLowStockWarning,
      showTrustBadges: layout.cro.showTrustBadges,
      stickyAddToCart: layout.cro.stickyAddToCart,
      urgencyMessage: layout.cro.urgencyMessage || '',
      lowStockThreshold: layout.cro.lowStockThreshold,
    },
    advanced: {
      customCSS: '',
      heroTitle: layout.heroTitle,
      heroSubtitle: layout.heroSubtitle,
      heroCtaText: layout.heroCtaText,
      heroCtaSecondary: layout.heroCtaSecondary,
    },
  }
}

// ─── Live Storefront Preview ─────────────────────────────────────

function LiveStorefrontPreview({ editor, fullScreen }: { editor: EditorState; fullScreen: boolean }) {
  const { colors, typography, layout, sections, cro, advanced } = editor
  const isDark = colors.background === '#030712' || colors.background === '#0F1629' || colors.background === '#0f0f23'
  const navTextColor = isDark ? colors.text : '#ffffff'
  const gridCols = layout.gridLayout === '2-col' ? 2 : layout.gridLayout === '3-col' ? 3 : layout.gridLayout === '4-col' ? 4 : 3
  const borderRadius = 8
  const scale = fullScreen ? 1 : 1

  const visibleSections = sections.filter(s => s.visible)

  return (
    <div className="w-full h-full overflow-auto" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
      {/* Browser Chrome */}
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white dark:bg-gray-700 rounded-md px-3 py-1 text-[11px] text-gray-400 mx-4 flex items-center gap-2">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          yourstore.vepar.in
        </div>
      </div>

      {/* Store Header */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ backgroundColor: colors.primary }}>
        <span className="font-bold text-sm" style={{ color: navTextColor, fontFamily: typography.headingFont }}>MyStore</span>
        <div className="flex gap-3" style={{ color: isDark ? colors.accent : `${navTextColor}99`, fontFamily: typography.bodyFont }}>
          <span className="text-[10px]">Home</span>
          <span className="text-[10px]">Shop</span>
          <span className="text-[10px]">About</span>
          <span className="text-[10px]">Cart</span>
        </div>
      </div>

      {/* Render sections based on visibility */}
      {visibleSections.some(s => s.id === 'hero') && (
        <div
          className="relative overflow-hidden px-6 py-8"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent}40)`,
          }}
        >
          <div style={{ fontFamily: typography.headingFont, fontSize: `${14 * typography.fontSizeScale}px` }}>
            <p className="text-[9px] font-medium mb-1 opacity-80" style={{ color: colors.accent }}>NEW COLLECTION</p>
            <h2 className="font-bold mb-2" style={{ color: isDark ? colors.text : '#ffffff', fontSize: `${18 * typography.fontSizeScale}px` }}>
              {advanced.heroTitle || 'Welcome to Our Store'}
            </h2>
            <p className="text-[10px] mb-3 opacity-75" style={{ color: isDark ? `${colors.text}aa` : '#ffffffaa', fontFamily: typography.bodyFont }}>
              {advanced.heroSubtitle || 'Curated collection of amazing products'}
            </p>
            <div className="flex gap-2">
              <button
                className="text-[9px] px-3 py-1.5 font-medium"
                style={{
                  backgroundColor: colors.accent,
                  color: isDark ? colors.background : '#ffffff',
                  borderRadius: `${borderRadius}px`,
                }}
              >
                {advanced.heroCtaText || 'Shop Now'}
              </button>
              <button
                className="text-[9px] px-3 py-1.5 font-medium"
                style={{
                  backgroundColor: 'transparent',
                  color: isDark ? colors.text : '#ffffff',
                  border: `1px solid ${isDark ? `${colors.text}40` : '#ffffff40'}`,
                  borderRadius: `${borderRadius}px`,
                }}
              >
                {advanced.heroCtaSecondary || 'Explore'}
              </button>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-15" style={{ backgroundColor: colors.accent }} />
        </div>
      )}

      {/* CRO: Urgency Timer */}
      {cro.showUrgencyTimer && (
        <div className="px-4 py-1.5 flex items-center gap-2" style={{ backgroundColor: `${colors.accent}15` }}>
          <Timer className="h-3 w-3" style={{ color: colors.accent }} />
          <span className="text-[9px] font-medium" style={{ color: colors.accent, fontFamily: typography.bodyFont }}>
            {cro.urgencyMessage || '🔥 Sale ends soon!'}
          </span>
        </div>
      )}

      {/* CRO: Live Viewers */}
      {cro.showLiveViewers && (
        <div className="px-4 py-1 flex items-center gap-2" style={{ backgroundColor: colors.background }}>
          <Activity className="h-3 w-3" style={{ color: colors.accent }} />
          <span className="text-[9px]" style={{ color: `${colors.text}80`, fontFamily: typography.bodyFont }}>
            42 people viewing right now
          </span>
        </div>
      )}

      {/* CRO: Recent Purchases */}
      {cro.showRecentPurchases && (
        <div className="px-4 py-1 flex items-center gap-2" style={{ backgroundColor: colors.background }}>
          <ShoppingCart className="h-3 w-3" style={{ color: colors.accent }} />
          <span className="text-[9px]" style={{ color: `${colors.text}80`, fontFamily: typography.bodyFont }}>
            🛒 Someone in Mumbai just purchased Wireless Headphones
          </span>
        </div>
      )}

      {/* Trust Badges Section */}
      {visibleSections.some(s => s.id === 'trust-badges') && cro.showTrustBadges && (
        <div className="px-4 py-2 flex items-center justify-center gap-3" style={{ backgroundColor: isDark ? `${colors.primary}20` : `${colors.accent}08`, borderBottom: `1px solid ${colors.text}10` }}>
          {['🔒 Secure', '🚚 Free Ship', '↩️ Returns', '✓ Genuine'].map(b => (
            <span key={b} className="text-[8px] px-2 py-1 rounded" style={{ backgroundColor: isDark ? `${colors.text}10` : '#f5f5f5', color: `${colors.text}80`, fontFamily: typography.bodyFont }}>
              {b}
            </span>
          ))}
        </div>
      )}

      {/* Trending Section */}
      {visibleSections.some(s => s.id === 'trending') && (
        <div className="px-4 py-3" style={{ backgroundColor: colors.background }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold" style={{ color: colors.text, fontFamily: typography.headingFont }}>🔥 Trending Now</h3>
            <span className="text-[8px]" style={{ color: colors.accent, fontFamily: typography.bodyFont }}>View All →</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-lg overflow-hidden" style={{ border: isDark ? `1px solid ${colors.text}15` : '1px solid #e5e7eb' }}>
                <div className="h-10" style={{ background: `linear-gradient(135deg, ${colors.primary}${isDark ? '30' : '15'}, ${colors.accent}${isDark ? '20' : '10'})` }} />
                <div className="p-1.5" style={{ backgroundColor: isDark ? colors.background : '#ffffff' }}>
                  <p className="text-[8px] font-medium truncate" style={{ color: colors.text, fontFamily: typography.bodyFont }}>Trending Item {i}</p>
                  <p className="text-[7px] font-semibold" style={{ color: colors.accent }}>${(29.99 + i * 15).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flash Sale Section */}
      {visibleSections.some(s => s.id === 'flash-sale') && (
        <div className="px-4 py-3" style={{ background: `linear-gradient(90deg, ${colors.accent}20, ${colors.primary}20)` }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold" style={{ color: colors.accent, fontFamily: typography.headingFont }}>⚡ FLASH SALE</span>
            <div className="flex gap-1">
              {['02', '14', '36'].map((t, i) => (
                <span key={i} className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold" style={{ backgroundColor: colors.primary, color: isDark ? colors.accent : '#fff' }}>
                  {t}{i < 2 ? ':' : ''}
                </span>
              ))}
            </div>
          </div>
          {cro.showLowStockWarning && (
            <p className="text-[7px] mt-1 font-medium" style={{ color: '#ef4444', fontFamily: typography.bodyFont }}>
              🔥 Only {cro.lowStockThreshold} left in stock!
            </p>
          )}
        </div>
      )}

      {/* Brand Values */}
      {visibleSections.some(s => s.id === 'brand-values') && (
        <div className="px-4 py-3 flex justify-center gap-4" style={{ backgroundColor: colors.background }}>
          {['🏆 Quality', '🚚 Fast Delivery', '💎 Premium', '🛡️ Warranty'].map(v => (
            <div key={v} className="text-center">
              <div className="h-7 w-7 rounded-full mx-auto mb-1 flex items-center justify-center text-[10px]" style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}cc)`, color: '#fff' }}>
                {v.charAt(0)}
              </div>
              <span className="text-[7px]" style={{ color: colors.text, fontFamily: typography.bodyFont }}>{v.slice(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Collections */}
      {visibleSections.some(s => s.id === 'collections') && (
        <div className="px-4 py-3" style={{ backgroundColor: isDark ? `${colors.primary}10` : `${colors.accent}05` }}>
          <h3 className="text-[11px] font-bold mb-2" style={{ color: colors.text, fontFamily: typography.headingFont }}>Collections</h3>
          <div className="grid grid-cols-3 gap-2">
            {['Summer', 'Winter', 'Essentials'].map(c => (
              <div key={c} className="h-12 rounded-lg flex items-center justify-center text-[9px] font-medium" style={{ background: `linear-gradient(135deg, ${colors.accent}30, ${colors.primary}20)`, color: colors.text, fontFamily: typography.bodyFont }}>
                {c}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {visibleSections.some(s => s.id === 'categories') && (
        <div className="px-4 py-3" style={{ backgroundColor: colors.background }}>
          <h3 className="text-[11px] font-bold mb-2" style={{ color: colors.text, fontFamily: typography.headingFont }}>Shop by Category</h3>
          <div className="grid grid-cols-4 gap-2">
            {['Electronics', 'Fashion', 'Home', 'Beauty'].map(c => (
              <div key={c} className="h-10 rounded-lg flex items-center justify-center text-[7px] font-medium" style={{ background: `linear-gradient(135deg, ${colors.primary}15, ${colors.accent}10)`, color: colors.text, fontFamily: typography.bodyFont }}>
                {c}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {visibleSections.some(s => s.id === 'products') && (
        <div className="p-4" style={{ backgroundColor: colors.background }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold" style={{ color: colors.text, fontFamily: typography.headingFont }}>Our Products</h3>
            <span className="text-[8px]" style={{ color: colors.accent, fontFamily: typography.bodyFont }}>View All →</span>
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
            {Array.from({ length: gridCols * 2 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg" style={{
                border: isDark ? `1px solid ${colors.text}15` : '1px solid #e5e7eb',
              }}>
                <div className="h-14 relative" style={{
                  background: `linear-gradient(135deg, ${colors.primary}${isDark ? '30' : '15'}, ${colors.accent}${isDark ? '20' : '10'})`,
                }}>
                  {layout.productCardStyle === 'neon' && (
                    <div className="absolute inset-0 border border-cyan-400/30 rounded-lg" />
                  )}
                  {layout.productCardStyle !== 'clean' && i === 0 && (
                    <span className="absolute top-1 left-1 text-[6px] px-1 py-0.5 rounded font-bold text-white" style={{ backgroundColor: colors.accent }}>NEW</span>
                  )}
                </div>
                <div className="p-1.5" style={{ backgroundColor: isDark ? colors.background : '#ffffff' }}>
                  <p className="text-[8px] font-medium truncate" style={{ color: colors.text, fontFamily: typography.bodyFont }}>Product {i + 1}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-[7px] font-semibold" style={{ color: colors.accent }}>${(29.99 + i * 15).toFixed(2)}</p>
                    {i % 3 === 0 && <p className="text-[6px] line-through" style={{ color: `${colors.text}50` }}>${(49.99 + i * 15).toFixed(2)}</p>}
                  </div>
                  {layout.productCardStyle !== 'clean' && (
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s <= 4 ? colors.accent : '#d1d5db' }} />
                      ))}
                    </div>
                  )}
                  {cro.showLowStockWarning && i === 0 && (
                    <p className="text-[6px] mt-0.5 font-medium" style={{ color: '#ef4444' }}>🔥 Only {cro.lowStockThreshold} left!</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Promo Banner */}
      {visibleSections.some(s => s.id === 'promo-banner') && (
        <div className="px-4 py-4" style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.primary}80)` }}>
          <p className="text-[11px] font-bold text-white mb-1" style={{ fontFamily: typography.headingFont }}>🎁 Special Offer</p>
          <p className="text-[8px] text-white/80 mb-2" style={{ fontFamily: typography.bodyFont }}>Get 20% off on your first order</p>
          <button className="text-[8px] px-3 py-1 rounded font-medium text-white" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            Shop the Sale
          </button>
        </div>
      )}

      {/* Testimonials */}
      {visibleSections.some(s => s.id === 'testimonials') && (
        <div className="px-4 py-3" style={{ backgroundColor: isDark ? `${colors.primary}10` : `${colors.accent}05` }}>
          <h3 className="text-[11px] font-bold mb-2" style={{ color: colors.text, fontFamily: typography.headingFont }}>What Our Customers Say</h3>
          <div className="grid grid-cols-2 gap-2">
            {['Great quality!', 'Fast delivery!'].map((t, i) => (
              <div key={i} className="p-2 rounded-lg" style={{ backgroundColor: isDark ? `${colors.text}08` : '#ffffff', border: `1px solid ${colors.text}10` }}>
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className="h-2 w-2 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[7px]" style={{ color: colors.text, fontFamily: typography.bodyFont }}>&ldquo;{t}&rdquo;</p>
                <p className="text-[6px] mt-0.5" style={{ color: `${colors.text}60`, fontFamily: typography.bodyFont }}>- Customer {i + 1}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter */}
      {visibleSections.some(s => s.id === 'newsletter') && (
        <div className="px-4 py-3" style={{ backgroundColor: isDark ? `${colors.primary}20` : `${colors.accent}08` }}>
          <p className="text-[10px] font-bold mb-1" style={{ color: colors.text, fontFamily: typography.headingFont }}>Stay Updated</p>
          <p className="text-[7px] mb-2" style={{ color: `${colors.text}70`, fontFamily: typography.bodyFont }}>Subscribe for exclusive deals</p>
          <div className="flex gap-1.5">
            <div className="flex-1 h-6 rounded flex items-center px-2" style={{ backgroundColor: isDark ? `${colors.text}10` : '#fff', border: `1px solid ${colors.text}15` }}>
              <span className="text-[7px]" style={{ color: `${colors.text}40`, fontFamily: typography.bodyFont }}>Your email</span>
            </div>
            <div className="h-6 px-3 rounded flex items-center" style={{ backgroundColor: colors.accent, borderRadius: `${borderRadius}px` }}>
              <span className="text-[7px] text-white font-medium" style={{ fontFamily: typography.bodyFont }}>Subscribe</span>
            </div>
          </div>
        </div>
      )}

      {/* Social Proof */}
      {visibleSections.some(s => s.id === 'social-proof') && (
        <div className="px-4 py-2" style={{ backgroundColor: colors.background }}>
          <span className="text-[8px]" style={{ color: `${colors.text}60`, fontFamily: typography.bodyFont }}>
            ✅ 12,847 happy customers
          </span>
        </div>
      )}

      {/* Recently Viewed */}
      {visibleSections.some(s => s.id === 'recently-viewed') && (
        <div className="px-4 py-2" style={{ backgroundColor: colors.background }}>
          <h3 className="text-[9px] font-bold mb-1" style={{ color: colors.text, fontFamily: typography.headingFont }}>Recently Viewed</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 w-8 rounded" style={{ background: `linear-gradient(135deg, ${colors.primary}20, ${colors.accent}15)` }} />
            ))}
          </div>
        </div>
      )}

      {/* Instagram Feed */}
      {visibleSections.some(s => s.id === 'instagram-feed') && (
        <div className="px-4 py-2" style={{ backgroundColor: isDark ? `${colors.primary}10` : `${colors.accent}05` }}>
          <h3 className="text-[9px] font-bold mb-1" style={{ color: colors.text, fontFamily: typography.headingFont }}>📸 Follow Us</h3>
          <div className="grid grid-cols-4 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-square rounded" style={{ background: `linear-gradient(135deg, ${colors.primary}25, ${colors.accent}20)` }} />
            ))}
          </div>
        </div>
      )}

      {/* Lookbook */}
      {visibleSections.some(s => s.id === 'lookbook') && (
        <div className="px-4 py-2" style={{ backgroundColor: colors.background }}>
          <h3 className="text-[9px] font-bold mb-1" style={{ color: colors.text, fontFamily: typography.headingFont }}>Lookbook</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-16 rounded-lg" style={{ background: `linear-gradient(135deg, ${colors.primary}30, ${colors.accent}20)` }} />
            <div className="h-16 rounded-lg" style={{ background: `linear-gradient(135deg, ${colors.accent}30, ${colors.primary}20)` }} />
          </div>
        </div>
      )}

      {/* CRO: Sticky Add to Cart */}
      {cro.stickyAddToCart && (
        <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: colors.accent }}>
          <span className="text-[10px] text-white font-bold" style={{ fontFamily: typography.bodyFont }}>$29.99</span>
          <span className="text-[8px] text-white/90 px-2.5 py-1 rounded font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>Add to Cart</span>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3" style={{ backgroundColor: isDark ? `${colors.primary}40` : `${colors.primary}10` }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] font-bold" style={{ color: colors.text, fontFamily: typography.headingFont }}>MyStore</span>
          <div className="flex gap-2">
            {['Home', 'Shop', 'About', 'Contact'].map(l => (
              <span key={l} className="text-[7px]" style={{ color: `${colors.text}70`, fontFamily: typography.bodyFont }}>{l}</span>
            ))}
          </div>
        </div>
        <Separator className="my-2 opacity-20" />
        <div className="flex justify-between items-center">
          <span className="text-[7px]" style={{ color: `${colors.text}50`, fontFamily: typography.bodyFont }}>© 2025 MyStore</span>
          <div className="flex gap-2">
            <span className="text-[7px]" style={{ color: `${colors.text}50`, fontFamily: typography.bodyFont }}>Privacy</span>
            <span className="text-[7px]" style={{ color: `${colors.text}50`, fontFamily: typography.bodyFont }}>Terms</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Color Picker Field ──────────────────────────────────────────

function ColorPickerField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const isValidHex = /^#[0-9a-fA-F]{6}$/.test(value)
  const displayValue = isValidHex ? value : '#000000'

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-border cursor-pointer p-0.5"
        />
      </div>
      <div className="flex-1">
        <Label className="text-xs font-medium mb-1 block">{label}</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 text-xs font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

// ─── Collapsible Section ─────────────────────────────────────────

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
  accentColor,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  accentColor?: string
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-muted/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="h-7 w-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: accentColor ? `${accentColor}15` : undefined }}>
          {icon}
        </div>
        <span className="text-sm font-semibold flex-1 text-left">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Section Manager ─────────────────────────────────────────────

function SectionManager({
  sections,
  onChange,
}: {
  sections: EditorSection[]
  onChange: (sections: EditorSection[]) => void
}) {
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections]
    const swapIdx = direction === 'up' ? index - 1 : index + 1
    if (swapIdx < 0 || swapIdx >= newSections.length) return
    const temp = newSections[swapIdx]!
    newSections[swapIdx] = newSections[index]!
    newSections[index] = temp
    onChange(newSections)
  }

  const toggleVisibility = (sectionId: SectionType) => {
    onChange(sections.map(s => s.id === sectionId ? { ...s, visible: !s.visible } : s))
  }

  return (
    <div className="space-y-1">
      {sections.map((section, idx) => (
        <motion.div
          key={section.id}
          layout
          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/30 transition-colors group"
        >
          <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-0.5 rounded hover:bg-muted transition-colors disabled:opacity-30"
              onClick={() => moveSection(idx, 'up')}
              disabled={idx === 0}
            >
              <ArrowUp className="h-3 w-3" />
            </button>
            <button
              className="p-0.5 rounded hover:bg-muted transition-colors disabled:opacity-30"
              onClick={() => moveSection(idx, 'down')}
              disabled={idx === sections.length - 1}
            >
              <ArrowDown className="h-3 w-3" />
            </button>
          </div>

          <div className="h-6 w-6 rounded flex items-center justify-center bg-muted/60 text-muted-foreground shrink-0">
            {section.icon}
          </div>

          <span className="text-xs font-medium flex-1 truncate">{section.label}</span>

          <Switch
            checked={section.visible}
            onCheckedChange={() => toggleVisibility(section.id)}
            className="scale-75"
          />
        </motion.div>
      ))}
    </div>
  )
}

// ─── Main Theme Editor Component ─────────────────────────────────

export function ThemeEditor() {
  const { selectedStoreId } = useAppStore()
  const [themeData, setThemeData] = useState<ThemeData | null>(null)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [originalEditor, setOriginalEditor] = useState<EditorState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [fullScreenPreview, setFullScreenPreview] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  // Fetch current theme on mount
  useEffect(() => {
    const fetchTheme = async () => {
      setLoading(true)
      try {
        const storeId = selectedStoreId || sessionStorage.getItem('vepar_store_id')
        if (!storeId) {
          setLoading(false)
          return
        }

        const res = await fetch(`/api/storefront/theme?storeId=${storeId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.theme) {
            setThemeData(data.theme)
            const config = typeof data.theme.config === 'string' ? JSON.parse(data.theme.config) : data.theme.config
            const layoutKey = THEME_KEY_MAP[data.theme.name] || 'bazaar'
            const layoutConfig = THEME_CONFIGS[layoutKey] ?? THEME_CONFIGS['bazaar']!
            const state = buildEditorState(config, layoutConfig)
            setEditor(state)
            setOriginalEditor(JSON.parse(JSON.stringify(state)))
          }
        }
      } catch (err) {
        console.error('Failed to fetch theme:', err)
        // Use default Bazaar theme
        const defaultConfig: ThemeConfig = {
          primaryColor: '#FF9500', accentColor: '#0D9488', secondaryAccent: '#FCD34D',
          bgColor: '#FAFAF9', textColor: '#1C1917', fontFamily: 'poppins',
          layoutStyle: 'classic', borderRadius: 'rounded', headerStyle: 'fullwidth',
          heroStyle: 'fullscreen', productCardStyle: 'warm', buttonStyle: 'rounded',
        }
        const state = buildEditorState(defaultConfig, THEME_CONFIGS['bazaar']!)
        setEditor(state)
        setOriginalEditor(JSON.parse(JSON.stringify(state)))
      } finally {
        setLoading(false)
      }
    }
    fetchTheme()
  }, [selectedStoreId])

  // Check for unsaved changes
  const hasChanges = useMemo(() => {
    if (!editor || !originalEditor) return false
    return JSON.stringify(editor) !== JSON.stringify(originalEditor)
  }, [editor, originalEditor])

  // Update editor helpers
  const updateColors = useCallback((patch: Partial<EditorColors>) => {
    setEditor(prev => prev ? { ...prev, colors: { ...prev.colors, ...patch } } : prev)
  }, [])

  const updateTypography = useCallback((patch: Partial<EditorTypography>) => {
    setEditor(prev => prev ? { ...prev, typography: { ...prev.typography, ...patch } } : prev)
  }, [])

  const updateLayout = useCallback((patch: Partial<EditorLayout>) => {
    setEditor(prev => prev ? { ...prev, layout: { ...prev.layout, ...patch } } : prev)
  }, [])

  const updateSections = useCallback((sections: EditorSection[]) => {
    setEditor(prev => prev ? { ...prev, sections } : prev)
  }, [])

  const updateCRO = useCallback((patch: Partial<EditorCRO>) => {
    setEditor(prev => prev ? { ...prev, cro: { ...prev.cro, ...patch } } : prev)
  }, [])

  const updateAdvanced = useCallback((patch: Partial<EditorAdvanced>) => {
    setEditor(prev => prev ? { ...prev, advanced: { ...prev.advanced, ...patch } } : prev)
  }, [])

  // Save handler
  const handleSave = async () => {
    if (!themeData || !editor) return
    setSaving(true)
    try {
      const config: ThemeConfig = {
        primaryColor: editor.colors.primary,
        accentColor: editor.colors.accent,
        secondaryAccent: editor.colors.secondaryAccent,
        bgColor: editor.colors.background,
        textColor: editor.colors.text,
        fontFamily: editor.typography.bodyFont.toLowerCase().replace(/\s+/g, '-'),
        layoutStyle: 'custom',
        borderRadius: 'rounded',
        headerStyle: editor.layout.headerStyle,
        heroStyle: 'fullscreen',
        productCardStyle: editor.layout.productCardStyle,
        buttonStyle: 'rounded',
      }

      const layout = {
        category: 'custom',
        features: editor.sections.filter(s => s.visible).map(s => s.id),
        headerVariant: editor.layout.headerStyle,
        productCardVariant: editor.layout.productCardStyle,
        gridLayout: editor.layout.gridLayout,
        footerVariant: editor.layout.footerStyle,
        sections: editor.sections.map(s => ({ id: s.id, visible: s.visible, props: s.props })),
        cro: {
          ...editor.cro,
          showSocialProofCount: true,
          viewerCountRange: [15, 65] as [number, number],
        },
        heroTitle: editor.advanced.heroTitle,
        heroSubtitle: editor.advanced.heroSubtitle,
        heroCtaText: editor.advanced.heroCtaText,
        heroCtaSecondary: editor.advanced.heroCtaSecondary,
      }

      await api.put(`/themes/${themeData.id}`, {
        config,
        layout,
        styles: { customCSS: editor.advanced.customCSS },
      })

      setOriginalEditor(JSON.parse(JSON.stringify(editor)))
      toast.success('Theme saved successfully', { description: 'Your changes have been saved as a draft.' })
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Failed to save theme', { description: 'Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  // Publish handler
  const handlePublish = async () => {
    if (!themeData || !editor) return
    setPublishing(true)
    try {
      // Save first
      await handleSave()
      // Then publish
      const storeId = selectedStoreId || sessionStorage.getItem('vepar_store_id')
      if (storeId) {
        await api.post('/themes/publish', { themeId: themeData.id, storeId })
      }
      toast.success('Theme published!', { description: 'Your store has been updated with the new theme.' })
    } catch (err) {
      console.error('Publish error:', err)
      toast.error('Failed to publish theme', { description: 'Please try again.' })
    } finally {
      setPublishing(false)
      setPublishDialogOpen(false)
    }
  }

  // Reset handler
  const handleReset = () => {
    if (originalEditor) {
      setEditor(JSON.parse(JSON.stringify(originalEditor)))
      toast.info('Theme reset to last saved state')
    }
    setResetDialogOpen(false)
  }

  // Loading state
  if (loading || !editor) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading theme editor...</p>
        </div>
      </div>
    )
  }

  const previewWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Palette className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Theme Editor</h2>
            <p className="text-xs text-muted-foreground">Customize your storefront appearance</p>
          </div>
          {hasChanges && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px]">
              Unsaved changes
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Device Preview Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/60 mr-2">
            {[
              { key: 'desktop' as const, icon: <Monitor className="h-3.5 w-3.5" /> },
              { key: 'tablet' as const, icon: <Smartphone className="h-3.5 w-3.5" /> },
              { key: 'mobile' as const, icon: <Smartphone className="h-3.5 w-3.5" /> },
            ].map(d => (
              <Tooltip key={d.key}>
                <TooltipTrigger asChild>
                  <button
                    className={`
                      p-1.5 rounded-md transition-colors
                      ${previewDevice === d.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}
                    `}
                    onClick={() => setPreviewDevice(d.key)}
                  >
                    {d.icon}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{d.key.charAt(0).toUpperCase() + d.key.slice(1)}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}>
                {rightPanelCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{rightPanelCollapsed ? 'Show Settings' : 'Hide Settings'}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setFullScreenPreview(!fullScreenPreview)}>
                {fullScreenPreview ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{fullScreenPreview ? 'Exit Full Preview' : 'Full Preview'}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Split Pane Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT: Preview Pane */}
        <motion.div
          className="border-r bg-muted/20 overflow-hidden flex flex-col"
          animate={{ width: fullScreenPreview ? '100%' : rightPanelCollapsed ? '100%' : '55%' }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="flex-1 overflow-auto p-4">
            <div className="mx-auto" style={{ maxWidth: previewWidths[previewDevice] }}>
              <div className="rounded-lg overflow-hidden shadow-lg border bg-white">
                <LiveStorefrontPreview editor={editor} fullScreen={fullScreenPreview} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Settings Panel */}
        <AnimatePresence>
          {!rightPanelCollapsed && !fullScreenPreview && (
            <motion.div
              className="flex flex-col min-h-0 bg-card"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '45%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Settings Scroll Area */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {/* Colors Section */}
                  <CollapsibleSection
                    title="Colors"
                    icon={<Palette className="h-4 w-4 text-rose-500" />}
                    defaultOpen={true}
                    accentColor="#f43f5e"
                  >
                    <ColorPickerField
                      label="Primary Color"
                      value={editor.colors.primary}
                      onChange={(v) => updateColors({ primary: v })}
                    />
                    <ColorPickerField
                      label="Accent Color"
                      value={editor.colors.accent}
                      onChange={(v) => updateColors({ accent: v })}
                    />
                    <ColorPickerField
                      label="Secondary Accent"
                      value={editor.colors.secondaryAccent}
                      onChange={(v) => updateColors({ secondaryAccent: v })}
                    />
                    <ColorPickerField
                      label="Background Color"
                      value={editor.colors.background}
                      onChange={(v) => updateColors({ background: v })}
                    />
                    <ColorPickerField
                      label="Text Color"
                      value={editor.colors.text}
                      onChange={(v) => updateColors({ text: v })}
                    />
                  </CollapsibleSection>

                  {/* Typography Section */}
                  <CollapsibleSection
                    title="Typography"
                    icon={<Type className="h-4 w-4 text-amber-500" />}
                    defaultOpen={false}
                    accentColor="#f59e0b"
                  >
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Heading Font</Label>
                      <Select value={editor.typography.headingFont} onValueChange={(v) => updateTypography({ headingFont: v })}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HEADING_FONTS.map(font => (
                            <SelectItem key={font} value={font}>{font}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Body Font</Label>
                      <Select value={editor.typography.bodyFont} onValueChange={(v) => updateTypography({ bodyFont: v })}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BODY_FONTS.map(font => (
                            <SelectItem key={font} value={font}>{font}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Font Size Scale: {editor.typography.fontSizeScale.toFixed(1)}x</Label>
                      <Slider
                        value={[editor.typography.fontSizeScale * 100]}
                        onValueChange={(v) => updateTypography({ fontSizeScale: v[0]! / 100 })}
                        min={80}
                        max={140}
                        step={5}
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>0.8x</span>
                        <span>1.0x</span>
                        <span>1.4x</span>
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Layout Section */}
                  <CollapsibleSection
                    title="Layout"
                    icon={<Layout className="h-4 w-4 text-emerald-500" />}
                    defaultOpen={false}
                    accentColor="#10b981"
                  >
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Header Style</Label>
                      <Select value={editor.layout.headerStyle} onValueChange={(v) => updateLayout({ headerStyle: v as HeaderVariant })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {HEADER_STYLES.map(s => (
                            <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Product Card Style</Label>
                      <Select value={editor.layout.productCardStyle} onValueChange={(v) => updateLayout({ productCardStyle: v as ProductCardVariant })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PRODUCT_CARD_STYLES.map(s => (
                            <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Grid Layout</Label>
                      <Select value={editor.layout.gridLayout} onValueChange={(v) => updateLayout({ gridLayout: v as GridLayout })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {GRID_LAYOUTS.map(s => (
                            <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Footer Style</Label>
                      <Select value={editor.layout.footerStyle} onValueChange={(v) => updateLayout({ footerStyle: v as FooterVariant })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FOOTER_STYLES.map(s => (
                            <SelectItem key={s} value={s}>{s === 'newsletter-focus' ? 'Newsletter Focus' : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CollapsibleSection>

                  {/* Sections Section */}
                  <CollapsibleSection
                    title="Sections"
                    icon={<Layers className="h-4 w-4 text-violet-500" />}
                    defaultOpen={false}
                    accentColor="#8b5cf6"
                  >
                    <p className="text-[11px] text-muted-foreground mb-2">Toggle visibility and reorder homepage sections</p>
                    <SectionManager
                      sections={editor.sections}
                      onChange={updateSections}
                    />
                  </CollapsibleSection>

                  {/* CRO Settings Section */}
                  <CollapsibleSection
                    title="CRO Settings"
                    icon={<Zap className="h-4 w-4 text-orange-500" />}
                    defaultOpen={false}
                    accentColor="#f97316"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Show Urgency Timer</Label>
                        <Switch checked={editor.cro.showUrgencyTimer} onCheckedChange={(v) => updateCRO({ showUrgencyTimer: v })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Show Live Viewers</Label>
                        <Switch checked={editor.cro.showLiveViewers} onCheckedChange={(v) => updateCRO({ showLiveViewers: v })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Show Recent Purchases</Label>
                        <Switch checked={editor.cro.showRecentPurchases} onCheckedChange={(v) => updateCRO({ showRecentPurchases: v })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Show Low Stock Warning</Label>
                        <Switch checked={editor.cro.showLowStockWarning} onCheckedChange={(v) => updateCRO({ showLowStockWarning: v })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Show Trust Badges</Label>
                        <Switch checked={editor.cro.showTrustBadges} onCheckedChange={(v) => updateCRO({ showTrustBadges: v })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Sticky Add to Cart</Label>
                        <Switch checked={editor.cro.stickyAddToCart} onCheckedChange={(v) => updateCRO({ stickyAddToCart: v })} />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Urgency Message</Label>
                        <Input
                          className="h-8 text-xs"
                          value={editor.cro.urgencyMessage}
                          onChange={(e) => updateCRO({ urgencyMessage: e.target.value })}
                          placeholder="🔥 Sale ends soon!"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Low Stock Threshold: {editor.cro.lowStockThreshold}</Label>
                        <Slider
                          value={[editor.cro.lowStockThreshold]}
                          onValueChange={(v) => updateCRO({ lowStockThreshold: v[0]! })}
                          min={1}
                          max={20}
                          step={1}
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>1</span>
                          <span>10</span>
                          <span>20</span>
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Advanced Section */}
                  <CollapsibleSection
                    title="Advanced"
                    icon={<Settings2 className="h-4 w-4 text-slate-500" />}
                    defaultOpen={false}
                    accentColor="#64748b"
                  >
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Custom CSS</Label>
                      <Textarea
                        className="min-h-[100px] text-xs font-mono bg-muted/30"
                        value={editor.advanced.customCSS}
                        onChange={(e) => updateAdvanced({ customCSS: e.target.value })}
                        placeholder="/* Custom CSS styles */&#10;.my-class {&#10;  color: red;&#10;}"
                      />
                      <p className="text-[10px] text-muted-foreground">Add custom CSS to override theme styles</p>
                    </div>

                    <Separator className="my-3" />

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Hero Title</Label>
                      <Input
                        className="h-8 text-xs"
                        value={editor.advanced.heroTitle}
                        onChange={(e) => updateAdvanced({ heroTitle: e.target.value })}
                        placeholder="Welcome to Our Store"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Hero Subtitle</Label>
                      <Input
                        className="h-8 text-xs"
                        value={editor.advanced.heroSubtitle}
                        onChange={(e) => updateAdvanced({ heroSubtitle: e.target.value })}
                        placeholder="Curated collection of amazing products"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Hero CTA Text</Label>
                      <Input
                        className="h-8 text-xs"
                        value={editor.advanced.heroCtaText}
                        onChange={(e) => updateAdvanced({ heroCtaText: e.target.value })}
                        placeholder="Shop Now"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Hero CTA Secondary</Label>
                      <Input
                        className="h-8 text-xs"
                        value={editor.advanced.heroCtaSecondary}
                        onChange={(e) => updateAdvanced({ heroCtaSecondary: e.target.value })}
                        placeholder="Explore"
                      />
                    </div>
                  </CollapsibleSection>
                </div>
              </ScrollArea>

              {/* Fixed Action Bar */}
              <div className="border-t p-3 bg-card shrink-0">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9"
                    onClick={() => setResetDialogOpen(true)}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9"
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                  >
                    {saving ? (
                      <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
                    ) : (
                      <Save className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Save
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-9 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    onClick={() => setPublishDialogOpen(true)}
                    disabled={publishing}
                  >
                    {publishing ? (
                      <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
                    ) : (
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Publish
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Publish Confirmation Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-violet-600" />
              Publish Theme
            </DialogTitle>
            <DialogDescription>
              Your store will update immediately with the current theme settings. All visitors will see the new design.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 my-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Your store will update immediately</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  All changes will be visible to your customers right away. Make sure you&apos;ve previewed everything.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handlePublish}
              disabled={publishing}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {publishing ? (
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Publishing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Publish Now
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-600" />
              Reset Theme
            </DialogTitle>
            <DialogDescription>
              This will revert all changes to the last saved state. Any unsaved edits will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
