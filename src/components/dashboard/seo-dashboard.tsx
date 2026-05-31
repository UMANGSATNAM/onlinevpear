'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  TrendingUp,
  TrendingDown,
  Globe,
  FileText,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Link2,
  Clock,
  Shield,
  Lightbulb,
  Sparkles,
  Target,
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
import { Progress } from '@/components/ui/progress'
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
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
interface KeywordEntry {
  id: string
  keyword: string
  position: number
  change: number
  volume: number
  difficulty: number
  url: string
}

interface PageAnalysis {
  id: string
  title: string
  url: string
  score: number
  issues: number
  lastOptimized: string
  expandedIssues: string[]
}

interface SeoSuggestion {
  id: string
  priority: 'High' | 'Medium' | 'Low'
  category: string
  icon: React.ReactNode
  description: string
  impact: string
}

// Mock data
const seoScore = 72

const seoBreakdown = [
  { name: 'Content Quality', score: 85, color: 'from-emerald-500 to-teal-600' },
  { name: 'Technical SEO', score: 78, color: 'from-violet-500 to-purple-600' },
  { name: 'Mobile Friendliness', score: 92, color: 'from-cyan-500 to-blue-600' },
  { name: 'Page Speed', score: 65, color: 'from-amber-500 to-orange-600' },
  { name: 'Backlinks', score: 58, color: 'from-rose-500 to-pink-600' },
  { name: 'Structured Data', score: 70, color: 'from-indigo-500 to-violet-600' },
]

const mockKeywords: KeywordEntry[] = [
  { id: 'kw-1', keyword: 'wireless headphones', position: 3, change: 2, volume: 18100, difficulty: 72, url: '/products/wireless-headphones' },
  { id: 'kw-2', keyword: 'bluetooth speaker', position: 7, change: -3, volume: 14800, difficulty: 68, url: '/products/bluetooth-speaker' },
  { id: 'kw-3', keyword: 'gaming keyboard', position: 12, change: 5, volume: 22000, difficulty: 81, url: '/products/gaming-keyboard' },
  { id: 'kw-4', keyword: 'smart watch', position: 18, change: -1, volume: 33100, difficulty: 89, url: '/products/smart-watch' },
  { id: 'kw-5', keyword: 'phone case', position: 5, change: 3, volume: 40500, difficulty: 55, url: '/products/phone-case' },
  { id: 'kw-6', keyword: 'laptop stand', position: 9, change: 0, volume: 12100, difficulty: 45, url: '/products/laptop-stand' },
  { id: 'kw-7', keyword: 'usb c hub', position: 22, change: -4, volume: 8100, difficulty: 62, url: '/products/usb-c-hub' },
  { id: 'kw-8', keyword: 'mechanical keyboard', position: 15, change: 7, volume: 27100, difficulty: 76, url: '/products/mechanical-keyboard' },
  { id: 'kw-9', keyword: 'wireless charger', position: 8, change: 1, volume: 16500, difficulty: 58, url: '/products/wireless-charger' },
  { id: 'kw-10', keyword: 'ergonomic mouse', position: 11, change: -2, volume: 9900, difficulty: 51, url: '/products/ergonomic-mouse' },
  { id: 'kw-11', keyword: 'monitor light bar', position: 25, change: 6, volume: 5400, difficulty: 38, url: '/products/monitor-light' },
  { id: 'kw-12', keyword: 'desk organizer', position: 31, change: -5, volume: 7200, difficulty: 42, url: '/products/desk-organizer' },
  { id: 'kw-13', keyword: 'webcam hd', position: 19, change: 4, volume: 11000, difficulty: 64, url: '/products/webcam-hd' },
  { id: 'kw-14', keyword: 'noise cancelling earbuds', position: 6, change: 2, volume: 27500, difficulty: 78, url: '/products/nc-earbuds' },
  { id: 'kw-15', keyword: 'portable ssd', position: 42, change: -8, volume: 8800, difficulty: 55, url: '/products/portable-ssd' },
]

