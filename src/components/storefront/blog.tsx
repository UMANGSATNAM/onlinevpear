'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Calendar,
  ArrowRight,
  Tag,
  Clock,
  BookOpen,
  TrendingUp,
  Mail,
  Share2,
  Sparkles,
  ChevronRight,
  PenLine,
  Lightbulb,
  BarChart3,
  Palette,
  Cpu,
  Megaphone,
  Package,
  Newspaper,
  Compass,
  Rss,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'

// --- Types ---
interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  coverImage?: string | null
  author?: string | null
  tags?: string
  status: string
  publishedAt?: string | null
  createdAt: string
}

interface MockBlogPost {
  id: string
  title: string
  excerpt: string
  category: string
  author: string
  authorInitials: string
  publishedAt: string
  readingTime: number
  tags: string[]
  featured: boolean
  gradientIndex: number
}

// --- Category config ---
const categories = [
  { id: 'all', label: 'All', icon: BookOpen },
  { id: 'Technology', label: 'Technology', icon: Cpu },
  { id: 'Reviews', label: 'Reviews', icon: Eye },
  { id: 'Guides', label: 'Guides', icon: Compass },
  { id: 'News', label: 'News', icon: Newspaper },
  { id: 'Lifestyle', label: 'Lifestyle', icon: Palette },
  { id: 'AI & Automation', label: 'AI & Automation', icon: Lightbulb },
  { id: 'Business', label: 'Business', icon: BarChart3 },
  { id: 'Marketing', label: 'Marketing', icon: Megaphone },
]

const categoryColors: Record<string, string> = {
  Technology: 'bg-orange-100 text-orange-700',
  Reviews: 'bg-sky-100 text-sky-700',
  Guides: 'bg-emerald-100 text-emerald-700',
  News: 'bg-red-100 text-red-700',
  Lifestyle: 'bg-fuchsia-100 text-fuchsia-700',
  'AI & Automation': 'bg-amber-100 text-amber-700',
  Business: 'bg-teal-100 text-teal-700',
  Marketing: 'bg-violet-100 text-violet-700',
  Product: 'bg-indigo-100 text-indigo-700',
  Design: 'bg-pink-100 text-pink-700',
}

const categoryBarColors: Record<string, string> = {
  Technology: 'from-orange-500 to-red-400',
  Reviews: 'from-sky-500 to-blue-400',
  Guides: 'from-emerald-500 to-teal-400',
  News: 'from-red-500 to-rose-400',
  Lifestyle: 'from-fuchsia-500 to-pink-400',
  'AI & Automation': 'from-amber-500 to-yellow-400',
  Business: 'from-teal-500 to-cyan-400',
  Marketing: 'from-violet-500 to-purple-400',
  Product: 'from-indigo-500 to-blue-400',
  Design: 'from-pink-500 to-rose-400',
}

const categoryIconColors: Record<string, string> = {
  Technology: 'from-orange-500 to-red-400',
  Reviews: 'from-sky-500 to-blue-400',
  Guides: 'from-emerald-500 to-teal-400',
  News: 'from-red-500 to-rose-400',
  Lifestyle: 'from-fuchsia-500 to-pink-400',
  'AI & Automation': 'from-amber-500 to-yellow-400',
  Business: 'from-teal-500 to-cyan-400',
  Marketing: 'from-violet-500 to-purple-400',
  Product: 'from-indigo-500 to-blue-400',
  Design: 'from-pink-500 to-rose-400',
}

const authorAvatarGradients: Record<string, string> = {
  'Sarah Chen': 'from-rose-400 to-orange-400',
  'Mike Torres': 'from-violet-400 to-purple-400',
  'Lisa Park': 'from-emerald-400 to-teal-400',
  'James Wilson': 'from-amber-400 to-yellow-400',
  'Emily Nguyen': 'from-sky-400 to-cyan-400',
  'David Kim': 'from-fuchsia-400 to-pink-400',
  'Rachel Adams': 'from-teal-400 to-cyan-400',
  'Tom Martinez': 'from-red-400 to-rose-400',
  'Aisha Patel': 'from-pink-400 to-rose-400',
  'Chris Lee': 'from-orange-400 to-amber-400',
}

