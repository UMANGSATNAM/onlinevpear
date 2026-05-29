'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Share2,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Calendar,
  Clock,
  TrendingUp,
  Heart,
  MessageCircle,
  Send,
  Eye,
  Plus,
  Image as ImageIcon,
  Zap,
  Users,
  DollarSign,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

// Types
interface SocialPlatform {
  id: string
  name: string
  icon: React.ReactNode
  gradient: string
  bgLight: string
  textLight: string
  username: string
  followers: number
  engagement: number
  connected: boolean
}

interface ScheduledPost {
  id: string
  content: string
  platforms: string[]
  scheduledAt: string
  status: 'scheduled' | 'published' | 'draft' | 'failed'
  image?: boolean
}

interface AutoPostRule {
  id: string
  name: string
  trigger: string
  platform: string
  platformIcon: React.ReactNode
  enabled: boolean
}

// Platform colors and icons
const platformConfig: Record<string, { gradient: string; bgLight: string; textLight: string; icon: React.ReactNode }> = {
  instagram: { gradient: 'from-pink-500 via-purple-500 to-orange-400', bgLight: 'bg-pink-100', textLight: 'text-pink-600', icon: <Instagram className="h-5 w-5" /> },
  facebook: { gradient: 'from-blue-600 to-blue-700', bgLight: 'bg-blue-100', textLight: 'text-blue-600', icon: <Facebook className="h-5 w-5" /> },
  twitter: { gradient: 'from-sky-400 to-sky-600', bgLight: 'bg-sky-100', textLight: 'text-sky-600', icon: <Twitter className="h-5 w-5" /> },
  tiktok: { gradient: 'from-slate-800 to-slate-900', bgLight: 'bg-slate-100', textLight: 'text-slate-600', icon: <Zap className="h-5 w-5" /> },
  pinterest: { gradient: 'from-red-500 to-rose-600', bgLight: 'bg-red-100', textLight: 'text-red-600', icon: <Heart className="h-5 w-5" /> },
  youtube: { gradient: 'from-red-600 to-red-700', bgLight: 'bg-red-100', textLight: 'text-red-600', icon: <Youtube className="h-5 w-5" /> },
}

// Mock data
const mockPlatforms: SocialPlatform[] = [
  { id: 'instagram', name: 'Instagram', icon: <Instagram className="h-5 w-5" />, gradient: 'from-pink-500 via-purple-500 to-orange-400', bgLight: 'bg-pink-100', textLight: 'text-pink-600', username: '@shopforge_store', followers: 24500, engagement: 4.8, connected: true },
  { id: 'facebook', name: 'Facebook', icon: <Facebook className="h-5 w-5" />, gradient: 'from-blue-600 to-blue-700', bgLight: 'bg-blue-100', textLight: 'text-blue-600', username: 'ShopForge Store', followers: 18200, engagement: 3.2, connected: true },
  { id: 'twitter', name: 'Twitter / X', icon: <Twitter className="h-5 w-5" />, gradient: 'from-sky-400 to-sky-600', bgLight: 'bg-sky-100', textLight: 'text-sky-600', username: '@shopforge', followers: 9800, engagement: 2.9, connected: true },
  { id: 'tiktok', name: 'TikTok', icon: <Zap className="h-5 w-5" />, gradient: 'from-slate-800 to-slate-900', bgLight: 'bg-slate-100', textLight: 'text-slate-600', username: '', followers: 0, engagement: 0, connected: false },
  { id: 'pinterest', name: 'Pinterest', icon: <Heart className="h-5 w-5" />, gradient: 'from-red-500 to-rose-600', bgLight: 'bg-red-100', textLight: 'text-red-600', username: '', followers: 0, engagement: 0, connected: false },
  { id: 'youtube', name: 'YouTube', icon: <Youtube className="h-5 w-5" />, gradient: 'from-red-600 to-red-700', bgLight: 'bg-red-100', textLight: 'text-red-600', username: 'ShopForge', followers: 5400, engagement: 6.1, connected: true },
]

