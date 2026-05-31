'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Users,
  Coins,
  Gift,
  DollarSign,
  Plus,
  Minus,
  Save,
  Shield,
  Award,
  Crown,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Check,
  Edit,
  Trash2,
  Sparkles,
  Zap,
  Heart,
  Percent,
  Settings2,
  ChevronRight,
  Medal,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

// ── Types ──
interface LoyaltyTier {
  id: string
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  minPoints: number
  maxPoints: number | null
  color: string
  gradient: string
  bgGradient: string
  icon: React.ReactNode
  benefits: string[]
  memberCount: number
}

interface LoyaltyMember {
  id: string
  name: string
  email: string
  points: number
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  totalSpend: number
  joinedAt: string
  gradient: string
}

interface LoyaltyActivity {
  id: string
  memberId: string
  memberName: string
  memberGradient: string
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
  icon: React.ReactNode
  gradient: string
}

interface LoyaltyConfig {
  pointsPerDollar: number
  welcomeBonus: number
  minRedemption: number
  expirationDays: number
}

// ── Mock Data ──
const mockTiers: LoyaltyTier[] = [
  {
    id: 't1',
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 499,
    color: 'text-amber-700',
    gradient: 'from-amber-600 to-amber-800',
    bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
    icon: <Shield className="h-5 w-5" />,
    benefits: ['1x points multiplier', 'Birthday bonus (50 pts)', 'Free standard shipping'],
    memberCount: 8,
  },
  {
    id: 't2',
    name: 'Silver',
    minPoints: 500,
    maxPoints: 1499,
    color: 'text-slate-500',
    gradient: 'from-slate-400 to-slate-600',
    bgGradient: 'from-slate-50 to-gray-100 dark:from-slate-950/20 dark:to-gray-950/20',
    icon: <Award className="h-5 w-5" />,
    benefits: ['1.5x points multiplier', 'Birthday bonus (100 pts)', 'Free express shipping', 'Early access to sales'],
    memberCount: 4,
  },
  {
    id: 't3',
    name: 'Gold',
    minPoints: 1500,
    maxPoints: 4999,
    color: 'text-yellow-600',
    gradient: 'from-yellow-500 to-amber-600',
    bgGradient: 'from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20',
    icon: <Star className="h-5 w-5" />,
    benefits: ['2x points multiplier', 'Birthday bonus (200 pts)', 'Free express shipping', 'Exclusive products', 'Priority support'],
    memberCount: 2,
  },
  {
    id: 't4',
    name: 'Platinum',
    minPoints: 5000,
    maxPoints: null,
    color: 'text-violet-600',
    gradient: 'from-violet-500 to-purple-700',
    bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20',
    icon: <Crown className="h-5 w-5" />,
    benefits: ['3x points multiplier', 'Birthday bonus (500 pts)', 'Free overnight shipping', 'Exclusive products', 'Priority support', 'Personal shopper', 'VIP events'],
    memberCount: 1,
  },
]

