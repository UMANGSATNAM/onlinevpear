// ─────────────────────────────────────────────────────────────────────────────
// ShopForge Theme Configuration System
// 10 CRO-optimized themes with distinct layouts, sections, and conversion features
// ─────────────────────────────────────────────────────────────────────────────

// ─── Union Types ────────────────────────────────────────────────────────────

export type HeroVariant =
  | 'split'
  | 'fullscreen'
  | 'parallax'
  | 'image-first'
  | 'slider'
  | 'video'
  | 'gradient'
  | 'carousel'
  | 'storytelling'
  | 'animated'

export type ProductCardVariant =
  | 'clean'
  | 'bold'
  | 'luxury'
  | 'soft'
  | 'warm'
  | 'wave'
  | 'glass'
  | 'boutique'
  | 'rustic'
  | 'neon'

export type HeaderVariant =
  | 'minimal'
  | 'fullwidth'
  | 'centered'
  | 'transparent'
  | 'sticky'
  | 'floating'
  | 'glass'
  | 'elegant'
  | 'banner'
  | 'fixed'

export type FooterVariant =
  | 'minimal'
  | 'full'
  | 'compact'
  | 'social'
  | 'newsletter-focus'

export type GridLayout =
  | '2-col'
  | '3-col'
  | '4-col'
  | 'masonry'
  | 'mixed'

export type SectionType =
  | 'hero'
  | 'trust-badges'
  | 'trending'
  | 'flash-sale'
  | 'brand-values'
  | 'collections'
  | 'categories'
  | 'products'
  | 'promo-banner'
  | 'testimonials'
  | 'newsletter'
  | 'social-proof'
  | 'recently-viewed'
  | 'instagram-feed'
  | 'lookbook'

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface SectionConfig {
  id: SectionType
  visible: boolean
  props?: Record<string, unknown>
}

export interface CROConfig {
  showUrgencyTimer: boolean
  showLiveViewers: boolean
  showRecentPurchases: boolean
  showLowStockWarning: boolean
  showTrustBadges: boolean
  showSocialProofCount: boolean
  stickyAddToCart: boolean
  urgencyMessage?: string
  lowStockThreshold: number
  viewerCountRange: [number, number]
}

export interface ThemeLayoutConfig {
  name: string
  heroVariant: HeroVariant
  productCardVariant: ProductCardVariant
  headerVariant: HeaderVariant
  footerVariant: FooterVariant
  gridLayout: GridLayout
  sections: SectionConfig[]
  cro: CROConfig
  // Visual / Copy
  heroTitle: string
  heroSubtitle: string
  heroCtaText: string
  heroCtaSecondary: string
  accentLineColors: string[]
  categoryCardStyle: 'gradient' | 'image' | 'minimal' | 'icon' | 'bordered'
  collectionCardStyle: 'gradient' | 'image' | 'overlay' | 'split' | 'minimal'
  testimonialStyle: 'cards' | 'slider' | 'minimal' | 'quote-wall'
  newsletterStyle: 'fullwidth' | 'card' | 'minimal' | 'popup'
  promoStyle: 'banner' | 'countdown' | 'split' | 'minimal'
  showInstagramFeed: boolean
  showLookbook: boolean
  animationIntensity: 'none' | 'subtle' | 'moderate' | 'high' | 'extreme'
}

// ─── Helper: Default Section Set ────────────────────────────────────────────

function makeSections(
  overrides: Partial<Record<SectionType, { visible?: boolean; props?: Record<string, unknown> }>> = {}
): SectionConfig[] {
  const defaults: SectionType[] = [
    'hero',
    'trust-badges',
    'trending',
    'flash-sale',
    'brand-values',
    'collections',
    'categories',
    'products',
    'promo-banner',
    'testimonials',
    'newsletter',
    'social-proof',
    'recently-viewed',
    'instagram-feed',
    'lookbook',
  ]
  return defaults.map((id) => {
    const o = overrides[id]
    return {
      id,
      visible: o?.visible ?? true,
      ...(o?.props ? { props: o.props } : {}),
    }
  })
}

