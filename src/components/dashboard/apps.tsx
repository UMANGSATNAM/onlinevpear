'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  Download,
  Grid3X3,
  Check,
  ExternalLink,
  Settings,
  Sparkles,
  Search,
  ShoppingBag,
  Palette,
  BarChart3,
  Bell,
  MessageSquare,
  Shield,
  Code,
  Megaphone,
  Package,
  TrendingUp,
  Clock,
  ArrowRight,
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
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

interface AppListing {
  id: string
  name: string
  slug: string
  description: string
  shortDesc: string | null
  icon: string | null
  screenshots: string
  category: string
  developer: string
  website: string | null
  pricing: string
  permissions: string
  installs: number
  rating: number
  reviews: number
  status: string
  createdAt: string
}

interface AppsResponse {
  apps: AppListing[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

const categoryIcons: Record<string, typeof ShoppingBag> = {
  marketing: Megaphone,
  sales: ShoppingBag,
  analytics: BarChart3,
  design: Palette,
  communication: MessageSquare,
  security: Shield,
  developer: Code,
  productivity: TrendingUp,
  notifications: Bell,
  shipping: Package,
}

const categoryGradients: Record<string, string> = {
  marketing: 'from-rose-500 to-pink-600',
  sales: 'from-emerald-500 to-teal-600',
  analytics: 'from-sky-500 to-blue-600',
  design: 'from-violet-500 to-purple-600',
  communication: 'from-cyan-500 to-teal-600',
  security: 'from-amber-500 to-orange-600',
  developer: 'from-slate-500 to-gray-600',
  productivity: 'from-indigo-500 to-blue-600',
  notifications: 'from-orange-500 to-red-600',
  shipping: 'from-teal-500 to-emerald-600',
}

const categoryBgLight: Record<string, string> = {
  marketing: 'bg-rose-50',
  sales: 'bg-emerald-50',
  analytics: 'bg-sky-50',
  design: 'bg-violet-50',
  communication: 'bg-cyan-50',
  security: 'bg-amber-50',
  developer: 'bg-slate-50',
  productivity: 'bg-indigo-50',
  notifications: 'bg-orange-50',
  shipping: 'bg-teal-50',
}

const categoryIconColor: Record<string, string> = {
  marketing: 'text-rose-600',
  sales: 'text-emerald-600',
  analytics: 'text-sky-600',
  design: 'text-violet-600',
  communication: 'text-cyan-600',
  security: 'text-amber-600',
  developer: 'text-slate-600',
  productivity: 'text-indigo-600',
  notifications: 'text-orange-600',
  shipping: 'text-teal-600',
}

const categoryPillColors: Record<string, string> = {
  marketing: 'bg-rose-100 text-rose-700',
  sales: 'bg-emerald-100 text-emerald-700',
  analytics: 'bg-sky-100 text-sky-700',
  design: 'bg-violet-100 text-violet-700',
  communication: 'bg-cyan-100 text-cyan-700',
  security: 'bg-amber-100 text-amber-700',
  developer: 'bg-slate-100 text-slate-700',
  productivity: 'bg-indigo-100 text-indigo-700',
  notifications: 'bg-orange-100 text-orange-700',
  shipping: 'bg-teal-100 text-teal-700',
}

const defaultIconColors = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500',
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function AppsMarketplace() {
  const { selectedMerchantId } = useAppStore()
  const [apps, setApps] = useState<AppListing[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [installed, setInstalled] = useState<Set<string>>(new Set())

  const fetchApps = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { limit: '50' }
      if (categoryFilter !== 'all') params.category = categoryFilter
      const data = await api.get<AppsResponse>('/apps', params)
      setApps(data.apps)
    } catch {
      toast.error('Failed to load apps')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [categoryFilter])

  const categories = useMemo(() => ['all', ...Array.from(new Set(apps.map((a) => a.category)))], [apps])

  const filteredApps = apps.filter((app) => {
    if (!search) return true
    const q = search.toLowerCase()
    return app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q)
  })

  const featuredApps = filteredApps.slice(0, 3)

  // Computed stats
  const appStats = useMemo(() => {
    const totalApps = apps.length
    const installedCount = installed.size
    const uniqueCategories = new Set(apps.map(a => a.category)).size
    const topRated = apps.length > 0
      ? apps.reduce((best, app) => app.rating > best.rating ? app : best, apps[0])
      : null
    return { totalApps, installedCount, uniqueCategories, topRated }
  }, [apps, installed])

  const handleInstall = (appId: string) => {
    setInstalled((prev) => {
      const next = new Set(prev)
      if (next.has(appId)) {
        next.delete(appId)
        toast.success('App uninstalled')
      } else {
        next.add(appId)
        toast.success('App installed')
      }
      return next
    })
  }

  const getPricingLabel = (pricing: string) => {
    try {
      const data = JSON.parse(pricing || '{}')
      if (data.type === 'free') return 'Free'
      if (data.type === 'freemium') return 'Freemium'
      if (data.monthly) return `$${data.monthly}/mo`
      return 'Free'
    } catch {
      return 'Free'
    }
  }

  const isNewApp = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime()
    return diff < 30 * 24 * 60 * 60 * 1000 // 30 days
  }

