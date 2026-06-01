import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}

    if (storeId) where.storeId = storeId
    if (category) where.categoryId = category
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ]
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          variants: { where: { isActive: true } },
          inventory: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let {
      storeId,
      merchantId,
      name,
      slug,
      description,
      shortDesc,
      sku,
      barcode,
      price,
      comparePrice,
      costPrice,
      images,
      status,
      visibility,
      type,
      vendor,
      tags,
      weight,
      dimensions,
      tracksInventory,
      categoryId,
      meta,
    } = body

    // If we have a merchantId but no storeId, grab their first store (for onboarding)
    if (!storeId && merchantId) {
      const merchant = await db.merchant.findUnique({
        where: { id: merchantId },
        include: { stores: true }
      });
      if (merchant && merchant.stores.length > 0) {
        storeId = merchant.stores[0].id;
      }
    }

    if (!slug && name) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (!storeId || !name || !slug || price === undefined) {
      return NextResponse.json(
        { error: 'storeId, name, slug, and price are required' },
        { status: 400 }
      )
    }

    // Check slug uniqueness within store
    const existing = await db.product.findUnique({
      where: { storeId_slug: { storeId, slug } },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Product with this slug already exists in this store' },
        { status: 409 }
      )
    }

    const product = await db.product.create({
      data: {
        storeId,
        name,
        slug,
        description: description || null,
        shortDesc: shortDesc || null,
        sku: sku || null,
        barcode: barcode || null,
        price: parseFloat(String(price)),
        comparePrice: comparePrice ? parseFloat(String(comparePrice)) : null,
        costPrice: costPrice ? parseFloat(String(costPrice)) : null,
        images: images ? JSON.stringify(images) : '[]',
        status: status || 'draft',
        visibility: visibility || 'public',
        type: type || 'physical',
        vendor: vendor || null,
        tags: tags ? JSON.stringify(tags) : '[]',
        weight: weight ? parseFloat(String(weight)) : null,
        dimensions: dimensions ? JSON.stringify(dimensions) : null,
        tracksInventory: tracksInventory !== undefined ? tracksInventory : true,
        categoryId: categoryId || null,
        meta: meta ? JSON.stringify(meta) : '{}',
        publishedAt: status === 'active' ? new Date() : null,
      },
      include: {
        category: true,
        variants: true,
        inventory: true,
      },
    })

    // Create initial inventory record if tracking
    if (tracksInventory !== false) {
      await db.inventory.create({
        data: {
          productId: product.id,
          quantity: 0,
          reserved: 0,
        },
      })
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Products POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