const mockScheduledPosts: ScheduledPost[] = [
  { id: 'sp-1', content: 'Introducing our new Wireless Headphones Pro — crystal clear sound, 40h battery life! 🎧', platforms: ['instagram', 'facebook'], scheduledAt: '2025-03-05T10:00:00', status: 'scheduled', image: true },
  { id: 'sp-2', content: 'Flash Sale: 25% off all Smart Watches this weekend only! ⌚✨', platforms: ['instagram', 'twitter'], scheduledAt: '2025-03-05T14:30:00', status: 'scheduled', image: true },
  { id: 'sp-3', content: 'Behind the scenes: How we design products that customers love 🛠️', platforms: ['instagram'], scheduledAt: '2025-03-06T09:00:00', status: 'scheduled', image: true },
  { id: 'sp-4', content: 'Customer spotlight: See how @techreview uses our Gaming Keyboard 🎮', platforms: ['twitter', 'facebook'], scheduledAt: '2025-03-06T12:00:00', status: 'draft' },
  { id: 'sp-5', content: 'New blog post: Top 10 Tech Gadgets for 2025 📱💻', platforms: ['twitter', 'facebook'], scheduledAt: '2025-03-07T10:00:00', status: 'scheduled' },
  { id: 'sp-6', content: 'Unboxing video: Bluetooth Speaker Premium Edition 🔊', platforms: ['youtube'], scheduledAt: '2025-03-07T15:00:00', status: 'scheduled', image: true },
  { id: 'sp-7', content: 'Win a free product! Retweet and follow to enter our giveaway 🎁', platforms: ['twitter'], scheduledAt: '2025-03-08T11:00:00', status: 'scheduled' },
  { id: 'sp-8', content: 'Weekend vibes with our Portable Speaker — perfect for outdoor adventures 🏕️', platforms: ['instagram', 'facebook'], scheduledAt: '2025-03-09T09:00:00', status: 'scheduled', image: true },
]

const engagementData = [
  { day: 'Mon', instagram: 4.2, facebook: 3.1, twitter: 2.5, youtube: 5.8 },
  { day: 'Tue', instagram: 4.8, facebook: 2.9, twitter: 3.1, youtube: 6.2 },
  { day: 'Wed', instagram: 3.9, facebook: 3.5, twitter: 2.8, youtube: 5.5 },
  { day: 'Thu', instagram: 5.1, facebook: 3.8, twitter: 3.5, youtube: 7.1 },
  { day: 'Fri', instagram: 4.5, facebook: 3.2, twitter: 2.9, youtube: 6.0 },
  { day: 'Sat', instagram: 5.8, facebook: 4.1, twitter: 3.8, youtube: 7.5 },
  { day: 'Sun', instagram: 5.2, facebook: 3.6, twitter: 3.2, youtube: 6.8 },
]

const topPosts = [
  { id: 'tp-1', title: 'Wireless Headphones Launch', platform: 'instagram', likes: 1240, comments: 89, shares: 156, reach: 18500 },
  { id: 'tp-2', title: 'Flash Sale Announcement', platform: 'facebook', likes: 890, comments: 67, shares: 234, reach: 15200 },
  { id: 'tp-3', title: 'Product Review Feature', platform: 'youtube', likes: 2100, comments: 312, shares: 89, reach: 32000 },
  { id: 'tp-4', title: 'Tech Tips Thread', platform: 'twitter', likes: 567, comments: 45, shares: 178, reach: 9800 },
  { id: 'tp-5', title: 'Unboxing Video', platform: 'youtube', likes: 1890, comments: 256, shares: 134, reach: 28000 },
]

const initialAutoPostRules: AutoPostRule[] = [
  { id: 'apr-1', name: 'Auto-post new products', trigger: 'When a new product is published', platform: 'instagram', platformIcon: <Instagram className="h-4 w-4" />, enabled: true },
  { id: 'apr-2', name: 'Share blog posts', trigger: 'When a new blog post is published', platform: 'twitter', platformIcon: <Twitter className="h-4 w-4" />, enabled: true },
  { id: 'apr-3', name: 'Promote sales', trigger: 'When a discount is activated', platform: 'facebook', platformIcon: <Facebook className="h-4 w-4" />, enabled: false },
  { id: 'apr-4', name: 'Product video upload', trigger: 'When a product video is added', platform: 'youtube', platformIcon: <Youtube className="h-4 w-4" />, enabled: true },
  { id: 'apr-5', name: 'Review highlights', trigger: 'When a 5-star review is received', platform: 'instagram', platformIcon: <Instagram className="h-4 w-4" />, enabled: false },
]

