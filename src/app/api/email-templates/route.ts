import { NextRequest, NextResponse } from 'next/server'

// Mock email templates data
const mockTemplates = [
  {
    id: 'tpl-1',
    name: 'Order Confirmed',
    category: 'order-confirmation',
    subject: 'Your order {{order_number}} has been confirmed!',
    content: 'Hi {{customer_name}},\n\nThank you for your order! We\'re getting it ready for you.\n\nOrder #{{order_number}}\nTotal: {{order_total}}\n\nBest regards,\n{{store_name}}',
    isActive: true,
    lastModified: '2024-01-15T10:30:00Z',
    variables: ['customer_name', 'order_number', 'order_total', 'store_name'],
    storeId: 'store-1',
  },
  {
    id: 'tpl-2',
    name: 'Your Order is on the Way',
    category: 'shipping-update',
    subject: 'Your order {{order_number}} has shipped!',
    content: 'Hi {{customer_name}},\n\nGreat news! Your order is on its way.\n\nCarrier: {{shipping_carrier}}\nTracking #: {{tracking_number}}\n\nCheers,\n{{store_name}}',
    isActive: true,
    lastModified: '2024-01-14T08:15:00Z',
    variables: ['customer_name', 'order_number', 'shipping_carrier', 'tracking_number', 'store_name'],
    storeId: 'store-1',
  },
  {
    id: 'tpl-3',
    name: 'Delivered!',
    category: 'delivery-confirmation',
    subject: 'Your order {{order_number}} has been delivered!',
    content: 'Hi {{customer_name}},\n\nYour order has been delivered!\n\nOrder #{{order_number}}\nDelivered on: {{delivery_date}}\n\nThank you for shopping with {{store_name}}!',
    isActive: true,
    lastModified: '2024-01-13T14:45:00Z',
    variables: ['customer_name', 'order_number', 'delivery_date', 'store_name'],
    storeId: 'store-1',
  },
  {
    id: 'tpl-4',
    name: 'You Left Something Behind',
    category: 'abandoned-cart',
    subject: '{{customer_name}}, your cart is waiting for you!',
    content: 'Hi {{customer_name}},\n\nLooks like you left some items in your cart.\n\nCart Total: {{cart_total}}\nUse code {{discount_code}} for {{discount_offer}} off!\n\nHappy shopping,\n{{store_name}}',
    isActive: true,
    lastModified: '2024-01-12T16:20:00Z',
    variables: ['customer_name', 'cart_total', 'discount_code', 'discount_offer', 'store_name'],
    storeId: 'store-1',
  },
  {
    id: 'tpl-5',
    name: 'Welcome to {{store_name}}!',
    category: 'welcome-email',
    subject: 'Welcome to {{store_name}} — let\'s get started!',
    content: 'Hi {{customer_name}},\n\nWelcome to {{store_name}}! We\'re so glad you\'re here.\n\nUse code {{discount_code}} for {{discount_offer}} off your first order!\n\nWarmly,\nThe {{store_name}} Team',
    isActive: true,
    lastModified: '2024-01-11T09:00:00Z',
    variables: ['customer_name', 'store_name', 'discount_code', 'discount_offer'],
    storeId: 'store-1',
  },
  {
    id: 'tpl-6',
    name: 'Reset Your Password',
    category: 'password-reset',
    subject: 'Reset your {{store_name}} password',
    content: 'Hi {{customer_name}},\n\nWe received a request to reset your password.\n\nClick here: {{reset_url}}\nThis link expires in {{expiry_minutes}} minutes.\n\n{{store_name}} Security Team',
    isActive: true,
    lastModified: '2024-01-10T11:30:00Z',
    variables: ['customer_name', 'store_name', 'reset_url', 'expiry_minutes'],
    storeId: 'store-1',
  },
  {
    id: 'tpl-7',
    name: 'Special Offer Inside!',
    category: 'promotional',
    subject: '{{customer_name}}, an exclusive offer just for you!',
    content: 'Hi {{customer_name}},\n\n{{promo_headline}}\n\nEnjoy {{discount_offer}} off with code: {{discount_code}}\nSale ends: {{promo_end_date}}\n\nHappy shopping,\n{{store_name}}',
    isActive: false,
    lastModified: '2024-01-09T15:45:00Z',
    variables: ['customer_name', 'promo_headline', 'discount_offer', 'discount_code', 'promo_end_date', 'store_name'],
    storeId: 'store-1',
  },
]

// GET /api/email-templates?storeId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const storeId = searchParams.get('storeId')

  if (!storeId) {
    return NextResponse.json(
      { message: 'storeId is required' },
      { status: 400 }
    )
  }

  // Return mock templates (in real app, filter by storeId from DB)
  return NextResponse.json({
    templates: mockTemplates,
    pagination: {
      page: 1,
      limit: 50,
      total: mockTemplates.length,
      totalPages: 1,
    },
  })
}

// POST /api/email-templates — Create or update a template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      id,
      name,
      category,
      subject,
      content,
      isActive,
      storeId,
    } = body

    if (!storeId) {
      return NextResponse.json(
        { message: 'storeId is required' },
        { status: 400 }
      )
    }

    if (!name || !subject || !content) {
      return NextResponse.json(
        { message: 'name, subject, and content are required' },
        { status: 400 }
      )
    }

    // Extract variables from subject and content
    const variablePattern = /\{\{(\w+)\}\}/g
    const allMatches = (subject.match(variablePattern) || [])
      .concat(content.match(variablePattern) || [])
    const variables = Array.from(
      new Set(allMatches.map((v: string) => v.replace(/\{\{|\}\}/g, '')))
    )

    if (id) {
      // Update existing template (mock)
      const existing = mockTemplates.find((t) => t.id === id)
      if (!existing) {
        return NextResponse.json(
          { message: 'Template not found' },
          { status: 404 }
        )
      }

      const updated = {
        ...existing,
        name,
        category: category || existing.category,
        subject,
        content,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        variables,
        lastModified: new Date().toISOString(),
      }

      return NextResponse.json({ template: updated })
    }

    // Create new template (mock)
    const newTemplate = {
      id: `tpl-${Date.now()}`,
      name,
      category: category || 'order-confirmation',
      subject,
      content,
      isActive: isActive !== undefined ? isActive : true,
      variables,
      lastModified: new Date().toISOString(),
      storeId,
    }

    return NextResponse.json({ template: newTemplate }, { status: 201 })
  } catch {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 }
    )
  }
}
