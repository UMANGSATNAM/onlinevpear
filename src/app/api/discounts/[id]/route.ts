import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const discount = await db.discount.findUnique({ where: { id } })

    if (!discount) {
      return NextResponse.json({ error: 'Discount not found' }, { status: 404 })
    }

    return NextResponse.json({ discount })
  } catch (error) {
    console.error('Discount GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.discount.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Discount not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'code', 'type', 'value', 'minOrderValue', 'maxDiscount',
      'usageLimit', 'perCustomerLimit', 'isActive',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (body.appliesTo && typeof body.appliesTo === 'object') {
      updateData.appliesTo = JSON.stringify(body.appliesTo)
    }
    if (body.startsAt) {
      updateData.startsAt = new Date(body.startsAt)
    }
    if (body.endsAt !== undefined) {
      updateData.endsAt = body.endsAt ? new Date(body.endsAt) : null
    }

    const discount = await db.discount.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ discount })
  } catch (error) {
    console.error('Discount PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.discount.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Discount not found' }, { status: 404 })
    }

    await db.discount.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Discount DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
