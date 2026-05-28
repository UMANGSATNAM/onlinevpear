'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Flag,
  Plus,
  Edit,
  Search,
  Tag,
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
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
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

// Categorize flags by key prefix
function getFlagCategory(key: string): string {
  const parts = key.split('_')
  if (parts.length < 2) return 'General'
  const prefix = parts[0].toLowerCase()
  const categories: Record<string, string> = {
    ai: 'AI Features',
    analytics: 'Analytics',
    store: 'Store',
    payment: 'Payments',
    shipping: 'Shipping',
    checkout: 'Checkout',
    marketing: 'Marketing',
    theme: 'Themes',
    api: 'API',
    admin: 'Admin',
    security: 'Security',
    notification: 'Notifications',
  }
  return categories[prefix] || 'General'
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
    const filtered = flags.filter(
      (f) =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.key.toLowerCase().includes(search.toLowerCase()) ||
        (f.description && f.description.toLowerCase().includes(search.toLowerCase()))
    )
    const groups: Record<string, FeatureFlag[]> = {}
    filtered.forEach((flag) => {
      const category = getFlagCategory(flag.key)
      if (!groups[category]) groups[category] = []
      groups[category].push(flag)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [flags, search])

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
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Flag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{flags.length}</p>
                <p className="text-xs text-muted-foreground">Total Flags</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Flag className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{flags.filter((f) => f.isEnabled).length}</p>
                <p className="text-xs text-muted-foreground">Enabled</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center">
                <Flag className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{flags.filter((f) => !f.isEnabled).length}</p>
                <p className="text-xs text-muted-foreground">Disabled</p>
              </div>
            </CardContent>
          </Card>
        </div>
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
        groupedFlags.map(([category, categoryFlags], gi) => (
          <motion.div key={category} {...fadeIn} transition={{ duration: 0.4, delay: 0.2 + gi * 0.1 }}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">{category}</CardTitle>
                  <Badge variant="secondary" className="text-[10px]">{categoryFlags.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                  >
                    <Switch
                      checked={flag.isEnabled}
                      onCheckedChange={() => handleToggle(flag)}
                      disabled={updating === flag.id}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{flag.name}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">{flag.key}</Badge>
                      </div>
                      {flag.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{flag.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${flag.rolloutPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{flag.rolloutPct}% rollout</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          Updated {new Date(flag.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(flag)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))
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
                  placeholder='{"plan": ["professional", "enterprise"], "region": ["US"]}'
                />
                <p className="text-xs text-muted-foreground">
                  Define targeting rules for who sees this feature. Leave empty for all users.
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
    </div>
  )
}

function FeatureFlagsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
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