const blogGradients = [
  'from-rose-400 via-pink-400 to-orange-300',
  'from-violet-400 via-purple-400 to-indigo-300',
  'from-emerald-400 via-teal-400 to-cyan-300',
  'from-amber-400 via-orange-400 to-yellow-300',
  'from-sky-400 via-blue-400 to-cyan-300',
  'from-fuchsia-400 via-pink-400 to-rose-300',
  'from-lime-400 via-green-400 to-emerald-300',
  'from-red-400 via-rose-400 to-pink-300',
  'from-indigo-400 via-blue-400 to-sky-300',
  'from-teal-400 via-cyan-400 to-sky-300',
]

// --- Mock Data ---
const mockPosts: MockBlogPost[] = [
  {
    id: 'mock-1',
    title: '10 Ways AI is Transforming Ecommerce in 2025',
    excerpt: 'From personalized recommendations to automated inventory management, artificial intelligence is reshaping how online stores operate. Discover the top AI trends that every merchant should know about to stay competitive in the evolving digital marketplace.',
    category: 'AI & Automation',
    author: 'Sarah Chen',
    authorInitials: 'SC',
    publishedAt: '2025-02-28',
    readingTime: 8,
    tags: ['AI', 'Ecommerce', 'Automation', 'Trends'],
    featured: true,
    gradientIndex: 0,
  },
  {
    id: 'mock-2',
    title: 'The Ultimate Guide to Product Photography',
    excerpt: 'Great product photos can increase conversion rates by up to 30%. Learn professional techniques for lighting, composition, and editing that will make your products stand out without expensive equipment.',
    category: 'Guides',
    author: 'Mike Torres',
    authorInitials: 'MT',
    publishedAt: '2025-02-25',
    readingTime: 12,
    tags: ['Photography', 'Product', 'Tips', 'Guide'],
    featured: false,
    gradientIndex: 1,
  },
  {
    id: 'mock-3',
    title: 'How to Reduce Cart Abandonment by 40%',
    excerpt: 'Cart abandonment costs ecommerce businesses billions annually. Here are proven strategies to recover lost sales, from optimized checkout flows to strategic email retargeting campaigns.',
    category: 'Business',
    author: 'Lisa Park',
    authorInitials: 'LP',
    publishedAt: '2025-02-22',
    readingTime: 6,
    tags: ['Cart Abandonment', 'Conversion', 'Business'],
    featured: false,
    gradientIndex: 2,
  },
  {
    id: 'mock-4',
    title: 'Social Media Marketing Strategies That Actually Work',
    excerpt: 'Stop wasting time on social media tactics that don\'t deliver results. These data-driven strategies have helped thousands of merchants grow their audience and drive real sales.',
    category: 'Marketing',
    author: 'James Wilson',
    authorInitials: 'JW',
    publishedAt: '2025-02-18',
    readingTime: 10,
    tags: ['Social Media', 'Marketing', 'Growth'],
    featured: false,
    gradientIndex: 3,
  },
  {
    id: 'mock-5',
    title: 'Top 10 Wireless Headphones of 2025: A Complete Review',
    excerpt: 'We tested over 50 wireless headphones across every price range. From audiophile-grade to budget-friendly, these are the picks that deliver the best sound quality, comfort, and value.',
    category: 'Reviews',
    author: 'Emily Nguyen',
    authorInitials: 'EN',
    publishedAt: '2025-02-15',
    readingTime: 15,
    tags: ['Headphones', 'Review', 'Audio', 'Wireless'],
    featured: false,
    gradientIndex: 4,
  },
  {
    id: 'mock-6',
    title: 'Headless Commerce: The Future of Online Retail',
    excerpt: 'Decoupling your front-end from your back-end gives you unmatched flexibility. Explore the benefits, challenges, and real-world examples of headless commerce architectures.',
    category: 'Technology',
    author: 'Chris Lee',
    authorInitials: 'CL',
    publishedAt: '2025-02-12',
    readingTime: 8,
    tags: ['Headless', 'Technology', 'Architecture'],
    featured: false,
    gradientIndex: 9,
  },
  {
    id: 'mock-7',
    title: 'The Remote Work Lifestyle: Building a Business From Anywhere',
    excerpt: 'More entrepreneurs are running ecommerce businesses from coffee shops and co-working spaces around the world. Learn the tools, habits, and mindset needed to make it work.',
    category: 'Lifestyle',
    author: 'David Kim',
    authorInitials: 'DK',
    publishedAt: '2025-02-08',
    readingTime: 7,
    tags: ['Remote Work', 'Lifestyle', 'Entrepreneurship'],
    featured: false,
    gradientIndex: 5,
  },
  {
    id: 'mock-8',
    title: 'Breaking: New EU Digital Markets Act Impacts Online Sellers',
    excerpt: 'The latest regulatory changes in the EU could reshape how online marketplaces operate. Here\'s what merchants need to know about compliance, data sharing, and fair competition rules.',
    category: 'News',
    author: 'Rachel Adams',
    authorInitials: 'RA',
    publishedAt: '2025-02-05',
    readingTime: 5,
    tags: ['Regulation', 'EU', 'News', 'Compliance'],
    featured: false,
    gradientIndex: 7,
  },
  {
    id: 'mock-9',
    title: 'The Psychology of Pricing: Why Customers Buy',
    excerpt: 'Why do customers perceive $9.99 as significantly cheaper than $10? The science behind pricing strategies reveals surprising insights about human decision-making and how to leverage them.',
    category: 'Business',
    author: 'Tom Martinez',
    authorInitials: 'TM',
    publishedAt: '2025-02-01',
    readingTime: 9,
    tags: ['Pricing', 'Psychology', 'Business'],
    featured: false,
    gradientIndex: 6,
  },
  {
    id: 'mock-10',
    title: 'Design Systems That Scale With Your Brand',
    excerpt: 'A well-crafted design system ensures consistency across every customer touchpoint. Learn how to build and maintain a design system that grows with your ecommerce business.',
    category: 'Guides',
    author: 'Aisha Patel',
    authorInitials: 'AP',
    publishedAt: '2025-01-28',
    readingTime: 11,
    tags: ['Design', 'Branding', 'Systems', 'Guide'],
    featured: false,
    gradientIndex: 8,
  },
]

