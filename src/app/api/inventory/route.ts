import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const productId = searchParams.get('productId')
    const lowStock = searchParams.get('lowStock') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}

    if (productId) where.productId = productId
    if (lowStock) where.quantity = { lte: 10 }
    if (storeId) {
      where.product = { storeId }
    }

    const [items, total] = await Promise.all([
      db.inventory.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, sku: true, storeId: true, images: true },
          },
          variant: {
            select: { id: true, title: true, sku: true, options: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.inventory.count({ where }),
    ])

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Inventory GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, quantity, reserved, location, lowStockThreshold, trackStock } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Inventory item id is required' },
        { status: 400 }
      )
    }

    const existing = await db.inventory.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (quantity !== undefined) updateData.quantity = parseInt(String(quantity))
    if (reserved !== undefined) updateData.reserved = parseInt(String(reserved))
    if (location !== undefined) updateData.location = location
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = parseInt(String(lowStockThreshold))
    if (trackStock !== undefined) updateData.trackStock = trackStock

    const item = await db.inventory.update({
      where: { id },
      data: updateData,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        variant: { select: { id: true, title: true } },
      },
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Inventory PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
