import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cartId = searchParams.get('cartId')
    const sessionId = searchParams.get('sessionId')

    if (!cartId && !sessionId) {
      return NextResponse.json(
        { error: 'cartId or sessionId is required' },
        { status: 400 }
      )
    }

    const where = cartId ? { id: cartId } : { sessionId: sessionId! }
    const cart = await db.cart.findFirst({
      where,
    })

    if (!cart) {
      return NextResponse.json({ cart: null, items: [] })
    }

    // Enrich cart items with product data
    const cartItems = JSON.parse(cart.items) as Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      price: number;
    }>

    const enrichedItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, images: true, status: true },
        })
        const variant = item.variantId
          ? await db.productVariant.findUnique({
              where: { id: item.variantId },
              select: { id: true, title: true, options: true },
            })
          : null
        return {
          ...item,
          product,
          variant,
        }
      })
    )

    return NextResponse.json({ cart, items: enrichedItems })
  } catch (error) {
    console.error('Cart GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, cartId, sessionId, customerId, items, couponCode } = body

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId is required' },
        { status: 400 }
      )
    }

    // Find existing cart
    let cart
    if (cartId) {
      cart = await db.cart.findUnique({ where: { id: cartId } })
    } else if (sessionId) {
      cart = await db.cart.findFirst({ where: { sessionId } })
    }

    const cartItems = cart ? JSON.parse(cart.items) as Array<{ productId: string; variantId?: string; quantity: number; price: number }> : []
    const newItems = items || []

    // Merge items - add quantities for same product+variant
    for (const newItem of newItems) {
      const existingIdx = cartItems.findIndex(
        (ci) => ci.productId === newItem.productId && ci.variantId === newItem.variantId
      )
      if (existingIdx >= 0) {
        cartItems[existingIdx].quantity += newItem.quantity
      } else {
        cartItems.push({
          productId: newItem.productId,
          variantId: newItem.variantId || undefined,
          quantity: newItem.quantity,
          price: newItem.price,
        })
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Get tax rate for store
    const taxRate = await db.taxRate.findFirst({
      where: { storeId, isActive: true },
    })
    const taxTotal = taxRate ? subtotal * (taxRate.rate / 100) : 0

    // Calculate discount if coupon provided
    let discountTotal = 0
    const effectiveCoupon = couponCode || (cart?.couponCode)
    if (effectiveCoupon) {
      const discount = await db.discount.findUnique({
        where: { storeId_code: { storeId, code: effectiveCoupon } },
      })
      if (discount && discount.isActive && (!discount.endsAt || discount.endsAt > new Date())) {
        if (discount.type === 'percentage') {
          discountTotal = subtotal * (discount.value / 100)
          if (discount.maxDiscount) discountTotal = Math.min(discountTotal, discount.maxDiscount)
        } else if (discount.type === 'fixed_amount') {
          discountTotal = Math.min(discount.value, subtotal)
        }
      }
    }

    // Shipping
    let shippingTotal = 0
    const firstShippingMethod = await db.shippingMethod.findFirst({
      where: { storeId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    if (firstShippingMethod) {
      shippingTotal = firstShippingMethod.price
      if (firstShippingMethod.freeAbove && subtotal >= firstShippingMethod.freeAbove) {
        shippingTotal = 0
      }
    }

    const total = subtotal + taxTotal + shippingTotal - discountTotal

    if (cart) {
      // Update existing cart
      cart = await db.cart.update({
        where: { id: cart.id },
        data: {
          items: JSON.stringify(cartItems),
          subtotal,
          taxTotal,
          shippingTotal,
          discountTotal,
          total,
          couponCode: effectiveCoupon || null,
          customerId: customerId || cart.customerId,
        },
      })
    } else {
      // Create new cart
      cart = await db.cart.create({
        data: {
          storeId,
          sessionId: sessionId || null,
          customerId: customerId || null,
          items: JSON.stringify(cartItems),
          subtotal,
          taxTotal,
          shippingTotal,
          discountTotal,
          total,
          couponCode: effectiveCoupon || null,
        },
      })
    }

    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Cart POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
