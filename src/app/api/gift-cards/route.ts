import { NextRequest, NextResponse } from 'next/server'

// In-memory gift cards store (mock data for demo)
// In production, this would use Prisma with a GiftCard model
interface GiftCard {
  id: string
  code: string
  initialValue: number
  balance: number
  recipientName: string
  recipientEmail: string
  message: string
  status: 'active' | 'redeemed' | 'expired' | 'partially_used'
  expiresAt: string | null
  storeId: string
  createdAt: string
  transactions: Array<{ id: string; amount: number; description: string; date: string }>
}

const giftCardsStore: GiftCard[] = [
  {
    id: 'gc-1', code: 'SG-A7K2-M9P4-X1L8', initialValue: 100, balance: 100,
    recipientName: 'Sarah Johnson', recipientEmail: 'sarah@example.com',
    message: 'Happy Birthday! Enjoy your gift!', status: 'active',
    expiresAt: '2026-03-15', storeId: 'store-1', createdAt: '2025-01-10', transactions: [],
  },
  {
    id: 'gc-2', code: 'SG-B3N5-Q8R2-W4T6', initialValue: 250, balance: 0,
    recipientName: 'Mike Chen', recipientEmail: 'mike@example.com',
    message: 'Thank you for being a great customer!', status: 'redeemed',
    expiresAt: '2026-01-01', storeId: 'store-1', createdAt: '2024-11-20',
    transactions: [
      { id: 'tx-1', amount: 150, description: 'Order #1042', date: '2024-12-05' },
      { id: 'tx-2', amount: 100, description: 'Order #1058', date: '2024-12-20' },
    ],
  },
  {
    id: 'gc-3', code: 'SG-C9D1-F5G7-H2J3', initialValue: 50, balance: 0,
    recipientName: 'Emily Davis', recipientEmail: 'emily@example.com',
    message: '', status: 'expired',
    expiresAt: '2024-12-31', storeId: 'store-1', createdAt: '2024-06-15', transactions: [],
  },
  {
    id: 'gc-4', code: 'SG-D4E6-K8L0-M2N4', initialValue: 500, balance: 320,
    recipientName: 'Alex Rivera', recipientEmail: 'alex@example.com',
    message: 'Holiday bonus from the team!', status: 'partially_used',
    expiresAt: '2026-06-30', storeId: 'store-1', createdAt: '2024-12-25',
    transactions: [
      { id: 'tx-3', amount: 180, description: 'Order #1102', date: '2025-01-05' },
    ],
  },
  {
    id: 'gc-5', code: 'SG-E1F3-G5H7-I9J0', initialValue: 75, balance: 75,
    recipientName: 'Lisa Wang', recipientEmail: 'lisa@example.com',
    message: 'Welcome to our store!', status: 'active',
    expiresAt: '2026-09-01', storeId: 'store-1', createdAt: '2025-02-01', transactions: [],
  },
  {
    id: 'gc-6', code: 'SG-F2G4-H6I8-J0K1', initialValue: 200, balance: 45,
    recipientName: 'Tom Brown', recipientEmail: 'tom@example.com',
    message: 'Congratulations on your anniversary!', status: 'partially_used',
    expiresAt: '2026-04-15', storeId: 'store-1', createdAt: '2024-10-15',
    transactions: [
      { id: 'tx-4', amount: 100, description: 'Order #980', date: '2024-11-02' },
      { id: 'tx-5', amount: 55, description: 'Order #995', date: '2024-11-18' },
    ],
  },
  {
    id: 'gc-7', code: 'SG-G8H0-J2K4-L6M8', initialValue: 150, balance: 150,
    recipientName: 'Nina Patel', recipientEmail: 'nina@example.com',
    message: 'Just because you deserve it!', status: 'active',
    expiresAt: null, storeId: 'store-1', createdAt: '2025-01-20', transactions: [],
  },
  {
    id: 'gc-8', code: 'SG-H3I5-K7M9-N1P3', initialValue: 300, balance: 0,
    recipientName: 'David Kim', recipientEmail: 'david@example.com',
    message: 'Employee of the month reward', status: 'redeemed',
    expiresAt: '2025-12-31', storeId: 'store-1', createdAt: '2024-09-01',
    transactions: [
      { id: 'tx-6', amount: 300, description: 'Order #920', date: '2024-09-15' },
    ],
  },
  {
    id: 'gc-9', code: 'SG-I6J8-L0N2-O4Q6', initialValue: 25, balance: 0,
    recipientName: 'Rachel Green', recipientEmail: 'rachel@example.com',
    message: '', status: 'expired',
    expiresAt: '2024-10-01', storeId: 'store-1', createdAt: '2024-04-01', transactions: [],
  },
  {
    id: 'gc-10', code: 'SG-J9K1-M3O5-P7R9', initialValue: 1000, balance: 1000,
    recipientName: 'Corporate Client - Acme Inc', recipientEmail: 'gifts@acme.com',
    message: 'Annual partnership appreciation gift', status: 'active',
    expiresAt: '2027-01-01', storeId: 'store-1', createdAt: '2025-02-14', transactions: [],
  },
]

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `SG-${seg()}-${seg()}-${seg()}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let filtered = [...giftCardsStore]

    // Filter by store
    if (storeId) {
      filtered = filtered.filter(c => c.storeId === storeId)
    }

    // Filter by status
    if (status && status !== 'all') {
      filtered = filtered.filter(c => c.status === status)
    }

    // Search by code or recipient
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(c =>
        c.code.toLowerCase().includes(q) ||
        c.recipientName.toLowerCase().includes(q) ||
        c.recipientEmail.toLowerCase().includes(q)
      )
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const paged = filtered.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      giftCards: paged,
      pagination: { page, limit, total, totalPages },
    })
  } catch (error) {
    console.error('Gift cards GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, code, initialValue, recipientName, recipientEmail, message, expiresAt } = body

    if (!storeId || !code || !initialValue || !recipientName || !recipientEmail) {
      return NextResponse.json(
        { error: 'storeId, code, initialValue, recipientName, and recipientEmail are required' },
        { status: 400 }
      )
    }

    // Check code uniqueness
    const existing = giftCardsStore.find(c => c.code === code && c.storeId === storeId)
    if (existing) {
      return NextResponse.json(
        { error: 'Gift card code already exists in this store' },
        { status: 409 }
      )
    }

    const amount = parseFloat(String(initialValue))
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'initialValue must be a positive number' },
        { status: 400 }
      )
    }

    const giftCard: GiftCard = {
      id: `gc-${Date.now()}`,
      code,
      initialValue: amount,
      balance: amount,
      recipientName,
      recipientEmail,
      message: message || '',
      status: 'active',
      expiresAt: expiresAt || null,
      storeId,
      createdAt: new Date().toISOString().split('T')[0],
      transactions: [],
    }

    giftCardsStore.unshift(giftCard)

    return NextResponse.json({ giftCard }, { status: 201 })
  } catch (error) {
    console.error('Gift cards POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
