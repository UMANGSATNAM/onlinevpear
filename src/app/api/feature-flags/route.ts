import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const [flags, total] = await Promise.all([
      db.featureFlag.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.featureFlag.count(),
    ])

    return NextResponse.json({
      flags,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Feature flags GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, key, isEnabled, rolloutPct, conditions } = body

    if (!id && !key) {
      return NextResponse.json(
        { error: 'id or key is required' },
        { status: 400 }
      )
    }

    const where = id ? { id } : { key }
    const existing = await db.featureFlag.findUnique({ where })
    if (!existing) {
      return NextResponse.json(
        { error: 'Feature flag not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled
    if (rolloutPct !== undefined) updateData.rolloutPct = parseInt(String(rolloutPct))
    if (conditions) updateData.conditions = JSON.stringify(conditions)

    const flag = await db.featureFlag.update({
      where: { id: existing.id },
      data: updateData,
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'feature_flag_updated',
        resource: 'feature_flag',
        resourceId: existing.id,
        details: JSON.stringify({ key: existing.key, isEnabled, rolloutPct }),
      },
    })

    return NextResponse.json({ flag })
  } catch (error) {
    console.error('Feature flags PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
