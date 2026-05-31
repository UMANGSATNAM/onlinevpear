import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get('merchantId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!merchantId) {
      return NextResponse.json(
        { error: 'merchantId is required' },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = { merchantId }
    if (status) where.status = status

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          subscription: {
            include: { plan: { select: { id: true, name: true, displayName: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.invoice.count({ where }),
    ])

    // Summary stats
    const allInvoices = await db.invoice.findMany({
      where: { merchantId },
      select: { amount: true, status: true },
    })

    const totalBilled = allInvoices.reduce((sum, inv) => sum + inv.amount, 0)
    const totalPaid = allInvoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)
    const totalPending = allInvoices.filter((inv) => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0)
    const totalOverdue = allInvoices.filter((inv) => inv.status === 'failed').reduce((sum, inv) => sum + inv.amount, 0)

    return NextResponse.json({
      invoices,
      summary: {
        totalBilled,
        totalPaid,
        totalPending,
        totalOverdue,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Billing GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