// ─── 10 Theme Configurations ────────────────────────────────────────────────

const minimalDawn: ThemeLayoutConfig = {
  name: 'Minimal Dawn',
  heroVariant: 'split',
  productCardVariant: 'clean',
  headerVariant: 'minimal',
  footerVariant: 'minimal',
  gridLayout: '4-col',
  sections: makeSections({
    'flash-sale': { visible: false },
    'social-proof': { visible: false },
    'lookbook': { visible: false },
    'instagram-feed': { visible: false },
    hero: { props: { alignment: 'left', imagePosition: 'right', imageSize: 'medium' } },
    'trust-badges': { props: { style: 'minimal-icons', count: 4 } },
    trending: { props: { limit: 8, showRatings: true } },
    'brand-values': { props: { layout: 'row', iconStyle: 'outline' } },
    collections: { props: { limit: 3, style: 'clean-grid' } },
    categories: { props: { limit: 6, style: 'icon-grid' } },
    products: { props: { limit: 12, showQuickView: true } },
    'promo-banner': { props: { style: 'subtle', background: 'light' } },
    testimonials: { props: { limit: 3, style: 'minimal-cards' } },
    newsletter: { props: { style: 'inline', showName: false } },
    'recently-viewed': { props: { limit: 4 } },
  }),
  cro: {
    showUrgencyTimer: false,
    showLiveViewers: false,
    showRecentPurchases: false,
    showLowStockWarning: true,
    showTrustBadges: true,
    showSocialProofCount: true,
    stickyAddToCart: false,
    urgencyMessage: undefined,
    lowStockThreshold: 5,
    viewerCountRange: [0, 0],
  },
  heroTitle: 'Curated Essentials',
  heroSubtitle: 'Thoughtfully designed pieces for the modern lifestyle',
  heroCtaText: 'Shop Collection',
  heroCtaSecondary: 'Explore All',
  accentLineColors: ['#6366f1', '#818cf8'],
  categoryCardStyle: 'minimal',
  collectionCardStyle: 'minimal',
  testimonialStyle: 'minimal',
  newsletterStyle: 'minimal',
  promoStyle: 'minimal',
  showInstagramFeed: false,
  showLookbook: false,
  animationIntensity: 'subtle',
}

const boldCommerce: ThemeLayoutConfig = {
  name: 'Bold Commerce',
  heroVariant: 'fullscreen',
  productCardVariant: 'bold',
  headerVariant: 'sticky',
  footerVariant: 'full',
  gridLayout: '4-col',
  sections: makeSections({
    'instagram-feed': { visible: false },
    lookbook: { visible: false },
    'recently-viewed': { visible: false },
    hero: { props: { alignment: 'center', overlay: 'dark', fullHeight: true, parallax: false } },
    'trust-badges': { props: { style: 'bold-badges', count: 5 } },
    trending: { props: { limit: 8, showRatings: false, showBadges: true } },
    'flash-sale': { props: { countdownStyle: 'large', urgencyLevel: 'high', backgroundColor: 'red' } },
    'brand-values': { props: { layout: 'grid', iconStyle: 'filled' } },
    collections: { props: { limit: 4, style: 'bold-cards' } },
    categories: { props: { limit: 8, style: 'image-overlay' } },
    products: { props: { limit: 16, showQuickView: true, emphasizePrice: true } },
    'promo-banner': { props: { style: 'countdown-banner', urgency: true } },
    testimonials: { props: { limit: 6, style: 'video-thumbnails' } },
    newsletter: { props: { style: 'popup-timed', delaySeconds: 30, showDiscount: true } },
    'social-proof': { props: { showNotifications: true, notificationStyle: 'slide-in', interval: 8000 } },
  }),
  cro: {
    showUrgencyTimer: true,
    showLiveViewers: true,
    showRecentPurchases: true,
    showLowStockWarning: true,
    showTrustBadges: true,
    showSocialProofCount: true,
    stickyAddToCart: true,
    urgencyMessage: '🔥 Sale ends soon — don\'t miss out!',
    lowStockThreshold: 10,
    viewerCountRange: [12, 47],
  },
  heroTitle: 'Mega Sale Live Now',
  heroSubtitle: 'Up to 70% off on premium products — limited time only',
  heroCtaText: 'Shop the Sale',
  heroCtaSecondary: 'View Deals',
  accentLineColors: ['#ef4444', '#f97316'],
  categoryCardStyle: 'image',
  collectionCardStyle: 'overlay',
  testimonialStyle: 'slider',
  newsletterStyle: 'popup',
  promoStyle: 'countdown',
  showInstagramFeed: false,
  showLookbook: false,
  animationIntensity: 'moderate',
}

