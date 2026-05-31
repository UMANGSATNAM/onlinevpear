import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Default theme config (Minimal Dawn) used when no theme is published
const DEFAULT_THEME_CONFIG = {
  primaryColor: '#1a1a2e',
  accentColor: '#e94560',
  secondaryAccent: '#e94560',
  bgColor: '#ffffff',
  textColor: '#1a1a2e',
  fontFamily: 'inter',
  layoutStyle: 'modern',
  borderRadius: 'rounded',
  headerStyle: 'minimal',
  heroStyle: 'split',
  productCardStyle: 'clean',
  buttonStyle: 'rounded',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId is required' },
        { status: 400 }
      )
    }

    // Find the store and its active theme
    const store = await db.store.findUnique({
      where: { id: storeId },
      include: { theme: true },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // If store has a theme assigned, use it
    if (store.theme) {
      let config = DEFAULT_THEME_CONFIG
      let layout: any = { category: 'Free', features: [] }
      let styles: any = {}

      try {
        config = { ...DEFAULT_THEME_CONFIG, ...JSON.parse(store.theme.config) }
      } catch {}

      try {
        layout = { ...layout, ...JSON.parse(store.theme.layout) }
      } catch {}

      try {
        styles = JSON.parse(store.theme.styles)
      } catch {}

      return NextResponse.json({
        theme: {
          id: store.theme.id,
          name: store.theme.name,
          description: store.theme.description,
          config,
          layout,
          styles,
          isActive: store.theme.isActive,
        },
      })
    }

    // Fallback: find any active theme in the system
    const activeTheme = await db.theme.findFirst({
      where: { isActive: true },
    })

    if (activeTheme) {
      let config = DEFAULT_THEME_CONFIG
      let layout: any = { category: 'Free', features: [] }
      let styles: any = {}

      try {
        config = { ...DEFAULT_THEME_CONFIG, ...JSON.parse(activeTheme.config) }
      } catch {}

      try {
        layout = { ...layout, ...JSON.parse(activeTheme.layout) }
      } catch {}

      try {
        styles = JSON.parse(activeTheme.styles)
      } catch {}

      return NextResponse.json({
        theme: {
          id: activeTheme.id,
          name: activeTheme.name,
          description: activeTheme.description,
          config,
          layout,
          styles,
          isActive: activeTheme.isActive,
        },
      })
    }

    // No theme found, return default
    return NextResponse.json({
      theme: {
        id: 'default',
        name: 'Default',
        description: 'Default Online Vepar theme',
        config: DEFAULT_THEME_CONFIG,
        layout: { category: 'Free', features: [] },
        styles: {},
        isActive: true,
      },
    })
  } catch (error) {
    console.error('Storefront theme GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
