'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  MessageSquare,
  Flag,
  ThumbsUp,
  Search,
  Filter,
  ChevronDown,
  Reply,
  Eye,
  EyeOff,
  Image as ImageIcon,
  TrendingUp,
  Award,
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
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

// ── Types ──
interface Review {
  id: string
  productId: string
  productName: string
  productImage: string
  customerId: string
  customerName: string
  rating: number
  title: string
  text: string
  images: string[]
  helpfulVotes: number
  status: 'published' | 'pending' | 'flagged'
  merchantReply: string | null
  merchantReplyDate: string | null
  featured: boolean
  createdAt: string
}

// ── Mock Data ──
const mockReviews: Review[] = [
  {
    id: 'r1',
    productId: 'p1',
    productName: 'Wireless Noise-Cancelling Headphones',
    productImage: 'from-violet-500 to-purple-600',
    customerId: 'c1',
    customerName: 'Sarah Mitchell',
    rating: 5,
    title: 'Absolutely incredible sound quality!',
    text: 'I\'ve been using these headphones for about two weeks now and I\'m blown away. The noise cancellation is top-tier — I can\'t hear anything when I\'m on the subway. The bass is deep and rich, and the mids and highs are crystal clear. Battery life easily lasts through my entire workday. The comfort level is also amazing, I forget I\'m wearing them sometimes. Highly recommended for anyone who values audio quality!',
    images: ['from-rose-400 to-pink-500', 'from-amber-400 to-orange-500'],
    helpfulVotes: 24,
    status: 'published',
    merchantReply: 'Thank you so much, Sarah! We\'re thrilled you love the sound quality and comfort. Enjoy your music! 🎵',
    merchantReplyDate: '2025-01-16',
    featured: true,
    createdAt: '2025-01-15',
  },
  {
    id: 'r2',
    productId: 'p2',
    productName: 'Premium Leather Wallet',
    productImage: 'from-amber-500 to-orange-600',
    customerId: 'c2',
    customerName: 'James Rodriguez',
    rating: 4,
    title: 'Great quality, slightly smaller than expected',
    text: 'The leather quality is outstanding — you can feel the craftsmanship. The stitching is precise and the color is exactly as shown. My only gripe is that it\'s a bit smaller than I expected. It fits the essentials but if you carry a lot of cards, you might find it tight. Overall a solid purchase.',
    images: ['from-emerald-400 to-teal-500'],
    helpfulVotes: 12,
    status: 'published',
    merchantReply: null,
    merchantReplyDate: null,
    featured: false,
    createdAt: '2025-01-14',
  },
  {
    id: 'r3',
    productId: 'p3',
    productName: 'Smart Fitness Watch Pro',
    productImage: 'from-emerald-500 to-teal-600',
    customerId: 'c3',
    customerName: 'Emily Chen',
    rating: 5,
    title: 'Best fitness tracker I\'ve owned',
    text: 'Upgraded from a basic tracker and wow, what a difference. The heart rate monitoring is accurate, sleep tracking gives detailed insights, and the GPS is spot-on for my runs. The display is bright and easy to read even in sunlight. App integration is seamless.',
    images: [],
    helpfulVotes: 31,
    status: 'published',
    merchantReply: 'Thanks Emily! We\'re glad the watch is helping you reach your fitness goals! 💪',
    merchantReplyDate: '2025-01-13',
    featured: true,
    createdAt: '2025-01-12',
  },
  {
    id: 'r4',
    productId: 'p4',
    productName: 'Organic Cotton T-Shirt',
    productImage: 'from-cyan-500 to-sky-600',
    customerId: 'c4',
    customerName: 'Mike Thompson',
    rating: 3,
    title: 'Decent but shrinks after washing',
    text: 'The fabric feels great initially and I love the organic cotton concept. However, after the first wash (even on cold), it shrank noticeably. I ordered a Large and it now fits like a Medium. Disappointing because the design and feel are otherwise nice.',
    images: ['from-blue-400 to-indigo-500'],
    helpfulVotes: 8,
    status: 'published',
    merchantReply: null,
    merchantReplyDate: null,
    featured: false,
    createdAt: '2025-01-11',
  },
  {
    id: 'r5',
    productId: 'p5',
    productName: 'Artisan Coffee Beans - Dark Roast',
    productImage: 'from-rose-500 to-pink-600',
    customerId: 'c5',
    customerName: 'Diana Kowalski',
    rating: 5,
    title: 'The best dark roast I\'ve ever had',
    text: 'Rich, smooth, with chocolate undertones. This is how coffee should taste! I\'m a coffee snob and this exceeded my expectations. Will definitely subscribe to the monthly delivery.',
    images: ['from-amber-400 to-red-500', 'from-yellow-400 to-amber-500', 'from-orange-400 to-rose-500'],
    helpfulVotes: 45,
    status: 'published',
    merchantReply: 'Diana, your review made our day! Our roasters take great pride in this blend. Enjoy! ☕',
    merchantReplyDate: '2025-01-10',
    featured: true,
    createdAt: '2025-01-09',
  },
  {
    id: 'r6',
    productId: 'p1',
    productName: 'Wireless Noise-Cancelling Headphones',
    productImage: 'from-violet-500 to-purple-600',
    customerId: 'c6',
    customerName: 'Alex Petrov',
    rating: 2,
    title: 'Bluetooth keeps disconnecting',
    text: 'Sound is good when it works, but the Bluetooth connection is very unreliable. It disconnects randomly every 20-30 minutes. Very frustrating during conference calls. I\'ve tried resetting and updating firmware but the issue persists. Cannot recommend until this is fixed.',
    images: [],
    helpfulVotes: 15,
    status: 'flagged',
    merchantReply: null,
    merchantReplyDate: null,
    featured: false,
    createdAt: '2025-01-08',
  },
  {
    id: 'r7',
    productId: 'p6',
    productName: 'Minimalist Desk Lamp',
    productImage: 'from-slate-500 to-gray-600',
    customerId: 'c7',
    customerName: 'Rachel Green',
    rating: 4,
    title: 'Beautiful design, good light quality',
    text: 'Love the Scandinavian-inspired design. It looks stunning on my desk. The warm light setting is perfect for evening work. The touch controls are intuitive. Only giving 4 stars because the base could be heavier — it wobbles slightly when adjusting the arm.',
    images: ['from-slate-400 to-zinc-500'],
    helpfulVotes: 6,
    status: 'published',
    merchantReply: 'Thanks for the feedback on the base, Rachel! We\'re looking into that for the next version.',
    merchantReplyDate: '2025-01-07',
    featured: false,
    createdAt: '2025-01-06',
  },
  {
    id: 'r8',
    productId: 'p7',
    productName: 'Yoga Mat - Premium Grip',
    productImage: 'from-lime-500 to-green-600',
    customerId: 'c8',
    customerName: 'Lisa Park',
    rating: 1,
    title: 'Terrible quality, started peeling immediately',
    text: 'Very disappointed. After just 3 uses, the surface started peeling off. The grip was never as good as advertised either. I slip during hot yoga which is dangerous. This is not a premium product — feel misled by the description.',
    images: ['from-red-400 to-rose-500', 'from-orange-400 to-red-500'],
    helpfulVotes: 19,
    status: 'flagged',
    merchantReply: null,
    merchantReplyDate: null,
    featured: false,
    createdAt: '2025-01-05',
  },
  {
    id: 'r9',
    productId: 'p2',
    productName: 'Premium Leather Wallet',
    productImage: 'from-amber-500 to-orange-600',
    customerId: 'c9',
    customerName: 'Tom Baker',
    rating: 5,
    title: 'Perfect gift!',
    text: 'Bought this as a birthday present for my dad and he absolutely loves it. The leather smells authentic and the craftsmanship is superb. Comes in a beautiful box too. Fast shipping!',
    images: [],
    helpfulVotes: 10,
    status: 'published',
    merchantReply: 'Glad your dad loves it, Tom! We appreciate your support.',
    merchantReplyDate: '2025-01-04',
    featured: false,
    createdAt: '2025-01-03',
  },
  {
    id: 'r10',
    productId: 'p8',
    productName: 'Stainless Steel Water Bottle',
    productImage: 'from-blue-500 to-indigo-600',
    customerId: 'c10',
    customerName: 'Nina Sharma',
    rating: 4,
    title: 'Keeps water cold all day!',
    text: 'Tested it with ice water in the morning and it was still cold 12 hours later. The double-wall insulation really works. The lid mechanism is clever and leak-proof. Wish it came in more colors though.',
    images: ['from-cyan-400 to-blue-500'],
    helpfulVotes: 22,
    status: 'pending',
    merchantReply: null,
    merchantReplyDate: null,
    featured: false,
    createdAt: '2025-01-02',
  },
  {
    id: 'r11',
    productId: 'p3',
    productName: 'Smart Fitness Watch Pro',
    productImage: 'from-emerald-500 to-teal-600',
    customerId: 'c11',
    customerName: 'Chris O\'Brien',
    rating: 3,
    title: 'Good features, poor battery life',
    text: 'The watch has all the features I need and the interface is smooth. However, the battery barely lasts 2 days with normal use. For a premium product, I expected at least 5 days. Need to charge it constantly which is annoying.',
    images: [],
    helpfulVotes: 7,
    status: 'pending',
    merchantReply: null,
    merchantReplyDate: null,
    featured: false,
    createdAt: '2025-01-01',
  },
  {
    id: 'r12',
    productId: 'p9',
    productName: 'Scented Candle Collection',
    productImage: 'from-fuchsia-500 to-pink-600',
    customerId: 'c12',
    customerName: 'Olivia Davis',
    rating: 5,
    title: 'Heavenly scents, long burn time',
    text: 'Each candle in this collection is a masterpiece. The lavender one is my favorite — so calming. They burn evenly and last much longer than expected. The packaging is elegant, perfect for gifting.',
    images: ['from-purple-400 to-fuchsia-500', 'from-pink-400 to-rose-500'],
    helpfulVotes: 33,
    status: 'published',
    merchantReply: 'Thank you Olivia! Our lavender blend is a bestseller for a reason. Enjoy the ambiance! 🕯️',
    merchantReplyDate: '2024-12-30',
    featured: false,
    createdAt: '2024-12-29',
  },
  {
    id: 'r13',
    productId: 'p4',
    productName: 'Organic Cotton T-Shirt',
    productImage: 'from-cyan-500 to-sky-600',
    customerId: 'c13',
    customerName: 'Kevin Wu',
    rating: 2,
    title: 'Color faded after one wash',
    text: 'Bought the navy blue version and after one wash it looked like a washed-out grey. The organic cotton claim is nice but the dye quality is terrible. Not worth the price.',
    images: ['from-gray-400 to-slate-500'],
    helpfulVotes: 4,
    status: 'pending',
    merchantReply: null,
    merchantReplyDate: null,
    featured: false,
    createdAt: '2024-12-28',
  },
  {
    id: 'r14',
    productId: 'p10',
    productName: 'Bamboo Cutting Board Set',
    productImage: 'from-yellow-500 to-amber-600',
    customerId: 'c14',
    customerName: 'Maria Santos',
    rating: 4,
    title: 'Sturdy and eco-friendly',
    text: 'Love that these are sustainable. The different sizes are practical. They feel solid and don\'t slide on the counter. Just make sure to oil them regularly as the instructions say, otherwise they can dry out.',
    images: [],
    helpfulVotes: 9,
    status: 'published',
    merchantReply: 'Great tip about the oiling, Maria! That keeps them in top condition for years.',
    merchantReplyDate: '2024-12-26',
    featured: false,
    createdAt: '2024-12-25',
  },
  {
    id: 'r15',
    productId: 'p6',
    productName: 'Minimalist Desk Lamp',
    productImage: 'from-slate-500 to-gray-600',
    customerId: 'c15',
    customerName: 'David Kim',
    rating: 3,
    title: 'Nice looking but brightness could be better',
    text: 'Aesthetically it\'s gorgeous — very modern and clean. But for a desk lamp, I wish it was brighter. The max setting is okay for casual reading but not enough for detailed work. The dimming feature is smooth though.',
    images: [],
    helpfulVotes: 3,
    status: 'published',
    merchantReply: null,
    merchantReplyDate: null,
    featured: false,
    createdAt: '2024-12-24',
  },
]

