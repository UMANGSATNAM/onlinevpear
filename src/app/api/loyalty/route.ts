import { NextRequest, NextResponse } from 'next/server'

// ── Types ──
interface LoyaltyTier {
  id: string
  name: string
  minPoints: number
  maxPoints: number | null
  memberCount: number
  benefits: string[]
}

interface LoyaltyMember {
  id: string
  name: string
  email: string
  points: number
  tier: string
  totalSpend: number
  joinedAt: string
}

interface LoyaltyActivity {
  id: string
  memberId: string
  memberName: string
  type: 'earned' | 'redeemed' | 'tier_upgrade' | 'bonus'
  points: number
  description: string
  timestamp: string
}

interface RewardItem {
  id: string
  name: string
  pointsCost: number
  description: string
  redemptionCount: number
}

interface LoyaltyConfig {
  pointsPerDollar: number
  welcomeBonus: number
  minRedemption: number
  expirationDays: number
}

// ── In-memory data (mock) ──
const loyaltyConfig: LoyaltyConfig = {
  pointsPerDollar: 10,
  welcomeBonus: 100,
  minRedemption: 250,
  expirationDays: 365,
}

const tiers: LoyaltyTier[] = [
  { id: 't1', name: 'Bronze', minPoints: 0, maxPoints: 499, memberCount: 8, benefits: ['1x points multiplier', 'Birthday bonus (50 pts)', 'Free standard shipping'] },
  { id: 't2', name: 'Silver', minPoints: 500, maxPoints: 1499, memberCount: 4, benefits: ['1.5x points multiplier', 'Birthday bonus (100 pts)', 'Free express shipping', 'Early access to sales'] },
  { id: 't3', name: 'Gold', minPoints: 1500, maxPoints: 4999, memberCount: 2, benefits: ['2x points multiplier', 'Birthday bonus (200 pts)', 'Free express shipping', 'Exclusive products', 'Priority support'] },
  { id: 't4', name: 'Platinum', minPoints: 5000, maxPoints: null, memberCount: 1, benefits: ['3x points multiplier', 'Birthday bonus (500 pts)', 'Free overnight shipping', 'Exclusive products', 'Priority support', 'Personal shopper', 'VIP events'] },
]

const members: LoyaltyMember[] = [
  { id: 'm1', name: 'Victoria Sterling', email: 'victoria@example.com', points: 8420, tier: 'Platinum', totalSpend: 12450, joinedAt: '2023-03-15' },
  { id: 'm2', name: 'Marcus Chen', email: 'marcus@example.com', points: 3890, tier: 'Gold', totalSpend: 7820, joinedAt: '2023-05-20' },
  { id: 'm3', name: 'Sophia Rodriguez', email: 'sophia@example.com', points: 2650, tier: 'Gold', totalSpend: 5430, joinedAt: '2023-07-10' },
  { id: 'm4', name: 'James Wilson', email: 'james@example.com', points: 1280, tier: 'Silver', totalSpend: 3210, joinedAt: '2023-09-01' },
  { id: 'm5', name: 'Aisha Patel', email: 'aisha@example.com', points: 980, tier: 'Silver', totalSpend: 2450, joinedAt: '2024-01-15' },
  { id: 'm6', name: 'Elena Volkov', email: 'elena@example.com', points: 720, tier: 'Silver', totalSpend: 1890, joinedAt: '2024-02-20' },
  { id: 'm7', name: 'David Kim', email: 'david@example.com', points: 510, tier: 'Silver', totalSpend: 1340, joinedAt: '2024-03-10' },
  { id: 'm8', name: 'Rachel Green', email: 'rachel@example.com', points: 380, tier: 'Bronze', totalSpend: 980, joinedAt: '2024-04-05' },
  { id: 'm9', name: 'Tom Baker', email: 'tom@example.com', points: 290, tier: 'Bronze', totalSpend: 760, joinedAt: '2024-05-12' },
  { id: 'm10', name: 'Nina Sharma', email: 'nina@example.com', points: 210, tier: 'Bronze', totalSpend: 540, joinedAt: '2024-06-18' },
  { id: 'm11', name: 'Carlos Mendez', email: 'carlos@example.com', points: 150, tier: 'Bronze', totalSpend: 390, joinedAt: '2024-07-22' },
  { id: 'm12', name: 'Hannah Lee', email: 'hannah@example.com', points: 120, tier: 'Bronze', totalSpend: 310, joinedAt: '2024-08-30' },
  { id: 'm13', name: 'Alex Petrov', email: 'alex@example.com', points: 80, tier: 'Bronze', totalSpend: 200, joinedAt: '2024-10-05' },
  { id: 'm14', name: 'Mia Johnson', email: 'mia@example.com', points: 45, tier: 'Bronze', totalSpend: 120, joinedAt: '2024-11-14' },
  { id: 'm15', name: "Liam O'Brien", email: 'liam@example.com', points: 20, tier: 'Bronze', totalSpend: 55, joinedAt: '2025-01-02' },
]