  const renderStars = (rating: number, size: string = 'h-3 w-3') => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : star <= rating
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getCategoryIcon = (category: string) => categoryIcons[category] || Package
  const getCategoryGradient = (category: string) => categoryGradients[category] || 'from-gray-400 to-slate-500'
  const getCategoryBgLight = (category: string) => categoryBgLight[category] || 'bg-gray-50'
  const getCategoryIconColor = (category: string) => categoryIconColor[category] || 'text-gray-600'
  const getCategoryPill = (category: string) => categoryPillColors[category] || 'bg-gray-100 text-gray-700'

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Page Header with Gradient */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                <Grid3X3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight">App Marketplace</h2>
                  <Badge className="bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    <Star className="mr-1 h-3 w-3" />
                    Marketplace
                  </Badge>
                </div>
                <p className="text-slate-300 mt-1">Extend your store with powerful apps and integrations</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Available Apps',
            value: appStats.totalApps,
            icon: Grid3X3,
            gradient: 'from-emerald-500 to-teal-600',
            bgGradient: 'from-emerald-50 to-teal-50',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            sub: 'in marketplace',
          },
          {
            title: 'Installed',
            value: appStats.installedCount,
            icon: Check,
            gradient: 'from-violet-500 to-purple-600',
            bgGradient: 'from-violet-50 to-purple-50',
            iconBg: 'bg-violet-100',
            iconColor: 'text-violet-600',
            sub: 'active integrations',
          },
          {
            title: 'Categories',
            value: appStats.uniqueCategories,
            icon: Palette,
            gradient: 'from-amber-500 to-orange-600',
            bgGradient: 'from-amber-50 to-orange-50',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            sub: 'app categories',
          },
          {
            title: 'Top Rated',
            value: appStats.topRated ? appStats.topRated.name.split(' ')[0] : 'N/A',
            icon: Star,
            gradient: 'from-rose-500 to-pink-600',
            bgGradient: 'from-rose-50 to-pink-50',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
            sub: appStats.topRated ? `${appStats.topRated.rating.toFixed(1)} ★ rating` : 'no ratings yet',
          },
        ].map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${stat.bgGradient}`}>
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-5 pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`${stat.iconBg} rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Glassmorphism Search Bar */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 backdrop-blur-xl shadow-lg dark:bg-slate-900/70 dark:border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-violet-50/30 dark:from-slate-800/30 dark:to-violet-950/30" />
          <div className="relative p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search apps..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-white/60 dark:bg-slate-800/60 border-white/30 backdrop-blur-sm"
                />
              </div>
              {/* Category filter chips */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => {
                  const CatIcon = cat !== 'all' ? getCategoryIcon(cat) : null
                  return (
                    <motion.button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border flex items-center gap-1.5 ${
                        categoryFilter === cat
                          ? cat === 'all'
                            ? 'bg-foreground text-background border-foreground shadow-sm'
                            : `shadow-sm`
                          : 'bg-white/60 dark:bg-slate-800/60 border-transparent hover:border-muted-foreground/30 text-muted-foreground'
                      }`}
                      style={
                        categoryFilter === cat && cat !== 'all'
                          ? { backgroundColor: `var(--cat-${cat})`, color: '#fff', borderColor: `var(--cat-${cat})` }
                          : undefined
                      }
                      whileTap={{ scale: 0.95 }}
                    >
                      {CatIcon && <CatIcon className="h-3 w-3" />}
                      {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Featured Apps */}
      {featuredApps.length > 0 && !search && categoryFilter === 'all' && (
        <motion.div variants={itemVariants}>
          <div>
            {/* Featured Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-1 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
              <h3 className="text-lg font-semibold">Featured Apps</h3>
              <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px]">
                <Star className="mr-1 h-3 w-3 fill-amber-400 text-amber-400" />
                Top Picks
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredApps.map((app, i) => {
                const catGradient = getCategoryGradient(app.category)
                const isInstalled = installed.has(app.id)
                const isNew = app.createdAt ? isNewApp(app.createdAt) : i === 0

                return (
                  <motion.div
                    key={app.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 relative">
                      {/* Gradient accent bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${catGradient}`} />
                      <CardContent className="p-6 pt-7">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`h-12 w-12 rounded-xl ${defaultIconColors[i % defaultIconColors.length]} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm`}>
                            {app.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{app.name}</h4>
                              {isNew && (
                                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0">
                                  <Sparkles className="mr-0.5 h-2.5 w-2.5" />
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{app.developer}</p>
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            {getPricingLabel(app.pricing)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {app.shortDesc || app.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1">
                              {renderStars(app.rating)}
                              <span className="font-medium text-xs ml-1">{app.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Download className="h-3.5 w-3.5" />
                              <span className="text-xs">{app.installs}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className={isInstalled
                              ? ''
                              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm shadow-emerald-500/20'}
                            variant={isInstalled ? 'secondary' : 'default'}
                            onClick={() => handleInstall(app.id)}
                          >
                            {isInstalled ? (
                              <><Check className="mr-1 h-4 w-4" /> Installed</>
                            ) : (
                              'Install'
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* All Apps Grid */}
      <motion.div variants={itemVariants}>
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {search ? `Results for "${search}"` : categoryFilter !== 'all' ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Apps` : 'All Apps'}
          </h3>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div>
                        <Skeleton className="h-5 w-24 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative mb-4 inline-block">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center mx-auto">
                  <Grid3X3 className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <p className="text-muted-foreground font-medium">No apps found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {filteredApps.map((app) => {
                const catGradient = getCategoryGradient(app.category)
                const CatIcon = getCategoryIcon(app.category)
                const catPill = getCategoryPill(app.category)
                const isInstalled = installed.has(app.id)
                const isNew = app.createdAt ? isNewApp(app.createdAt) : false

                return (
                  <motion.div
                    key={app.id}
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 relative">
                      {/* Category gradient accent bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${catGradient}`} />
                      <CardContent className="p-5 pt-6">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`h-10 w-10 rounded-lg ${defaultIconColors[app.name.length % defaultIconColors.length]} flex items-center justify-center text-white font-bold shrink-0`}>
                            {app.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-semibold text-sm">{app.name}</h4>
                              {isNew && (
                                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[9px] px-1 py-0">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{app.developer}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {app.shortDesc || app.description}
                        </p>
                        {/* Category pill with icon */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${catPill}`}>
                            <CatIcon className="h-2.5 w-2.5" />
                            {app.category.charAt(0).toUpperCase() + app.category.slice(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {getPricingLabel(app.pricing)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-0.5">
                              {renderStars(app.rating, 'h-2.5 w-2.5')}
                              <span className="font-medium ml-0.5">{app.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-0.5 text-muted-foreground">
                              <Download className="h-3 w-3" />
                              <span>{app.installs}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={isInstalled ? 'secondary' : 'outline'}
                            onClick={() => handleInstall(app.id)}
                          >
                            {isInstalled ? (
                              <><Check className="mr-1 h-3 w-3" /> Installed</>
                            ) : (
                              'Install'
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Installed Apps Section */}
      {installed.size > 0 && (
        <motion.div variants={itemVariants}>
          <div>
            {/* Your Apps Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
              <h3 className="text-lg font-semibold">Your Apps</h3>
              <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px]">
                <Check className="mr-1 h-3 w-3" />
                {installed.size} installed
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {apps
                .filter((app) => installed.has(app.id))
                .map((app) => (
                  <Card key={app.id} className="relative overflow-hidden hover:shadow-md transition-all duration-300">
                    {/* Emerald accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <CardContent className="p-4 pt-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`h-10 w-10 rounded-lg ${defaultIconColors[app.name.length % defaultIconColors.length]} flex items-center justify-center text-white font-bold shrink-0`}>
                          {app.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{app.name}</p>
                          <p className="text-xs text-muted-foreground">{app.category}</p>
                        </div>
                      </div>
                      {/* Version and last updated info */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span>v1.0.0</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Updated recently
                        </span>
                      </div>
                      {/* Quick action buttons */}
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => toast.info(`Opening ${app.name}...`)}>
                          <ExternalLink className="mr-1 h-3 w-3" /> Open
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => toast.info(`Opening ${app.name} settings...`)}>
                          <Settings className="mr-1 h-3 w-3" /> Settings
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs text-destructive hover:text-destructive" onClick={() => handleInstall(app.id)}>
                          Uninstall
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
