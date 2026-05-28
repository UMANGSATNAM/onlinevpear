'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Workflows</h2>
          <p className="text-sm text-muted-foreground">Automate your store operations</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Workflow
        </Button>
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
        <div className="text-center py-12">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <GitBranch className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">No workflows yet</p>
          <p className="text-sm text-muted-foreground mb-4">Automate repetitive tasks and streamline your operations</p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create your first workflow
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <Collapsible
              key={workflow.id}
              open={expandedId === workflow.id}
              onOpenChange={(open) => setExpandedId(open ? workflow.id : null)}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <CollapsibleTrigger asChild>
                      <button className="text-left flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${workflow.isActive ? 'bg-emerald-50' : 'bg-muted'}`}>
                            <Zap className={`h-5 w-5 ${workflow.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold">{workflow.name}</h3>
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
                      <Badge variant="secondary" className="text-xs">
                        {workflow.runCount} runs
                      </Badge>
                      <Switch
                        checked={workflow.isActive}
                        onCheckedChange={() => handleToggle(workflow)}
                      />
                    </div>
                  </div>

                  {/* Workflow visualization */}
                  <div className="flex items-center gap-2 mt-4 text-sm">
                    <div className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                      Trigger: {triggerLabels[workflow.trigger] || workflow.trigger}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium">
                      {parseJson(workflow.conditions).length} condition(s)
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                      {parseJson(workflow.actions).length} action(s)
                    </div>
                  </div>
                </CardContent>

                <CollapsibleContent>
                  <div className="border-t px-6 py-4">
                    <h4 className="text-sm font-medium mb-3">Execution History</h4>
                    {workflow.executions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No executions yet</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {workflow.executions.map((exec) => (
                          <div key={exec.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
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
                    {workflow.lastRunAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Last run: {new Date(workflow.lastRunAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Create Workflow Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="e.g. Low Stock Alert"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="What does this workflow do?"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Trigger *</Label>
              <Select value={formTrigger} onValueChange={setFormTrigger}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order_created">Order Created</SelectItem>
                  <SelectItem value="order_shipped">Order Shipped</SelectItem>
                  <SelectItem value="order_delivered">Order Delivered</SelectItem>
                  <SelectItem value="customer_created">Customer Created</SelectItem>
                  <SelectItem value="low_stock">Low Stock Alert</SelectItem>
                  <SelectItem value="product_created">Product Created</SelectItem>
                  <SelectItem value="abandoned_cart">Abandoned Cart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Conditions (JSON)</Label>
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
              <Label>Actions (JSON)</Label>
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
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create Workflow'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
