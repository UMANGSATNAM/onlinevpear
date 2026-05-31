import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get('merchantId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}

    if (merchantId) where.merchantId = merchantId
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        include: {
          store: { select: { id: true, name: true } },
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.customer.count({ where }),
    ])

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Customers GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, merchantId, email, name, phone, addresses, tags, notes } = body

    if (!storeId || !merchantId || !email) {
      return NextResponse.json(
        { error: 'storeId, merchantId, and email are required' },
        { status: 400 }
      )
    }

    // Check for existing customer in store
    const existing = await db.customer.findUnique({
      where: { storeId_email: { storeId, email } },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Customer with this email already exists in this store' },
        { status: 409 }
      )
    }

    const customer = await db.customer.create({
      data: {
        storeId,
        merchantId,
        email,
        name: name || null,
        phone: phone || null,
        addresses: addresses ? JSON.stringify(addresses) : '[]',
        tags: tags ? JSON.stringify(tags) : '[]',
        notes: notes || null,
      },
    })

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    console.error('Customers POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
