import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { email: { contains: search } },
        { domain: { contains: search } },
      ]
    }

    const [merchants, total] = await Promise.all([
      db.merchant.findMany({
        where,
        include: {
          plan: true,
          _count: { select: { stores: true, customers: true, users: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.merchant.count({ where }),
    ])

    return NextResponse.json({
      merchants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Merchants GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessName, email, phone, domain, subdomain, planId, settings } = body

    if (!businessName || !email) {
      return NextResponse.json(
        { error: 'businessName and email are required' },
        { status: 400 }
      )
    }

    // Check unique email
    const existing = await db.merchant.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Merchant with this email already exists' },
        { status: 409 }
      )
    }

    // Check unique domain
    if (domain) {
      const domainExists = await db.merchant.findUnique({ where: { domain } })
      if (domainExists) {
        return NextResponse.json(
          { error: 'Domain already in use' },
          { status: 409 }
        )
      }
    }

    const merchant = await db.merchant.create({
      data: {
        businessName,
        email,
        phone: phone || null,
        domain: domain || null,
        subdomain: subdomain || null,
        planId: planId || null,
        status: 'trial',
        settings: settings ? JSON.stringify(settings) : '{}',
      },
      include: {
        plan: true,
        stores: true,
      },
    })

    return NextResponse.json({ merchant }, { status: 201 })
  } catch (error) {
    console.error('Merchants POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