const activities: LoyaltyActivity[] = [
  { id: 'a1', memberId: 'm1', memberName: 'Victoria Sterling', type: 'earned', points: 150, description: 'Purchase of Premium Headphones', timestamp: '2 min ago' },
  { id: 'a2', memberId: 'm3', memberName: 'Sophia Rodriguez', type: 'redeemed', points: 500, description: 'Redeemed $10 Off coupon', timestamp: '15 min ago' },
  { id: 'a3', memberId: 'm5', memberName: 'Aisha Patel', type: 'tier_upgrade', points: 0, description: 'Upgraded from Bronze to Silver', timestamp: '1 hr ago' },
  { id: 'a4', memberId: 'm2', memberName: 'Marcus Chen', type: 'bonus', points: 200, description: 'Referral bonus — invited friend', timestamp: '2 hrs ago' },
  { id: 'a5', memberId: 'm7', memberName: 'Elena Volkov', type: 'earned', points: 85, description: 'Purchase of Yoga Mat', timestamp: '3 hrs ago' },
  { id: 'a6', memberId: 'm1', memberName: 'Victoria Sterling', type: 'earned', points: 300, description: 'Purchase of Smart Watch Pro', timestamp: '5 hrs ago' },
  { id: 'a7', memberId: 'm4', memberName: 'James Wilson', type: 'redeemed', points: 1000, description: 'Redeemed Free Product reward', timestamp: '8 hrs ago' },
  { id: 'a8', memberId: 'm9', memberName: 'Tom Baker', type: 'bonus', points: 50, description: 'Birthday bonus', timestamp: '12 hrs ago' },
  { id: 'a9', memberId: 'm6', memberName: 'David Kim', type: 'tier_upgrade', points: 0, description: 'Upgraded from Bronze to Silver', timestamp: '1 day ago' },
  { id: 'a10', memberId: 'm8', memberName: 'Rachel Green', type: 'earned', points: 45, description: 'Purchase of Candle Set', timestamp: '1 day ago' },
]

const rewards: RewardItem[] = [
  { id: 'rw1', name: '$10 Off Your Order', pointsCost: 500, description: 'Get $10 off your next purchase of $50 or more', redemptionCount: 87 },
  { id: 'rw2', name: 'Free Shipping', pointsCost: 250, description: 'Free standard shipping on your next order', redemptionCount: 142 },
  { id: 'rw3', name: 'Free Product', pointsCost: 1000, description: 'Choose any product under $25 for free', redemptionCount: 34 },
  { id: 'rw4', name: 'Double Points Day', pointsCost: 300, description: 'Earn 2x points on all purchases for 24 hours', redemptionCount: 56 },
  { id: 'rw5', name: '15% Off Coupon', pointsCost: 750, description: 'Get 15% off your next order, no minimum', redemptionCount: 63 },
  { id: 'rw6', name: 'Exclusive Access', pointsCost: 1500, description: 'Early access to new product launches for a month', redemptionCount: 18 },
]

// ── GET handler ──
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    // Compute stats
    const totalMembers = members.length
    const pointsIssued = members.reduce((sum, m) => sum + m.points, 0) + 12500
    const pointsRedeemed = 18400
    const rewardValue = pointsRedeemed * 0.02

    // Top members sorted by points
    const topMembers = [...members].sort((a, b) => b.points - a.points).slice(0, 10)

    return NextResponse.json({
      stats: { totalMembers, pointsIssued, pointsRedeemed, rewardValue },
      config: loyaltyConfig,
      tiers,
      members: topMembers,
      activities,
      rewards,
      programEnabled: true,
    })
  } catch (error) {
    console.error('Loyalty GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ── POST handler ──
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, config } = body

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId is required' },
        { status: 400 }
      )
    }

    // Update config
    if (config) {
      if (config.pointsPerDollar !== undefined) loyaltyConfig.pointsPerDollar = config.pointsPerDollar
      if (config.welcomeBonus !== undefined) loyaltyConfig.welcomeBonus = config.welcomeBonus
      if (config.minRedemption !== undefined) loyaltyConfig.minRedemption = config.minRedemption
      if (config.expirationDays !== undefined) loyaltyConfig.expirationDays = config.expirationDays
    }

    return NextResponse.json({
      success: true,
      config: loyaltyConfig,
    })
  } catch (error) {
    console.error('Loyalty POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
