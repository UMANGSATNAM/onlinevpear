import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId is required' },
        { status: 400 }
      )
    }

    const categories = await db.category.findMany({
      where: { storeId },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Categories GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, name, slug, description, image, parentId, sortOrder, isActive } = body

    if (!storeId || !name || !slug) {
      return NextResponse.json(
        { error: 'storeId, name, and slug are required' },
        { status: 400 }
      )
    }

    // Check slug uniqueness
    const existing = await db.category.findUnique({
      where: { storeId_slug: { storeId, slug } },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists in this store' },
        { status: 409 }
      )
    }

    const category = await db.category.create({
      data: {
        storeId,
        name,
        slug,
        description: description || null,
        image: image || null,
        parentId: parentId || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Categories POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
