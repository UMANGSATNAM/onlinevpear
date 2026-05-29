import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const merchant = await db.merchant.findUnique({
      where: { id },
      include: {
        plan: true,
        stores: {
          include: {
            _count: { select: { products: true, orders: true } },
          },
        },
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        users: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    })

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    return NextResponse.json({ merchant })
  } catch (error) {
    console.error('Merchant GET error:', error)
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

    const existing = await db.merchant.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'businessName', 'email', 'phone', 'logo', 'domain',
      'subdomain', 'status', 'planId', 'settings',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'settings' && typeof body[field] === 'object') {
          updateData[field] = JSON.stringify(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    if (body.onboardedAt !== undefined) {
      updateData.onboardedAt = body.onboardedAt ? new Date(body.onboardedAt) : null
    }
    if (body.trialEndsAt !== undefined) {
      updateData.trialEndsAt = body.trialEndsAt ? new Date(body.trialEndsAt) : null
    }

    const merchant = await db.merchant.update({
      where: { id },
      data: updateData,
      include: {
        plan: true,
        stores: true,
      },
    })

    return NextResponse.json({ merchant })
  } catch (error) {
    console.error('Merchant PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
