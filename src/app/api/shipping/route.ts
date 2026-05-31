import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (storeId) where.storeId = storeId

    const [methods, total] = await Promise.all([
      db.shippingMethod.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.shippingMethod.count({ where }),
    ])

    return NextResponse.json({
      methods,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Shipping GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, name, description, price, freeAbove, zones, estimatedDays, isActive, sortOrder } = body

    if (!storeId || !name || price === undefined) {
      return NextResponse.json(
        { error: 'storeId, name, and price are required' },
        { status: 400 }
      )
    }

    const method = await db.shippingMethod.create({
      data: {
        storeId,
        name,
        description: description || null,
        price: parseFloat(String(price)),
        freeAbove: freeAbove ? parseFloat(String(freeAbove)) : null,
        zones: zones ? JSON.stringify(zones) : '[]',
        estimatedDays: estimatedDays || null,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json({ method }, { status: 201 })
  } catch (error) {
    console.error('Shipping POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
