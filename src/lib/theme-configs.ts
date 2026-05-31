// ─────────────────────────────────────────────────────────────────────────────
// Online Vepar — Theme Configuration System
// 5 CRO-optimized themes for the Indian ecommerce market
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

// ─── THEME 1: LUMIA — Luxury Jewellery ─────────────────────────────────────
// Palette: Champagne gold (#D4AF37), deep black (#0D0D0D), ivory (#F8F4EE)
// Fonts: "Cormorant Garamond" (editorial serif) + "Montserrat" (uppercase nav)
// Style: Editorial, full-bleed photography, dramatic negative space, minimal chrome

const lumia: ThemeLayoutConfig = {
  name: 'Lumia',
  heroVariant: 'carousel',
  productCardVariant: 'luxury',
  headerVariant: 'elegant',
  footerVariant: 'full',
  gridLayout: 'masonry',
  sections: makeSections({
    'flash-sale': { visible: false },
    'social-proof': { visible: false },
    hero: {
      props: {
        alignment: 'center',
        carouselStyle: 'editorial-fade',
        fullBleed: true,
        overlay: 'gradient-dark',
        typography: 'serif',
        imageFill: true,
        negativeSpace: 'dramatic',
        autoplay: true,
        interval: 6000,
        crossfadeDuration: 600,
      },
    },
    'trust-badges': {
      props: {
        style: 'certification-badges',
        count: 4,
        badges: ['gia-certified', 'hallmarked', 'insured-delivery', 'lifetime-warranty'],
        layout: 'centered',
        goldAccents: true,
      },
    },
    trending: {
      props: {
        limit: 6,
        showRatings: false,
        editorial: true,
        layout: 'editorial-spread',
        hoverReveal: true,
        crossfadeSpeed: 600,
      },
    },
    'brand-values': {
      props: {
        layout: 'editorial-row',
        iconStyle: 'line-art-gold',
        values: ['heritage', 'craftsmanship', 'certified', 'bespoke'],
        minimalChrome: true,
      },
    },
    collections: {
      props: {
        limit: 3,
        style: 'editorial-spread',
        fullBleed: true,
        hoverReveal: true,
        typography: 'serif',
      },
    },
    categories: {
      props: {
        limit: 4,
        style: 'editorial-image',
        largeImages: true,
        minimalLabels: true,
      },
    },
    products: {
      props: {
        limit: 9,
        hoverZoom: true,
        showQuickView: false,
        crossfadeOnHover: true,
        crossfadeDuration: 600,
        minimalTextOverlay: true,
        showCertificationBadge: true,
        showDeliveryEstimator: true,
      },
    },
    'promo-banner': {
      props: {
        style: 'elegant-split',
        background: 'dark',
        goldAccent: true,
        serif: true,
      },
    },
    testimonials: {
      props: {
        limit: 4,
        style: 'editorial-quotes',
        showPhotos: true,
        serif: true,
        darkElegant: true,
      },
    },
    newsletter: {
      props: {
        style: 'card',
        background: 'dark',
        showName: true,
        goldButton: true,
        incentive: 'First access to new collections',
      },
    },
    'recently-viewed': {
      props: {
        limit: 4,
        style: 'editorial',
        minimalChrome: true,
      },
    },
    'instagram-feed': {
      props: {
        columns: 4,
        gap: 'large',
        style: 'editorial',
        quality: 'high',
      },
    },
    lookbook: {
      props: {
        layout: 'magazine-spread',
        columns: 2,
        fullBleed: true,
        serif: true,
      },
    },
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
  heroTitle: 'Timeless Radiance',
  heroSubtitle: 'Exquisite jewellery crafted for moments that last forever',
  heroCtaText: 'Discover Collection',
  heroCtaSecondary: 'Our Heritage',
  accentLineColors: ['#D4AF37', '#F5E6A3'],
  categoryCardStyle: 'image',
  collectionCardStyle: 'split',
  testimonialStyle: 'quote-wall',
  newsletterStyle: 'card',
  promoStyle: 'split',
  showInstagramFeed: true,
  showLookbook: true,
  animationIntensity: 'subtle',
}

// ─── THEME 2: BLAZE — D2C Fashion / Streetwear ─────────────────────────────
// Palette: Electric yellow (#FFE600), black (#000000), white (#FFFFFF)
// Fonts: "Archivo Black" (brutalist display) + "Barlow" (body)
// Style: Bold typography-first, brutalist grid, high contrast, motion-heavy

const blaze: ThemeLayoutConfig = {
  name: 'Blaze',
  heroVariant: 'animated',
  productCardVariant: 'bold',
  headerVariant: 'sticky',
  footerVariant: 'compact',
  gridLayout: '4-col',
  sections: makeSections({
    'instagram-feed': { visible: false },
    lookbook: { visible: false },
    'recently-viewed': { visible: false },
    hero: {
      props: {
        alignment: 'center',
        animationStyle: 'marquee-ticker',
        neonBorder: true,
        showCountdown: true,
        showMarquee: true,
        marqueeText: 'NEW DROP ⚡ FREE SHIPPING ⚡ LIMITED EDITION',
        brutalist: true,
        highContrast: true,
        yellowAccent: true,
        featureLabel: 'NEW DROP',
      },
    },
    'trust-badges': {
      props: {
        style: 'brutalist-badges',
        count: 4,
        badges: ['free-shipping', 'easy-returns', 'authentic', 'secure'],
        highContrast: true,
        yellowAccents: true,
      },
    },
    trending: {
      props: {
        limit: 8,
        showRatings: false,
        showBadges: true,
        realTimeStock: true,
        brutalist: true,
      },
    },
    'flash-sale': {
      props: {
        countdownStyle: 'large-brutalist',
        urgencyLevel: 'extreme',
        backgroundColor: 'yellow',
        animatedStrikethrough: true,
        flashSaleLabel: 'FLASH DROP',
      },
    },
    'brand-values': {
      props: {
        layout: 'brutalist-grid',
        iconStyle: 'filled-high-contrast',
        values: ['authentic', 'limited', 'street', 'bold'],
      },
    },
    collections: {
      props: {
        limit: 4,
        style: 'bold-cards',
        highContrast: true,
        animatedBorders: true,
      },
    },
    categories: {
      props: {
        limit: 8,
        style: 'image-overlay',
        bold: true,
        yellowHover: true,
      },
    },
    products: {
      props: {
        limit: 16,
        showQuickView: true,
        emphasizePrice: true,
        realTimeStockCounter: true,
        animatedAddToCart: true,
        stockLabel: 'Only {count} left!',
        brutalist: true,
        animatedStrikethrough: true,
      },
    },
    'promo-banner': {
      props: {
        style: 'countdown-banner',
        urgency: true,
        highContrast: true,
        animatedText: true,
        yellowAccent: true,
      },
    },
    testimonials: {
      props: {
        limit: 4,
        style: 'bold-cards',
        highContrast: true,
        streetStyle: true,
      },
    },
    newsletter: {
      props: {
        style: 'popup-timed',
        delaySeconds: 20,
        showDiscount: true,
        discountLabel: '10% OFF FIRST DROP',
        brutalist: true,
      },
    },
    'social-proof': {
      props: {
        showNotifications: true,
        showLiveViewers: true,
        notificationStyle: 'slide-in-bold',
        interval: 6000,
        liveViewerLabel: 'people shopping now',
      },
    },
  }),
  cro: {
    showUrgencyTimer: true,
    showLiveViewers: true,
    showRecentPurchases: true,
    showLowStockWarning: true,
    showTrustBadges: true,
    showSocialProofCount: true,
    stickyAddToCart: true,
    urgencyMessage: '⚡ DROP ENDING SOON — grab yours before it\'s gone!',
    lowStockThreshold: 5,
    viewerCountRange: [15, 65],
  },
  heroTitle: 'NEW DROP LIVE',
  heroSubtitle: 'Limited edition streetwear — once it\'s gone, it\'s gone',
  heroCtaText: 'Shop the Drop',
  heroCtaSecondary: 'See Lookbook',
  accentLineColors: ['#FFE600', '#FFD000'],
  categoryCardStyle: 'image',
  collectionCardStyle: 'overlay',
  testimonialStyle: 'cards',
  newsletterStyle: 'popup',
  promoStyle: 'countdown',
  showInstagramFeed: false,
  showLookbook: false,
  animationIntensity: 'extreme',
}

// ─── THEME 3: GLOW — Beauty & Skincare ─────────────────────────────────────
// Palette: Blush rose (#F4B8C1), sage green (#A8C5A0), cream (#FFF9F5)
// Fonts: "Playfair Display" (elegant serif titles) + "Nunito" (friendly body)
// Style: Soft, feminine, science-backed trust signals, ingredient-forward

const glow: ThemeLayoutConfig = {
  name: 'Glow',
  heroVariant: 'slider',
  productCardVariant: 'soft',
  headerVariant: 'centered',
  footerVariant: 'newsletter-focus',
  gridLayout: '3-col',
  sections: makeSections({
    'flash-sale': { visible: false },
    hero: {
      props: {
        alignment: 'center',
        sliderStyle: 'before-after',
        showQuizCTA: true,
        ingredientSpotlight: true,
        softTransitions: true,
        slides: 4,
        autoplay: true,
        interval: 5000,
        transition: 'soft-fade',
        blushOverlay: true,
      },
    },
    'trust-badges': {
      props: {
        style: 'dermatologist-badges',
        count: 4,
        badges: ['dermatologist-tested', 'cruelty-free', 'clean-beauty', 'paraben-free'],
        softColors: true,
        showIcons: true,
      },
    },
    trending: {
      props: {
        limit: 8,
        showRatings: true,
        showIngredientBadge: true,
        softStyle: true,
        skinTypeLabels: true,
      },
    },
    'brand-values': {
      props: {
        layout: 'organic-grid',
        iconStyle: 'soft-filled',
        values: ['science-backed', 'clean-ingredients', 'dermatologist-approved', 'sustainable'],
        roundedCards: true,
      },
    },
    collections: {
      props: {
        limit: 4,
        style: 'soft-cards',
        roundImages: true,
        skinConcernLabels: true,
      },
    },
    categories: {
      props: {
        limit: 6,
        style: 'soft-gradient',
        skinTypeCategories: true,
        roundEdges: true,
      },
    },
    products: {
      props: {
        limit: 12,
        showQuickView: true,
        softRounded: true,
        showIngredientHighlights: true,
        showSkinTypeCompatibility: true,
        showDermatologistQuote: true,
      },
    },
    'promo-banner': {
      props: {
        style: 'soft-blush',
        background: 'blush-gradient',
        roundEdges: true,
      },
    },
    testimonials: {
      props: {
        limit: 6,
        style: 'soft-cards',
        showAvatar: true,
        showSkinType: true,
        beforeAfter: true,
        dermatologistQuotes: true,
      },
    },
    newsletter: {
      props: {
        style: 'card',
        showName: true,
        showSkinQuiz: true,
        background: 'blush',
        incentive: 'Personalized routine',
        routineBuilder: true,
      },
    },
    'social-proof': {
      props: {
        showCount: true,
        label: 'glowing skin stories',
        style: 'soft-toast',
        interval: 10000,
        showIngredientTrust: true,
      },
    },
    'recently-viewed': {
      props: {
        limit: 4,
        style: 'soft',
        showSkinMatch: true,
      },
    },
    'instagram-feed': {
      props: {
        columns: 3,
        gap: 'medium',
        style: 'beauty-grid',
        roundEdges: true,
      },
    },
    lookbook: {
      props: {
        layout: 'routine-builder',
        columns: 3,
        showSteps: true,
        skinRoutine: true,
      },
    },
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
    lowStockThreshold: 5,
    viewerCountRange: [0, 0],
  },
  heroTitle: 'Glow From Within',
  heroSubtitle: 'Science-backed skincare for every skin story',
  heroCtaText: 'Take the Skin Quiz',
  heroCtaSecondary: 'Shop Bestsellers',
  accentLineColors: ['#F4B8C1', '#A8C5A0'],
  categoryCardStyle: 'gradient',
  collectionCardStyle: 'image',
  testimonialStyle: 'cards',
  newsletterStyle: 'card',
  promoStyle: 'banner',
  showInstagramFeed: true,
  showLookbook: true,
  animationIntensity: 'moderate',
}

// ─── THEME 4: BOLT — Electronics & Gadgets ─────────────────────────────────
// Palette: Deep navy (#0F1629), electric blue (#0EA5E9), silver (#CBD5E1)
// Fonts: "Oxanium" (tech/gaming display) + "IBM Plex Sans" (spec-sheet body)
// Style: Dark, technical, spec-sheet data density, glowing blue accents

const bolt: ThemeLayoutConfig = {
  name: 'Bolt',
  heroVariant: 'gradient',
  productCardVariant: 'neon',
  headerVariant: 'glass',
  footerVariant: 'minimal',
  gridLayout: 'mixed',
  sections: makeSections({
    'instagram-feed': { visible: false },
    lookbook: { visible: false },
    hero: {
      props: {
        alignment: 'center',
        gradientStyle: 'dark-tech',
        floating3DProduct: true,
        featureComparisonTable: true,
        specHighlights: true,
        particles: true,
        glowEffect: true,
        blueAccent: true,
        darkBackground: true,
      },
    },
    'trust-badges': {
      props: {
        style: 'tech-warranty-badges',
        count: 5,
        badges: ['1-year-warranty', 'emi-available', 'free-delivery', 'genuine-products', 'easy-returns'],
        darkMode: true,
        glowAccents: true,
      },
    },
    trending: {
      props: {
        limit: 8,
        showRatings: true,
        darkMode: true,
        showSpecs: true,
        techStyle: true,
      },
    },
    'flash-sale': {
      props: {
        countdownStyle: 'digital',
        urgencyLevel: 'high',
        backgroundColor: 'dark-navy',
        glowBorder: true,
        techDeals: true,
        showEmiPrice: true,
      },
    },
    'brand-values': {
      props: {
        layout: 'tech-grid',
        iconStyle: 'neon-glow',
        values: ['performance', 'innovation', 'value', 'support'],
        darkMode: true,
      },
    },
    collections: {
      props: {
        limit: 4,
        style: 'dark-glass-cards',
        glow: true,
        darkMode: true,
        showSpecPreview: true,
      },
    },
    categories: {
      props: {
        limit: 8,
        style: 'dark-tech-panels',
        darkMode: true,
        showSpecIcons: true,
        blueAccents: true,
      },
    },
    products: {
      props: {
        limit: 12,
        showQuickView: true,
        darkCards: true,
        showSpecTable: true,
        showEmiCalculator: true,
        showCompareVsCompetitor: true,
        showWarrantyInfo: true,
        glowPrice: true,
        neonHover: true,
      },
    },
    'promo-banner': {
      props: {
        style: 'tech-deal-banner',
        background: 'dark-gradient',
        glowBorder: true,
        showEmi: true,
        blueAccent: true,
      },
    },
    testimonials: {
      props: {
        limit: 4,
        style: 'dark-tech-cards',
        darkMode: true,
        reviewAggregator: true,
        showRatingBreakdown: true,
      },
    },
    newsletter: {
      props: {
        style: 'minimal',
        background: 'dark',
        glowButton: true,
        incentive: 'Early access to tech deals',
        techStyle: true,
      },
    },
    'social-proof': {
      props: {
        showLiveViewers: true,
        showNotifications: true,
        notificationStyle: 'tech-toast',
        interval: 7000,
        showCompatibility: true,
      },
    },
    'recently-viewed': {
      props: {
        limit: 4,
        style: 'dark-glass',
        showSpecs: true,
      },
    },
  }),
  cro: {
    showUrgencyTimer: true,
    showLiveViewers: true,
    showRecentPurchases: true,
    showLowStockWarning: true,
    showTrustBadges: true,
    showSocialProofCount: true,
    stickyAddToCart: true,
    urgencyMessage: '⚡ Deal expires in — compare specs & save big!',
    lowStockThreshold: 8,
    viewerCountRange: [20, 75],
  },
  heroTitle: 'Power Up Your Setup',
  heroSubtitle: 'Cutting-edge tech with specs that speak for themselves',
  heroCtaText: 'Explore Tech',
  heroCtaSecondary: 'Compare Specs',
  accentLineColors: ['#0EA5E9', '#38BDF8'],
  categoryCardStyle: 'gradient',
  collectionCardStyle: 'overlay',
  testimonialStyle: 'slider',
  newsletterStyle: 'minimal',
  promoStyle: 'countdown',
  showInstagramFeed: false,
  showLookbook: false,
  animationIntensity: 'high',
}

// ─── THEME 5: BAZAAR — Multi-Category Indian Market ────────────────────────
// Palette: Saffron (#FF9500), deep teal (#0D9488), off-white (#FAFAF9)
// Fonts: "Mukta" (Devanagari + Latin, India-optimized) + "Lato" (body)
// Style: Vibrant, high energy, flash-sale ready, category-grid focused, India-first

const bazaar: ThemeLayoutConfig = {
  name: 'Bazaar',
  heroVariant: 'fullscreen',
  productCardVariant: 'warm',
  headerVariant: 'fullwidth',
  footerVariant: 'social',
  gridLayout: '2-col',
  sections: makeSections({
    'instagram-feed': { visible: false },
    lookbook: { visible: false },
    hero: {
      props: {
        alignment: 'center',
        overlay: 'saffron-gradient',
        fullHeight: true,
        flashSaleHero: true,
        liveCountdown: true,
        scrollableCategoryGrid: true,
        categoryCount: 12,
        trendingNow: true,
        saffronAccent: true,
        indiaFirst: true,
      },
    },
    'trust-badges': {
      props: {
        style: 'india-trust-badges',
        count: 5,
        badges: ['cod-available', 'pan-india-delivery', 'genuine-products', 'easy-returns', 'secure-payment'],
        vibrant: true,
        showCodBadge: true,
      },
    },
    trending: {
      props: {
        limit: 10,
        showRatings: true,
        priceForward: true,
        showMrpStrikethrough: true,
        showCodBadge: true,
        vibrant: true,
      },
    },
    'flash-sale': {
      props: {
        countdownStyle: 'indian-festival',
        urgencyLevel: 'extreme',
        backgroundColor: 'saffron-gradient',
        colorTransition: 'green-amber-red',
        showMrpStrikethrough: true,
        bulkPricing: true,
        regionalLanguage: true,
        festivalLabel: 'MEGA SALE',
      },
    },
    'brand-values': {
      props: {
        layout: 'vibrant-grid',
        iconStyle: 'colorful-filled',
        values: ['value-for-money', 'cod-available', 'pan-india', 'trusted-seller'],
        vibrant: true,
      },
    },
    collections: {
      props: {
        limit: 6,
        style: 'vibrant-cards',
        categoryGrid: true,
        highEnergy: true,
        saffronAccents: true,
      },
    },
    categories: {
      props: {
        limit: 12,
        style: 'vibrant-grid',
        scrollable: true,
        showProductCount: true,
        colorfulIcons: true,
        indiaCategories: true,
      },
    },
    products: {
      props: {
        limit: 16,
        showQuickView: true,
        priceForward: true,
        showMrpStrikethrough: true,
        showCodBadge: true,
        showPincodeChecker: true,
        showEmiBreakdown: true,
        showQA: true,
        showBulkPricing: true,
        warmShadows: true,
      },
    },
    'promo-banner': {
      props: {
        style: 'indian-festival-banner',
        background: 'saffron-teal-gradient',
        flashSaleTimer: true,
        colorTransition: 'green-amber-red',
        vibrant: true,
      },
    },
    testimonials: {
      props: {
        limit: 6,
        style: 'vibrant-cards',
        showLocation: true,
        showVerifiedPurchase: true,
        indianNames: true,
      },
    },
    newsletter: {
      props: {
        style: 'fullwidth',
        background: 'teal-gradient',
        showName: true,
        showPhone: true,
        incentive: '₹200 off on first order',
        vibrant: true,
      },
    },
    'social-proof': {
      props: {
        showLiveViewers: true,
        showNotifications: true,
        notificationStyle: 'indian-toast',
        interval: 5000,
        liveViewerLabel: 'people viewing this right now',
        regionalLanguage: true,
        showBulkBuyers: true,
      },
    },
    'recently-viewed': {
      props: {
        limit: 4,
        style: 'warm',
        showMrpStrikethrough: true,
      },
    },
  }),
  cro: {
    showUrgencyTimer: true,
    showLiveViewers: true,
    showRecentPurchases: true,
    showLowStockWarning: true,
    showTrustBadges: true,
    showSocialProofCount: true,
    stickyAddToCart: true,
    urgencyMessage: '🔥 Flash Sale LIVE — Prices drop every hour!',
    lowStockThreshold: 10,
    viewerCountRange: [25, 120],
  },
  heroTitle: 'Mega Sale Live Now!',
  heroSubtitle: 'India\'s favourite deals — Fashion, Electronics, Home & more',
  heroCtaText: 'Shop the Sale',
  heroCtaSecondary: 'Explore Categories',
  accentLineColors: ['#FF9500', '#0D9488'],
  categoryCardStyle: 'gradient',
  collectionCardStyle: 'gradient',
  testimonialStyle: 'cards',
  newsletterStyle: 'fullwidth',
  promoStyle: 'countdown',
  showInstagramFeed: false,
  showLookbook: false,
  animationIntensity: 'high',
}

// ─── Exported Config Map ────────────────────────────────────────────────────

export const THEME_CONFIGS: Record<string, ThemeLayoutConfig> = {
  'lumia': lumia,
  'blaze': blaze,
  'glow': glow,
  'bolt': bolt,
  'bazaar': bazaar,
}

// ─── Helper: Get Config With Fallback ───────────────────────────────────────

const DEFAULT_THEME_KEY = 'bazaar'

export function getThemeConfig(themeName: string): ThemeLayoutConfig {
  return THEME_CONFIGS[themeName] ?? THEME_CONFIGS[DEFAULT_THEME_KEY]!
}

// ─── Convenience: Theme Key List ────────────────────────────────────────────

export const THEME_KEYS = Object.keys(THEME_CONFIGS) as readonly string[]

export const THEME_NAMES = Object.values(THEME_CONFIGS).map((t) => t.name) as readonly string[]
