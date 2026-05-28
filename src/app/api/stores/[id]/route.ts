import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const store = await db.store.findUnique({
      where: { id },
      include: {
        merchant: { select: { id: true, businessName: true } },
        theme: { select: { id: true, name: true } },
        _count: { select: { products: true, orders: true, customers: true } },
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    return NextResponse.json({ store })
  } catch (error) {
    console.error('Store GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.store.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'name', 'description', 'logo', 'favicon', 'domain', 'subdomain',
      'status', 'currency', 'language', 'timezone',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (body.seo && typeof body.seo === 'object') {
      updateData.seo = JSON.stringify(body.seo)
    }
    if (body.settings && typeof body.settings === 'object') {
      updateData.settings = JSON.stringify(body.settings)
    }
    if (body.themeId) {
      updateData.themeId = body.themeId
    }

    const store = await db.store.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ store })
  } catch (error) {
    console.error('Store PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