// ── Computed Stats ──
function computeStats(reviews: Review[]) {
  const total = reviews.length
  const avgRating = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0
  const fiveStarCount = reviews.filter(r => r.rating === 5).length
  const fiveStarPercent = total > 0 ? (fiveStarCount / total) * 100 : 0
  const withReplies = reviews.filter(r => r.merchantReply).length
  const responseRate = total > 0 ? (withReplies / total) * 100 : 0

  return { total, avgRating, fiveStarCount, fiveStarPercent, responseRate }
}

// ── Rating Distribution ──
function getRatingDistribution(reviews: Review[]) {
  const dist = [0, 0, 0, 0, 0]
  reviews.forEach(r => { dist[r.rating - 1]++ })
  const max = Math.max(...dist, 1)
  return [5, 4, 3, 2, 1].map(star => ({
    star,
    count: dist[star - 1],
    percent: reviews.length > 0 ? (dist[star - 1] / reviews.length) * 100 : 0,
    fill: star >= 4 ? '#f59e0b' : star === 3 ? '#fb923c' : '#ef4444',
  }))
}

// ── Star Rating Display ──
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' | 'xl' }) {
  const sizeClass = size === 'xl' ? 'h-8 w-8' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${sizeClass} ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )
}

// ── Chart Config ──
const distributionChartConfig = {
  count: { label: 'Reviews', color: '#f59e0b' },
} satisfies ChartConfig

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