const chartConfig = {
  instagram: { label: 'Instagram', color: 'hsl(330, 80%, 55%)' },
  facebook: { label: 'Facebook', color: 'hsl(220, 80%, 55%)' },
  twitter: { label: 'Twitter', color: 'hsl(200, 80%, 55%)' },
  youtube: { label: 'YouTube', color: 'hsl(0, 80%, 55%)' },
} satisfies ChartConfig

function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

function formatScheduleDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const statusConfig: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Scheduled', className: 'bg-sky-100 text-sky-700 border-sky-200' },
  published: { label: 'Published', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  draft: { label: 'Draft', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  failed: { label: 'Failed', className: 'bg-rose-100 text-rose-700 border-rose-200' },
}

// Calendar days with posts
const calendarPostDays = [5, 6, 7, 8, 9, 12, 15, 19, 22, 25]

export function SocialMedia() {
  const { selectedStoreId } = useAppStore()
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(mockPlatforms)
  const [autoPostRules, setAutoPostRules] = useState<AutoPostRule[]>(initialAutoPostRules)
  const [createPostOpen, setCreatePostOpen] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostPlatforms, setNewPostPlatforms] = useState<string[]>([])
  const [newPostSchedule, setNewPostSchedule] = useState('')
  const [calendarMonth, setCalendarMonth] = useState(2) // March (0-indexed)
  const [calendarYear, setCalendarYear] = useState(2025)

  const connectedCount = platforms.filter(p => p.connected).length

  // Stats
  const stats = useMemo(() => {
    const connectedPlatforms = platforms.filter(p => p.connected)
    const totalFollowers = connectedPlatforms.reduce((sum, p) => sum + p.followers, 0)
    const avgEngagement = connectedPlatforms.length > 0
      ? connectedPlatforms.reduce((sum, p) => sum + p.engagement, 0) / connectedPlatforms.length
      : 0
    const scheduledCount = mockScheduledPosts.filter(p => p.status === 'scheduled').length
    return { totalFollowers, avgEngagement, scheduledCount, socialRevenue: 4250 }
  }, [platforms])

  // Calendar generation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay()
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }, [calendarMonth, calendarYear])

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const handleToggleConnection = (platformId: string) => {
    setPlatforms(prev => prev.map(p =>
      p.id === platformId ? {
        ...p,
        connected: !p.connected,
        username: !p.connected ? `@shopforge_${p.id}` : '',
        followers: !p.connected ? Math.floor(Math.sin(platformId.charCodeAt(0) * 3.7) * 5000 + 5000) : 0,
        engagement: !p.connected ? parseFloat((Math.sin(platformId.charCodeAt(0) * 2.3) * 3 + 4).toFixed(1)) : 0,
      } : p
    ))
    const platform = platforms.find(p => p.id === platformId)
    toast.success(platform?.connected ? `${platform.name} disconnected` : `${platform?.name} connected`, {
      description: platform?.connected ? 'Account removed from integration' : 'Account successfully linked',
    })
  }

  const handleToggleRule = (ruleId: string) => {
    setAutoPostRules(prev => prev.map(r =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ))
    const rule = autoPostRules.find(r => r.id === ruleId)
    toast.success(`${rule?.name} ${rule?.enabled ? 'disabled' : 'enabled'}`)
  }

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast.error('Please enter post content')
      return
    }
    if (newPostPlatforms.length === 0) {
      toast.error('Please select at least one platform')
      return
    }
    setCreatePostOpen(false)
    setNewPostContent('')
    setNewPostPlatforms([])
    setNewPostSchedule('')
    toast.success('Post created', {
      description: `Scheduled for ${newPostPlatforms.length} platform(s)`,
    })
  }

  const handleToggleNewPlatform = (platformId: string) => {
    setNewPostPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-6 sm:p-8">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shadow-lg backdrop-blur-sm">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-white">Social Media</h2>
                  <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-0.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5" />
                    {connectedCount} Connected
                  </Badge>
                </div>
                <p className="text-sm text-white/70 mt-1">Manage your social presence across platforms</p>
              </div>
            </div>
            <Button
              onClick={() => setCreatePostOpen(true)}
              className="bg-white text-violet-700 hover:bg-white/90 font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Followers</p>
                  <p className="text-2xl font-bold">{formatFollowers(stats.totalFollowers)}</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-0.5 mt-1">
                    <TrendingUp className="h-3 w-3" /> +8.2% this month
                  </p>
                </div>
                <div className="bg-emerald-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                  <p className="text-2xl font-bold">{stats.avgEngagement.toFixed(1)}%</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-0.5 mt-1">
                    <TrendingUp className="h-3 w-3" /> +1.3% vs last week
                  </p>
                </div>
                <div className="bg-violet-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-5 w-5 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Scheduled Posts</p>
                  <p className="text-2xl font-bold">{stats.scheduledCount}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-0.5 mt-1">
                    <Clock className="h-3 w-3" /> Next in 2h
                  </p>
                </div>
                <div className="bg-amber-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Social Revenue</p>
                  <p className="text-2xl font-bold">${stats.socialRevenue.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-0.5 mt-1">
                    <TrendingUp className="h-3 w-3" /> +22% this month
                  </p>
                </div>
                <div className="bg-rose-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-5 w-5 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Connected Accounts Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Share2 className="h-5 w-5 text-violet-500" />
              Connected Accounts
            </CardTitle>
            <CardDescription>Manage your social media integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {platforms.map((platform, i) => {
                const pc = platformConfig[platform.id]
                return (
                  <motion.div
                    key={platform.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className={`hover:shadow-lg transition-all duration-300 ${!platform.connected ? 'opacity-70' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${pc.gradient} flex items-center justify-center text-white shadow-sm shrink-0`}>
                            {pc.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">{platform.name}</p>
                            {platform.connected ? (
                              <p className="text-xs text-muted-foreground truncate">{platform.username}</p>
                            ) : (
                              <p className="text-xs text-muted-foreground">Not connected</p>
                            )}
                          </div>
                          <Switch
                            checked={platform.connected}
                            onCheckedChange={() => handleToggleConnection(platform.id)}
                          />
                        </div>
                        {platform.connected ? (
                          <>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="text-center p-2 rounded-lg bg-muted/40">
                                <p className="text-xs text-muted-foreground">Followers</p>
                                <p className="text-sm font-bold">{formatFollowers(platform.followers)}</p>
                              </div>
                              <div className="text-center p-2 rounded-lg bg-muted/40">
                                <p className="text-xs text-muted-foreground">Engagement</p>
                                <p className="text-sm font-bold">{platform.engagement}%</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full">
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                              Manage
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            className={`w-full bg-gradient-to-r ${pc.gradient} text-white hover:opacity-90`}
                            onClick={() => handleToggleConnection(platform.id)}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Connect {platform.name}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Post Scheduler + Calendar */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Scheduled Posts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-amber-500" />
                      Scheduled Posts
                    </CardTitle>
                    <CardDescription>{mockScheduledPosts.length} posts scheduled</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setCreatePostOpen(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    New Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {mockScheduledPosts.map((post, i) => {
                    const sc = statusConfig[post.status]
                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="hover:shadow-md transition-all duration-200">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center gap-1 shrink-0">
                                {post.platforms.map(pId => {
                                  const pc = platformConfig[pId]
                                  return pc ? (
                                    <div key={pId} className={`h-7 w-7 rounded-lg bg-gradient-to-br ${pc.gradient} flex items-center justify-center text-white`}>
                                      <span className="scale-75">{pc.icon}</span>
                                    </div>
                                  ) : null
                                })}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm line-clamp-2">{post.content}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatScheduleDate(post.scheduledAt)}
                                  </span>
                                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${sc.className}`}>
                                    {sc.label}
                                  </Badge>
                                  {post.image && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted">
                                      <ImageIcon className="h-2.5 w-2.5 mr-1" />
                                      Image
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mini Calendar */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{monthNames[calendarMonth]} {calendarYear}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                      if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1) }
                      else setCalendarMonth(calendarMonth - 1)
                    }}>
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                      if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1) }
                      else setCalendarMonth(calendarMonth + 1)
                    }}>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-0.5 text-center">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
                  ))}
                  {calendarDays.map((day, i) => (
                    <div
                      key={`cal-${i}`}
                      className={`relative h-8 flex items-center justify-center text-xs rounded-md ${
                        day ? 'hover:bg-muted cursor-pointer' : ''
                      } ${day && calendarPostDays.includes(day) ? 'font-bold text-violet-600 bg-violet-50' : ''}`}
                    >
                      {day}
                      {day && calendarPostDays.includes(day) && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-violet-500" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
                    Posts scheduled
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Analytics Overview */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              Analytics Overview
            </CardTitle>
            <CardDescription>7-day engagement trend per platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={engagementData} margin={{ left: 10 }}>
                <defs>
                  <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(330, 80%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(330, 80%, 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fbGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(220, 80%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(220, 80%, 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="twGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ytGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 80%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0, 80%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="instagram" stroke="hsl(330, 80%, 55%)" fill="url(#igGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="facebook" stroke="hsl(220, 80%, 55%)" fill="url(#fbGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="twitter" stroke="hsl(200, 80%, 55%)" fill="url(#twGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="youtube" stroke="hsl(0, 80%, 55%)" fill="url(#ytGrad)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Performing Posts */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              Top Performing Posts
            </CardTitle>
            <CardDescription>Highest engagement this month</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Post</TableHead>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Platform</TableHead>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Likes</TableHead>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Comments</TableHead>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Shares</TableHead>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Reach</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPosts.map((post, i) => {
                    const pc = platformConfig[post.platform]
                    return (
                      <motion.tr
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <span className="text-sm font-medium">{post.title}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${pc.gradient} flex items-center justify-center text-white`}>
                              <span className="scale-75">{pc.icon}</span>
                            </div>
                            <span className="text-xs capitalize">{post.platform}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Heart className="h-3.5 w-3.5 text-rose-400" />
                            {post.likes.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MessageCircle className="h-3.5 w-3.5 text-sky-400" />
                            {post.comments.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Send className="h-3.5 w-3.5 text-emerald-400" />
                            {post.shares.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            {post.reach.toLocaleString()}
                          </div>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Auto-Post Rules */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Auto-Post Rules
            </CardTitle>
            <CardDescription>Automate your social media posting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {autoPostRules.map((rule, i) => {
                const pc = platformConfig[rule.platform]
                return (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="hover:shadow-md transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${pc.gradient} flex items-center justify-center text-white shrink-0`}>
                              <span className="scale-90">{rule.platformIcon}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold">{rule.name}</p>
                              <p className="text-xs text-muted-foreground">{rule.trigger}</p>
                            </div>
                          </div>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => handleToggleRule(rule.id)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Post Dialog */}
      <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              Create Post
            </DialogTitle>
            <DialogDescription>
              Compose and schedule a social media post
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                className="resize-none"
              />
              <p className="text-[11px] text-muted-foreground">{newPostContent.length}/280 characters</p>
            </div>
            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(platformConfig).map(([pId, pc]) => {
                  const isSelected = newPostPlatforms.includes(pId)
                  const isConnected = platforms.find(p => p.id === pId)?.connected
                  return (
                    <button
                      key={pId}
                      onClick={() => isConnected && handleToggleNewPlatform(pId)}
                      disabled={!isConnected}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-violet-300 bg-violet-50 text-violet-700'
                          : isConnected
                            ? 'border-muted hover:border-muted-foreground/30 text-muted-foreground'
                            : 'border-muted text-muted-foreground/40 cursor-not-allowed'
                      }`}
                    >
                      <span className="scale-75">{pc.icon}</span>
                      <span className="capitalize">{pId}</span>
                      {!isConnected && <span className="text-[9px]">(not connected)</span>}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-violet-300 hover:bg-violet-50/30 transition-colors">
                <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
                <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Schedule</Label>
              <Input
                type="datetime-local"
                value={newPostSchedule}
                onChange={(e) => setNewPostSchedule(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setCreatePostOpen(false)}>Cancel</Button>
            <Button
              variant="outline"
              onClick={handleCreatePost}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Send className="h-4 w-4 mr-1.5" />
              Post Now
            </Button>
            <Button
              onClick={handleCreatePost}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
            >
              <Clock className="h-4 w-4 mr-1.5" />
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
