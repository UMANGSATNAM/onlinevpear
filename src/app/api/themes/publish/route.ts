import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { themeId, storeId } = body

    if (!themeId || !storeId) {
      return NextResponse.json(
        { error: 'themeId and storeId are required' },
        { status: 400 }
      )
    }

    // Check theme exists
    const theme = await db.theme.findUnique({ where: { id: themeId } })
    if (!theme) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      )
    }

    // Check store exists
    const store = await db.store.findUnique({ where: { id: storeId } })
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // Deactivate ALL other themes (not just one)
    await db.theme.updateMany({
      where: { isActive: true, id: { not: themeId } },
      data: { isActive: false },
    })

    // Set the new theme as active
    await db.theme.update({
      where: { id: themeId },
      data: { isActive: true },
    })

    // Update store's themeId
    const updatedStore = await db.store.update({
      where: { id: storeId },
      data: { themeId },
    })

    return NextResponse.json({
      success: true,
      store: updatedStore,
      theme: { id: theme.id, name: theme.name },
    })
  } catch (error) {
    console.error('Theme publish error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
