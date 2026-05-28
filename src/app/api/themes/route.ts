import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const [themes, total] = await Promise.all([
      db.theme.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.theme.count(),
    ])

    return NextResponse.json({
      themes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Themes GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, preview, thumbnail, config, styles, layout, isSystem, isActive } = body

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      )
    }

    const theme = await db.theme.create({
      data: {
        name,
        description: description || null,
        preview: preview || null,
        thumbnail: thumbnail || null,
        config: config ? JSON.stringify(config) : '{}',
        styles: styles ? JSON.stringify(styles) : '{}',
        layout: layout ? JSON.stringify(layout) : '{}',
        isSystem: isSystem || false,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({ theme }, { status: 201 })
  } catch (error) {
    console.error('Themes POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
