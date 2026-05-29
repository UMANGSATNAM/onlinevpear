'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Flag,
  Plus,
  Edit,
  Search,
  Tag,
  Globe,
  Clock,
  User,
  Beaker,
  Rocket,
  ShoppingCart,
  Megaphone,
  Settings,
  BarChart3,
  Brain,
  Package,
  CreditCard,
  Truck,
  Palette,
  Server,
  Shield,
  Bell,
  Zap,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string | null
  isEnabled: boolean
  rolloutPct: number
  conditions: string
  createdAt: string
  updatedAt: string
}

interface FlagsResponse {
  flags: FeatureFlag[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

// Flag categories with icons and colors
const flagCategories: Record<string, { label: string; icon: React.ElementType; gradient: string; color: string }> = {
  core: { label: 'Core', icon: Settings, gradient: 'from-slate-500 to-slate-600', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  ai: { label: 'AI', icon: Brain, gradient: 'from-violet-500 to-purple-600', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  commerce: { label: 'Commerce', icon: ShoppingCart, gradient: 'from-emerald-500 to-teal-600', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  marketing: { label: 'Marketing', icon: Megaphone, gradient: 'from-amber-500 to-orange-600', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  experimental: { label: 'Experimental', icon: Beaker, gradient: 'from-rose-500 to-pink-600', color: 'bg-rose-100 text-rose-700 border-rose-200' },
}

// Map key prefix to category
function getFlagCategory(key: string): string {
  const prefix = key.split('_')[0].toLowerCase()
  const categoryMap: Record<string, string> = {
    ai: 'ai',
    analytics: 'core',
    store: 'core',
    payment: 'commerce',
    shipping: 'commerce',
    checkout: 'commerce',
    marketing: 'marketing',
    theme: 'core',
    api: 'core',
    admin: 'core',
    security: 'core',
    notification: 'core',
    experiment: 'experimental',
    beta: 'experimental',
    promo: 'marketing',
    cart: 'commerce',
  }
  return categoryMap[prefix] || 'experimental'
}

// Determine env targeting from conditions
function getEnvTargeting(conditions: string): { production: boolean; staging: boolean; development: boolean } {
  try {
    const parsed = JSON.parse(conditions)
    if (parsed?.environments) {
      return {
        production: parsed.environments.includes('production'),
        staging: parsed.environments.includes('staging'),
        development: parsed.environments.includes('development'),
      }
    }
  } catch {
    // not JSON or no environments key
  }
  // Default: if enabled and 100% rollout, assume all envs
  return { production: true, staging: true, development: true }
}

// Mock user who last modified
function getLastModifiedBy(flag: FeatureFlag): string {
  const users = ['admin@shopforge.io', 'dev@shopforge.io', 'product@shopforge.io']
  const idx = flag.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % users.length
  return users[idx]
}

export function FeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editFlag, setEditFlag] = useState<FeatureFlag | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    isEnabled: false,
    rolloutPct: 0,
    conditions: '',
  })
  const [updating, setUpdating] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    key: '',
    name: '',
    description: '',
    category: 'core',
    isEnabled: false,
    rolloutPct: 100,
    conditions: '',
  })
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const fetchFlags = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.get<FlagsResponse>('/feature-flags', { limit: '100' })
      setFlags(result.flags)
    } catch {
      toast.error('Failed to load feature flags')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFlags()
  }, [fetchFlags])

  // Group flags by category
  const groupedFlags = useMemo(() => {
    let filtered = flags.filter(
      (f) =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.key.toLowerCase().includes(search.toLowerCase()) ||
        (f.description && f.description.toLowerCase().includes(search.toLowerCase()))
    )

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((f) => getFlagCategory(f.key) === categoryFilter)
    }

    const groups: Record<string, FeatureFlag[]> = {}
    filtered.forEach((flag) => {
      const category = getFlagCategory(flag.key)
      if (!groups[category]) groups[category] = []
      groups[category].push(flag)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [flags, search, categoryFilter])

  // Stats
  const stats = useMemo(() => ({
    total: flags.length,
    enabled: flags.filter((f) => f.isEnabled).length,
    disabled: flags.filter((f) => !f.isEnabled).length,
    draft: flags.filter((f) => f.rolloutPct < 100 && f.isEnabled).length,
  }), [flags])

  const handleToggle = async (flag: FeatureFlag) => {
    setUpdating(flag.id)
    try {
      const result = await api.put<{ flag: FeatureFlag }>('/feature-flags', {
        id: flag.id,
        isEnabled: !flag.isEnabled,
      })
      setFlags((prev) => prev.map((f) => (f.id === flag.id ? result.flag : f)))
      toast.success(`Feature flag "${flag.name}" ${!flag.isEnabled ? 'enabled' : 'disabled'}`)
    } catch {
      toast.error('Failed to update feature flag')
    } finally {
      setUpdating(null)
    }
  }

  const openEditDialog = (flag: FeatureFlag) => {
    setEditFlag(flag)
    setEditForm({
      isEnabled: flag.isEnabled,
      rolloutPct: flag.rolloutPct,
      conditions: flag.conditions,
    })
    setEditDialogOpen(true)
  }

  const handleSaveFlag = async () => {
    if (!editFlag) return
    try {
      const result = await api.put<{ flag: FeatureFlag }>('/feature-flags', {
        id: editFlag.id,
        isEnabled: editForm.isEnabled,
        rolloutPct: editForm.rolloutPct,
        conditions: editForm.conditions ? JSON.parse(editForm.conditions) : undefined,
      })
      setFlags((prev) => prev.map((f) => (f.id === editFlag.id ? result.flag : f)))
      toast.success('Feature flag updated')
      setEditDialogOpen(false)
    } catch {
      toast.error('Failed to update feature flag')
    }
  }

  const handleCreateFlag = async () => {
    if (!createForm.key || !createForm.name) {
      toast.error('Key and name are required')
      return
    }
    try {
      const result = await api.put<{ flag: FeatureFlag }>('/feature-flags', {
        key: createForm.key,
        name: createForm.name,
        description: createForm.description || undefined,
        isEnabled: createForm.isEnabled,
        rolloutPct: createForm.rolloutPct,
        conditions: createForm.conditions ? JSON.parse(createForm.conditions) : undefined,
      })
      setFlags((prev) => [...prev, result.flag])
      toast.success('Feature flag created')
      setCreateDialogOpen(false)
      setCreateForm({ key: '', name: '', description: '', category: 'core', isEnabled: false, rolloutPct: 100, conditions: '' })
    } catch {
      toast.error('Failed to create feature flag')
    }
  }

  if (loading) return <FeatureFlagsSkeleton />

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Feature Flags</h2>
            <p className="text-muted-foreground">Manage feature rollouts and targeting</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search flags..."
                className="pl-9 w-full sm:w-[250px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Create Flag
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-4">
        {[
          { title: 'Total Flags', value: stats.total, icon: Flag, gradient: 'from-slate-500 to-slate-600', bg: 'from-slate-50 to-slate-100/50' },
          { title: 'Enabled', value: stats.enabled, icon: ToggleRight, gradient: 'from-emerald-500 to-teal-600', bg: 'from-emerald-50 to-teal-50/50' },
          { title: 'Disabled', value: stats.disabled, icon: ToggleLeft, gradient: 'from-gray-400 to-gray-500', bg: 'from-gray-50 to-gray-100/50' },
          { title: 'Draft/Partial', value: stats.draft, icon: Beaker, gradient: 'from-amber-500 to-orange-600', bg: 'from-amber-50 to-orange-50/50' },
        ].map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Category Filter Tabs */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.1 }}>
        <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
          <TabsList className="h-10 flex-wrap">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            {Object.entries(flagCategories).map(([key, cat]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                <cat.icon className="h-3 w-3 mr-1.5" />
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Grouped Flags */}
      {groupedFlags.length === 0 ? (
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card>
            <CardContent className="py-12 text-center">
              <Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No feature flags found</p>
              <p className="text-sm text-muted-foreground">
                {search ? 'Try adjusting your search' : 'Feature flags will appear here when created'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        groupedFlags.map(([category, categoryFlags], gi) => {
          const catConfig = flagCategories[category] || flagCategories.experimental
          return (
            <motion.div key={category} {...fadeIn} transition={{ duration: 0.4, delay: 0.2 + gi * 0.08 }}>
              <Card className="overflow-hidden">
                {/* Category Header */}
                <div className={`h-1 bg-gradient-to-r ${catConfig.gradient}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${catConfig.gradient} flex items-center justify-center`}>
                      <catConfig.icon className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-base">{catConfig.label}</CardTitle>
                    <Badge variant="outline" className={catConfig.color}>{categoryFlags.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categoryFlags.map((flag) => {
                    const envTargeting = getEnvTargeting(flag.conditions)
                    const lastModifiedBy = getLastModifiedBy(flag)
                    const isDraft = flag.isEnabled && flag.rolloutPct < 100

                    return (
                      <div
                        key={flag.id}
                        className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/30 transition-colors group"
                      >
                        <Switch
                          checked={flag.isEnabled}
                          onCheckedChange={() => handleToggle(flag)}
                          disabled={updating === flag.id}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{flag.name}</span>
                            <Badge variant="outline" className="text-[10px] font-mono">{flag.key}</Badge>
                            {isDraft && (
                              <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700">Partial Rollout</Badge>
                            )}
                          </div>
                          {flag.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{flag.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                            {/* Rollout progress */}
                            <div className="flex items-center gap-1.5">
                              <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${flag.isEnabled ? 'bg-emerald-500' : 'bg-gray-400'}`}
                                  style={{ width: `${flag.rolloutPct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground">{flag.rolloutPct}%</span>
                            </div>

                            {/* Environment Targeting */}
                            <div className="flex items-center gap-1.5">
                              {[
                                { key: 'production' as const, label: 'Prod', color: envTargeting.production ? 'bg-emerald-500' : 'bg-gray-300' },
                                { key: 'staging' as const, label: 'Stg', color: envTargeting.staging ? 'bg-amber-500' : 'bg-gray-300' },
                                { key: 'development' as const, label: 'Dev', color: envTargeting.development ? 'bg-sky-500' : 'bg-gray-300' },
                              ].map((env) => (
                                <div key={env.key} className="flex items-center gap-0.5">
                                  <div className={`h-2 w-2 rounded-full ${env.color}`} />
                                  <span className="text-[9px] text-muted-foreground">{env.label}</span>
                                </div>
                              ))}
                            </div>

                            {/* Last Modified */}
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(flag.updatedAt).toLocaleDateString()}</span>
                              <span className="text-muted-foreground/50">by</span>
                              <span className="font-medium">{lastModifiedBy}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEditDialog(flag)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )
        })
      )}

      {/* Edit Flag Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Feature Flag</DialogTitle>
            <DialogDescription>
              {editFlag?.name} ({editFlag?.key})
            </DialogDescription>
          </DialogHeader>
          {editFlag && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Enabled</Label>
                  <p className="text-xs text-muted-foreground">Toggle this feature flag on or off</p>
                </div>
                <Switch
                  checked={editForm.isEnabled}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, isEnabled: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Rollout Percentage</Label>
                  <span className="text-sm font-semibold">{editForm.rolloutPct}%</span>
                </div>
                <Slider
                  value={[editForm.rolloutPct]}
                  onValueChange={(value) => setEditForm({ ...editForm, rolloutPct: value[0] })}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0% (Off)</span>
                  <span>50% (Half)</span>
                  <span>100% (Full)</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Targeting Conditions (JSON)</Label>
                <Textarea
                  value={editForm.conditions}
                  onChange={(e) => setEditForm({ ...editForm, conditions: e.target.value })}
                  rows={4}
                  className="font-mono text-xs"
                  placeholder='{"plan": ["professional", "enterprise"], "region": ["US"], "environments": ["production", "staging"]}'
                />
                <p className="text-xs text-muted-foreground">
                  Define targeting rules for who sees this feature. Add &quot;environments&quot; key to control env targeting. Leave empty for all users.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveFlag}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Flag Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Feature Flag
            </DialogTitle>
            <DialogDescription>
              Create a new feature flag to control feature rollouts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {/* Flag Key */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Flag Key</Label>
              <Input
                placeholder="e.g., ai_product_recommendations"
                value={createForm.key}
                onChange={(e) => setCreateForm({ ...createForm, key: e.target.value.replace(/\s/g, '_').toLowerCase() })}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Unique identifier for the flag. Use snake_case format.</p>
            </div>

            {/* Flag Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Display Name</Label>
              <Input
                placeholder="e.g., AI Product Recommendations"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                placeholder="Describe what this feature flag controls..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                rows={3}
                className="text-sm"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Select value={createForm.category} onValueChange={(v) => setCreateForm({ ...createForm, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(flagCategories).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="h-3.5 w-3.5" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Enabled toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Enabled</Label>
                <p className="text-xs text-muted-foreground">Start with the flag enabled or disabled</p>
              </div>
              <Switch
                checked={createForm.isEnabled}
                onCheckedChange={(checked) => setCreateForm({ ...createForm, isEnabled: checked })}
              />
            </div>

            {/* Rollout */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Rollout Percentage</Label>
                <span className="text-sm font-semibold">{createForm.rolloutPct}%</span>
              </div>
              <Slider
                value={[createForm.rolloutPct]}
                onValueChange={(value) => setCreateForm({ ...createForm, rolloutPct: value[0] })}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0% (Off)</span>
                <span>50% (Half)</span>
                <span>100% (Full)</span>
              </div>
            </div>

            {/* Targeting Conditions */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Targeting Conditions (JSON, optional)</Label>
              <Textarea
                value={createForm.conditions}
                onChange={(e) => setCreateForm({ ...createForm, conditions: e.target.value })}
                rows={3}
                className="font-mono text-xs"
                placeholder='{"environments": ["staging", "development"], "plan": ["professional"]}'
              />
              <p className="text-xs text-muted-foreground">
                Define targeting rules. Add &quot;environments&quot; to control Prod/Stg/Dev visibility.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFlag} disabled={!createForm.key || !createForm.name}>
              Create Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FeatureFlagsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-10 w-10 rounded-lg mb-2" />
              <Skeleton className="h-6 w-12 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
