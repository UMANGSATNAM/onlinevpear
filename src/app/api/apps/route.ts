import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = { status: 'active' }
    if (category) where.category = category

    const [apps, total] = await Promise.all([
      db.appListing.findMany({
        where,
        orderBy: { installs: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.appListing.count({ where }),
    ])

    return NextResponse.json({
      apps,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Apps GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