const elegantLuxe: ThemeLayoutConfig = {
  name: 'Elegant Luxe',
  heroVariant: 'parallax',
  productCardVariant: 'luxury',
  headerVariant: 'elegant',
  footerVariant: 'full',
  gridLayout: 'masonry',
  sections: makeSections({
    'flash-sale': { visible: false },
    'social-proof': { visible: false },
    hero: { props: { alignment: 'center', parallax: true, overlay: 'gradient-dark', typography: 'serif' } },
    'trust-badges': { props: { style: 'editorial', count: 3 } },
    trending: { props: { limit: 6, showRatings: false, editorial: true } },
    'brand-values': { props: { layout: 'editorial', iconStyle: 'line-art' } },
    collections: { props: { limit: 3, style: 'editorial-spread' } },
    categories: { props: { limit: 4, style: 'editorial-image' } },
    products: { props: { limit: 9, hoverZoom: true, showQuickView: false } },
    'promo-banner': { props: { style: 'elegant-split', background: 'dark' } },
    testimonials: { props: { limit: 4, style: 'editorial-quotes', showPhotos: true } },
    newsletter: { props: { style: 'card', showName: true, background: 'dark' } },
    'recently-viewed': { props: { limit: 4 } },
    'instagram-feed': { props: { columns: 4, gap: 'large', style: 'editorial' } },
    lookbook: { props: { layout: 'magazine-spread', columns: 2 } },
  }),
  cro: {
    showUrgencyTimer: false,
    showLiveViewers: false,
    showRecentPurchases: false,
    showLowStockWarning: true,
    showTrustBadges: true,
    showSocialProofCount: false,
    stickyAddToCart: false,
    urgencyMessage: undefined,
    lowStockThreshold: 3,
    viewerCountRange: [0, 0],
  },
  heroTitle: 'Timeless Elegance',
  heroSubtitle: 'Where craftsmanship meets sophistication',
  heroCtaText: 'Discover Collection',
  heroCtaSecondary: 'Read the Story',
  accentLineColors: ['#b8860b', '#daa520'],
  categoryCardStyle: 'image',
  collectionCardStyle: 'split',
  testimonialStyle: 'quote-wall',
  newsletterStyle: 'card',
  promoStyle: 'split',
  showInstagramFeed: true,
  showLookbook: true,
  animationIntensity: 'subtle',
}

