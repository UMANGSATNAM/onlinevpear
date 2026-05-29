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

    const [rates, total] = await Promise.all([
      db.taxRate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.taxRate.count({ where }),
    ])

    return NextResponse.json({
      rates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Tax GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, name, rate, country, region, isCompound, isActive } = body

    if (!storeId || !name || rate === undefined) {
      return NextResponse.json(
        { error: 'storeId, name, and rate are required' },
        { status: 400 }
      )
    }

    const taxRate = await db.taxRate.create({
      data: {
        storeId,
        name,
        rate: parseFloat(String(rate)),
        country: country || null,
        region: region || null,
        isCompound: isCompound || false,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({ taxRate }, { status: 201 })
  } catch (error) {
    console.error('Tax POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
