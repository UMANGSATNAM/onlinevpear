'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { getThemeConfig, ThemeLayoutConfig } from '@/lib/theme-configs'

export interface ThemeConfig {
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

export interface StoreTheme {
  id: string
  name: string
  description: string | null
  config: ThemeConfig
  layout: { category: string; features: string[] }
  styles: Record<string, string>
  isActive: boolean
  layoutConfig: ThemeLayoutConfig | null
}

interface ThemeContextType {
  theme: StoreTheme | null
  loading: boolean
  refetch: () => void
  layoutConfig: ThemeLayoutConfig | null
}

const ThemeContext = createContext<ThemeContextType>({
  theme: null,
  loading: true,
  refetch: () => {},
  layoutConfig: null,
})

export function useStoreTheme() {
  return useContext(ThemeContext)
}

export function useThemeLayout() {
  const { layoutConfig } = useContext(ThemeContext)
  return layoutConfig
}

// Convert hex to RGB for CSS variable usage
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

// Generate a lighter/darker version of a color
function adjustColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const r = Math.max(0, Math.min(255, rgb.r + amount))
  const g = Math.max(0, Math.min(255, rgb.g + amount))
  const b = Math.max(0, Math.min(255, rgb.b + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Mix two colors
function mixColors(color1: string, color2: string, ratio: number): string {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  if (!rgb1 || !rgb2) return color1
  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio)
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio)
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Font family mapping
const FONT_MAP: Record<string, string> = {
  inter: "'Inter', system-ui, -apple-system, sans-serif",
  montserrat: "'Montserrat', system-ui, sans-serif",
  poppins: "'Poppins', system-ui, sans-serif",
  playfair: "'Playfair Display', Georgia, serif",
  lora: "'Lora', Georgia, serif",
  system: "system-ui, -apple-system, sans-serif",
}

// Check if a color is very dark (luminance < threshold)
function isVeryDark(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance < 0.15
}

// Inject CSS custom properties based on theme config
function injectThemeCSS(config: ThemeConfig, themeName: string) {
  const isDark = isVeryDark(config.bgColor)
  const isPrimaryVeryDark = isVeryDark(config.primaryColor)
  const primaryRgb = hexToRgb(config.primaryColor)
  const accentRgb = hexToRgb(config.accentColor)
  const secondaryAccent = config.secondaryAccent || config.accentColor
  const secondaryRgb = hexToRgb(secondaryAccent)

  // Font family
  const fontFamily = FONT_MAP[config.fontFamily] || FONT_MAP.inter

  // Border radius mapping
  const radiusMap: Record<string, string> = {
    sharp: '2px',
    rounded: '8px',
    soft: '12px',
    elegant: '6px',
    organic: '16px',
    fluid: '24px',
    worn: '8px',
    pill: '999px',
  }
  const borderRadius = radiusMap[config.borderRadius] || '8px'

  // Build CSS custom properties
  const css = `
    :root {
      /* Primary colors */
      --theme-primary: ${config.primaryColor};
      --theme-primary-rgb: ${primaryRgb ? `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}` : '0, 0, 0'};
      --theme-primary-light: ${adjustColor(config.primaryColor, 40)};
      --theme-primary-dark: ${adjustColor(config.primaryColor, -40)};
      --theme-primary-50: ${mixColors(config.primaryColor, '#ffffff', 0.95)};
      --theme-primary-100: ${mixColors(config.primaryColor, '#ffffff', 0.88)};
      --theme-primary-200: ${mixColors(config.primaryColor, '#ffffff', 0.75)};

      /* Accent colors */
      --theme-accent: ${config.accentColor};
      --theme-accent-rgb: ${accentRgb ? `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}` : '0, 0, 0'};
      --theme-accent-light: ${adjustColor(config.accentColor, 40)};
      --theme-accent-dark: ${adjustColor(config.accentColor, -40)};
      --theme-accent-50: ${mixColors(config.accentColor, '#ffffff', 0.95)};
      --theme-accent-100: ${mixColors(config.accentColor, '#ffffff', 0.88)};
      --theme-accent-200: ${mixColors(config.accentColor, '#ffffff', 0.75)};

      /* Secondary accent */
      --theme-secondary-accent: ${secondaryAccent};
      --theme-secondary-accent-rgb: ${secondaryRgb ? `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}` : '0, 0, 0'};

      /* Background & Surface */
      --theme-bg: ${config.bgColor};
      --theme-bg-rgb: ${hexToRgb(config.bgColor) ? `${hexToRgb(config.bgColor)!.r}, ${hexToRgb(config.bgColor)!.g}, ${hexToRgb(config.bgColor)!.b}` : '255, 255, 255'};
      --theme-surface: ${isDark ? adjustColor(config.bgColor, 15) : '#ffffff'};
      --theme-surface-elevated: ${isDark ? adjustColor(config.bgColor, 25) : '#f8f9fa'};
      --theme-surface-dim: ${isDark ? adjustColor(config.bgColor, 8) : '#f1f3f5'};

      /* Text */
      --theme-text: ${config.textColor};
      --theme-text-rgb: ${hexToRgb(config.textColor) ? `${hexToRgb(config.textColor)!.r}, ${hexToRgb(config.textColor)!.g}, ${hexToRgb(config.textColor)!.b}` : '0, 0, 0'};
      --theme-text-muted: ${isDark ? adjustColor(config.textColor, -60) : adjustColor(config.textColor, 100)};
      --theme-text-subtle: ${isDark ? adjustColor(config.textColor, -100) : adjustColor(config.textColor, 140)};

      /* Gradients */
      --theme-gradient-primary: linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor});
      --theme-gradient-hero: linear-gradient(135deg, ${config.primaryColor}, ${mixColors(config.primaryColor, config.accentColor, 0.4)});
      --theme-gradient-accent: linear-gradient(135deg, ${config.accentColor}, ${secondaryAccent});
      --theme-gradient-banner: linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor}60);
      --theme-gradient-warm: linear-gradient(135deg, ${config.accentColor}, ${adjustColor(config.accentColor, 30)});
      --theme-gradient-cool: linear-gradient(135deg, ${config.primaryColor}, ${adjustColor(config.primaryColor, -30)});

      /* Layout */
      --theme-font-family: ${fontFamily};
      --theme-border-radius: ${borderRadius};
      --theme-radius-sm: calc(${borderRadius} * 0.5);
      --theme-radius-lg: calc(${borderRadius} * 1.5);
      --theme-radius-xl: calc(${borderRadius} * 2);

      /* Borders */
      --theme-border: ${isDark ? `${adjustColor(config.textColor, -120)}30` : '#e5e7eb'};
      --theme-border-focus: ${config.accentColor}40;

      /* Shadows */
      --theme-shadow-sm: 0 1px 3px rgba(var(--theme-primary-rgb), 0.06);
      --theme-shadow-md: 0 4px 12px rgba(var(--theme-primary-rgb), 0.08);
      --theme-shadow-lg: 0 8px 24px rgba(var(--theme-primary-rgb), 0.12);
      --theme-shadow-accent: 0 4px 14px rgba(var(--theme-accent-rgb), 0.25);

      /* Is dark mode */
      --theme-is-dark: ${isDark ? '1' : '0'};
    }

    /* ─── Storefront Theme Overrides ─── */
    [data-storefront-theme="${themeName}"] {

      /* Announcement Bar */
      .sf-announcement {
        background: linear-gradient(90deg, ${config.accentColor}, ${config.primaryColor}, ${secondaryAccent}) !important;
      }
      .sf-announcement-bar-left {
        background: linear-gradient(90deg, ${config.accentColor}, transparent) !important;
      }
      .sf-announcement-bar-right {
        background: linear-gradient(90deg, transparent, ${secondaryAccent}) !important;
      }

      /* Header */
      .sf-header {
        ${isDark ? `background: rgba(var(--theme-bg-rgb), 0.8) !important;` : ''}
      }
      .sf-header.scrolled {
        ${isDark ? `background: rgba(var(--theme-bg-rgb), 0.9) !important;` : ''}
      }
      .sf-logo-badge {
        background: linear-gradient(135deg, ${config.accentColor}, ${adjustColor(config.accentColor, -30)}) !important;
      }

      /* Hero */
      .sf-hero {
        background: ${isPrimaryVeryDark
          ? `linear-gradient(135deg, ${config.primaryColor}, ${adjustColor(config.accentColor, -40)}, ${config.accentColor}60)`
          : `linear-gradient(135deg, ${config.primaryColor}, ${mixColors(config.primaryColor, config.accentColor, 0.3)})`
        } !important;
      }
      .sf-hero-badge {
        background: rgba(var(--theme-accent-rgb), 0.15) !important;
        border-color: rgba(var(--theme-accent-rgb), 0.3) !important;
      }
      .sf-hero-title-accent {
        background: linear-gradient(135deg, ${config.accentColor}, ${secondaryAccent}, ${adjustColor(config.accentColor, 40)}) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        background-clip: text !important;
      }
      .sf-hero-cta {
        background: ${config.accentColor} !important;
        ${isDark ? `color: ${config.bgColor} !important;` : 'color: #ffffff !important;'}
      }
      .sf-hero-cta:hover {
        background: ${adjustColor(config.accentColor, -20)} !important;
      }
      .sf-hero-cta-outline {
        border-color: ${isDark ? `${config.textColor}40` : '#ffffff40'} !important;
        ${isDark ? `color: ${config.textColor} !important;` : 'color: #ffffff !important;'}
      }

      /* Hero decorative blobs */
      .sf-hero-blob-1 {
        background: rgba(var(--theme-accent-rgb), 0.2) !important;
      }
      .sf-hero-blob-2 {
        background: rgba(var(--theme-primary-rgb), 0.15) !important;
      }

      /* Section Headers */
      .sf-section-accent-line {
        background: linear-gradient(90deg, ${config.accentColor}, ${secondaryAccent}) !important;
      }

      /* Buttons */
      .sf-btn-primary {
        background: ${config.accentColor} !important;
        ${isDark ? `color: ${config.bgColor} !important;` : 'color: #ffffff !important;'}
      }
      .sf-btn-primary:hover {
        background: ${adjustColor(config.accentColor, -20)} !important;
      }

      /* Product Cards */
      .sf-product-card:hover {
        ${isDark ? `border-color: rgba(var(--theme-accent-rgb), 0.3) !important;` : ''}
      }
      .sf-product-card-badge {
        background: ${config.accentColor} !important;
      }
      .sf-product-price {
        color: ${config.accentColor} !important;
      }
      .sf-product-category {
        color: ${adjustColor(config.accentColor, -30)} !important;
      }

      /* Promo Banner */
      .sf-promo-banner {
        background: linear-gradient(135deg, ${config.accentColor}, ${config.primaryColor}80) !important;
      }

      /* Flash Sale */
      .sf-flash-sale {
        background: linear-gradient(135deg, ${config.accentColor}, ${config.primaryColor}) !important;
      }

      /* Footer */
      .sf-footer {
        background: ${isDark
          ? `linear-gradient(to bottom, ${adjustColor(config.bgColor, -10)}, ${adjustColor(config.bgColor, -20)})`
          : `linear-gradient(to bottom, ${adjustColor(config.primaryColor, -80)}, ${adjustColor(config.primaryColor, -100)})`
        } !important;
        color: ${isDark ? config.textColor : '#ffffff'} !important;
      }
      .sf-footer-top-line {
        background: linear-gradient(90deg, ${config.accentColor}, ${secondaryAccent}, ${config.accentColor}) !important;
      }
      .sf-footer-logo-badge {
        background: linear-gradient(135deg, ${config.accentColor}, ${adjustColor(config.accentColor, -30)}) !important;
      }
      .sf-footer-subscribe-btn {
        background: linear-gradient(135deg, ${config.accentColor}, ${secondaryAccent}) !important;
        box-shadow: 0 4px 14px rgba(var(--theme-accent-rgb), 0.3) !important;
      }

      /* Brand Values */
      .sf-brand-value-icon {
        background: linear-gradient(135deg, ${config.accentColor}, ${adjustColor(config.accentColor, -20)}) !important;
      }

      /* Trust badges */
      .sf-trust-badge-icon {
        background: linear-gradient(135deg, ${config.accentColor}, ${adjustColor(config.accentColor, -20)}) !important;
      }

      /* Collection cards */
      .sf-collection-card-gradient {
        background: linear-gradient(135deg, ${config.primaryColor}60, ${config.accentColor}40) !important;
      }

      /* Category cards */
      .sf-category-card-gradient {
        background: linear-gradient(135deg, ${config.primaryColor}40, ${config.accentColor}30) !important;
      }

      /* Testimonials */
      .sf-testimonial-accent-line {
        background: linear-gradient(90deg, ${config.accentColor}, ${secondaryAccent}) !important;
      }

      /* Newsletter */
      .sf-newsletter-section {
        background: ${isDark
          ? `linear-gradient(135deg, ${adjustColor(config.bgColor, 5)}, ${mixColors(config.accentColor, config.bgColor, 0.05)})`
          : `linear-gradient(135deg, ${mixColors(config.accentColor, '#ffffff', 0.95)}, ${mixColors(config.primaryColor, '#ffffff', 0.97)})`
        } !important;
      }
      .sf-newsletter-accent-line {
        background: linear-gradient(90deg, ${config.accentColor}, ${secondaryAccent}) !important;
      }
      .sf-newsletter-btn {
        background: ${config.accentColor} !important;
        ${isDark ? `color: ${config.bgColor} !important;` : 'color: #ffffff !important;'}
      }

      /* Back to Top */
      .sf-back-to-top {
        background: linear-gradient(135deg, ${config.accentColor}, ${adjustColor(config.accentColor, -20)}) !important;
        box-shadow: 0 4px 14px rgba(var(--theme-accent-rgb), 0.3) !important;
      }

      /* Cart badge */
      .sf-cart-badge {
        background: ${config.accentColor} !important;
      }

      /* Nav active */
      .sf-nav-active {
        color: ${config.accentColor} !important;
        background: rgba(var(--theme-accent-rgb), 0.05) !important;
      }

      /* Mobile nav active */
      .sf-mobile-nav-active {
        background: rgba(var(--theme-accent-rgb), 0.08) !important;
        color: ${config.accentColor} !important;
      }

      /* Trust badges section */
      .sf-trust-badges-section {
        background: ${isDark ? `rgba(var(--theme-bg-rgb), 1)` : 'linear-gradient(to right, rgba(var(--theme-accent-rgb), 0.05), white, rgba(var(--theme-accent-rgb), 0.05))'} !important;
        border-color: ${isDark ? 'rgba(var(--theme-accent-rgb), 0.1)' : '#e5e7eb'} !important;
      }

      /* Brand values section */
      .sf-brand-values-section {
        background: ${isDark ? 'rgba(var(--theme-bg-rgb), 1)' : 'white'} !important;
        border-color: ${isDark ? 'rgba(var(--theme-accent-rgb), 0.1)' : '#e5e7eb'} !important;
      }

      /* Categories section */
      .sf-categories-section {
        background: ${isDark ? 'rgba(var(--theme-bg-rgb), 1)' : `linear-gradient(to bottom, rgba(var(--theme-accent-rgb), 0.03), white)`} !important;
      }

      /* Testimonials section */
      .sf-testimonials-section {
        background: ${isDark ? 'rgba(var(--theme-bg-rgb), 1)' : `linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.03), rgba(var(--theme-primary-rgb), 0.02), rgba(var(--theme-secondary-accent-rgb), 0.03))`} !important;
      }

      /* Product tabs section */
      .sf-product-tabs-bg {
        background: ${isDark ? 'rgba(var(--theme-bg-rgb), 1)' : 'white'} !important;
      }
      .sf-product-tab-active {
        background: ${isDark ? 'rgba(var(--theme-accent-rgb), 0.15)' : 'white'} !important;
        color: ${config.accentColor} !important;
      }
      .sf-product-tab-inactive {
        color: ${isDark ? 'rgba(var(--theme-text-rgb), 0.5)' : '#737373'} !important;
      }

      /* Card backgrounds for dark mode */
      .sf-card-surface {
        background: ${isDark ? 'rgba(var(--theme-surface-elevated), 1)' : 'rgba(255,255,255,0.8)'} !important;
        border-color: ${isDark ? 'rgba(var(--theme-accent-rgb), 0.1)' : 'transparent'} !important;
      }

      /* Flash sale section */
      .sf-flash-sale-section {
        background: linear-gradient(135deg, ${config.accentColor}, ${config.primaryColor}80) !important;
      }

      /* Promo banner section */
      .sf-promo-banner-section {
        background: linear-gradient(135deg, ${config.accentColor}, ${config.primaryColor}80) !important;
      }

      /* Font family */
      font-family: var(--theme-font-family) !important;
    }
  `

  return css
}

