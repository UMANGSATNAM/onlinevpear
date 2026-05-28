'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  Download,
  Grid3X3,
  Check,
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
}

interface AppsResponse {
  apps: AppListing[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

const defaultIconColors = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500',
]

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

  const categories = ['all', ...Array.from(new Set(apps.map((a) => a.category)))]

  const filteredApps = apps.filter((app) => {
    if (!search) return true
    const q = search.toLowerCase()
    return app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q)
  })

  const featuredApps = filteredApps.slice(0, 3)

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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">App Marketplace</h2>
        <p className="text-sm text-muted-foreground">Extend your store with powerful apps</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="capitalize">
                {cat === 'all' ? 'All Categories' : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Featured Apps */}
      {featuredApps.length > 0 && !search && categoryFilter === 'all' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Featured Apps</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredApps.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`h-12 w-12 rounded-xl ${defaultIconColors[i % defaultIconColors.length]} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                        {app.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold">{app.name}</h4>
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
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{app.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Download className="h-3.5 w-3.5" />
                          <span>{app.installs}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={installed.has(app.id) ? 'secondary' : 'default'}
                        onClick={() => handleInstall(app.id)}
                      >
                        {installed.has(app.id) ? (
                          <><Check className="mr-1 h-4 w-4" /> Installed</>
                        ) : (
                          'Install'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Apps Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {search ? `Results for "${search}"` : categoryFilter !== 'all' ? `${categoryFilter} Apps` : 'All Apps'}
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
            <p className="text-muted-foreground">No apps found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredApps.map((app, i) => (
              <Card key={app.id} className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`h-10 w-10 rounded-lg ${defaultIconColors[i % defaultIconColors.length]} flex items-center justify-center text-white font-bold shrink-0`}>
                      {app.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm">{app.name}</h4>
                      <p className="text-xs text-muted-foreground">{app.developer}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {app.shortDesc || app.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{app.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {getPricingLabel(app.pricing)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant={installed.has(app.id) ? 'secondary' : 'outline'}
                      onClick={() => handleInstall(app.id)}
                    >
                      {installed.has(app.id) ? (
                        <><Check className="mr-1 h-3 w-3" /> Installed</>
                      ) : (
                        'Install'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Installed Apps Section */}
      {installed.size > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Installed Apps</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {apps
              .filter((app) => installed.has(app.id))
              .map((app, i) => (
                <Card key={app.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${defaultIconColors[i % defaultIconColors.length]} flex items-center justify-center text-white font-bold shrink-0`}>
                      {app.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.category}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleInstall(app.id)}>
                      Uninstall
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
