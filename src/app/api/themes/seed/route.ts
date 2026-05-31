import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const THEME_DEFINITIONS = [
  {
    name: 'Minimal Dawn',
    description: 'A clean, minimalist theme with lots of whitespace and elegant typography. Perfect for modern brands that want their products to speak for themselves.',
    category: 'Free',
    features: ['Clean Layout', 'White Space Focus', 'Fast Loading', 'Mobile First', 'SEO Optimized'],
    config: {
      primaryColor: '#1a1a2e',
      accentColor: '#e94560',
      bgColor: '#ffffff',
      textColor: '#1a1a2e',
      fontFamily: 'inter',
      layoutStyle: 'modern',
      borderRadius: 'rounded',
      headerStyle: 'minimal',
      heroStyle: 'split',
      productCardStyle: 'clean',
      buttonStyle: 'rounded',
    },
    styles: JSON.stringify({}),
    layout: JSON.stringify({}),
    isSystem: true,
  },
  {
    name: 'Bold Commerce',
    description: 'Make a statement with bold colors and strong visual hierarchy. Ideal for brands that want to stand out and create an impactful first impression.',
    category: 'Free',
    features: ['Bold Colors', 'Strong CTAs', 'Dynamic Layout', 'Animated Elements', 'High Contrast'],
    config: {
      primaryColor: '#ff6b35',
      accentColor: '#004e89',
      bgColor: '#ffffff',
      textColor: '#1a1a1a',
      fontFamily: 'montserrat',
      layoutStyle: 'modern',
      borderRadius: 'sharp',
      headerStyle: 'fullwidth',
      heroStyle: 'fullscreen',
      productCardStyle: 'bold',
      buttonStyle: 'pill',
    },
    styles: JSON.stringify({}),
    layout: JSON.stringify({}),
    isSystem: true,
  },
  {
    name: 'Elegant Luxe',
    description: 'A luxurious, premium theme with dark accents and sophisticated color palette. Designed for high-end fashion, jewelry, and luxury brands.',
    category: 'Premium',
    features: ['Luxury Feel', 'Dark Mode Ready', 'Parallax Effects', 'Elegant Typography', 'Premium Animations'],
    config: {
      primaryColor: '#2c003e',
      accentColor: '#c874b2',
      bgColor: '#faf5ff',
      textColor: '#2c003e',
      fontFamily: 'playfair',
      layoutStyle: 'spacious',
      borderRadius: 'elegant',
      headerStyle: 'centered',
      heroStyle: 'parallax',
      productCardStyle: 'luxury',
      buttonStyle: 'outlined',
    },
    styles: JSON.stringify({}),
    layout: JSON.stringify({}),
    isSystem: true,
  },
  {
    name: 'Fresh Garden',
    description: 'Nature-inspired theme with earthy greens and organic shapes. Great for eco-friendly, sustainable, organic, and wellness brands.',
    category: 'Free',
    features: ['Organic Shapes', 'Green Palette', 'Eco Vibe', 'Soft Transitions', 'Nature Icons'],
    config: {
      primaryColor: '#2d6a4f',
      accentColor: '#95d5b2',
      bgColor: '#f0fdf4',
      textColor: '#1b4332',
      fontFamily: 'lora',
      layoutStyle: 'spacious',
      borderRadius: 'organic',
      headerStyle: 'transparent',
      heroStyle: 'image-first',
      productCardStyle: 'soft',
      buttonStyle: 'rounded',
    },
    styles: JSON.stringify({}),
    layout: JSON.stringify({}),
    isSystem: true,
  },
  {
    name: 'Sunset Glow',
    description: 'Warm, inviting theme with amber and sunset-inspired colors. Perfect for lifestyle, home decor, and artisan brands that want a cozy feel.',
    category: 'Free',
    features: ['Warm Tones', 'Inviting Layout', 'Storytelling Focus', 'Newsletter Section', 'Instagram Feed'],
    config: {
      primaryColor: '#d97706',
      accentColor: '#ea580c',
      bgColor: '#fffbeb',
      textColor: '#78350f',
      fontFamily: 'poppins',
      layoutStyle: 'classic',
      borderRadius: 'soft',
      headerStyle: 'sticky',
      heroStyle: 'slider',
      productCardStyle: 'warm',
      buttonStyle: 'rounded',
    },
    styles: JSON.stringify({}),
    layout: JSON.stringify({}),
    isSystem: true,
  },
  {
    name: 'Ocean Breeze',
    description: 'Cool, calming blues with a fresh oceanic feel. Ideal for swimwear, beachwear, water sports, and coastal lifestyle brands.',
    category: 'Premium',
    features: ['Cool Palette', 'Wave Animations', 'Fluid Layout', 'Video Hero', 'Watercolor Effects'],
    config: {
      primaryColor: '#0c4a6e',
      accentColor: '#06b6d4',
      bgColor: '#f0f9ff',
      textColor: '#0c4a6e',
      fontFamily: 'inter',
      layoutStyle: 'modern',
      borderRadius: 'fluid',
      headerStyle: 'floating',
      heroStyle: 'video',
      productCardStyle: 'wave',
      buttonStyle: 'pill',
    },
    styles: JSON.stringify({}),
    layout: JSON.stringify({}),
    isSystem: true,
  },
  {
    name: 'Midnight Elite',
    description: 'Professional dark mode theme with sleek gradients and modern aesthetics. Built for tech, SaaS, and digital product stores.',
    category: 'Premium',
    features: ['Dark Mode', 'Sleek Gradients', 'Tech Vibe', 'Glassmorphism', 'Micro-animations'],
    config: {
      primaryColor: '#7c3aed',
      accentColor: '#a78bfa',
      bgColor: '#0f0f23',
      textColor: '#e2e8f0',
      fontFamily: 'inter',
      layoutStyle: 'modern',
      borderRadius: 'sharp',
      headerStyle: 'glass',
      heroStyle: 'gradient',
      productCardStyle: 'glass',
      buttonStyle: 'glow',
    },
    styles: JSON.stringify({}),
    layout: JSON.stringify({}),
    isSystem: true,
  },
  {
    name: 'Rose Boutique',
    description: 'Feminine and elegant with soft rose tones and delicate details. Designed for fashion, beauty, cosmetics, and jewelry stores.',
    category: 'Free',
    features: ['Rose Palette', 'Feminine Touch', 'Elegant Details', 'Wishlist Ready', 'Quick View'],
    config: {
      primaryColor: '#be185d',
      accentColor: '#f9a8d4',
      bgColor: '#fdf2f8',
      textColor: '#831843',
      fontFamily: 'playfair',
      layoutStyle: 'elegant',
      borderRadius: 'soft',
      headerStyle: 'elegant',
      heroStyle: 'carousel',
      productCardStyle: 'boutique',
      buttonStyle: 'rounded',
    },
    styles: JSON.stringify({}),
    layout: JSON.stringify({}),
    isSystem: true,
  },
  {
    name: 'Rustic Charm',
    description: 'Earthy, warm theme with handcrafted feel and vintage accents. Perfect for artisan, handmade, craft, and farmhouse-style brands.',
    category: 'Free',
    features: ['Vintage Feel', 'Handcrafted Vibe', 'Earthy Tones', 'Story Sections', 'Custom Badges'],
    config: {
      primaryColor: '#92400e',
      accentColor: '#d97706',
      bgColor: '#fefce8',
      textColor: '#451a03',
      fontFamily: 'lora',
      layoutStyle: 'classic',
      borderRadius: 'worn',
      headerStyle: 'banner',
      heroStyle: 'storytelling',
      productCardStyle: 'rustic',
      buttonStyle: 'solid',
    },
    styles: JSON.stringify({}),
    layout: JSON.stringify({}),
    isSystem: true,
  },
  {
    name: 'Neon Pulse',
    description: 'Futuristic, high-energy theme with neon accents and dynamic animations. Built for gaming, streetwear, and youth-culture brands.',
    category: 'Premium',
    features: ['Neon Accents', 'Glitch Effects', 'Dynamic Animations', 'Countdown Timers', 'Limited Edition Badges'],
    config: {
      primaryColor: '#000000',
      accentColor: '#22d3ee',
      secondaryAccent: '#f43f5e',
      bgColor: '#030712',
      textColor: '#f1f5f9',
      fontFamily: 'montserrat',
      layoutStyle: 'modern',
      borderRadius: 'sharp',
      headerStyle: 'fixed',
      heroStyle: 'animated',
      productCardStyle: 'neon',
      buttonStyle: 'outlined-neon',
    },
    styles: JSON.stringify({}),
    layout: JSON.stringify({}),
    isSystem: true,
  },
]

export async function POST() {
  try {
    let created = 0
    let skipped = 0

    for (const themeDef of THEME_DEFINITIONS) {
      // Check if theme already exists by name
      const existing = await db.theme.findFirst({
        where: { name: themeDef.name },
      })

      if (existing) {
        skipped++
        continue
      }

      await db.theme.create({
        data: {
          name: themeDef.name,
          description: themeDef.description,
          config: JSON.stringify(themeDef.config),
          styles: themeDef.styles,
          layout: JSON.stringify({
            category: themeDef.category,
            features: themeDef.features,
          }),
          isSystem: true,
          isActive: false,
        },
      })
      created++
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      total: THEME_DEFINITIONS.length,
    })
  } catch (error) {
    console.error('Theme seed error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