interface ThemeProviderProps {
  storeId: string | null
  children: ReactNode
}

export function StorefrontThemeProvider({ storeId, children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<StoreTheme | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTheme = useCallback(async () => {
    if (!storeId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/storefront/theme?storeId=${storeId}`)
      if (res.ok) {
        const data = await res.json()
        const themeName = data.theme?.name
          ? data.theme.name.toLowerCase().replace(/\s+/g, '-')
          : null
        const layoutConfig = themeName ? getThemeConfig(themeName) : null
        setTheme({ ...data.theme, layoutConfig })
      }
    } catch (err) {
      console.error('Failed to fetch theme:', err)
    } finally {
      setLoading(false)
    }
  }, [storeId])

  useEffect(() => {
    fetchTheme()
  }, [fetchTheme])

  // Inject CSS when theme changes
  useEffect(() => {
    if (!theme) return

    const css = injectThemeCSS(theme.config, theme.name)

    // Remove old theme style tag if exists
    const oldStyle = document.getElementById('storefront-theme-override')
    if (oldStyle) oldStyle.remove()

    // Create and inject new style tag
    const style = document.createElement('style')
    style.id = 'storefront-theme-override'
    style.textContent = css
    document.head.appendChild(style)

    // Set data attribute on body for CSS targeting
    document.body.setAttribute('data-storefront-theme', theme.name)

    // Load Google Fonts if needed
    const fontsToLoad: string[] = []
    if (theme.config.fontFamily === 'playfair') fontsToLoad.push('Playfair+Display:wght@400;600;700')
    if (theme.config.fontFamily === 'lora') fontsToLoad.push('Lora:wght@400;500;600;700')
    if (theme.config.fontFamily === 'montserrat') fontsToLoad.push('Montserrat:wght@400;500;600;700;800')
    if (theme.config.fontFamily === 'poppins') fontsToLoad.push('Poppins:wght@400;500;600;700')
    if (theme.config.fontFamily === 'inter') fontsToLoad.push('Inter:wght@400;500;600;700;800')

    if (fontsToLoad.length > 0) {
      const existingLink = document.getElementById('storefront-font-link')
      if (existingLink) existingLink.remove()
      const link = document.createElement('link')
      link.id = 'storefront-font-link'
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?${fontsToLoad.map(f => `family=${f}`).join('&')}&display=swap`
      document.head.appendChild(link)
    }

    return () => {
      // Cleanup on unmount or theme change
      const styleEl = document.getElementById('storefront-theme-override')
      if (styleEl) styleEl.remove()
      document.body.removeAttribute('data-storefront-theme')
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, loading, refetch: fetchTheme, layoutConfig: theme?.layoutConfig ?? null }}>
      {children}
    </ThemeContext.Provider>
  )
}
