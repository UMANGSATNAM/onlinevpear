import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        store: { select: { id: true, name: true } },
        orders: {
          include: {
            items: { select: { id: true, name: true, quantity: true, price: true } },
            payments: { select: { id: true, method: true, amount: true, status: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        wishlistItems: {
          include: { product: { select: { id: true, name: true, price: true, images: true } } },
          take: 10,
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Customer GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.customer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'phone', 'status', 'notes']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (body.addresses) updateData.addresses = JSON.stringify(body.addresses)
    if (body.tags) updateData.tags = JSON.stringify(body.tags)
    if (body.metadata) updateData.metadata = JSON.stringify(body.metadata)

    const customer = await db.customer.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Customer PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