const freshGarden: ThemeLayoutConfig = {
  name: 'Fresh Garden',
  heroVariant: 'image-first',
  productCardVariant: 'soft',
  headerVariant: 'centered',
  footerVariant: 'newsletter-focus',
  gridLayout: '3-col',
  sections: makeSections({
    'flash-sale': { visible: false },
    hero: { props: { alignment: 'center', imagePosition: 'top', organicShapes: true, botanicalOverlay: true } },
    'trust-badges': { props: { style: 'eco-badges', count: 4, badges: ['organic', 'cruelty-free', 'sustainable', 'eco-packaging'] } },
    trending: { props: { limit: 6, showRatings: true, showEcoBadge: true } },
    'brand-values': { props: { layout: 'organic-grid', iconStyle: 'nature', values: ['sustainable', 'natural', 'handcrafted', 'community'] } },
    collections: { props: { limit: 3, style: 'soft-cards', roundImages: true } },
    categories: { props: { limit: 6, style: 'icon-grid', iconStyle: 'botanical' } },
    products: { props: { limit: 9, showQuickView: true, showEcoLabels: true } },
    'promo-banner': { props: { style: 'nature-banner', background: 'gradient-green' } },
    testimonials: { props: { limit: 3, style: 'soft-cards', showAvatar: true } },
    newsletter: { props: { style: 'card', showName: true, background: 'nature' } },
    'social-proof': { props: { showCount: true, label: 'happy customers', style: 'soft' } },
    'recently-viewed': { props: { limit: 4, style: 'soft' } },
    'instagram-feed': { props: { columns: 3, gap: 'medium', style: 'botanical' } },
    lookbook: { visible: false },
  }),
  cro: {
    showUrgencyTimer: false,
    showLiveViewers: false,
    showRecentPurchases: false,
    showLowStockWarning: true,
    showTrustBadges: true,
    showSocialProofCount: true,
    stickyAddToCart: false,
    urgencyMessage: undefined,
    lowStockThreshold: 5,
    viewerCountRange: [0, 0],
  },
  heroTitle: 'Naturally Beautiful',
  heroSubtitle: 'Sustainably sourced products for a greener tomorrow',
  heroCtaText: 'Explore Organic',
  heroCtaSecondary: 'Our Story',
  accentLineColors: ['#22c55e', '#86efac'],
  categoryCardStyle: 'icon',
  collectionCardStyle: 'image',
  testimonialStyle: 'cards',
  newsletterStyle: 'card',
  promoStyle: 'banner',
  showInstagramFeed: true,
  showLookbook: false,
  animationIntensity: 'subtle',
}

const sunsetGlow: ThemeLayoutConfig = {
  name: 'Sunset Glow',
  heroVariant: 'slider',
  productCardVariant: 'warm',
  headerVariant: 'floating',
  footerVariant: 'social',
  gridLayout: '3-col',
  sections: makeSections({
    'flash-sale': { visible: false },
    'recently-viewed': { visible: false },
    hero: { props: { alignment: 'center', slides: 4, autoplay: true, interval: 5000, transition: 'fade', gradient: 'sunset' } },
    'trust-badges': { props: { style: 'warm-badges', count: 3 } },
    trending: { props: { limit: 6, showRatings: true, warmTones: true } },
    'brand-values': { props: { layout: 'storytelling', iconStyle: 'warm-filled' } },
    collections: { props: { limit: 3, style: 'warm-gradient' } },
    categories: { props: { limit: 6, style: 'gradient-cards' } },
    products: { props: { limit: 9, showQuickView: true, warmShadows: true } },
    'promo-banner': { props: { style: 'sunset-split', background: 'sunset-gradient' } },
    testimonials: { props: { limit: 4, style: 'story-cards', showPhotos: true } },
    newsletter: { props: { style: 'fullwidth', background: 'sunset' } },
    'social-proof': { props: { showNotifications: true, notificationStyle: 'warm-toast', interval: 10000 } },
    'instagram-feed': { props: { columns: 4, gap: 'small', style: 'warm' } },
    lookbook: { props: { layout: 'story-scroll', columns: 3 } },
  }),
  cro: {
    showUrgencyTimer: true,
    showLiveViewers: false,
    showRecentPurchases: true,
    showLowStockWarning: true,
    showTrustBadges: true,
    showSocialProofCount: true,
    stickyAddToCart: false,
    urgencyMessage: '☀️ Warm deals cooling down soon!',
    lowStockThreshold: 7,
    viewerCountRange: [0, 0],
  },
  heroTitle: 'Glow Up Your Style',
  heroSubtitle: 'Embrace the warmth of the season with our curated collection',
  heroCtaText: 'Start Exploring',
  heroCtaSecondary: 'Watch Lookbook',
  accentLineColors: ['#f97316', '#fb923c'],
  categoryCardStyle: 'gradient',
  collectionCardStyle: 'gradient',
  testimonialStyle: 'cards',
  newsletterStyle: 'fullwidth',
  promoStyle: 'split',
  showInstagramFeed: true,
  showLookbook: true,
  animationIntensity: 'moderate',
}

