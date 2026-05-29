import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const storeId = searchParams.get('storeId')
    const merchantId = searchParams.get('merchantId')
    const type = searchParams.get('type') || 'all' // all, products, orders, customers
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!q) {
      return NextResponse.json(
        { error: 'Search query (q) is required' },
        { status: 400 }
      )
    }

    const results: {
      products?: Awaited<ReturnType<typeof db.product.findMany>>
      orders?: Awaited<ReturnType<typeof db.order.findMany>>
      customers?: Awaited<ReturnType<typeof db.customer.findMany>>
    } = {}

    // Search products
    if (type === 'all' || type === 'products') {
      const productWhere: Record<string, unknown> = {
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { sku: { contains: q } },
        ],
      }
      if (storeId) productWhere.storeId = storeId

      results.products = await db.product.findMany({
        where: productWhere,
        include: {
          category: { select: { id: true, name: true } },
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
    }

    // Search orders
    if (type === 'all' || type === 'orders') {
      const orderWhere: Record<string, unknown> = {
        OR: [
          { orderNumber: { contains: q } },
          { trackingNumber: { contains: q } },
        ],
      }
      if (storeId) orderWhere.storeId = storeId

      results.orders = await db.order.findMany({
        where: orderWhere,
        include: {
          customer: { select: { id: true, name: true, email: true } },
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
    }

    // Search customers
    if (type === 'all' || type === 'customers') {
      const customerWhere: Record<string, unknown> = {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
        ],
      }
      if (merchantId) customerWhere.merchantId = merchantId

      results.customers = await db.customer.findMany({
        where: customerWhere,
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
    }

    const totalResults =
      (results.products?.length || 0) +
      (results.orders?.length || 0) +
      (results.customers?.length || 0)

    return NextResponse.json({
      query: q,
      totalResults,
      results,
    })
  } catch (error) {
    console.error('Search GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