// ── Main Component ──
export function ReviewsManagement() {
  const { selectedStoreId } = useAppStore()
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [searchQuery, setSearchQuery] = useState('')
  const [starFilter, setStarFilter] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<string>('newest')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Filter & sort reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews]

    if (starFilter !== null) {
      result = result.filter(r => r.rating === starFilter)
    }

    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        r =>
          r.customerName.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          r.text.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q)
      )
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'highest':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'lowest':
        result.sort((a, b) => a.rating - b.rating)
        break
      case 'with-photos':
        result = result.filter(r => r.images.length > 0)
        break
    }

    return result
  }, [reviews, starFilter, sortBy, statusFilter, searchQuery])

  const stats = computeStats(reviews)
  const distribution = getRatingDistribution(reviews)

  const toggleExpand = (id: string) => {
    setExpandedReviews(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleReply = (id: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openReplyDialog = (review: Review) => {
    setSelectedReview(review)
    setReplyText('')
    setReplyDialogOpen(true)
  }

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please write a reply')
      return
    }
    setSubmitting(true)
    try {
      // In production: await api.post(`/reviews/${selectedReview?.id}/reply`, { text: replyText })
      setReviews(prev =>
        prev.map(r =>
          r.id === selectedReview?.id
            ? { ...r, merchantReply: replyText, merchantReplyDate: new Date().toISOString().split('T')[0] }
            : r
        )
      )
      toast.success('Reply submitted successfully')
      setReplyDialogOpen(false)
      setReplyText('')
    } catch {
      toast.error('Failed to submit reply')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFlag = (review: Review) => {
    setReviews(prev =>
      prev.map(r =>
        r.id === review.id
          ? { ...r, status: r.status === 'flagged' ? 'published' : 'flagged' }
          : r
      )
    )
    toast.success(review.status === 'flagged' ? 'Review unflagged' : 'Review flagged for review')
  }

  const handleFeature = (review: Review) => {
    setReviews(prev =>
      prev.map(r =>
        r.id === review.id
          ? { ...r, featured: !r.featured }
          : r
      )
    )
    toast.success(review.featured ? 'Review unfeatured' : 'Review featured')
  }

  const statusBadge = (status: Review['status']) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Published</Badge>
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>
      case 'flagged':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Flagged</Badge>
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reviews & Ratings</h2>
          <p className="text-sm text-muted-foreground mt-1">Monitor and respond to customer feedback</p>
        </div>
        <div className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl px-5 py-3 border border-amber-200/50 dark:border-amber-800/30">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">{stats.avgRating.toFixed(1)}</div>
            <StarRating rating={Math.round(stats.avgRating)} size="sm" />
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{stats.total}</span> total reviews
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Average Rating',
            value: stats.avgRating.toFixed(1),
            sub: <StarRating rating={Math.round(stats.avgRating)} size="sm" />,
            icon: Star,
            gradient: 'from-amber-500 to-orange-600',
            bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
          },
          {
            title: 'Total Reviews',
            value: stats.total.toString(),
            sub: <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +8 this week</span>,
            icon: MessageSquare,
            gradient: 'from-emerald-500 to-teal-600',
            bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20',
          },
          {
            title: '5-Star Reviews',
            value: `${stats.fiveStarPercent.toFixed(0)}%`,
            sub: <span className="text-xs text-muted-foreground">{stats.fiveStarCount} reviews</span>,
            icon: Award,
            gradient: 'from-violet-500 to-purple-600',
            bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20',
          },
          {
            title: 'Response Rate',
            value: `${stats.responseRate.toFixed(0)}%`,
            sub: <span className="text-xs text-muted-foreground">{reviews.filter(r => r.merchantReply).length} replied</span>,
            icon: Reply,
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
                  <stat.icon className={`h-5 w-5 bg-gradient-to-r ${stat.gradient} bg-clip-text`} style={{ color: 'transparent', background: `linear-gradient(to right, var(--tw-gradient-stops))`, WebkitBackgroundClip: 'text' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={itemVariants}>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Top row: star filter + search */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Star Rating Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setStarFilter(starFilter === star ? null : star)}
                        className={`flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                          starFilter === star
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        <Star className={`h-3 w-3 ${starFilter === star ? 'text-amber-500 fill-amber-500' : ''}`} />
                        {star}
                      </button>
                    ))}
                    {starFilter && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setStarFilter(null)}>
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reviews, products, customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Bottom row: sort + status */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="highest">Highest Rated</SelectItem>
                    <SelectItem value="lowest">Lowest Rated</SelectItem>
                    <SelectItem value="with-photos">With Photos Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>

                <div className="sm:ml-auto text-xs text-muted-foreground flex items-center gap-1">
                  <span className="font-medium text-foreground">{filteredReviews.length}</span> review{filteredReviews.length !== 1 ? 's' : ''} found
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content: Reviews + Distribution Chart */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4 max-h-[800px] overflow-y-auto pr-1 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredReviews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground mb-1">No reviews found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
              </motion.div>
            ) : (
              filteredReviews.map((review, index) => {
                const isExpanded = expandedReviews.has(review.id)
                const isReplyExpanded = expandedReplies.has(review.id)
                const isLongText = review.text.length > 200

                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="group relative overflow-hidden hover:shadow-md transition-all duration-300">
                      {/* Gradient accent based on rating */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                        review.rating >= 4
                          ? 'from-amber-400 to-amber-600'
                          : review.rating === 3
                            ? 'from-orange-400 to-orange-600'
                            : 'from-red-400 to-red-600'
                      }`} />

                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Product image placeholder */}
                          <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${review.productImage} flex items-center justify-center shrink-0`}>
                            <ImageIcon className="h-5 w-5 text-white/80" />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Header row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <div>
                                <p className="text-sm font-semibold">{review.productName}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <StarRating rating={review.rating} />
                                  <span className="text-xs text-muted-foreground">by {review.customerName}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {review.featured && (
                                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px]">
                                    <Award className="h-3 w-3 mr-0.5" /> Featured
                                  </Badge>
                                )}
                                {statusBadge(review.status)}
                                <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                              </div>
                            </div>

                            {/* Review title */}
                            <p className="font-medium text-sm mb-1">{review.title}</p>

                            {/* Review text */}
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {isLongText && !isExpanded
                                ? review.text.slice(0, 200) + '...'
                                : review.text
                              }
                            </p>
                            {isLongText && (
                              <button
                                onClick={() => toggleExpand(review.id)}
                                className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                              >
                                {isExpanded ? 'Show less' : 'Read more'}
                                <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            )}

                            {/* Review images */}
                            {review.images.length > 0 && (
                              <div className="flex items-center gap-2 mt-3">
                                {review.images.map((img, i) => (
                                  <div
                                    key={i}
                                    className={`h-14 w-14 rounded-md bg-gradient-to-br ${img} flex items-center justify-center border border-white/20 shadow-sm`}
                                  >
                                    <ImageIcon className="h-4 w-4 text-white/60" />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Helpful votes */}
                            <div className="flex items-center gap-3 mt-3">
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <ThumbsUp className="h-3 w-3" />
                                {review.helpfulVotes} found helpful
                              </span>
                            </div>

                            {/* Merchant reply section */}
                            {review.merchantReply && (
                              <div className="mt-3">
                                <button
                                  onClick={() => toggleReply(review.id)}
                                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                >
                                  <Reply className="h-3 w-3" />
                                  {isReplyExpanded ? 'Hide your reply' : 'View your reply'}
                                  <ChevronDown className={`h-3 w-3 transition-transform ${isReplyExpanded ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                  {isReplyExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-2 ml-4 pl-3 border-l-2 border-primary/30"
                                    >
                                      <p className="text-sm text-muted-foreground">{review.merchantReply}</p>
                                      <p className="text-xs text-muted-foreground mt-1">Replied on {review.merchantReplyDate}</p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => openReplyDialog(review)}
                              >
                                <Reply className="h-3 w-3 mr-1" />
                                Reply
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className={`h-7 text-xs ${review.status === 'flagged' ? 'text-red-600 border-red-200 hover:bg-red-50' : ''}`}
                                onClick={() => handleFlag(review)}
                              >
                                <Flag className="h-3 w-3 mr-1" />
                                {review.status === 'flagged' ? 'Unflag' : 'Flag'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className={`h-7 text-xs ${review.featured ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : ''}`}
                                onClick={() => handleFeature(review)}
                              >
                                <Award className="h-3 w-3 mr-1" />
                                {review.featured ? 'Unfeature' : 'Feature'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>

        {/* Rating Distribution Chart */}
        <div className="space-y-4">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Rating Distribution</CardTitle>
              <CardDescription>Breakdown of review ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={distributionChartConfig} className="h-[250px] w-full">
                <BarChart
                  data={distribution}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="star"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(v) => `${v} ★`}
                    width={40}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(value, name, item) => [`${value} reviews (${item.payload.percent.toFixed(0)}%)`, 'Count']} />}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={24}>
                    {distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>

              {/* Distribution bars (visual) */}
              <div className="mt-4 space-y-2.5">
                {distribution.map(item => (
                  <div key={item.star} className="flex items-center gap-2">
                    <span className="text-xs font-medium w-6 text-right">{item.star}★</span>
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={`h-full rounded-full ${
                          item.star >= 4
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                            : item.star === 3
                              ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                              : 'bg-gradient-to-r from-red-400 to-red-500'
                        }`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Positive (4-5★)</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {reviews.filter(r => r.rating >= 4).length} ({stats.total > 0 ? ((reviews.filter(r => r.rating >= 4).length / stats.total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Neutral (3★)</span>
                <span className="text-sm font-semibold text-amber-600">
                  {reviews.filter(r => r.rating === 3).length} ({stats.total > 0 ? ((reviews.filter(r => r.rating === 3).length / stats.total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Negative (1-2★)</span>
                <span className="text-sm font-semibold text-red-600">
                  {reviews.filter(r => r.rating <= 2).length} ({stats.total > 0 ? ((reviews.filter(r => r.rating <= 2).length / stats.total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending reviews</span>
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                  {reviews.filter(r => r.status === 'pending').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Flagged reviews</span>
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                  {reviews.filter(r => r.status === 'flagged').length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Review Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Reply className="h-5 w-5" />
              Reply to Review
            </DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              {/* Original review */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <StarRating rating={selectedReview.rating} />
                  <span className="text-sm font-medium">{selectedReview.customerName}</span>
                </div>
                <p className="text-sm font-medium">{selectedReview.title}</p>
                <p className="text-sm text-muted-foreground">{selectedReview.text}</p>
                <p className="text-xs text-muted-foreground">{selectedReview.productName} · {formatDate(selectedReview.createdAt)}</p>
              </div>

              {/* Reply textarea */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Reply</label>
                <Textarea
                  placeholder="Write a thoughtful response to this review..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Your reply will be publicly visible. Be professional and helpful.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReply} disabled={submitting || !replyText.trim()}>
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <>
                  <Reply className="h-4 w-4 mr-1" />
                  Submit Reply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