const oceanBreeze: ThemeLayoutConfig = {
  name: 'Ocean Breeze',
  heroVariant: 'video',
  productCardVariant: 'wave',
  headerVariant: 'transparent',
  footerVariant: 'compact',
  gridLayout: 'mixed',
  sections: makeSections({
    'flash-sale': { visible: false },
    hero: { props: { alignment: 'center', videoStyle: 'ambient', overlay: 'blue-tint', fallback: 'ocean-image', fluidShapes: true } },
    'trust-badges': { props: { style: 'coastal-badges', count: 4, badges: ['free-shipping', 'easy-returns', 'secure', 'quality'] } },
    trending: { props: { limit: 8, showRatings: true, fluidLayout: true } },
    'brand-values': { props: { layout: 'wave', iconStyle: 'filled-blue' } },
    collections: { props: { limit: 3, style: 'wave-cards', fluid: true } },
    categories: { props: { limit: 6, style: 'fluid-cards', roundEdges: true } },
    products: { props: { limit: 12, showQuickView: true, waveHover: true } },
    'promo-banner': { props: { style: 'ocean-banner', background: 'wave-gradient' } },
    testimonials: { props: { limit: 4, style: 'floating-cards', showAvatar: true } },
    newsletter: { props: { style: 'card', background: 'ocean', showName: false } },
    'social-proof': { props: { showCount: true, label: 'happy swimmers', style: 'wave' } },
    'recently-viewed': { props: { limit: 4, style: 'wave' } },
    'instagram-feed': { props: { columns: 4, gap: 'medium', style: 'coastal' } },
    lookbook: { props: { layout: 'fluid-gallery', columns: 3 } },
  }),
  cro: {
    showUrgencyTimer: false,
    showLiveViewers: false,
    showRecentPurchases: false,
    showLowStockWarning: true,
    showTrustBadges: true,
    showSocialProofCount: true,
    stickyAddToCart: false,
    urgencyMessage: undefined,
    lowStockThreshold: 5,
    viewerCountRange: [0, 0],
  },
  heroTitle: 'Dive Into Fresh',
  heroSubtitle: 'Breeze through our collection of coastal-inspired essentials',
  heroCtaText: 'Discover More',
  heroCtaSecondary: 'New Arrivals',
  accentLineColors: ['#0ea5e9', '#38bdf8'],
  categoryCardStyle: 'gradient',
  collectionCardStyle: 'overlay',
  testimonialStyle: 'slider',
  newsletterStyle: 'card',
  promoStyle: 'banner',
  showInstagramFeed: true,
  showLookbook: true,
  animationIntensity: 'moderate',
}