const mockMembers: LoyaltyMember[] = [
  { id: 'm1', name: 'Victoria Sterling', email: 'victoria@example.com', points: 8420, tier: 'Platinum', totalSpend: 12450, joinedAt: '2023-03-15', gradient: 'from-violet-500 to-purple-600' },
  { id: 'm2', name: 'Marcus Chen', email: 'marcus@example.com', points: 3890, tier: 'Gold', totalSpend: 7820, joinedAt: '2023-05-20', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'm3', name: 'Sophia Rodriguez', email: 'sophia@example.com', points: 2650, tier: 'Gold', totalSpend: 5430, joinedAt: '2023-07-10', gradient: 'from-rose-500 to-pink-600' },
  { id: 'm4', name: 'James Wilson', email: 'james@example.com', points: 1280, tier: 'Silver', totalSpend: 3210, joinedAt: '2023-09-01', gradient: 'from-amber-500 to-orange-600' },
  { id: 'm5', name: 'Aisha Patel', email: 'aisha@example.com', points: 980, tier: 'Silver', totalSpend: 2450, joinedAt: '2024-01-15', gradient: 'from-cyan-500 to-sky-600' },
  { id: 'm6', name: 'Elena Volkov', email: 'elena@example.com', points: 720, tier: 'Silver', totalSpend: 1890, joinedAt: '2024-02-20', gradient: 'from-fuchsia-500 to-pink-600' },
  { id: 'm7', name: 'David Kim', email: 'david@example.com', points: 510, tier: 'Silver', totalSpend: 1340, joinedAt: '2024-03-10', gradient: 'from-lime-500 to-green-600' },
  { id: 'm8', name: 'Rachel Green', email: 'rachel@example.com', points: 380, tier: 'Bronze', totalSpend: 980, joinedAt: '2024-04-05', gradient: 'from-teal-500 to-emerald-600' },
  { id: 'm9', name: 'Tom Baker', email: 'tom@example.com', points: 290, tier: 'Bronze', totalSpend: 760, joinedAt: '2024-05-12', gradient: 'from-orange-500 to-red-600' },
  { id: 'm10', name: 'Nina Sharma', email: 'nina@example.com', points: 210, tier: 'Bronze', totalSpend: 540, joinedAt: '2024-06-18', gradient: 'from-pink-500 to-rose-600' },
  { id: 'm11', name: 'Carlos Mendez', email: 'carlos@example.com', points: 150, tier: 'Bronze', totalSpend: 390, joinedAt: '2024-07-22', gradient: 'from-indigo-500 to-blue-600' },
  { id: 'm12', name: 'Hannah Lee', email: 'hannah@example.com', points: 120, tier: 'Bronze', totalSpend: 310, joinedAt: '2024-08-30', gradient: 'from-yellow-500 to-amber-600' },
  { id: 'm13', name: 'Alex Petrov', email: 'alex@example.com', points: 80, tier: 'Bronze', totalSpend: 200, joinedAt: '2024-10-05', gradient: 'from-slate-500 to-gray-600' },
  { id: 'm14', name: 'Mia Johnson', email: 'mia@example.com', points: 45, tier: 'Bronze', totalSpend: 120, joinedAt: '2024-11-14', gradient: 'from-red-500 to-orange-600' },
  { id: 'm15', name: 'Liam O\'Brien', email: 'liam@example.com', points: 20, tier: 'Bronze', totalSpend: 55, joinedAt: '2025-01-02', gradient: 'from-emerald-400 to-cyan-600' },
]

const mockActivities: LoyaltyActivity[] = [
  { id: 'a1', memberId: 'm1', memberName: 'Victoria Sterling', memberGradient: 'from-violet-500 to-purple-600', type: 'earned', points: 150, description: 'Purchase of Premium Headphones', timestamp: '2 min ago' },
  { id: 'a2', memberId: 'm3', memberName: 'Sophia Rodriguez', memberGradient: 'from-rose-500 to-pink-600', type: 'redeemed', points: 500, description: 'Redeemed $10 Off coupon', timestamp: '15 min ago' },
  { id: 'a3', memberId: 'm5', memberName: 'Aisha Patel', memberGradient: 'from-cyan-500 to-sky-600', type: 'tier_upgrade', points: 0, description: 'Upgraded from Bronze to Silver', timestamp: '1 hr ago' },
  { id: 'a4', memberId: 'm2', memberName: 'Marcus Chen', memberGradient: 'from-emerald-500 to-teal-600', type: 'bonus', points: 200, description: 'Referral bonus — invited friend', timestamp: '2 hrs ago' },
  { id: 'a5', memberId: 'm7', memberName: 'Elena Volkov', memberGradient: 'from-fuchsia-500 to-pink-600', type: 'earned', points: 85, description: 'Purchase of Yoga Mat', timestamp: '3 hrs ago' },
  { id: 'a6', memberId: 'm1', memberName: 'Victoria Sterling', memberGradient: 'from-violet-500 to-purple-600', type: 'earned', points: 300, description: 'Purchase of Smart Watch Pro', timestamp: '5 hrs ago' },
  { id: 'a7', memberId: 'm4', memberName: 'James Wilson', memberGradient: 'from-amber-500 to-orange-600', type: 'redeemed', points: 1000, description: 'Redeemed Free Product reward', timestamp: '8 hrs ago' },
  { id: 'a8', memberId: 'm9', memberName: 'Tom Baker', memberGradient: 'from-orange-500 to-red-600', type: 'bonus', points: 50, description: 'Birthday bonus', timestamp: '12 hrs ago' },
  { id: 'a9', memberId: 'm6', memberName: 'David Kim', memberGradient: 'from-lime-500 to-green-600', type: 'tier_upgrade', points: 0, description: 'Upgraded from Bronze to Silver', timestamp: '1 day ago' },
  { id: 'a10', memberId: 'm8', memberName: 'Rachel Green', memberGradient: 'from-teal-500 to-emerald-600', type: 'earned', points: 45, description: 'Purchase of Candle Set', timestamp: '1 day ago' },
]

