'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Send,
  Mail,
  Clock,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Eye,
  MousePointerClick,
  Edit,
  ArrowUpRight,
  Timer,
  Flame,
  Heart,
  Package,
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
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  ResponsiveContainer,
} from 'recharts'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

// Types
interface AbandonedCart {
  id: string
  customer: string
  email: string
  items: string[]
  cartValue: number
  abandonedAt: string
  status: 'new' | 'email_sent' | 'offer_sent' | 'recovered' | 'lost'
}

interface EmailStep {
  id: string
  step: number
  name: string
  timing: string
  description: string
  subject: string
  preview: string
  enabled: boolean
  openRate: number
  clickRate: number
}

// Mock data
const mockAbandonedCarts: AbandonedCart[] = [
  { id: 'ac-1', customer: 'Sarah Johnson', email: 'sarah@example.com', items: ['Wireless Headphones', 'Phone Case'], cartValue: 189.97, abandonedAt: '2025-03-04T14:23:00', status: 'new' },
  { id: 'ac-2', customer: 'Mike Chen', email: 'mike@example.com', items: ['Running Shoes', 'Socks Pack', 'Water Bottle'], cartValue: 154.50, abandonedAt: '2025-03-04T09:15:00', status: 'email_sent' },
  { id: 'ac-3', customer: 'Emily Davis', email: 'emily@example.com', items: ['Leather Jacket'], cartValue: 299.00, abandonedAt: '2025-03-03T22:45:00', status: 'offer_sent' },
  { id: 'ac-4', customer: 'Alex Rivera', email: 'alex@example.com', items: ['Smart Watch', 'Charging Dock'], cartValue: 424.99, abandonedAt: '2025-03-03T16:30:00', status: 'recovered' },
  { id: 'ac-5', customer: 'Lisa Wang', email: 'lisa@example.com', items: ['Yoga Mat', 'Resistance Bands'], cartValue: 78.50, abandonedAt: '2025-03-02T11:20:00', status: 'new' },
  { id: 'ac-6', customer: 'Tom Brown', email: 'tom@example.com', items: ['Espresso Machine', 'Coffee Grinder'], cartValue: 549.00, abandonedAt: '2025-03-02T08:50:00', status: 'email_sent' },
  { id: 'ac-7', customer: 'Nina Patel', email: 'nina@example.com', items: ['Desk Lamp', 'Monitor Stand', 'Cable Organizer'], cartValue: 132.45, abandonedAt: '2025-03-01T20:10:00', status: 'lost' },
  { id: 'ac-8', customer: 'David Kim', email: 'david@example.com', items: ['Bluetooth Speaker'], cartValue: 89.99, abandonedAt: '2025-03-01T15:40:00', status: 'recovered' },
  { id: 'ac-9', customer: 'Rachel Green', email: 'rachel@example.com', items: ['Winter Coat', 'Scarf', 'Gloves'], cartValue: 267.50, abandonedAt: '2025-02-28T12:30:00', status: 'offer_sent' },
  { id: 'ac-10', customer: 'James Wilson', email: 'james@example.com', items: ['Gaming Keyboard', 'Mouse Pad'], cartValue: 179.98, abandonedAt: '2025-02-28T09:00:00', status: 'email_sent' },
  { id: 'ac-11', customer: 'Sophie Turner', email: 'sophie@example.com', items: ['Cookware Set'], cartValue: 349.00, abandonedAt: '2025-02-27T17:20:00', status: 'lost' },
  { id: 'ac-12', customer: 'Chris Lee', email: 'chris@example.com', items: ['Hiking Backpack', 'Trekking Poles'], cartValue: 215.75, abandonedAt: '2025-02-27T14:55:00', status: 'new' },
]

const initialEmailSteps: EmailStep[] = [
  {
    id: 'step-1',
    step: 1,
    name: 'Friendly Reminder',
    timing: '1 hour',
    description: 'A gentle nudge to remind customers about their cart',
    subject: 'You left something behind! 🛒',
    preview: 'Hi {{customer_name}},\n\nWe noticed you left some items in your cart. No rush — they\'re still here waiting for you!\n\nYour items are reserved for the next 24 hours.',
    enabled: true,
    openRate: 62.4,
    clickRate: 28.1,
  },
  {
    id: 'step-2',
    step: 2,
    name: 'Special Offer',
    timing: '24 hours',
    description: 'Entice with a discount to complete the purchase',
    subject: 'Here\'s 10% off your cart! 🎁',
    preview: 'Hi {{customer_name}},\n\nStill thinking about your cart? We\'d love to help you complete your purchase.\n\nUse code COMEBACK10 for 10% off your entire order!',
    enabled: true,
    openRate: 48.7,
    clickRate: 35.2,
  },
  {
    id: 'step-3',
    step: 3,
    name: 'Last Chance',
    timing: '72 hours',
    description: 'Create urgency with a final opportunity message',
    subject: 'Last chance — your cart expires soon! ⏰',
    preview: 'Hi {{customer_name}},\n\nThis is your final reminder — your cart will expire in 24 hours.\n\nDon\'t miss out! Complete your purchase before it\'s too late.',
    enabled: true,
    openRate: 34.1,
    clickRate: 22.8,
  },
]