const midnightElite: ThemeLayoutConfig = {
  name: 'Midnight Elite',
  heroVariant: 'gradient',
  productCardVariant: 'glass',
  headerVariant: 'glass',
  footerVariant: 'compact',
  gridLayout: '4-col',
  sections: makeSections({
    'flash-sale': { visible: false },
    lookbook: { visible: false },
    hero: { props: { alignment: 'center', gradientStyle: 'dark-neon', particles: true, glowEffect: true } },
    'trust-badges': { props: { style: 'tech-badges', count: 4, badges: ['encrypted', 'fast-delivery', '24-7-support', 'warranty'] } },
    trending: { props: { limit: 8, showRatings: true, glassmorphism: true } },
    'brand-values': { props: { layout: 'tech-grid', iconStyle: 'neon' } },
    collections: { props: { limit: 3, style: 'glass-cards', glow: true } },
    categories: { props: { limit: 6, style: 'glass-panels', blur: true } },
    products: { props: { limit: 12, showQuickView: true, glassHover: true, glowPrice: true } },
    'promo-banner': { props: { style: 'neon-banner', background: 'dark-gradient', glowBorder: true } },
    testimonials: { props: { limit: 4, style: 'glass-cards', darkMode: true } },
    newsletter: { props: { style: 'minimal', background: 'dark', glowButton: true } },
    'social-proof': { props: { showLiveViewers: true, showNotifications: true, notificationStyle: 'neon-toast', interval: 7000 } },
    'recently-viewed': { props: { limit: 4, style: 'glass' } },
    'instagram-feed': { props: { columns: 4, gap: 'small', style: 'dark-grid' } },
  }),
  cro: {
    showUrgencyTimer: false,
    showLiveViewers: true,
    showRecentPurchases: true,
    showLowStockWarning: true,
    showTrustBadges: true,
    showSocialProofCount: true,
    stickyAddToCart: true,
    urgencyMessage: undefined,
    lowStockThreshold: 5,
    viewerCountRange: [18, 62],
  },
  heroTitle: 'Future of Shopping',
  heroSubtitle: 'Cutting-edge tech meets premium quality',
  heroCtaText: 'Enter Store',
  heroCtaSecondary: 'Tech Specs',
  accentLineColors: ['#8b5cf6', '#a78bfa'],
  categoryCardStyle: 'gradient',
  collectionCardStyle: 'overlay',
  testimonialStyle: 'cards',
  newsletterStyle: 'minimal',
  promoStyle: 'banner',
  showInstagramFeed: true,
  showLookbook: false,
  animationIntensity: 'high',
}

const roseBoutique: ThemeLayoutConfig = {
  name: 'Rose Boutique',
  heroVariant: 'carousel',
  productCardVariant: 'boutique',
  headerVariant: 'centered',
  footerVariant: 'newsletter-focus',
  gridLayout: '3-col',
  sections: makeSections({
    'flash-sale': { visible: false },
    hero: { props: { alignment: 'center', carouselStyle: 'fade', dots: true, arrows: true, autoplay: true, interval: 4000, editorial: true } },
    'trust-badges': { props: { style: 'boutique-badges', count: 3, badges: ['handmade', 'curated', 'premium'] } },
    trending: { props: { limit: 6, showRatings: true, editorial: true } },
    'brand-values': { props: { layout: 'elegant-row', iconStyle: 'fashion', values: ['curated', 'exclusive', 'personalized', 'premium'] } },
    collections: { props: { limit: 4, style: 'editorial-cards', hoverReveal: true } },
    categories: { props: { limit: 6, style: 'image-overlay', roundCorners: true } },
    products: { props: { limit: 9, showQuickView: true, boutiqueHover: true, showColorSwatches: true } },
    'promo-banner': { props: { style: 'fashion-banner', background: 'rose-gradient' } },
    testimonials: { props: { limit: 4, style: 'editorial-quotes', showPhotos: true, showNames: true } },
    newsletter: { props: { style: 'card', background: 'rose', showName: true, incentive: '15% off first order' } },
    'social-proof': { props: { showNotifications: true, notificationStyle: 'elegant-toast', interval: 12000 } },
    'recently-viewed': { props: { limit: 4, style: 'boutique' } },
    'instagram-feed': { props: { columns: 4, gap: 'small', style: 'editorial-grid' } },
    lookbook: { props: { layout: 'fashion-spread', columns: 2 } },
  }),
  cro: {
    showUrgencyTimer: false,
    showLiveViewers: false,
    showRecentPurchases: true,
    showLowStockWarning: true,
    showTrustBadges: true,
    showSocialProofCount: true,
    stickyAddToCart: false,
    urgencyMessage: undefined,
    lowStockThreshold: 3,
    viewerCountRange: [0, 0],
  },
  heroTitle: 'Style Redefined',
  heroSubtitle: 'Handpicked fashion for the discerning taste',
  heroCtaText: 'Shop New Arrivals',
  heroCtaSecondary: 'View Lookbook',
  accentLineColors: ['#e11d48', '#fb7185'],
  categoryCardStyle: 'image',
  collectionCardStyle: 'image',
  testimonialStyle: 'slider',
  newsletterStyle: 'card',
  promoStyle: 'split',
  showInstagramFeed: true,
  showLookbook: true,
  animationIntensity: 'moderate',
}

