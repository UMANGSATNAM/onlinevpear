import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Total merchants
    const totalMerchants = await db.merchant.count()
    const activeMerchants = await db.merchant.count({ where: { status: 'active' } })
    const trialMerchants = await db.merchant.count({ where: { status: 'trial' } })

    // Total revenue (from paid invoices)
    const paidInvoices = await db.invoice.findMany({
      where: { status: 'paid' },
      select: { amount: true, createdAt: true },
    })
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0)

    // Recent revenue (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentRevenue = paidInvoices
      .filter((inv) => inv.createdAt >= thirtyDaysAgo)
      .reduce((sum, inv) => sum + inv.amount, 0)

    // Total orders across all stores
    const totalOrders = await db.order.count()
    const recentOrders = await db.order.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    })

    // Total products
    const totalProducts = await db.product.count()
    const activeProducts = await db.product.count({ where: { status: 'active' } })

    // Total customers
    const totalCustomers = await db.customer.count()

    // AI usage
    const aiUsageRecords = await db.aiUsage.findMany({
      select: { totalTokens: true, cost: true, feature: true, createdAt: true },
    })
    const totalAiTokens = aiUsageRecords.reduce((sum, r) => sum + r.totalTokens, 0)
    const totalAiCost = aiUsageRecords.reduce((sum, r) => sum + r.cost, 0)
    const recentAiUsage = aiUsageRecords.filter((r) => r.createdAt >= thirtyDaysAgo)

    // AI usage by feature
    const aiUsageByFeature: Record<string, { tokens: number; cost: number; count: number }> = {}
    aiUsageRecords.forEach((r) => {
      if (!aiUsageByFeature[r.feature]) {
        aiUsageByFeature[r.feature] = { tokens: 0, cost: 0, count: 0 }
      }
      aiUsageByFeature[r.feature].tokens += r.totalTokens
      aiUsageByFeature[r.feature].cost += r.cost
      aiUsageByFeature[r.feature].count += 1
    })

    // Revenue chart (monthly)
    const now = new Date()
    const monthlyRevenue: { month: string; revenue: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const monthName = monthStart.toLocaleString('en', { month: 'short' })

      const monthRevenue = paidInvoices
        .filter((inv) => inv.createdAt >= monthStart && inv.createdAt <= monthEnd)
        .reduce((sum, inv) => sum + inv.amount, 0)

      monthlyRevenue.push({ month: monthName, revenue: monthRevenue })
    }

    // Growth metrics
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    const previousPeriodOrders = await db.order.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    })
    const currentPeriodOrders = await db.order.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    })
    const orderGrowth = previousPeriodOrders > 0
      ? ((currentPeriodOrders - previousPeriodOrders) / previousPeriodOrders) * 100
      : 0

    const previousPeriodMerchants = await db.merchant.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    })
    const currentPeriodMerchants = await db.merchant.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    })
    const merchantGrowth = previousPeriodMerchants > 0
      ? ((currentPeriodMerchants - previousPeriodMerchants) / previousPeriodMerchants) * 100
      : 0

    // Plan distribution
    const planDistribution = await db.merchant.groupBy({
      by: ['planId'],
      _count: { id: true },
    })

    // Recent merchants
    const recentMerchants = await db.merchant.findMany({
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      stats: {
        totalMerchants,
        activeMerchants,
        trialMerchants,
        totalRevenue,
        recentRevenue,
        totalOrders,
        recentOrders,
        totalProducts,
        activeProducts,
        totalCustomers,
        aiUsage: {
          totalTokens: totalAiTokens,
          totalCost: totalAiCost,
          byFeature: aiUsageByFeature,
          recentTokens: recentAiUsage.reduce((sum, r) => sum + r.totalTokens, 0),
          recentCost: recentAiUsage.reduce((sum, r) => sum + r.cost, 0),
        },
      },
      growth: {
        orders: orderGrowth,
        merchants: merchantGrowth,
      },
      revenueChart: monthlyRevenue,
      planDistribution,
      recentMerchants,
    })
  } catch (error) {
    console.error('Admin dashboard GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
