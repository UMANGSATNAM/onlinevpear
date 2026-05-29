import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const slug = searchParams.get('slug')

    if (!storeId && !slug) {
      return NextResponse.json(
        { error: 'storeId or slug is required' },
        { status: 400 }
      )
    }

    // Find store
    const storeWhere = storeId ? { id: storeId } : { slug }
    const store = await db.store.findUnique({
      where: storeWhere,
      include: {
        theme: true,
      },
    })

    if (!store || store.status !== 'active') {
      return NextResponse.json(
        { error: 'Store not found or inactive' },
        { status: 404 }
      )
    }

    // Get products
    const products = await db.product.findMany({
      where: {
        storeId: store.id,
        status: 'active',
        visibility: 'public',
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: { where: { isActive: true } },
        inventory: { select: { quantity: true, reserved: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Get categories
    const categories = await db.category.findMany({
      where: {
        storeId: store.id,
        isActive: true,
      },
      include: {
        _count: { select: { products: { where: { status: 'active' } } } },
      },
      orderBy: { sortOrder: 'asc' },
    })

    // Get collections
    const collections = await db.collection.findMany({
      where: {
        storeId: store.id,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    // Get pages
    const pages = await db.storePage.findMany({
      where: {
        storeId: store.id,
        status: 'published',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        template: true,
        isHomepage: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    // Get shipping methods
    const shippingMethods = await db.shippingMethod.findMany({
      where: {
        storeId: store.id,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        logo: store.logo,
        domain: store.domain,
        subdomain: store.subdomain,
        currency: store.currency,
        language: store.language,
        seo: store.seo,
        settings: store.settings,
        theme: store.theme,
      },
      products,
      categories,
      collections,
      pages,
      shippingMethods,
    })
  } catch (error) {
    console.error('Storefront GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
