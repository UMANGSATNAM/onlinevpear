'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Zap,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  GitBranch,
  Activity,
  Sparkles,
  Timer,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  Mail,
  BarChart3,
  Tag,
  Bell,
  Settings,
  Flame,
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

interface WorkflowExecution {
  id: string
  status: string
  triggerData: string
  result: string
  error: string | null
  startedAt: string
  completedAt: string | null
}

interface Workflow {
  id: string
  name: string
  description: string | null
  trigger: string
  conditions: string
  actions: string
  isActive: boolean
  lastRunAt: string | null
  runCount: number
  createdAt: string
  executions: WorkflowExecution[]
  _count: { executions: number }
}

interface WorkflowsResponse {
  workflows: Workflow[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

const triggerLabels: Record<string, string> = {
  order_created: 'Order Created',
  order_shipped: 'Order Shipped',
  order_delivered: 'Order Delivered',
  customer_created: 'Customer Created',
  low_stock: 'Low Stock Alert',
  product_created: 'Product Created',
  abandoned_cart: 'Abandoned Cart',
}

const triggerIcons: Record<string, typeof ShoppingCart> = {
  order_created: ShoppingCart,
  order_shipped: Package,
  order_delivered: CheckCircle2,
  customer_created: Users,
  low_stock: AlertTriangle,
  product_created: Tag,
  abandoned_cart: ShoppingCart,
}

const triggerColors: Record<string, { bg: string; icon: string; pill: string; pillText: string }> = {
  order_created: { bg: 'bg-blue-50', icon: 'text-blue-600', pill: 'bg-blue-100 text-blue-700', pillText: '' },
  order_shipped: { bg: 'bg-violet-50', icon: 'text-violet-600', pill: 'bg-violet-100 text-violet-700', pillText: '' },
  order_delivered: { bg: 'bg-emerald-50', icon: 'text-emerald-600', pill: 'bg-emerald-100 text-emerald-700', pillText: '' },
  customer_created: { bg: 'bg-cyan-50', icon: 'text-cyan-600', pill: 'bg-cyan-100 text-cyan-700', pillText: '' },
  low_stock: { bg: 'bg-amber-50', icon: 'text-amber-600', pill: 'bg-amber-100 text-amber-700', pillText: '' },
  product_created: { bg: 'bg-rose-50', icon: 'text-rose-600', pill: 'bg-rose-100 text-rose-700', pillText: '' },
  abandoned_cart: { bg: 'bg-orange-50', icon: 'text-orange-600', pill: 'bg-orange-100 text-orange-700', pillText: '' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function WorkflowsManagement() {
  const { selectedMerchantId } = useAppStore()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formTrigger, setFormTrigger] = useState('order_created')
  const [formConditions, setFormConditions] = useState('')
  const [formActions, setFormActions] = useState('')

  // Computed stats
  const workflowStats = useMemo(() => {
    const activeCount = workflows.filter(w => w.isActive).length
    const totalRuns = workflows.reduce((sum, w) => sum + w.runCount, 0)
    const completedExecs = workflows.reduce((sum, w) =>
      sum + w.executions.filter(e => e.status === 'completed').length, 0)
    const totalExecs = workflows.reduce((sum, w) => sum + w.executions.length, 0)
    const successRate = totalExecs > 0 ? Math.round((completedExecs / totalExecs) * 100) : 0
    const lastRunWorkflow = workflows.find(w => w.lastRunAt)
    const lastRunAgo = lastRunWorkflow?.lastRunAt
      ? Math.floor((Date.now() - new Date(lastRunWorkflow.lastRunAt).getTime()) / 60000)
      : null
    return { activeCount, totalRuns, successRate, lastRunAgo }
  }, [workflows])

  const maxRunCount = useMemo(() => {
    return Math.max(...workflows.map(w => w.runCount), 1)
  }, [workflows])

  const fetchWorkflows = async () => {
    if (!selectedMerchantId) return
    setLoading(true)
    try {
      const data = await api.get<WorkflowsResponse>('/workflows', { merchantId: selectedMerchantId, limit: '50' })
      setWorkflows(data.workflows)
    } catch {
      toast.error('Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflows()
  }, [selectedMerchantId])

  const handleToggle = async (workflow: Workflow) => {
    try {
      await api.put(`/workflows/${workflow.id}`, { isActive: !workflow.isActive })
      toast.success(workflow.isActive ? 'Workflow paused' : 'Workflow activated')
      fetchWorkflows()
    } catch {
      toast.error('Failed to toggle workflow')
    }
  }

  const handleCreate = async () => {
    if (!selectedMerchantId || !formName || !formTrigger) {
      toast.error('Please fill in required fields')
      return
    }
    setSaving(true)
    try {
      await api.post('/workflows', {
        merchantId: selectedMerchantId,
        name: formName,
        description: formDescription || null,
        trigger: formTrigger,
        conditions: formConditions ? JSON.parse(formConditions) : [],
        actions: formActions ? JSON.parse(formActions) : [],
        isActive: true,
      })
      toast.success('Workflow created')
      setCreateOpen(false)
      resetForm()
      fetchWorkflows()
    } catch {
      toast.error('Failed to create workflow')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormName('')
    setFormDescription('')
    setFormTrigger('order_created')
    setFormConditions('')
    setFormActions('')
  }

  const parseJson = (str: string): any[] => {
    try {
      return JSON.parse(str || '[]')
    } catch {
      return []
    }
  }

  const execStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    if (status === 'failed') return <XCircle className="h-4 w-4 text-red-600" />
    return <Clock className="h-4 w-4 text-amber-600" />
  }

  // Trigger card data for the visual trigger builder
  const triggerCards = [
    { value: 'order_created', label: 'Order Created', icon: ShoppingCart, color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50', iconColor: 'text-blue-600' },
    { value: 'order_shipped', label: 'Order Shipped', icon: Package, color: 'from-violet-500 to-violet-600', bgLight: 'bg-violet-50', iconColor: 'text-violet-600' },
    { value: 'order_delivered', label: 'Delivered', icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { value: 'customer_created', label: 'New Customer', icon: Users, color: 'from-cyan-500 to-cyan-600', bgLight: 'bg-cyan-50', iconColor: 'text-cyan-600' },
    { value: 'low_stock', label: 'Low Stock', icon: AlertTriangle, color: 'from-amber-500 to-amber-600', bgLight: 'bg-amber-50', iconColor: 'text-amber-600' },
    { value: 'product_created', label: 'New Product', icon: Tag, color: 'from-rose-500 to-rose-600', bgLight: 'bg-rose-50', iconColor: 'text-rose-600' },
    { value: 'abandoned_cart', label: 'Cart Abandoned', icon: ShoppingCart, color: 'from-orange-500 to-orange-600', bgLight: 'bg-orange-50', iconColor: 'text-orange-600' },
  ]

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
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                <GitBranch className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight">Workflows</h2>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <Zap className="mr-1 h-3 w-3" />
                    Automate
                    <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </Badge>
                </div>
                <p className="text-slate-300 mt-1">Automate your store operations with powerful workflow triggers</p>
              </div>
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Workflow
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Active Workflows',
            value: workflowStats.activeCount,
            icon: Activity,
            gradient: 'from-emerald-500 to-teal-600',
            bgGradient: 'from-emerald-50 to-teal-50',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            sub: `of ${workflows.length} total`,
          },
          {
            title: 'Total Runs',
            value: workflowStats.totalRuns,
            icon: TrendingUp,
            gradient: 'from-violet-500 to-purple-600',
            bgGradient: 'from-violet-50 to-purple-50',
            iconBg: 'bg-violet-100',
            iconColor: 'text-violet-600',
            sub: 'across all workflows',
          },
          {
            title: 'Success Rate',
            value: `${workflowStats.successRate}%`,
            icon: CheckCircle2,
            gradient: 'from-sky-500 to-blue-600',
            bgGradient: 'from-sky-50 to-blue-50',
            iconBg: 'bg-sky-100',
            iconColor: 'text-sky-600',
            sub: 'completed executions',
          },
          {
            title: 'Last Run',
            value: workflowStats.lastRunAgo !== null
              ? workflowStats.lastRunAgo < 1 ? 'Just now'
                : workflowStats.lastRunAgo < 60 ? `${workflowStats.lastRunAgo}m ago`
                : `${Math.floor(workflowStats.lastRunAgo / 60)}h ago`
              : 'Never',
            icon: Timer,
            gradient: 'from-amber-500 to-orange-600',
            bgGradient: 'from-amber-50 to-orange-50',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            sub: workflowStats.lastRunAgo !== null ? 'since last trigger' : 'no runs yet',
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

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-3" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-6">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                  <GitBranch className="h-10 w-10 text-emerald-400" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-3 w-3 text-white" />
                </motion.div>
              </div>
              <h3 className="text-lg font-semibold mb-1">No workflows yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Automate repetitive tasks and streamline your store operations with powerful workflow triggers
              </p>
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Create your first workflow
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {workflows.map((workflow) => {
            const triggerColor = triggerColors[workflow.trigger] || triggerColors.order_created
            const TriggerIcon = triggerIcons[workflow.trigger] || Zap
            const conditions = parseJson(workflow.conditions)
            const actions = parseJson(workflow.actions)
            const runPercent = maxRunCount > 0 ? Math.min((workflow.runCount / maxRunCount) * 100, 100) : 0

            return (
              <Collapsible
                key={workflow.id}
                open={expandedId === workflow.id}
                onOpenChange={(open) => setExpandedId(open ? workflow.id : null)}
              >
                <motion.div variants={itemVariants}>
                  <Card className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 ${!workflow.isActive ? 'opacity-75' : ''}`}>
                    {/* Gradient accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${workflow.isActive ? 'from-emerald-500 to-teal-500' : 'from-gray-300 to-slate-400'}`} />
                    <CardContent className="p-6 pt-7">
                      <div className="flex items-start justify-between">
                        <CollapsibleTrigger asChild>
                          <button className="text-left flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${triggerColor.bg}`}>
                                <TriggerIcon className={`h-5 w-5 ${triggerColor.icon}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{workflow.name}</h3>
                                  {workflow.isActive ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0">
                                      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-[10px] px-2 py-0">
                                      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-gray-400" />
                                      Paused
                                    </Badge>
                                  )}
                                </div>
                                {workflow.description && (
                                  <p className="text-sm text-muted-foreground">{workflow.description}</p>
                                )}
                              </div>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {triggerLabels[workflow.trigger] || workflow.trigger}
                          </Badge>
                          <Switch
                            checked={workflow.isActive}
                            onCheckedChange={() => handleToggle(workflow)}
                          />
                        </div>
                      </div>

                      {/* Enhanced workflow visualization: colored step pills with connecting arrows */}
                      <div className="flex items-center gap-2 mt-4 text-sm flex-wrap">
                        <div className={`px-3 py-1.5 rounded-lg ${triggerColor.pill} text-xs font-medium flex items-center gap-1.5`}>
                          <TriggerIcon className="h-3 w-3" />
                          {triggerLabels[workflow.trigger] || workflow.trigger}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium flex items-center gap-1.5">
                          <Settings className="h-3 w-3" />
                          {conditions.length} condition{conditions.length !== 1 ? 's' : ''}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium flex items-center gap-1.5">
                          <Zap className="h-3 w-3" />
                          {actions.length} action{actions.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {/* Run count progress bar */}
                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Runs</span>
                            <span className="text-xs font-medium">{workflow.runCount}</span>
                          </div>
                          <Progress
                            value={runPercent}
                            className="h-1.5"
                          />
                        </div>
                        {workflow.lastRunAt && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            Last: {new Date(workflow.lastRunAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </CardContent>

                    <CollapsibleContent>
                      <div className="border-t px-6 py-4">
                        <h4 className="text-sm font-medium mb-3">Execution History</h4>
                        {workflow.executions.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No executions yet</p>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                            {workflow.executions.map((exec) => (
                              <div key={exec.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                                <div className="flex items-center gap-2">
                                  {execStatusIcon(exec.status)}
                                  <div>
                                    <p className="text-sm font-medium capitalize">{exec.status}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(exec.startedAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                {exec.error && (
                                  <p className="text-xs text-red-600 max-w-[200px] truncate">{exec.error}</p>
                                )}
                                {exec.completedAt && (
                                  <p className="text-xs text-muted-foreground">
                                    Completed: {new Date(exec.completedAt).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </motion.div>
              </Collapsible>
            )
          })}
        </motion.div>
      )}

      {/* Create Workflow Dialog - Enhanced */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          {/* Gradient Header */}
          <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-white">Create Workflow</DialogTitle>
                  <p className="text-emerald-100 text-xs">Set up automation for your store</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Name *</Label>
              <Input
                placeholder="e.g. Low Stock Alert"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Description</Label>
              <Textarea
                placeholder="What does this workflow do?"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Visual Trigger Builder */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Trigger *</Label>
              <div className="grid grid-cols-2 gap-2">
                {triggerCards.map((trigger) => (
                  <motion.button
                    key={trigger.value}
                    onClick={() => setFormTrigger(trigger.value)}
                    className={`relative flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                      formTrigger === trigger.value
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-500/10'
                        : 'border-transparent bg-muted/50 hover:bg-muted'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`p-1.5 rounded-lg ${trigger.bgLight}`}>
                      <trigger.icon className={`h-4 w-4 ${trigger.iconColor}`} />
                    </div>
                    <span className="text-xs font-medium">{trigger.label}</span>
                    {formTrigger === trigger.value && (
                      <div className="absolute top-1.5 right-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Conditions (JSON)</Label>
              <Textarea
                placeholder='[{"field": "total", "operator": ">", "value": 100}]'
                value={formConditions}
                onChange={(e) => setFormConditions(e.target.value)}
                rows={3}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">Optional. JSON array of condition objects.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Actions (JSON)</Label>
              <Textarea
                placeholder='[{"type": "send_email", "template": "order_confirmation"}]'
                value={formActions}
                onChange={(e) => setFormActions(e.target.value)}
                rows={3}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">JSON array of action objects.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={saving}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              {saving ? 'Creating...' : 'Create Workflow'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