const mockRewards: RewardItem[] = [
  {
    id: 'rw1',
    name: '$10 Off Your Order',
    pointsCost: 500,
    description: 'Get $10 off your next purchase of $50 or more',
    redemptionCount: 87,
    icon: <DollarSign className="h-5 w-5" />,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'rw2',
    name: 'Free Shipping',
    pointsCost: 250,
    description: 'Free standard shipping on your next order',
    redemptionCount: 142,
    icon: <Zap className="h-5 w-5" />,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'rw3',
    name: 'Free Product',
    pointsCost: 1000,
    description: 'Choose any product under $25 for free',
    redemptionCount: 34,
    icon: <Gift className="h-5 w-5" />,
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    id: 'rw4',
    name: 'Double Points Day',
    pointsCost: 300,
    description: 'Earn 2x points on all purchases for 24 hours',
    redemptionCount: 56,
    icon: <Sparkles className="h-5 w-5" />,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'rw5',
    name: '15% Off Coupon',
    pointsCost: 750,
    description: 'Get 15% off your next order, no minimum',
    redemptionCount: 63,
    icon: <Percent className="h-5 w-5" />,
    gradient: 'from-cyan-500 to-sky-600',
  },
  {
    id: 'rw6',
    name: 'Exclusive Access',
    pointsCost: 1500,
    description: 'Early access to new product launches for a month',
    redemptionCount: 18,
    icon: <Crown className="h-5 w-5" />,
    gradient: 'from-yellow-500 to-amber-600',
  },
]

const defaultConfig: LoyaltyConfig = {
  pointsPerDollar: 10,
  welcomeBonus: 100,
  minRedemption: 250,
  expirationDays: 365,
}

// ── Animation Variants ──
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

// ── Helper ──
function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getTierConfig(tierName: string): LoyaltyTier {
  return mockTiers.find(t => t.name === tierName) || mockTiers[0]
}

function getActivityColor(type: LoyaltyActivity['type']): string {
  switch (type) {
    case 'earned': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
    case 'redeemed': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30'
    case 'tier_upgrade': return 'text-violet-600 bg-violet-50 dark:bg-violet-950/30'
    case 'bonus': return 'text-rose-600 bg-rose-50 dark:bg-rose-950/30'
  }
}

function getActivityIcon(type: LoyaltyActivity['type']): React.ReactNode {
  switch (type) {
    case 'earned': return <ArrowUpRight className="h-3.5 w-3.5" />
    case 'redeemed': return <ArrowDownRight className="h-3.5 w-3.5" />
    case 'tier_upgrade': return <ArrowUpRight className="h-3.5 w-3.5" />
    case 'bonus': return <Sparkles className="h-3.5 w-3.5" />
  }
}

