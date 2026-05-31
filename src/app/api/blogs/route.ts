import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (storeId) where.storeId = storeId
    if (status) where.status = status

    const [blogs, total] = await Promise.all([
      db.blog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.blog.count({ where }),
    ])

    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Blogs GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, title, slug, content, excerpt, coverImage, author, tags, status, publishedAt } = body

    if (!storeId || !title || !slug || !content) {
      return NextResponse.json(
        { error: 'storeId, title, slug, and content are required' },
        { status: 400 }
      )
    }

    // Check slug uniqueness
    const existing = await db.blog.findUnique({
      where: { storeId_slug: { storeId, slug } },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Blog with this slug already exists in this store' },
        { status: 409 }
      )
    }

    const blog = await db.blog.create({
      data: {
        storeId,
        title,
        slug,
        content,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        author: author || null,
        tags: tags ? JSON.stringify(tags) : '[]',
        status: status || 'draft',
        publishedAt: publishedAt ? new Date(publishedAt) : (status === 'published' ? new Date() : null),
      },
    })

    return NextResponse.json({ blog }, { status: 201 })
  } catch (error) {
    console.error('Blogs POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
