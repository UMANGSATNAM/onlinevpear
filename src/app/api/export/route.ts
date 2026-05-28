import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatDate(date: Date | null | string): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'orders'
    const merchantId = searchParams.get('merchantId')
    const storeId = searchParams.get('storeId')
    const filter = searchParams.get('filter') || 'all' // all, active

    if (!merchantId && !storeId) {
      return NextResponse.json(
        { error: 'merchantId or storeId is required' },
        { status: 400 }
      )
    }

    let csvContent = ''
    let filename = 'export.csv'

    switch (type) {
      case 'orders': {
        const where: Record<string, unknown> = {}
        if (storeId) where.storeId = storeId
        if (merchantId) {
          const stores = await db.store.findMany({
            where: { merchantId },
            select: { id: true },
          })
          where.storeId = { in: stores.map((s) => s.id) }
        }

        const orders = await db.order.findMany({
          where,
          include: {
            customer: { select: { name: true, email: true } },
            items: { select: { id: true, name: true, quantity: true, price: true } },
          },
          orderBy: { createdAt: 'desc' },
        })

        const headers = ['Order #', 'Date', 'Customer Name', 'Customer Email', 'Status', 'Payment Status', 'Fulfillment Status', 'Subtotal', 'Tax', 'Shipping', 'Discount', 'Total', 'Currency', 'Items Count', 'Tracking Number']
        const rows = orders.map((o) => [
          escapeCSV(o.orderNumber),
          formatDate(o.createdAt),
          escapeCSV(o.customer?.name || 'Guest'),
          escapeCSV(o.customer?.email || ''),
          o.status,
          o.paymentStatus,
          o.fulfillmentStatus,
          formatCurrency(o.subtotal),
          formatCurrency(o.taxTotal),
          formatCurrency(o.shippingTotal),
          formatCurrency(o.discountTotal),
          formatCurrency(o.total),
          o.currency,
          String(o.items.length),
          escapeCSV(o.trackingNumber || ''),
        ])

        csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
        filename = `orders-export-${new Date().toISOString().split('T')[0]}.csv`
        break
      }

      case 'products': {
        const where: Record<string, unknown> = {}
        if (storeId) where.storeId = storeId
        if (merchantId) {
          const stores = await db.store.findMany({
            where: { merchantId },
            select: { id: true },
          })
          where.storeId = { in: stores.map((s) => s.id) }
        }
        if (filter === 'active') where.status = 'active'

        const products = await db.product.findMany({
          where,
          include: {
            category: { select: { name: true } },
            inventory: { select: { quantity: true, reserved: true } },
            variants: { select: { id: true, title: true, price: true, isActive: true } },
          },
          orderBy: { createdAt: 'desc' },
        })

        const headers = ['Name', 'SKU', 'Status', 'Type', 'Price', 'Compare Price', 'Category', 'Total Stock', 'Reserved Stock', 'Variant Count', 'Created Date']
        const rows = products.map((p) => {
          const totalStock = p.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
          const reservedStock = p.inventory.reduce((sum, inv) => sum + inv.reserved, 0)
          return [
            escapeCSV(p.name),
            escapeCSV(p.sku || ''),
            p.status,
            p.type,
            formatCurrency(p.price),
            p.comparePrice ? formatCurrency(p.comparePrice) : '',
            escapeCSV(p.category?.name || ''),
            String(totalStock),
            String(reservedStock),
            String(p.variants.length),
            formatDate(p.createdAt),
          ]
        })

        csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
        filename = `products-export-${new Date().toISOString().split('T')[0]}.csv`
        break
      }

      case 'customers': {
        const where: Record<string, unknown> = {}
        if (merchantId) where.merchantId = merchantId
        if (storeId) where.storeId = storeId
        if (filter === 'active') where.status = 'active'

        const customers = await db.customer.findMany({
          where,
          include: {
            store: { select: { name: true } },
            _count: { select: { orders: true } },
          },
          orderBy: { createdAt: 'desc' },
        })

        const headers = ['Name', 'Email', 'Phone', 'Status', 'Total Orders', 'Total Spent', 'Avg Order Value', 'Last Order Date', 'Join Date', 'Store', 'Tags']
        const rows = customers.map((c) => {
          let tags: string[] = []
          try { tags = JSON.parse(c.tags || '[]') } catch { tags = [] }
          return [
            escapeCSV(c.name || ''),
            escapeCSV(c.email),
            escapeCSV(c.phone || ''),
            c.status,
            String(c._count.orders),
            formatCurrency(c.totalSpent),
            formatCurrency(c.avgOrderValue),
            c.lastOrderAt ? formatDate(c.lastOrderAt) : '',
            formatDate(c.createdAt),
            escapeCSV(c.store.name),
            escapeCSV(tags.join('; ')),
          ]
        })

        csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
        filename = `customers-export-${new Date().toISOString().split('T')[0]}.csv`
        break
      }

      default:
        return NextResponse.json(
          { error: 'Invalid export type. Supported: orders, products, customers' },
          { status: 400 }
        )
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