const rusticCharm: ThemeLayoutConfig = {
  name: 'Rustic Charm',
  heroVariant: 'storytelling',
  productCardVariant: 'rustic',
  headerVariant: 'banner',
  footerVariant: 'full',
  gridLayout: '2-col',
  sections: makeSections({
    'flash-sale': { visible: false },
    'social-proof': { visible: false },
    hero: { props: { alignment: 'left', storyStyle: 'scroll', vintageOverlay: true, textureBackground: true, typography: 'serif' } },
    'trust-badges': { props: { style: 'rustic-stamps', count: 3, badges: ['handmade', 'small-batch', 'family-owned'] } },
    trending: { props: { limit: 6, showRatings: true, vintageStyle: true } },
    'brand-values': { props: { layout: 'story-cards', iconStyle: 'hand-drawn', values: ['heritage', 'craftsmanship', 'community', 'tradition'] } },
    collections: { props: { limit: 3, style: 'rustic-cards', bordered: true, texture: 'kraft' } },
    categories: { props: { limit: 4, style: 'bordered', iconStyle: 'hand-drawn' } },
    products: { props: { limit: 8, showQuickView: false, borderedCards: true, showOrigin: true } },
    'promo-banner': { props: { style: 'kraft-banner', background: 'kraft-texture', border: 'double' } },
    testimonials: { props: { limit: 3, style: 'quote-cards', showLocation: true, serif: true } },
    newsletter: { props: { style: 'card', background: 'kraft', showName: true, buttonStyle: 'vintage' } },
    'recently-viewed': { props: { limit: 4, style: 'rustic' } },
    'instagram-feed': { props: { columns: 3, gap: 'medium', style: 'vintage-filter' } },
    lookbook: { props: { layout: 'scrapbook', columns: 2, texture: true } },
  }),
  cro: {
    showUrgencyTimer: false,
    showLiveViewers: false,
    showRecentPurchases: false,
    showLowStockWarning: true,
    showTrustBadges: true,
    showSocialProofCount: false,
    stickyAddToCart: false,
    urgencyMessage: undefined,
    lowStockThreshold: 4,
    viewerCountRange: [0, 0],
  },
  heroTitle: 'Crafted With Heart',
  heroSubtitle: 'Every piece tells a story of tradition and craftsmanship',
  heroCtaText: 'Browse Handmades',
  heroCtaSecondary: 'Our Heritage',
  accentLineColors: ['#92400e', '#b45309'],
  categoryCardStyle: 'bordered',
  collectionCardStyle: 'image',
  testimonialStyle: 'cards',
  newsletterStyle: 'card',
  promoStyle: 'banner',
  showInstagramFeed: true,
  showLookbook: true,
  animationIntensity: 'none',
}