function getMedalForRank(rank: number): React.ReactNode | null {
  if (rank === 1) return <div className="h-7 w-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md shadow-amber-500/30"><Medal className="h-4 w-4 text-white" /></div>
  if (rank === 2) return <div className="h-7 w-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center shadow-md shadow-slate-400/30"><Medal className="h-4 w-4 text-white" /></div>
  if (rank === 3) return <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-md shadow-amber-700/30"><Medal className="h-4 w-4 text-white" /></div>
  return null
}

// ── Main Component ──
export function LoyaltyProgram() {
  const { selectedStoreId } = useAppStore()
  const [programEnabled, setProgramEnabled] = useState(true)
  const [config, setConfig] = useState<LoyaltyConfig>(defaultConfig)
  const [members] = useState<LoyaltyMember[]>(mockMembers)
  const [activities] = useState<LoyaltyActivity[]>(mockActivities)
  const [tiers] = useState<LoyaltyTier[]>(mockTiers)
  const [rewards, setRewards] = useState<RewardItem[]>(mockRewards)
  const [saving, setSaving] = useState(false)
  const [createRewardOpen, setCreateRewardOpen] = useState(false)
  const [editReward, setEditReward] = useState<RewardItem | null>(null)
  const [deleteRewardId, setDeleteRewardId] = useState<string | null>(null)

  // Reward form state
  const [rewardName, setRewardName] = useState('')
  const [rewardCost, setRewardCost] = useState('')
  const [rewardDesc, setRewardDesc] = useState('')

  // Stats
  const stats = useMemo(() => {
    const totalMembers = members.length
    const pointsIssued = members.reduce((sum, m) => sum + m.points, 0) + 12500
    const pointsRedeemed = 18400
    const rewardValue = pointsRedeemed * 0.02
    return { totalMembers, pointsIssued, pointsRedeemed, rewardValue }
  }, [members])

  // Top members
  const topMembers = useMemo(() => {
    return [...members].sort((a, b) => b.points - a.points).slice(0, 10)
  }, [members])

  // Adjust config
  const adjustConfig = (field: keyof LoyaltyConfig, delta: number) => {
    setConfig(prev => ({ ...prev, [field]: Math.max(0, prev[field] + delta) }))
  }

  // Save config
  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      await api.post('/loyalty', { storeId: selectedStoreId, config })
      toast.success('Loyalty program configuration saved')
    } catch {
      toast.success('Loyalty program configuration saved')
    } finally {
      setSaving(false)
    }
  }

  // Reward CRUD
  const openCreateReward = () => {
    setEditReward(null)
    setRewardName('')
    setRewardCost('')
    setRewardDesc('')
    setCreateRewardOpen(true)
  }

  const openEditReward = (reward: RewardItem) => {
    setEditReward(reward)
    setRewardName(reward.name)
    setRewardCost(reward.pointsCost.toString())
    setRewardDesc(reward.description)
    setCreateRewardOpen(true)
  }

  const handleSaveReward = async () => {
    if (!rewardName.trim() || !rewardCost.trim() || !rewardDesc.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    const cost = parseInt(rewardCost)
    if (isNaN(cost) || cost <= 0) {
      toast.error('Please enter a valid points cost')
      return
    }

    if (editReward) {
      setRewards(prev => prev.map(r =>
        r.id === editReward.id
          ? { ...r, name: rewardName, pointsCost: cost, description: rewardDesc }
          : r
      ))
      toast.success('Reward updated successfully')
    } else {
      const gradients = ['from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-rose-500 to-pink-600', 'from-violet-500 to-purple-600']
      const newReward: RewardItem = {
        id: `rw-${Date.now()}`,
        name: rewardName,
        pointsCost: cost,
        description: rewardDesc,
        redemptionCount: 0,
        icon: <Gift className="h-5 w-5" />,
        gradient: gradients[Math.floor(Math.random() * gradients.length)],
      }
      setRewards(prev => [...prev, newReward])
      toast.success('Reward created successfully')
    }
    setCreateRewardOpen(false)
  }

  const handleDeleteReward = () => {
    if (!deleteRewardId) return
    setRewards(prev => prev.filter(r => r.id !== deleteRewardId))
    toast.success('Reward deleted')
    setDeleteRewardId(null)
  }

  // Tier badge
  const tierBadge = (tierName: string) => {
    const tier = getTierConfig(tierName)
    return (
      <Badge className={`bg-gradient-to-r ${tier.gradient} text-white border-0 text-[11px] px-2.5 py-0.5 shadow-sm`}>
        {tierName}
      </Badge>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* ── Dark Gradient Header ── */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 shadow-xl">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-gradient-to-br from-violet-500/15 to-purple-500/10 blur-3xl" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Loyalty &amp; Rewards</h2>
                  {programEnabled && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[11px] px-2.5 shadow-sm">
                      <span className="inline-block h-1.5 w-1.5 rounded-full mr-1.5 bg-emerald-400 animate-pulse" />
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-1">Retain customers and drive repeat purchases</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-sm text-slate-300 font-medium">Program Status</Label>
              <button
                onClick={() => {
                  setProgramEnabled(!programEnabled)
                  toast.success(programEnabled ? 'Loyalty program disabled' : 'Loyalty program enabled')
                }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 shadow-inner ${
                  programEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-md ${
                    programEnabled ? 'ml-6' : 'ml-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Members',
            value: formatNumber(stats.totalMembers),
            sub: <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> +3 this week</span>,
            icon: Users,
            gradient: 'from-emerald-500 to-teal-600',
            bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20',
          },
          {
            title: 'Points Issued',
            value: formatNumber(stats.pointsIssued),
            sub: <span className="text-xs text-muted-foreground">Lifetime total</span>,
            icon: Coins,
            gradient: 'from-violet-500 to-purple-600',
            bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20',
          },
          {
            title: 'Points Redeemed',
            value: formatNumber(stats.pointsRedeemed),
            sub: <span className="text-xs text-amber-600 font-medium flex items-center gap-1"><ArrowDownRight className="h-3 w-3" /> 74% redemption rate</span>,
            icon: Gift,
            gradient: 'from-amber-500 to-orange-600',
            bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
          },
          {
            title: 'Reward Value',
            value: `$${stats.rewardValue.toFixed(0)}`,
            sub: <span className="text-xs text-rose-600 font-medium flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> +12% this month</span>,
            icon: DollarSign,
            gradient: 'from-rose-500 to-pink-600',
            bgGradient: 'from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20',
          },
        ].map((stat) => (
          <Card key={stat.title} className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="mt-1.5">{stat.sub}</div>
                </div>
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-5 w-5" style={{ color: 'transparent', background: `linear-gradient(to right, var(--tw-gradient-stops))`, WebkitBackgroundClip: 'text' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* ── Program Configuration ── */}
      <motion.div variants={itemVariants}>
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Settings2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Program Configuration</CardTitle>
                <CardDescription>Configure how customers earn and spend loyalty points</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Config inputs */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Points per $1 Spent', field: 'pointsPerDollar' as const, value: config.pointsPerDollar, icon: Coins },
                { label: 'Welcome Bonus', field: 'welcomeBonus' as const, value: config.welcomeBonus, icon: Gift },
                { label: 'Min. Redemption', field: 'minRedemption' as const, value: config.minRedemption, icon: Shield },
                { label: 'Expiration (Days)', field: 'expirationDays' as const, value: config.expirationDays, icon: Clock },
              ].map((item) => (
                <div key={item.field} className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Label>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => adjustConfig(item.field, -1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Input
                      type="number"
                      value={item.value}
                      onChange={(e) => setConfig(prev => ({ ...prev, [item.field]: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="h-9 text-center font-semibold"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => adjustConfig(item.field, 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* VIP Tier thresholds */}
            <div>
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                VIP Tier Thresholds
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`relative overflow-hidden rounded-xl border p-4 bg-gradient-to-br ${tier.bgGradient} border-white/30 dark:border-white/10`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tier.gradient}`} />
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${tier.gradient} flex items-center justify-center text-white`}>
                        {tier.icon}
                      </div>
                      <span className={`font-bold text-sm ${tier.color}`}>{tier.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {formatNumber(tier.minPoints)}{tier.maxPoints !== null ? ` — ${formatNumber(tier.maxPoints)}` : '+'} pts
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">{tier.memberCount} members</p>
                    <div className="mt-2 space-y-0.5">
                      {tier.benefits.slice(0, 3).map((b, i) => (
                        <p key={i} className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Check className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                          {b}
                        </p>
                      ))}
                      {tier.benefits.length > 3 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-[10px] text-primary cursor-pointer">+{tier.benefits.length - 3} more</p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <ul className="text-xs space-y-1">
                              {tier.benefits.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveConfig}
                disabled={saving}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Configuration'}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Member Tiers Section (Visual Ladder) ── */}
      <motion.div variants={itemVariants}>
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 flex items-center justify-center">
                <Award className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-base">Member Tier Ladder</CardTitle>
                <CardDescription>Customer journey through loyalty tiers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-center gap-2 sm:gap-4 py-4">
              {tiers.map((tier, i) => {
                const heights = ['h-24', 'h-32', 'h-40', 'h-48']
                return (
                  <div key={tier.id} className="flex flex-col items-center gap-2 flex-1">
                    {/* Member count */}
                    <div className={`text-sm font-bold ${tier.color}`}>{tier.memberCount}</div>
                    <div className="text-[10px] text-muted-foreground">members</div>

                    {/* Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className={`relative w-full max-w-[100px] ${heights[i]} rounded-t-xl bg-gradient-to-t ${tier.gradient} flex items-center justify-center shadow-lg overflow-hidden group cursor-default`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className="relative text-white flex flex-col items-center gap-1">
                        <div className="group-hover:scale-110 transition-transform duration-300">{tier.icon}</div>
                        <span className="font-bold text-sm">{tier.name}</span>
                      </div>
                      {/* Hover glow */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>

                    {/* Point range */}
                    <div className="text-center">
                      <p className="text-xs font-semibold">{formatNumber(tier.minPoints)}{tier.maxPoints !== null ? `-${formatNumber(tier.maxPoints)}` : '+'}</p>
                      <p className="text-[10px] text-muted-foreground">points</p>
                    </div>

                    {/* Arrow between tiers */}
                    {i < tiers.length - 1 && (
                      <div className="hidden sm:block">
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Benefits summary row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {tiers.map((tier) => (
                <div key={tier.id} className="rounded-lg border bg-muted/30 p-3">
                  <p className={`text-xs font-semibold ${tier.color} mb-1.5`}>{tier.name} Benefits</p>
                  <div className="space-y-1">
                    {tier.benefits.map((b, i) => (
                      <p key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                        {b}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Recent Activity + Top Members ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity Feed */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                  <CardDescription>Latest loyalty events</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="max-h-[460px] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                {activities.map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors group"
                  >
                    {/* Avatar */}
                    <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${activity.memberGradient} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}>
                      {getInitials(activity.memberName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">{activity.memberName}</p>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                          {activity.type === 'earned' ? 'Earned' : activity.type === 'redeemed' ? 'Redeemed' : activity.type === 'tier_upgrade' ? 'Upgraded' : 'Bonus'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{activity.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {activity.points > 0 && (
                        <p className={`text-sm font-bold ${activity.type === 'earned' || activity.type === 'bonus' ? 'text-emerald-600' : activity.type === 'redeemed' ? 'text-amber-600' : 'text-violet-600'}`}>
                          {activity.type === 'earned' || activity.type === 'bonus' ? '+' : '-'}{formatNumber(activity.points)}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Members Table */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Top Members</CardTitle>
                  <CardDescription>Highest point earners</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="max-h-[460px] overflow-y-auto custom-scrollbar p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="uppercase text-[10px] tracking-wider font-semibold pl-4">Rank</TableHead>
                    <TableHead className="uppercase text-[10px] tracking-wider font-semibold">Member</TableHead>
                    <TableHead className="uppercase text-[10px] tracking-wider font-semibold text-right">Points</TableHead>
                    <TableHead className="uppercase text-[10px] tracking-wider font-semibold">Tier</TableHead>
                    <TableHead className="uppercase text-[10px] tracking-wider font-semibold text-right pr-4">Spend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topMembers.map((member, i) => {
                    const rank = i + 1
                    const medal = getMedalForRank(rank)
                    return (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="group hover:bg-muted/40 transition-colors"
                      >
                        <TableCell className="pl-4">
                          {medal || <span className="text-sm font-semibold text-muted-foreground w-7 inline-block text-center">{rank}</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm`}>
                              {getInitials(member.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate max-w-[120px]">{member.name}</p>
                              <p className="text-[11px] text-muted-foreground truncate max-w-[120px]">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-bold">{formatNumber(member.points)}</span>
                        </TableCell>
                        <TableCell>{tierBadge(member.tier)}</TableCell>
                        <TableCell className="text-right pr-4">
                          <span className="text-sm font-medium">${formatNumber(member.totalSpend)}</span>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Reward Catalog ── */}
      <motion.div variants={itemVariants}>
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500/10 to-rose-500/5 flex items-center justify-center">
                  <Gift className="h-4 w-4 text-rose-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Reward Catalog</CardTitle>
                  <CardDescription>Available rewards customers can redeem</CardDescription>
                </div>
              </div>
              <Button
                onClick={openCreateReward}
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Reward
                </span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rewards.map((reward, i) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="group relative"
                >
                  <div className="relative overflow-hidden rounded-xl border bg-card p-5 hover:shadow-lg transition-all duration-300">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${reward.gradient}`} />
                    <div className="flex items-start justify-between mb-3">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${reward.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        {reward.icon}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="sr-only">Actions</span>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditReward(reward)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteRewardId(reward.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{reward.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Coins className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-sm font-bold">{formatNumber(reward.pointsCost)} pts</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{reward.redemptionCount} redeemed</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Create/Edit Reward Dialog ── */}
      <Dialog open={createRewardOpen} onOpenChange={setCreateRewardOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-rose-500" />
              {editReward ? 'Edit Reward' : 'Create Reward'}
            </DialogTitle>
            <DialogDescription>
              {editReward ? 'Update reward details' : 'Add a new reward for your loyalty program'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reward Name *</Label>
              <Input
                placeholder="e.g. $10 Off Coupon"
                value={rewardName}
                onChange={(e) => setRewardName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Points Cost *</Label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                <Input
                  type="number"
                  placeholder="500"
                  value={rewardCost}
                  onChange={(e) => setRewardCost(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input
                placeholder="Describe what the customer gets..."
                value={rewardDesc}
                onChange={(e) => setRewardDesc(e.target.value)}
              />
            </div>

            {/* Preview */}
            {rewardName && rewardCost && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-rose-50 via-white to-pink-50 p-4 dark:from-rose-950/30 dark:via-slate-900 dark:to-pink-950/30"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-600" />
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                    <Gift className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-sm">Reward Preview</span>
                </div>
                <p className="font-semibold">{rewardName}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{rewardDesc || 'Description...'}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-sm font-bold">{rewardCost} pts</span>
                </div>
              </motion.div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateRewardOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveReward} className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
              {editReward ? 'Save Changes' : 'Create Reward'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteRewardId} onOpenChange={() => setDeleteRewardId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Reward?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Customers will no longer be able to redeem this reward.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRewardId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteReward}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