// Timeline chart data (last 7 days)
const timelineData = [
  { day: 'Feb 26', recovered: 3, lost: 5 },
  { day: 'Feb 27', recovered: 4, lost: 4 },
  { day: 'Feb 28', recovered: 2, lost: 6 },
  { day: 'Mar 01', recovered: 5, lost: 3 },
  { day: 'Mar 02', recovered: 6, lost: 2 },
  { day: 'Mar 03', recovered: 4, lost: 4 },
  { day: 'Mar 04', recovered: 7, lost: 3 },
]

// Status config
const statusConfig: Record<string, { label: string; className: string; dotColor: string }> = {
  new: { label: 'New', className: 'bg-rose-100 text-rose-800 border-rose-200', dotColor: 'bg-rose-500' },
  email_sent: { label: 'Email Sent', className: 'bg-amber-100 text-amber-800 border-amber-200', dotColor: 'bg-amber-500' },
  offer_sent: { label: 'Offer Sent', className: 'bg-blue-100 text-blue-800 border-blue-200', dotColor: 'bg-blue-500' },
  recovered: { label: 'Recovered', className: 'bg-emerald-100 text-emerald-800 border-emerald-200', dotColor: 'bg-emerald-500' },
  lost: { label: 'Lost', className: 'bg-gray-100 text-gray-800 border-gray-200', dotColor: 'bg-gray-400' },
}