const mockPages: PageAnalysis[] = [
  { id: 'p-1', title: 'Homepage', url: '/', score: 88, issues: 2, lastOptimized: '2 days ago', expandedIssues: ['Missing alt text on 3 images', 'H1 tag duplicate'] },
  { id: 'p-2', title: 'Wireless Headphones', url: '/products/wireless-headphones', score: 75, issues: 4, lastOptimized: '1 week ago', expandedIssues: ['Slow load time (3.2s)', 'Missing meta description', 'No structured data', 'Large image sizes'] },
  { id: 'p-3', title: 'Bluetooth Speaker', url: '/products/bluetooth-speaker', score: 62, issues: 5, lastOptimized: '2 weeks ago', expandedIssues: ['Missing canonical tag', 'Duplicate H1 tags', 'No Open Graph tags', 'Slow mobile speed', 'Missing schema markup'] },
  { id: 'p-4', title: 'Smart Watch Pro', url: '/products/smart-watch', score: 81, issues: 3, lastOptimized: '3 days ago', expandedIssues: ['Missing alt text on gallery images', 'No breadcrumb schema', 'Slow Time to Interactive'] },
  { id: 'p-5', title: 'Blog: Best Tech 2025', url: '/blog/best-tech-2025', score: 70, issues: 3, lastOptimized: '5 days ago', expandedIssues: ['Thin content (under 500 words)', 'No internal links', 'Missing FAQ schema'] },
  { id: 'p-6', title: 'About Us', url: '/about', score: 55, issues: 6, lastOptimized: '1 month ago', expandedIssues: ['No meta description', 'Missing H1 tag', 'No structured data', 'Slow load time', 'No internal links', 'Low content quality'] },
]

const mockSuggestions: SeoSuggestion[] = [
  { id: 's-1', priority: 'High', category: 'Technical', icon: <Zap className="h-4 w-4" />, description: 'Fix slow page load on product pages — compress images and enable lazy loading to improve Page Speed score by ~15 points.', impact: '+15 Page Speed' },
  { id: 's-2', priority: 'High', category: 'Content', icon: <FileText className="h-4 w-4" />, description: 'Add meta descriptions to 12 pages that are missing them. This can improve CTR by up to 5.8%.', impact: '+5.8% CTR' },
  { id: 's-3', priority: 'Medium', category: 'Structured Data', icon: <Shield className="h-4 w-4" />, description: 'Implement Product and Review schema markup on all product pages for rich snippets in search results.', impact: 'Rich Snippets' },
  { id: 's-4', priority: 'Medium', category: 'Backlinks', icon: <Link2 className="h-4 w-4" />, description: 'Reach out to 8 tech blogs for guest post opportunities. Focus on high-DA sites for maximum impact.', impact: '+8 Backlinks' },
  { id: 's-5', priority: 'Low', category: 'Mobile', icon: <Globe className="h-4 w-4" />, description: 'Optimize tap targets on mobile navigation — some buttons are too close together, causing usability issues.', impact: 'Better UX' },
]

const positionDistribution = [
  { range: 'Top 3', count: 3, color: 'hsl(142, 76%, 36%)' },
  { range: 'Top 10', count: 5, color: 'hsl(160, 84%, 39%)' },
  { range: 'Top 20', count: 3, color: 'hsl(45, 93%, 47%)' },
  { range: 'Top 50', count: 3, color: 'hsl(25, 95%, 53%)' },
  { range: '50+', count: 1, color: 'hsl(0, 84%, 60%)' },
]

