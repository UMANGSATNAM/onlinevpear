import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (storeId) where.storeId = storeId
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const [discounts, total] = await Promise.all([
      db.discount.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.discount.count({ where }),
    ])

    return NextResponse.json({
      discounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Discounts GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      storeId, code, type, value, minOrderValue, maxDiscount,
      usageLimit, perCustomerLimit, appliesTo, startsAt, endsAt, isActive,
    } = body

    if (!storeId || !code || !type || value === undefined || !startsAt) {
      return NextResponse.json(
        { error: 'storeId, code, type, value, and startsAt are required' },
        { status: 400 }
      )
    }

    // Check code uniqueness
    const existing = await db.discount.findUnique({
      where: { storeId_code: { storeId, code } },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Discount code already exists in this store' },
        { status: 409 }
      )
    }

    const discount = await db.discount.create({
      data: {
        storeId,
        code,
        type,
        value: parseFloat(String(value)),
        minOrderValue: minOrderValue ? parseFloat(String(minOrderValue)) : null,
        maxDiscount: maxDiscount ? parseFloat(String(maxDiscount)) : null,
        usageLimit: usageLimit || null,
        perCustomerLimit: perCustomerLimit || null,
        appliesTo: appliesTo ? JSON.stringify(appliesTo) : '{}',
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({ discount }, { status: 201 })
  } catch (error) {
    console.error('Discounts POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
