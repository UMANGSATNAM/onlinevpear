import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get('merchantId')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (merchantId) where.merchantId = merchantId
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const [workflows, total] = await Promise.all([
      db.workflow.findMany({
        where,
        include: {
          executions: {
            orderBy: { startedAt: 'desc' },
            take: 5,
          },
          _count: { select: { executions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.workflow.count({ where }),
    ])

    return NextResponse.json({
      workflows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Workflows GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { merchantId, name, description, trigger, conditions, actions, isActive } = body

    if (!merchantId || !name || !trigger) {
      return NextResponse.json(
        { error: 'merchantId, name, and trigger are required' },
        { status: 400 }
      )
    }

    const workflow = await db.workflow.create({
      data: {
        merchantId,
        name,
        description: description || null,
        trigger,
        conditions: conditions ? JSON.stringify(conditions) : '[]',
        actions: actions ? JSON.stringify(actions) : '[]',
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({ workflow }, { status: 201 })
  } catch (error) {
    console.error('Workflows POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