const popularTags = ['AI', 'Marketing', 'Ecommerce', 'Design', 'Growth', 'Tips', 'Analytics', 'Pricing', 'Shipping', 'Product', 'Guide', 'Review']

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const sidebarVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.3 } },
}

// --- Helper Functions ---
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

function getCategoryIcon(category: string) {
  const cat = categories.find((c) => c.id === category)
  return cat ? cat.icon : BookOpen
}

// --- Social Share Button ---
function ShareButtons({ title, className }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <button
        onClick={(e) => { e.stopPropagation(); handleCopyLink() }}
        className="h-7 w-7 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center transition-colors"
        title={copied ? 'Copied!' : 'Copy link'}
      >
        <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </div>
  )
}

// --- Main Component ---
export function BlogPage() {
  const { selectedStoreId } = useAppStore()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [visibleCount, setVisibleCount] = useState(6)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [sidebarEmail, setSidebarEmail] = useState('')
  const [sidebarSubscribed, setSidebarSubscribed] = useState(false)

  // Fetch published blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const storeId = sessionStorage.getItem('vepar_store_id') || selectedStoreId
        if (!storeId) {
          setLoading(false)
          return
        }
        const res = await fetch(`/api/blogs?storeId=${storeId}&status=published&limit=50`)
        if (res.ok) {
          const data = await res.json()
          const publishedPosts = data.blogs || []
          setPosts(publishedPosts)
        }
      } catch (err) {
        console.error('Failed to fetch blogs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBlogs()
  }, [selectedStoreId])

  // Build combined post list: API posts + mock data
  const allPosts: MockBlogPost[] = useMemo(() => {
    const apiPosts: MockBlogPost[] = posts.map((post, i) => {
      const parsedTags: string[] = (() => {
        try { return JSON.parse(post.tags || '[]') } catch { return [] }
      })()
      const cat = parsedTags[0] || 'Business'
      const authorName = post.author || 'Online Vepar Team'
      const initials = authorName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
      return {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || post.content?.substring(0, 180) || '',
        category: categories.some((c) => c.id === cat) ? cat : 'Business',
        author: authorName,
        authorInitials: initials,
        publishedAt: post.publishedAt || post.createdAt,
        readingTime: post.content ? estimateReadingTime(post.content) : 5,
        tags: parsedTags.length > 0 ? parsedTags : [cat],
        featured: i === 0,
        gradientIndex: i % blogGradients.length,
      }
    })

    // If we have API posts, use them; otherwise use mock data
    if (apiPosts.length > 0) return apiPosts
    return mockPosts
  }, [posts])

  // Filter posts
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      if (selectedCategory !== 'all' && post.category !== selectedCategory) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !post.title.toLowerCase().includes(q) &&
          !post.excerpt.toLowerCase().includes(q) &&
          !post.tags.some((t) => t.toLowerCase().includes(q))
        ) {
          return false
        }
      }
      return true
    })
  }, [allPosts, selectedCategory, searchQuery])

  const featuredPost = filteredPosts.find((p) => p.featured) || filteredPosts[0]
  const gridPosts = filteredPosts.filter((p) => p.id !== featuredPost?.id)
  const visibleGridPosts = gridPosts.slice(0, visibleCount)
  const hasMore = gridPosts.length > visibleCount

  // Collect all tags from visible posts
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    filteredPosts.forEach((p) => p.tags.forEach((t) => tags.add(t)))
    return Array.from(tags)
  }, [filteredPosts])

  // Category counts for sidebar
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allPosts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1
    })
    return counts
  }, [allPosts])

  const handleSubscribe = (source: 'hero' | 'sidebar') => {
    const emailValue = source === 'hero' ? email : sidebarEmail
    if (!emailValue || !emailValue.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    if (source === 'hero') {
      setSubscribed(true)
    } else {
      setSidebarSubscribed(true)
    }
    toast.success('Thanks for subscribing! 🎉')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Skeleton className="h-60 w-full rounded-2xl mb-8" />
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* ====== Hero Banner ====== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-rose-900/90 to-slate-900 px-4 sm:px-6 py-16 sm:py-24"
      >
        {/* Decorative animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 12, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 left-[8%] w-72 h-72 bg-rose-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 15, 0], x: [0, -12, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-10 right-[12%] w-80 h-80 bg-orange-500/15 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 10, 0], x: [0, 8, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 right-[30%] w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20 mb-4 px-3 py-1">
              <Rss className="h-3 w-3 mr-1.5" />
              Insights & Resources
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4"
          >
            The{' '}
            <span className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Blog
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-lg text-white/70 mb-8 max-w-xl mx-auto"
          >
            Insights, tips, and stories from TechGear Pro
          </motion.p>

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="relative max-w-lg mx-auto mb-6"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input
              placeholder="Search articles, topics, authors..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(6) }}
              className="pl-12 h-12 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/40 focus:border-rose-400/50 focus:ring-rose-400/30 rounded-xl text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 hover:text-white/70 transition-colors"
              >
                ✕
              </button>
            )}
          </motion.div>

          {/* Newsletter CTA in Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {subscribed ? (
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm text-emerald-300 px-5 py-2.5 rounded-full text-sm font-medium border border-emerald-500/20">
                <Sparkles className="h-4 w-4" />
                You&apos;re subscribed! Check your inbox.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    type="email"
                    placeholder="Subscribe to newsletter..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubscribe('hero')}
                    className="pl-10 h-11 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/40 focus:border-rose-400/50 focus:ring-rose-400/30 rounded-xl"
                  />
                </div>
                <Button
                  onClick={() => handleSubscribe('hero')}
                  className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 h-11 px-6 shadow-lg shadow-rose-500/20 transition-all"
                >
                  Subscribe
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            )}
          </motion.div>

          {/* Category Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-2 mt-8"
          >
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setVisibleCount(6) }}
                  className={`
                    inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${selectedCategory === cat.id
                      ? 'bg-white text-slate-900 shadow-lg shadow-white/20'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-sm border border-white/10'
                    }
                  `}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              )
            })}
          </motion.div>
        </div>
      </motion.div>

      <div className="px-4 sm:px-6 py-8 sm:py-12">
        {/* ====== Results Info ====== */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-6"
          >
            <p className="text-sm text-muted-foreground">
              {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}
              className="text-rose-500"
            >
              Clear search
            </Button>
          </motion.div>
        )}

        {filteredPosts.length === 0 ? (
          /* ====== Empty State ====== */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No articles found</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search term or browse categories above.'
                : 'Check back later for new articles.'}
            </p>
            <Button
              variant="outline"
              onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}
              className="border-rose-200 text-rose-500 hover:bg-rose-50"
            >
              Reset Filters
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            {/* ====== Main Content ====== */}
            <div className="flex-1 min-w-0">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* ====== Featured Post ====== */}
                {featuredPost && (
                  <motion.div variants={itemVariants} className="mb-10">
                    <Card className="overflow-hidden cursor-pointer group border-0 shadow-md hover:shadow-xl transition-all duration-500">
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Image */}
                        <div className="relative aspect-video lg:aspect-auto min-h-[260px] overflow-hidden">
                          <div className={`absolute inset-0 bg-gradient-to-br ${blogGradients[featuredPost.gradientIndex]} transition-transform duration-700 group-hover:scale-105`} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {(() => {
                              const CatIcon = getCategoryIcon(featuredPost.category)
                              return <CatIcon className="h-20 w-20 text-white/20" />
                            })()}
                          </div>
                          {/* Featured badge */}
                          <div className="absolute top-4 left-4 z-10">
                            <Badge className="bg-gradient-to-r from-rose-500 to-orange-500 text-white border-0 shadow-lg">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                          {/* Category badge */}
                          <div className="absolute top-4 right-4 z-10">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[featuredPost.category] || 'bg-gray-100 text-gray-700'}`}>
                              {featuredPost.category}
                            </span>
                          </div>
                        </div>
                        {/* Content */}
                        <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(featuredPost.publishedAt)}
                            </span>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {featuredPost.readingTime} min read
                            </span>
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-bold mb-4 group-hover:text-rose-500 transition-colors leading-tight">
                            {featuredPost.title}
                          </h2>
                          <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                            {featuredPost.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className={`bg-gradient-to-br ${authorAvatarGradients[featuredPost.author] || 'from-rose-400 to-orange-400'} text-white text-sm font-semibold`}>
                                  {featuredPost.authorInitials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{featuredPost.author}</p>
                                <p className="text-xs text-muted-foreground">Author</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <ShareButtons title={featuredPost.title} />
                              <Button variant="ghost" className="text-rose-500 group/btn">
                                Read More
                                <ArrowRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* ====== Post Grid ====== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {visibleGridPosts.map((post, index) => {
                    const CatIcon = getCategoryIcon(post.category)
                    return (
                      <motion.div
                        key={post.id}
                        variants={itemVariants}
                      >
                        <Card className="overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full flex flex-col">
                          {/* Gradient accent bar at top */}
                          <div className={`h-1.5 bg-gradient-to-r ${categoryBarColors[post.category] || 'from-gray-400 to-gray-300'}`} />
                          
                          {/* Image */}
                          <div className="relative aspect-video overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-br ${blogGradients[post.gradientIndex]} transition-transform duration-500 group-hover:scale-110`} />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <CatIcon className="h-12 w-12 text-white/20" />
                            </div>
                            {/* Category pill */}
                            <div className="absolute top-3 left-3 z-10">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'}`}>
                                {post.category}
                              </span>
                            </div>
                            {/* Reading time */}
                            <div className="absolute top-3 right-3 z-10">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-black/40 backdrop-blur-sm text-white">
                                <Clock className="h-3 w-3" />
                                {post.readingTime} min
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5 flex-1 flex flex-col">
                            {/* Date */}
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDate(post.publishedAt)}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="font-bold text-base mb-2 group-hover:text-rose-500 transition-colors line-clamp-2 leading-snug">
                              {post.title}
                            </h3>

                            {/* Excerpt */}
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1 leading-relaxed">
                              {post.excerpt}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/80 text-muted-foreground">
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Bottom Row */}
                            <div className="flex items-center justify-between pt-3 border-t">
                              {/* Author with gradient avatar */}
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className={`text-[10px] font-semibold bg-gradient-to-br ${authorAvatarGradients[post.author] || 'from-rose-400 to-orange-400'} text-white`}>
                                    {post.authorInitials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium text-muted-foreground">{post.author}</span>
                              </div>

                              {/* Read More */}
                              <span className="text-xs font-medium text-rose-500 flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                                Read More
                                <ChevronRight className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>

                {/* ====== Load More ====== */}
                {hasMore && (
                  <motion.div variants={itemVariants} className="flex justify-center mt-10">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setVisibleCount((c) => c + 6)}
                      className="min-w-[200px] border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300"
                    >
                      Load More Articles
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* ====== Desktop Sidebar ====== */}
            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              className="hidden lg:block w-72 shrink-0"
            >
              <div className="sticky top-6 space-y-6">
                {/* Categories List with Post Counts */}
                <Card className="p-5 border-0 shadow-sm">
                  <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-rose-500" />
                    Categories
                  </h3>
                  <div className="space-y-1">
                    {categories.filter(c => c.id !== 'all').map((cat) => {
                      const Icon = cat.icon
                      const count = categoryCounts[cat.id] || 0
                      return (
                        <button
                          key={cat.id}
                          onClick={() => { setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id); setVisibleCount(6) }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            selectedCategory === cat.id
                              ? 'bg-rose-50 text-rose-600 font-medium'
                              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5" />
                            {cat.label}
                          </div>
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                            {count}
                          </Badge>
                        </button>
                      )
                    })}
                  </div>
                </Card>

                {/* Popular Tags Cloud */}
                <Card className="p-5 border-0 shadow-sm">
                  <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-rose-500" />
                    Popular Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 12).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => { setSearchQuery(tag); setVisibleCount(6) }}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted/80 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                      >
                        <Tag className="h-3 w-3 inline mr-1" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Newsletter Subscribe Card */}
                <Card className="p-5 border-0 shadow-sm overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50" />
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute -top-8 -right-8 w-32 h-32 bg-rose-300/20 rounded-full blur-2xl"
                    />
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm">Newsletter</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Get the latest articles and insights delivered to your inbox. No spam, ever.
                    </p>
                    {sidebarSubscribed ? (
                      <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium bg-emerald-50 px-3 py-2 rounded-lg">
                        <Sparkles className="h-3.5 w-3.5" />
                        Subscribed!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={sidebarEmail}
                          onChange={(e) => setSidebarEmail(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSubscribe('sidebar')}
                          className="h-9 text-sm bg-white/80 border-white/50 focus:border-rose-300 focus:ring-rose-200"
                        />
                        <Button
                          onClick={() => handleSubscribe('sidebar')}
                          className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 h-9 text-sm shadow-md"
                        >
                          Subscribe
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </motion.aside>
          </div>
        )}

        {/* ====== Newsletter CTA (Bottom) ====== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mt-16 sm:mt-20"
        >
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="relative bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 px-6 sm:px-12 py-12 sm:py-16">
              {/* Decorative blobs */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-10 -left-10 w-40 h-40 bg-rose-300/20 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-10 -right-10 w-48 h-48 bg-orange-300/20 rounded-full blur-3xl"
                />
              </div>

              <div className="relative max-w-xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-sm">
                  <Mail className="h-4 w-4 text-rose-500" />
                  <span className="text-sm font-medium">Newsletter</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">Stay in the loop</h2>
                <p className="text-muted-foreground mb-8">
                  Get the latest articles, insights, and ecommerce tips delivered straight to your inbox. No spam, ever.
                </p>

                {subscribed ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-6 py-3 rounded-full font-medium"
                  >
                    <Sparkles className="h-4 w-4" />
                    You&apos;re subscribed! Check your inbox.
                  </motion.div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubscribe('hero')}
                        className="pl-10 h-11 bg-white/80 backdrop-blur-sm border-white/50 focus:border-rose-300 focus:ring-rose-200"
                      />
                    </div>
                    <Button
                      onClick={() => handleSubscribe('hero')}
                      className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 h-11 px-6 shadow-md hover:shadow-lg transition-all"
                    >
                      Subscribe
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
