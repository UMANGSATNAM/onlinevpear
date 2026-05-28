import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          include: { inventory: true },
          orderBy: { position: 'asc' },
        },
        inventory: true,
        orderItems: {
          select: { id: true, quantity: true, price: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product GET error:', error)
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

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check slug uniqueness if slug is being updated
    if (body.slug && body.slug !== existing.slug) {
      const slugConflict = await db.product.findUnique({
        where: { storeId_slug: { storeId: existing.storeId, slug: body.slug } },
      })
      if (slugConflict) {
        return NextResponse.json(
          { error: 'Product with this slug already exists in this store' },
          { status: 409 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'name', 'slug', 'description', 'shortDesc', 'sku', 'barcode',
      'price', 'comparePrice', 'costPrice', 'status', 'visibility',
      'type', 'vendor', 'weight', 'dimensions', 'tracksInventory',
      'categoryId', 'seo', 'meta',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (['price', 'comparePrice', 'costPrice', 'weight'].includes(field) && body[field] !== null) {
          updateData[field] = parseFloat(String(body[field]))
        } else if (['images', 'tags', 'collectionIds'].includes(field)) {
          updateData[field] = JSON.stringify(body[field])
        } else if (['dimensions', 'seo', 'meta'].includes(field) && typeof body[field] === 'object') {
          updateData[field] = JSON.stringify(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    if (body.status === 'active' && existing.status !== 'active') {
      updateData.publishedAt = new Date()
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        variants: true,
        inventory: true,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check for active orders referencing this product
    const orderItemCount = await db.orderItem.count({
      where: { productId: id },
    })

    if (orderItemCount > 0) {
      // Soft delete by archiving
      await db.product.update({
        where: { id },
        data: { status: 'archived' },
      })
      return NextResponse.json({
        message: 'Product archived (has associated orders)',
        archived: true,
      })
    }

    // Hard delete if no orders reference it
    await db.product.delete({ where: { id } })
    return NextResponse.json({ message: 'Product deleted', deleted: true })
  } catch (error) {
    console.error('Product DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