const chartConfig = {
  count: { label: 'Keywords', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

function getScoreColor(score: number): string {
  if (score >= 60) return 'text-emerald-500'
  if (score >= 30) return 'text-amber-500'
  return 'text-rose-500'
}

function getScoreStroke(score: number): string {
  if (score >= 60) return '#10b981'
  if (score >= 30) return '#f59e0b'
  return '#ef4444'
}

function getDifficultyLabel(d: number): { label: string; className: string } {
  if (d >= 75) return { label: 'Hard', className: 'bg-rose-100 text-rose-700 border-rose-200' }
  if (d >= 50) return { label: 'Medium', className: 'bg-amber-100 text-amber-700 border-amber-200' }
  return { label: 'Easy', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
}

export function SeoDashboard() {
  const { selectedStoreId } = useAppStore()
  const [keywordSearch, setKeywordSearch] = useState('')
  const [expandedPage, setExpandedPage] = useState<string | null>(null)
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<SeoSuggestion[]>(mockSuggestions)

  // Filter keywords
  const filteredKeywords = useMemo(() => {
    if (!keywordSearch) return mockKeywords
    return mockKeywords.filter(k =>
      k.keyword.toLowerCase().includes(keywordSearch.toLowerCase()) ||
      k.url.toLowerCase().includes(keywordSearch.toLowerCase())
    )
  }, [keywordSearch])

  // Compute position distribution
  const computedDistribution = useMemo(() => {
    const dist = { 'Top 3': 0, 'Top 10': 0, 'Top 20': 0, 'Top 50': 0, '50+': 0 }
    mockKeywords.forEach(k => {
      if (k.position <= 3) dist['Top 3']++
      else if (k.position <= 10) dist['Top 10']++
      else if (k.position <= 20) dist['Top 20']++
      else if (k.position <= 50) dist['Top 50']++
      else dist['50+']++
    })
    return Object.entries(dist).map(([range, count]) => {
      const template = positionDistribution.find(p => p.range === range)!
      return { range, count, color: template.color }
    })
  }, [])

  const handleGenerateSuggestions = async () => {
    setGeneratingSuggestions(true)
    // Simulate AI call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setGeneratingSuggestions(false)
    toast.success('AI suggestions generated', {
      description: '5 new SEO optimization recommendations ready',
    })
  }

  const handleApplySuggestion = (suggestion: SeoSuggestion) => {
    toast.success(`Applied: ${suggestion.category}`, {
      description: suggestion.description.slice(0, 80) + '...',
    })
  }

  // SVG Gauge
  const gaugeRadius = 60
  const gaugeCircumference = 2 * Math.PI * gaugeRadius
  const gaugeOffset = gaugeCircumference - (seoScore / 100) * gaugeCircumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8">
          {/* Pattern overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-white">SEO Dashboard</h2>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs px-2 py-0.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 mt-1">Monitor and optimize your store&apos;s search engine performance</p>
              </div>
            </div>
            {/* SEO Score Gauge */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <svg width="140" height="140" className="-rotate-90">
                  <circle cx="70" cy="70" r={gaugeRadius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                  {/* Red segment 0-30 */}
                  <circle cx="70" cy="70" r={gaugeRadius} fill="none" stroke="#ef4444" strokeWidth="10"
                    strokeDasharray={`${0.3 * gaugeCircumference} ${gaugeCircumference}`} strokeDashoffset="0" strokeLinecap="round" opacity="0.3" />
                  {/* Orange segment 30-60 */}
                  <circle cx="70" cy="70" r={gaugeRadius} fill="none" stroke="#f59e0b" strokeWidth="10"
                    strokeDasharray={`${0.3 * gaugeCircumference} ${gaugeCircumference}`} strokeDashoffset={`${-0.3 * gaugeCircumference}`} strokeLinecap="round" opacity="0.3" />
                  {/* Green segment 60-100 */}
                  <circle cx="70" cy="70" r={gaugeRadius} fill="none" stroke="#10b981" strokeWidth="10"
                    strokeDasharray={`${0.4 * gaugeCircumference} ${gaugeCircumference}`} strokeDashoffset={`${-0.6 * gaugeCircumference}`} strokeLinecap="round" opacity="0.3" />
                  {/* Active arc */}
                  <circle cx="70" cy="70" r={gaugeRadius} fill="none" stroke={getScoreStroke(seoScore)} strokeWidth="10"
                    strokeDasharray={`${(seoScore / 100) * gaugeCircumference} ${gaugeCircumference}`} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease-in-out' }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className={`text-3xl font-bold ${getScoreColor(seoScore)}`}>{seoScore}</span>
                    <span className="text-xs text-slate-400 block">/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4 Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">SEO Score</p>
                  <p className="text-2xl font-bold">{seoScore}<span className="text-sm text-muted-foreground font-normal">/100</span></p>
                </div>
                <div className="bg-emerald-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Organic Traffic</p>
                  <p className="text-2xl font-bold">24,580</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-0.5 mt-1">
                    <TrendingUp className="h-3 w-3" /> +12.4% this month
                  </p>
                </div>
                <div className="bg-violet-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-5 w-5 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Keywords Ranked</p>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-0.5 mt-1">
                    <TrendingUp className="h-3 w-3" /> +18 new this month
                  </p>
                </div>
                <div className="bg-amber-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Backlinks</p>
                  <p className="text-2xl font-bold">342</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-0.5 mt-1">
                    <TrendingUp className="h-3 w-3" /> +24 new this month
                  </p>
                </div>
                <div className="bg-rose-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <Link2 className="h-5 w-5 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* SEO Score Breakdown Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-500" />
              SEO Score Breakdown
            </CardTitle>
            <CardDescription>Performance across key SEO categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {seoBreakdown.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>{item.score}</span>
                  </div>
                  <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Keywords Tracking Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5 text-amber-500" />
                  Keywords Tracking
                </CardTitle>
                <CardDescription>{mockKeywords.length} keywords monitored</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search keywords..."
                  value={keywordSearch}
                  onChange={(e) => setKeywordSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Keyword</TableHead>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Position</TableHead>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Change</TableHead>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Volume</TableHead>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Difficulty</TableHead>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKeywords.map((kw, i) => {
                    const diff = getDifficultyLabel(kw.difficulty)
                    return (
                      <motion.tr
                        key={kw.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="group hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <span className="text-sm font-medium">{kw.keyword}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold">{kw.position}</span>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 text-sm ${kw.change > 0 ? 'text-emerald-600' : kw.change < 0 ? 'text-rose-600' : 'text-muted-foreground'}`}>
                            {kw.change > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : kw.change < 0 ? <ArrowDownRight className="h-3.5 w-3.5" /> : null}
                            <span className="font-medium">{kw.change > 0 ? `+${kw.change}` : kw.change === 0 ? '—' : kw.change}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{kw.volume.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[11px] px-2 py-0.5 border ${diff.className}`}>
                            {diff.label} ({kw.difficulty})
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground max-w-[160px] truncate">
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            {kw.url}
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

      {/* Position Distribution Chart */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-500" />
              Position Distribution
            </CardTitle>
            <CardDescription>Keywords by ranking position range</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={computedDistribution} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="range" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {computedDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Page Analysis Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-500" />
              Page Analysis
            </CardTitle>
            <CardDescription>SEO health for your key pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockPages.map((page, i) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setExpandedPage(expandedPage === page.id ? null : page.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{page.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{page.url}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          {expandedPage === page.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>
                      {/* Mini gauge */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="relative w-10 h-10">
                          <svg width="40" height="40" className="-rotate-90">
                            <circle cx="20" cy="20" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                            <circle cx="20" cy="20" r="16" fill="none" stroke={getScoreStroke(page.score)} strokeWidth="4"
                              strokeDasharray={`${(page.score / 100) * 2 * Math.PI * 16} ${2 * Math.PI * 16}`} strokeLinecap="round" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-[10px] font-bold ${getScoreColor(page.score)}`}>{page.score}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-xs text-muted-foreground">{page.issues} issues</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{page.lastOptimized}</span>
                          </div>
                        </div>
                      </div>
                      {/* Expanded issues */}
                      <AnimatePresence>
                        {expandedPage === page.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t pt-3 mt-2 space-y-1.5">
                              {page.expandedIssues.map((issue, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                                  <span className="text-xs text-muted-foreground">{issue}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI SEO Suggestions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                  AI SEO Suggestions
                </CardTitle>
                <CardDescription>AI-powered recommendations to improve your SEO</CardDescription>
              </div>
              <Button
                onClick={handleGenerateSuggestions}
                disabled={generatingSuggestions}
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
              >
                {generatingSuggestions ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Suggestions
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((suggestion, i) => {
                const priorityConfig = {
                  High: { className: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
                  Medium: { className: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
                  Low: { className: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
                }
                const pc = priorityConfig[suggestion.priority]
                return (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="hover:shadow-md transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                            {suggestion.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${pc.className}`}>
                                <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${pc.dot}`} />
                                {suggestion.priority}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted">
                                {suggestion.category}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">
                                {suggestion.impact}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                            onClick={() => handleApplySuggestion(suggestion)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Apply
                          </Button>
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

      {/* Sitemap Status Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-500" />
              Sitemap Status
            </CardTitle>
            <CardDescription>Search engine indexing status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitted URLs</p>
                  <p className="text-lg font-bold">1,248</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Indexed</p>
                  <p className="text-lg font-bold">1,186</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Crawl</p>
                  <p className="text-lg font-bold">6h ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Errors</p>
                  <p className="text-lg font-bold">7</p>
                </div>
              </div>
            </div>
            {/* Indexing progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-muted-foreground">Indexing Progress</span>
                <span className="text-sm font-semibold">1,186 / 1,248</span>
              </div>
              <Progress value={(1186 / 1248) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">94.9% of submitted URLs are indexed</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
