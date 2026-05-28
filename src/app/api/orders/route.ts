import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}

    if (storeId) where.storeId = storeId
    if (status) where.status = status
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { email: { contains: search } } },
      ]
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          items: true,
          payments: {
            select: { id: true, method: true, amount: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Orders GET error:', error)
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
      storeId,
      customerId,
      items,
      subtotal,
      taxTotal,
      shippingTotal,
      discountTotal,
      total,
      currency,
      notes,
      shippingAddress,
      billingAddress,
      shippingMethod,
    } = body

    if (!storeId || !items || !items.length || total === undefined) {
      return NextResponse.json(
        { error: 'storeId, items, and total are required' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderCount = await db.order.count()
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`

    const order = await db.order.create({
      data: {
        storeId,
        customerId: customerId || null,
        orderNumber,
        status: 'pending',
        paymentStatus: 'pending',
        fulfillmentStatus: 'unfulfilled',
        subtotal: parseFloat(String(subtotal)),
        taxTotal: taxTotal ? parseFloat(String(taxTotal)) : 0,
        shippingTotal: shippingTotal ? parseFloat(String(shippingTotal)) : 0,
        discountTotal: discountTotal ? parseFloat(String(discountTotal)) : 0,
        total: parseFloat(String(total)),
        currency: currency || 'USD',
        notes: notes || null,
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
        billingAddress: billingAddress ? JSON.stringify(billingAddress) : null,
        shippingMethod: shippingMethod || null,
        items: {
          create: items.map((item: { productId?: string; variantId?: string; name: string; sku?: string; quantity: number; price: number; total: number; image?: string; options?: Record<string, unknown> }) => ({
            productId: item.productId || null,
            variantId: item.variantId || null,
            name: item.name,
            sku: item.sku || null,
            quantity: item.quantity,
            price: parseFloat(String(item.price)),
            total: parseFloat(String(item.total)),
            image: item.image || null,
            options: item.options ? JSON.stringify(item.options) : '{}',
          })),
        },
      },
      include: {
        items: true,
        customer: true,
        payments: true,
      },
    })

    // Update customer stats if customer is associated
    if (customerId) {
      const customerOrders = await db.order.findMany({
        where: { customerId },
        select: { total: true },
      })
      const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0)
      await db.customer.update({
        where: { id: customerId },
        data: {
          totalOrders: customerOrders.length,
          totalSpent,
          avgOrderValue: customerOrders.length > 0 ? totalSpent / customerOrders.length : 0,
          lastOrderAt: new Date(),
        },
      })
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
