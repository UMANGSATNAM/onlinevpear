import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await db.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
            variant: { select: { id: true, title: true, options: true } },
          },
        },
        payments: true,
        refunds: true,
        store: { select: { id: true, name: true, currency: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order GET error:', error)
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
    const { status, paymentStatus, fulfillmentStatus, trackingNumber, notes } = body

    const existing = await db.order.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (status) {
      updateData.status = status
      // Set timestamps based on status
      if (status === 'confirmed' && !existing.confirmedAt) updateData.confirmedAt = new Date()
      if (status === 'shipped' && !existing.shippedAt) {
        updateData.shippedAt = new Date()
        updateData.fulfillmentStatus = 'fulfilled'
      }
      if (status === 'delivered' && !existing.deliveredAt) {
        updateData.deliveredAt = new Date()
        updateData.fulfillmentStatus = 'fulfilled'
      }
      if (status === 'cancelled' && !existing.cancelledAt) updateData.cancelledAt = new Date()
    }

    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (fulfillmentStatus) updateData.fulfillmentStatus = fulfillmentStatus
    if (trackingNumber) updateData.trackingNumber = trackingNumber
    if (notes !== undefined) updateData.notes = notes

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: true,
        payments: true,
      },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'order_updated',
        resource: 'order',
        resourceId: id,
        details: JSON.stringify({ status, paymentStatus, fulfillmentStatus }),
      },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
