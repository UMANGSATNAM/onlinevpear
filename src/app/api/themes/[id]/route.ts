import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const theme = await db.theme.findUnique({ where: { id } })

    if (!theme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 })
    }

    return NextResponse.json({ theme })
  } catch (error) {
    console.error('Theme GET error:', error)
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
    const { name, description, config, styles, layout, isActive } = body

    const existing = await db.theme.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (config !== undefined) updateData.config = typeof config === 'string' ? config : JSON.stringify(config)
    if (styles !== undefined) updateData.styles = typeof styles === 'string' ? styles : JSON.stringify(styles)
    if (layout !== undefined) updateData.layout = typeof layout === 'string' ? layout : JSON.stringify(layout)
    if (isActive !== undefined) updateData.isActive = isActive

    const theme = await db.theme.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ theme })
  } catch (error) {
    console.error('Theme PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.theme.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 })
    }

    if (existing.isSystem) {
      return NextResponse.json({ error: 'Cannot delete system themes' }, { status: 400 })
    }

    await db.theme.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Theme DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
