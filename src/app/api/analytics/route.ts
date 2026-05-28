import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get('merchantId')

    if (!merchantId) {
      return NextResponse.json(
        { error: 'merchantId is required' },
        { status: 400 }
      )
    }

    // Get merchant stores
    const stores = await db.store.findMany({
      where: { merchantId },
      select: { id: true },
    })
    const storeIds = stores.map((s) => s.id)

    // Revenue stats
    const orders = await db.order.findMany({
      where: { storeId: { in: storeIds } },
      select: { total: true, createdAt: true, status: true },
    })

    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0)

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const recentRevenue = orders
      .filter((o) => o.createdAt >= thirtyDaysAgo && o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0)

    // Orders count
    const totalOrders = orders.length
    const recentOrders = orders.filter((o) => o.createdAt >= thirtyDaysAgo).length

    // Customers count
    const totalCustomers = await db.customer.count({
      where: { merchantId },
    })

    const recentCustomers = await db.customer.count({
      where: {
        merchantId,
        createdAt: { gte: thirtyDaysAgo },
      },
    })

    // Products count
    const totalProducts = await db.product.count({
      where: { storeId: { in: storeIds } },
    })

    const activeProducts = await db.product.count({
      where: { storeId: { in: storeIds }, status: 'active' },
    })

    // Recent orders for dashboard
    const recentOrdersList = await db.order.findMany({
      where: { storeId: { in: storeIds } },
      include: {
        customer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Revenue chart data (last 12 months)
    const monthlyRevenue: { month: string; revenue: number; orders: number }[] = []

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const monthName = monthStart.toLocaleString('en', { month: 'short' })

      const monthOrders = orders.filter(
        (o) => o.createdAt >= monthStart && o.createdAt <= monthEnd && o.status !== 'cancelled'
      )
      monthlyRevenue.push({
        month: monthName,
        revenue: monthOrders.reduce((sum, o) => sum + o.total, 0),
        orders: monthOrders.length,
      })
    }

    // Top products by revenue
    const topProducts = await db.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: { storeId: { in: storeIds } },
        productId: { not: null },
      },
      _sum: { quantity: true, total: true },
      _count: true,
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    })

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (tp) => {
        const product = tp.productId
          ? await db.product.findUnique({
              where: { id: tp.productId },
              select: { id: true, name: true, images: true, price: true },
            })
          : null
        return {
          product,
          totalQuantity: tp._sum.quantity || 0,
          totalRevenue: tp._sum.total || 0,
          orderCount: tp._count,
        }
      })
    )

    // Order status breakdown
    const orderStatusBreakdown: Record<string, number> = {}
    orders.forEach((o) => {
      orderStatusBreakdown[o.status] = (orderStatusBreakdown[o.status] || 0) + 1
    })

    // Low stock products
    const lowStockProducts = await db.inventory.findMany({
      where: {
        product: { storeId: { in: storeIds } },
        quantity: { lte: 10 },
        trackStock: true,
      },
      include: {
        product: { select: { id: true, name: true, sku: true, images: true } },
      },
      take: 5,
    })

    return NextResponse.json({
      stats: {
        totalRevenue,
        recentRevenue,
        revenueGrowth: totalRevenue > 0 ? ((recentRevenue - (totalRevenue - recentRevenue)) / Math.max(totalRevenue - recentRevenue, 1)) * 100 : 0,
        totalOrders,
        recentOrders,
        totalCustomers,
        recentCustomers,
        totalProducts,
        activeProducts,
      },
      recentOrders: recentOrdersList,
      revenueChart: monthlyRevenue,
      topProducts: topProductsWithDetails,
      orderStatusBreakdown,
      lowStockProducts,
    })
  } catch (error) {
    console.error('Analytics GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