const neonPulse: ThemeLayoutConfig = {
  name: 'Neon Pulse',
  heroVariant: 'animated',
  productCardVariant: 'neon',
  headerVariant: 'fixed',
  footerVariant: 'compact',
  gridLayout: '4-col',
  sections: makeSections({
    hero: { props: { alignment: 'center', animationStyle: 'glitch-pulse', neonBorder: true, particles: true, soundwave: true, gaming: true } },
    'trust-badges': { props: { style: 'neon-badges', count: 4, badges: ['instant-delivery', 'secure-checkout', '24-7-support', 'money-back'], glow: true } },
    trending: { props: { limit: 8, showRatings: true, neonCards: true, glow: true } },
    'flash-sale': { props: { countdownStyle: 'neon', urgencyLevel: 'extreme', backgroundColor: 'dark', glowBorder: true, neonColors: true } },
    'brand-values': { props: { layout: 'neon-grid', iconStyle: 'neon-glow' } },
    collections: { props: { limit: 4, style: 'neon-cards', glowBorder: true } },
    categories: { props: { limit: 8, style: 'neon-panels', darkMode: true } },
    products: { props: { limit: 16, showQuickView: true, neonHover: true, glowPrice: true, darkMode: true } },
    'promo-banner': { props: { style: 'neon-flash', background: 'dark', glowBorder: true, animated: true } },
    testimonials: { props: { limit: 4, style: 'neon-cards', darkMode: true, glowAccent: true } },
    newsletter: { props: { style: 'minimal', background: 'dark', glowButton: true, incentive: 'Unlock exclusive drops' } },
    'social-proof': { props: { showLiveViewers: true, showNotifications: true, notificationStyle: 'neon-alert', interval: 5000 } },
    'recently-viewed': { props: { limit: 4, style: 'neon' } },
    'instagram-feed': { props: { columns: 4, gap: 'small', style: 'neon-grid' } },
    lookbook: { visible: false },
  }),
  cro: {
    showUrgencyTimer: true,
    showLiveViewers: true,
    showRecentPurchases: true,
    showLowStockWarning: true,
    showTrustBadges: true,
    showSocialProofCount: true,
    stickyAddToCart: true,
    urgencyMessage: '⚡ Flash drop ending in — grab yours NOW!',
    lowStockThreshold: 8,
    viewerCountRange: [24, 89],
  },
  heroTitle: 'Level Up Your Game',
  heroSubtitle: 'Premium gear for gamers who refuse to compromise',
  heroCtaText: 'Shop Gear',
  heroCtaSecondary: 'New Drops',
  accentLineColors: ['#06b6d4', '#22d3ee'],
  categoryCardStyle: 'gradient',
  collectionCardStyle: 'overlay',
  testimonialStyle: 'cards',
  newsletterStyle: 'minimal',
  promoStyle: 'countdown',
  showInstagramFeed: true,
  showLookbook: false,
  animationIntensity: 'extreme',
}

// ─── Exported Config Map ────────────────────────────────────────────────────

export const THEME_CONFIGS: Record<string, ThemeLayoutConfig> = {
  'minimal-dawn': minimalDawn,
  'bold-commerce': boldCommerce,
  'elegant-luxe': elegantLuxe,
  'fresh-garden': freshGarden,
  'sunset-glow': sunsetGlow,
  'ocean-breeze': oceanBreeze,
  'midnight-elite': midnightElite,
  'rose-boutique': roseBoutique,
  'rustic-charm': rusticCharm,
  'neon-pulse': neonPulse,
}

// ─── Helper: Get Config With Fallback ───────────────────────────────────────

const DEFAULT_THEME_KEY = 'minimal-dawn'

export function getThemeConfig(themeName: string): ThemeLayoutConfig {
  return THEME_CONFIGS[themeName] ?? THEME_CONFIGS[DEFAULT_THEME_KEY]!
}

// ─── Convenience: Theme Key List ────────────────────────────────────────────

export const THEME_KEYS = Object.keys(THEME_CONFIGS) as readonly string[]

export const THEME_NAMES = Object.values(THEME_CONFIGS).map((t) => t.name) as readonly string[]