const chartConfig = {
  recovered: { label: 'Recovered', color: 'hsl(var(--chart-2))' },
  lost: { label: 'Lost', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const then = new Date(dateStr)
  const diffMs = now.getTime() - then.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  return 'Just now'
}

export function AbandonedCartRecovery() {
  const { selectedStoreId } = useAppStore()
  const [carts, setCarts] = useState<AbandonedCart[]>(mockAbandonedCarts)
  const [emailSteps, setEmailSteps] = useState<EmailStep[]>(initialEmailSteps)
  const [editStep, setEditStep] = useState<EmailStep | null>(null)
  const [editSubject, setEditSubject] = useState('')
  const [editPreview, setEditPreview] = useState('')

  // Stats
  const stats = useMemo(() => {
    const abandoned = carts.filter(c => c.status !== 'recovered')
    const recovered = carts.filter(c => c.status === 'recovered')
    const atRisk = abandoned.reduce((sum, c) => sum + c.cartValue, 0)
    const recoveredValue = recovered.reduce((sum, c) => sum + c.cartValue, 0)
    const recoveryRate = carts.length > 0 ? (recovered.length / carts.length) * 100 : 0
    return {
      abandonedCount: abandoned.length,
      recoveryRate,
      atRisk,
      recoveredValue,
    }
  }, [carts])

  // Sort carts by value (highest first)
  const sortedCarts = useMemo(() => {
    return [...carts].sort((a, b) => b.cartValue - a.cartValue)
  }, [carts])

  const handleToggleStep = (stepId: string) => {
    setEmailSteps(prev => prev.map(s =>
      s.id === stepId ? { ...s, enabled: !s.enabled } : s
    ))
    const step = emailSteps.find(s => s.id === stepId)
    toast.success(`${step?.name} ${step?.enabled ? 'disabled' : 'enabled'}`)
  }

  const handleSendRecoveryEmail = (cart: AbandonedCart) => {
    const nextStatus = cart.status === 'new' ? 'email_sent' : cart.status === 'email_sent' ? 'offer_sent' : cart.status
    setCarts(prev => prev.map(c =>
      c.id === cart.id ? { ...c, status: nextStatus as AbandonedCart['status'] } : c
    ))
    toast.success(`Recovery email sent to ${cart.customer}`, {
      description: `${cart.items.join(', ')} — $${cart.cartValue.toFixed(2)}`,
    })
  }

  const handleEditStep = (step: EmailStep) => {
    setEditStep(step)
    setEditSubject(step.subject)
    setEditPreview(step.preview)
  }

  const handleSaveStep = () => {
    if (!editStep) return
    setEmailSteps(prev => prev.map(s =>
      s.id === editStep.id ? { ...s, subject: editSubject, preview: editPreview } : s
    ))
    toast.success(`${editStep.name} template updated`)
    setEditStep(null)
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status]
    if (!config) return null
    return (
      <Badge variant="outline" className={`text-[11px] px-2 py-0.5 border ${config.className}`}>
        <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${config.dotColor}`} />
        {config.label}
      </Badge>
    )
  }

  const stepIcons = [
    <Heart key="heart" className="h-5 w-5" />,
    <Flame key="flame" className="h-5 w-5" />,
    <Timer key="timer" className="h-5 w-5" />,
  ]

  const stepColors = [
    { bg: 'bg-rose-100', text: 'text-rose-600', gradient: 'from-rose-500 to-pink-600' },
    { bg: 'bg-amber-100', text: 'text-amber-600', gradient: 'from-amber-500 to-orange-600' },
    { bg: 'bg-violet-100', text: 'text-violet-600', gradient: 'from-violet-500 to-purple-600' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Abandoned Cart Recovery</h2>
              <p className="text-sm text-muted-foreground">Recover lost revenue from abandoned carts</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-white/80">Recovery Rate</p>
                <p className="text-2xl font-bold">{stats.recoveryRate.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Abandoned Carts</p>
                  <p className="text-2xl font-bold">{stats.abandonedCount}</p>
                </div>
                <div className="bg-rose-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="h-5 w-5 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recovery Rate</p>
                  <p className="text-2xl font-bold">{stats.recoveryRate.toFixed(1)}%</p>
                </div>
                <div className="bg-emerald-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue at Risk</p>
                  <p className="text-2xl font-bold">${stats.atRisk.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-amber-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue Recovered</p>
                  <p className="text-2xl font-bold">${stats.recoveredValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-violet-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-5 w-5 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Recovery Automation Section */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Recovery Email Sequence</h3>
            <p className="text-sm text-muted-foreground">3-step automated email campaign to recover abandoned carts</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {emailSteps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 ${!step.enabled ? 'opacity-60' : ''}`}>
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${stepColors[i].gradient}`} />
                <CardContent className="p-5 pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl ${stepColors[i].bg} flex items-center justify-center ${stepColors[i].text}`}>
                        {stepIcons[i]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Step {step.step}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {step.timing}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={step.enabled}
                      onCheckedChange={() => handleToggleStep(step.id)}
                    />
                  </div>

                  <h4 className="font-bold mb-1">{step.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{step.description}</p>

                  {/* Template Preview */}
                  <div className="rounded-lg border bg-muted/30 p-3 mb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Subject</p>
                    <p className="text-sm font-medium truncate">{step.subject}</p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2 mb-1">Preview</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-line">{step.preview}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">{step.openRate}%</span>
                      <span className="text-xs text-muted-foreground">opens</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MousePointerClick className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">{step.clickRate}%</span>
                      <span className="text-xs text-muted-foreground">clicks</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleEditStep(step)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Edit Template
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Abandoned Carts Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Abandoned Carts</CardTitle>
            <CardDescription>Sorted by cart value (highest first)</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Customer</TableHead>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Items</TableHead>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Cart Value</TableHead>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Abandoned At</TableHead>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Status</TableHead>
                    <TableHead className="uppercase text-[11px] tracking-wider font-semibold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {sortedCarts.map((cart, i) => (
                      <motion.tr
                        key={cart.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25, delay: i * 0.03 }}
                        className="group"
                      >
                        <TableCell>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-[160px]">{cart.customer}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[160px]">{cart.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate max-w-[180px]">{cart.items.join(', ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            ${cart.cartValue.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(cart.abandonedAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(cart.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          {cart.status !== 'recovered' && cart.status !== 'lost' ? (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => handleSendRecoveryEmail(cart)}
                              >
                                <Send className="h-3 w-3 mr-1.5" />
                                {cart.status === 'new' ? 'Send Email' : cart.status === 'email_sent' ? 'Send Offer' : 'Send Reminder'}
                              </Button>
                            </motion.div>
                          ) : (
                            <div className="flex items-center justify-end">
                              {cart.status === 'recovered' ? (
                                <Badge variant="outline" className="text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Recovered
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[11px] bg-gray-50 text-gray-500 border-gray-200">
                                  Lost
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recovery Timeline Chart */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recovery Timeline</CardTitle>
            <CardDescription>Recovered vs lost carts over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={timelineData} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="recovered" fill="var(--color-recovered)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lost" fill="var(--color-lost)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Email Template Dialog */}
      <Dialog open={!!editStep} onOpenChange={(open) => { if (!open) setEditStep(null) }}>
        <DialogContent className="max-w-lg">
          {editStep && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-rose-500" />
                  Edit: {editStep.name}
                </DialogTitle>
                <DialogDescription>
                  Step {editStep.step} — Sent after {editStep.timing}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject Line</Label>
                  <Input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    placeholder="Email subject line"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Body</Label>
                  <Textarea
                    value={editPreview}
                    onChange={(e) => setEditPreview(e.target.value)}
                    placeholder="Email body content..."
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Use {'{{customer_name}}'} for personalization
                  </p>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/40">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs">{editStep.openRate}% open rate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MousePointerClick className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs">{editStep.clickRate}% click rate</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditStep(null)}>Cancel</Button>
                <Button onClick={handleSaveStep} className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
                  Save Template
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
