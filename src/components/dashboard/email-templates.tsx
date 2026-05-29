'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Edit,
  Eye,
  Plus,
  Copy,
  Send,
  Smartphone,
  Monitor,
  X,
  ChevronRight,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Clock,
  Variable,
  FileText,
  Check,
  ArrowRight,
  MoreVertical,
  Trash2,
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
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

type TemplateCategory =
  | 'order-confirmation'
  | 'shipping-update'
  | 'delivery-confirmation'
  | 'abandoned-cart'
  | 'welcome-email'
  | 'password-reset'
  | 'promotional'

interface EmailTemplate {
  id: string
  name: string
  category: TemplateCategory
  subject: string
  content: string
  isActive: boolean
  lastModified: string
  variables: string[]
}

// ─── Category Config ─────────────────────────────────────────────────────────

const categoryConfig: Record<TemplateCategory, {
  label: string
  gradient: string
  bg: string
  icon: React.ElementType
  badgeColor: string
}> = {
  'order-confirmation': {
    label: 'Order Confirmation',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-100',
    icon: Check,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  'shipping-update': {
    label: 'Shipping Update',
    gradient: 'from-sky-500 to-cyan-600',
    bg: 'bg-sky-100',
    icon: ArrowRight,
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  'delivery-confirmation': {
    label: 'Delivery Confirmation',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-100',
    icon: Check,
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
  },
  'abandoned-cart': {
    label: 'Abandoned Cart',
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-100',
    icon: Clock,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  'welcome-email': {
    label: 'Welcome Email',
    gradient: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-100',
    icon: Sparkles,
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  'password-reset': {
    label: 'Password Reset',
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-red-100',
    icon: Variable,
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
  },
  'promotional': {
    label: 'Promotional',
    gradient: 'from-fuchsia-500 to-purple-600',
    bg: 'bg-fuchsia-100',
    icon: Send,
    badgeColor: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  },
}

const categoryOrder: TemplateCategory[] = [
  'order-confirmation',
  'shipping-update',
  'delivery-confirmation',
  'abandoned-cart',
  'welcome-email',
  'password-reset',
  'promotional',
]

// ─── Mock Data ───────────────────────────────────────────────────────────────

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Order Confirmed',
    category: 'order-confirmation',
    subject: 'Your order {{order_number}} has been confirmed!',
    content: `Hi {{customer_name}},

Thank you for your order! We're getting it ready for you.

Order Details:
──────────────
Order #{{order_number}}
Date: {{order_date}}
Total: {{order_total}}

Items:
{{order_items}}

Shipping to:
{{shipping_address}}

We'll send you another email when your order ships. If you have any questions, feel free to reply to this email.

Best regards,
{{store_name}}`,
    isActive: true,
    lastModified: '2024-01-15T10:30:00Z',
    variables: ['customer_name', 'order_number', 'order_date', 'order_total', 'order_items', 'shipping_address', 'store_name'],
  },
  {
    id: 'tpl-2',
    name: 'Your Order is on the Way',
    category: 'shipping-update',
    subject: 'Your order {{order_number}} has shipped!',
    content: `Hi {{customer_name}},

Great news! Your order is on its way.

Tracking Information:
────────────────────
Carrier: {{shipping_carrier}}
Tracking #: {{tracking_number}}
Track your package: {{tracking_url}}

Order #{{order_number}}
Estimated delivery: {{estimated_delivery}}

We hope you love your purchase!

Cheers,
{{store_name}}`,
    isActive: true,
    lastModified: '2024-01-14T08:15:00Z',
    variables: ['customer_name', 'order_number', 'shipping_carrier', 'tracking_number', 'tracking_url', 'estimated_delivery', 'store_name'],
  },
  {
    id: 'tpl-3',
    name: 'Delivered!',
    category: 'delivery-confirmation',
    subject: 'Your order {{order_number}} has been delivered!',
    content: `Hi {{customer_name}},

Your order has been delivered! 🎉

Order #{{order_number}}
Delivered on: {{delivery_date}}

We'd love to hear what you think! Leave a review and help other shoppers make informed decisions.

{{review_link}}

If there are any issues with your order, please don't hesitate to contact us.

Thank you for shopping with {{store_name}}!`,
    isActive: true,
    lastModified: '2024-01-13T14:45:00Z',
    variables: ['customer_name', 'order_number', 'delivery_date', 'review_link', 'store_name'],
  },
  {
    id: 'tpl-4',
    name: 'You Left Something Behind',
    category: 'abandoned-cart',
    subject: '{{customer_name}}, your cart is waiting for you!',
    content: `Hi {{customer_name}},

Looks like you left some items in your cart. No worries — they're still here waiting for you!

Your Cart:
──────────
{{cart_items}}

Cart Total: {{cart_total}}

Complete your purchase now and get {{discount_offer}} off with code: {{discount_code}}

Shop now: {{cart_url}}

This offer expires in {{expiry_hours}} hours.

Happy shopping,
{{store_name}}`,
    isActive: true,
    lastModified: '2024-01-12T16:20:00Z',
    variables: ['customer_name', 'cart_items', 'cart_total', 'discount_offer', 'discount_code', 'cart_url', 'expiry_hours', 'store_name'],
  },
  {
    id: 'tpl-5',
    name: 'Welcome to {{store_name}}!',
    category: 'welcome-email',
    subject: 'Welcome to {{store_name}} — let\'s get started!',
    content: `Hi {{customer_name}},

Welcome to {{store_name}}! We're so glad you're here.

Here's what you can do:
──────────────────────
📦 Browse our latest collections
🔍 Discover personalized recommendations
💰 Get exclusive member-only deals

Use code WELCOME{{discount_code}} for {{discount_offer}} off your first order!

Start shopping: {{store_url}}

If you ever need help, just reply to this email. We're here for you.

Warmly,
The {{store_name}} Team`,
    isActive: true,
    lastModified: '2024-01-11T09:00:00Z',
    variables: ['customer_name', 'store_name', 'discount_code', 'discount_offer', 'store_url'],
  },
  {
    id: 'tpl-6',
    name: 'Reset Your Password',
    category: 'password-reset',
    subject: 'Reset your {{store_name}} password',
    content: `Hi {{customer_name}},

We received a request to reset your password for your {{store_name}} account.

Click the button below to set a new password:

{{reset_url}}

This link will expire in {{expiry_minutes}} minutes.

If you didn't request this, you can safely ignore this email. Your password will remain unchanged.

For security tips, visit our help center.

Stay safe,
{{store_name}} Security Team`,
    isActive: true,
    lastModified: '2024-01-10T11:30:00Z',
    variables: ['customer_name', 'store_name', 'reset_url', 'expiry_minutes'],
  },
  {
    id: 'tpl-7',
    name: 'Special Offer Inside!',
    category: 'promotional',
    subject: '{{customer_name}}, an exclusive offer just for you!',
    content: `Hi {{customer_name}},

We've got something special just for you! ✨

{{promo_headline}}

For a limited time, enjoy {{discount_offer}} off on {{promo_category}} with code: {{discount_code}}

Sale ends: {{promo_end_date}}

Shop the sale: {{promo_url}}

Featured picks:
{{featured_products}}

Don't miss out — these deals won't last long!

Happy shopping,
{{store_name}}`,
    isActive: false,
    lastModified: '2024-01-09T15:45:00Z',
    variables: ['customer_name', 'promo_headline', 'discount_offer', 'promo_category', 'discount_code', 'promo_end_date', 'promo_url', 'featured_products', 'store_name'],
  },
]

// ─── Sample Data for Preview ─────────────────────────────────────────────────

const sampleData: Record<string, string> = {
  customer_name: 'Sarah Johnson',
  order_number: 'SF-2024-1234',
  order_date: 'January 15, 2024',
  order_total: '$149.97',
  order_items: '1x Wireless Headphones - $89.99\n1x Phone Case - $29.99\n1x Charging Cable - $29.99',
  shipping_address: '123 Main Street, Apt 4B\nNew York, NY 10001',
  store_name: 'ShopForge Store',
  shipping_carrier: 'FedEx',
  tracking_number: '794644790132',
  tracking_url: 'https://track.fedex.com/794644790132',
  estimated_delivery: 'January 18, 2024',
  delivery_date: 'January 18, 2024',
  review_link: 'https://shopforge.store/review/SF-2024-1234',
  cart_items: '1x Smart Watch Pro - $199.99\n1x Leather Band - $39.99',
  cart_total: '$239.98',
  discount_offer: '15%',
  discount_code: 'CART15',
  cart_url: 'https://shopforge.store/cart',
  expiry_hours: '48',
  store_url: 'https://shopforge.store',
  reset_url: 'https://shopforge.store/reset-password?token=abc123',
  expiry_minutes: '30',
  promo_headline: 'Flash Sale: Up to 50% Off Electronics',
  promo_category: 'Electronics',
  promo_end_date: 'January 20, 2024',
  promo_url: 'https://shopforge.store/sale/electronics',
  featured_products: '1. Smart Watch Pro - $99.99 (was $199.99)\n2. Wireless Earbuds - $49.99 (was $89.99)\n3. Bluetooth Speaker - $34.99 (was $69.99)',
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ─── Helper: Replace variables in text ───────────────────────────────────────

function replaceVariables(text: string): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return sampleData[key] || match
  })
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EmailTemplates() {
  const { selectedStoreId } = useAppStore()
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates)
  const [activeTab, setActiveTab] = useState<string>('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [sendingTest, setSendingTest] = useState(false)

  // Editor form state
  const [formName, setFormName] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formCategory, setFormCategory] = useState<TemplateCategory>('order-confirmation')
  const [formActive, setFormActive] = useState(true)
  const [saving, setSaving] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Filter templates by category tab
  const filteredTemplates = useMemo(() => {
    if (activeTab === 'all') return templates
    return templates.filter((t) => t.category === activeTab)
  }, [templates, activeTab])

  // Stats
  const stats = useMemo(() => {
    const active = templates.filter((t) => t.isActive).length
    const totalVars = new Set(templates.flatMap((t) => t.variables)).size
    const recentlyModified = templates.filter((t) => {
      const d = new Date(t.lastModified)
      return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000
    }).length
    return { total: templates.length, active, totalVars, recentlyModified }
  }, [templates])

  // Open editor for existing template
  const openEditor = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setFormName(template.name)
    setFormSubject(template.subject)
    setFormContent(template.content)
    setFormCategory(template.category)
    setFormActive(template.isActive)
    setEditorOpen(true)
  }

  // Open editor for new template
  const openNewEditor = () => {
    setEditingTemplate(null)
    setFormName('')
    setFormSubject('')
    setFormContent('')
    setFormCategory('order-confirmation')
    setFormActive(true)
    setEditorOpen(true)
  }

  // Insert variable at cursor position
  const insertVariable = useCallback((variable: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formContent
    const insertion = `{{${variable}}}`
    const newContent = text.substring(0, start) + insertion + text.substring(end)
    setFormContent(newContent)

    // Restore cursor position after React re-renders
    requestAnimationFrame(() => {
      textarea.selectionStart = start + insertion.length
      textarea.selectionEnd = start + insertion.length
      textarea.focus()
    })
  }, [formContent])

  // Save template
  const handleSave = async () => {
    if (!formName || !formSubject || !formContent) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      const allVars = Array.from(
        new Set(
          (formSubject.match(/\{\{(\w+)\}\}/g) || [])
            .concat(formContent.match(/\{\{(\w+)\}\}/g) || [])
            .map((v: string) => v.replace(/\{\{|\}\}/g, ''))
        )
      )

      if (editingTemplate) {
        // Update existing
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === editingTemplate.id
              ? {
                  ...t,
                  name: formName,
                  subject: formSubject,
                  content: formContent,
                  category: formCategory,
                  isActive: formActive,
                  variables: allVars,
                  lastModified: new Date().toISOString(),
                }
              : t
          )
        )
        toast.success('Template updated successfully')
      } else {
        // Create new
        const newTemplate: EmailTemplate = {
          id: `tpl-${Date.now()}`,
          name: formName,
          category: formCategory,
          subject: formSubject,
          content: formContent,
          isActive: formActive,
          lastModified: new Date().toISOString(),
          variables: allVars,
        }
        setTemplates((prev) => [...prev, newTemplate])
        toast.success('Template created successfully')
      }

      setEditorOpen(false)
    } catch {
      toast.error('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  // Toggle template active status
  const toggleTemplate = (template: EmailTemplate) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === template.id ? { ...t, isActive: !t.isActive, lastModified: new Date().toISOString() } : t
      )
    )
    toast.success(template.isActive ? 'Template deactivated' : 'Template activated')
  }

  // Delete template
  const deleteTemplate = (template: EmailTemplate) => {
    setTemplates((prev) => prev.filter((t) => t.id !== template.id))
    toast.success('Template deleted')
  }

  // Duplicate template
  const duplicateTemplate = (template: EmailTemplate) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      name: `${template.name} (Copy)`,
      lastModified: new Date().toISOString(),
    }
    setTemplates((prev) => [...prev, newTemplate])
    toast.success('Template duplicated')
  }

  // Mock send test email
  const handleSendTest = async () => {
    setSendingTest(true)
    await new Promise((r) => setTimeout(r, 1500))
    setSendingTest(false)
    toast.success('Test email sent to your inbox!')
  }

  // Open preview
  const openPreview = (template: EmailTemplate) => {
    setPreviewTemplate(template)
    setPreviewOpen(true)
  }

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // All available variables across templates
  const allVariables = useMemo(() => {
    return Array.from(new Set(templates.flatMap((t) => t.variables))).sort()
  }, [templates])

  // Variables available for the current editing category
  const categoryVariables = useMemo(() => {
    const cat = formCategory
    return Array.from(
      new Set(
        templates
          .filter((t) => t.category === cat)
          .flatMap((t) => t.variables)
      )
    ).sort()
  }, [templates, formCategory])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      variants={containerVariants}
    >
      {/* ── Page Header with Dark Gradient ── */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8">
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-rose-500/5 blur-3xl" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Mail className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Email Templates</h1>
                <p className="text-sm text-slate-300 mt-1">Design and manage your customer email templates</p>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={openNewEditor}
                className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/25 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Template
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Cards ── */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Total Templates',
              value: stats.total,
              gradient: 'from-emerald-500 to-teal-600',
              bg: 'bg-emerald-100',
              icon: FileText,
              iconColor: 'text-emerald-600',
            },
            {
              label: 'Active',
              value: stats.active,
              gradient: 'from-cyan-500 to-sky-600',
              bg: 'bg-cyan-100',
              icon: ToggleRight,
              iconColor: 'text-cyan-600',
            },
            {
              label: 'Unique Variables',
              value: stats.totalVars,
              gradient: 'from-amber-500 to-orange-600',
              bg: 'bg-amber-100',
              icon: Variable,
              iconColor: 'text-amber-600',
            },
            {
              label: 'Modified This Week',
              value: stats.recentlyModified,
              gradient: 'from-rose-500 to-pink-600',
              bg: 'bg-rose-100',
              icon: Clock,
              iconColor: 'text-rose-600',
            },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
                <CardContent className="p-5 pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`${stat.bg} rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </motion.div>

      {/* ── Category Tabs ── */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="inline-flex h-auto gap-1 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger
                value="all"
                className="px-4 py-2 rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                All ({templates.length})
              </TabsTrigger>
              {categoryOrder.map((cat) => {
                const config = categoryConfig[cat]
                const count = templates.filter((t) => t.category === cat).length
                return (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className="px-4 py-2 rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${config.gradient}`} />
                      {config.label} ({count})
                    </span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </ScrollArea>
        </Tabs>
      </motion.div>

      {/* ── Template Cards Grid ── */}
      <motion.div variants={containerVariants} className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map((template, i) => {
            const config = categoryConfig[template.category]
            const CatIcon = config.icon

            return (
              <motion.div
                key={template.id}
                variants={itemVariants}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Card className={cn(
                  "relative overflow-hidden group hover:shadow-lg transition-all duration-300",
                  !template.isActive && "opacity-60"
                )}>
                  {/* Gradient accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${config.gradient}`} />

                  {/* Gradient preview thumbnail */}
                  <div className={`relative h-24 bg-gradient-to-br ${config.gradient} opacity-10`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Mail className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  </div>

                  <CardContent className="p-5 pt-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-sm`}>
                          <CatIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{template.name}</p>
                          <Badge variant="outline" className={`text-[10px] mt-0.5 px-1.5 py-0 border ${config.badgeColor}`}>
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => duplicateTemplate(template)}>
                            <Copy className="mr-2 h-4 w-4" />Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteTemplate(template)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Subject line preview */}
                    <p className="text-sm text-muted-foreground truncate mb-3">
                      <span className="font-medium text-foreground/70">Subject: </span>
                      {replaceVariables(template.subject)}
                    </p>

                    {/* Variable chips */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.variables.slice(0, 4).map((v) => (
                        <span
                          key={v}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-mono text-muted-foreground hover:bg-muted/80 cursor-pointer transition-colors"
                          onClick={() => {
                            navigator.clipboard.writeText(`{{${v}}}`)
                            toast.success(`{{${v}}} copied`)
                          }}
                        >
                          <Variable className="h-2.5 w-2.5" />
                          {v}
                        </span>
                      ))}
                      {template.variables.length > 4 && (
                        <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground">
                          +{template.variables.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            "text-[11px] px-2 py-0.5 border",
                            template.isActive
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          )}
                        >
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(template.lastModified)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleTemplate(template)}
                          title={template.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {template.isActive ? (
                            <ToggleRight className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openPreview(template)}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditor(template)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* ── Empty State ── */}
      {filteredTemplates.length === 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center mb-4">
                <Mail className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No templates in this category</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                Create a new email template for this category to get started.
              </p>
              <Button
                onClick={openNewEditor}
                className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Template Editor Sheet ── */}
      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent className="w-full sm:max-w-3xl p-0 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Editor Header */}
            <SheetHeader className="p-6 pb-4 border-b bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-800/50">
              <SheetTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                  <Edit className="h-4 w-4 text-white" />
                </div>
                {editingTemplate ? 'Edit Template' : 'New Template'}
              </SheetTitle>
            </SheetHeader>

            {/* Editor Body */}
            <div className="flex-1 overflow-hidden">
              <div className="grid h-full sm:grid-cols-[1fr_280px]">
                {/* Main Editor */}
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-5">
                    {/* Template Name */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Template Name *</Label>
                      <Input
                        placeholder="e.g. Order Confirmation"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Category</Label>
                      <div className="flex flex-wrap gap-2">
                        {categoryOrder.map((cat) => {
                          const config = categoryConfig[cat]
                          const isSelected = formCategory === cat
                          return (
                            <button
                              key={cat}
                              onClick={() => setFormCategory(cat)}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border",
                                isSelected
                                  ? `bg-gradient-to-r ${config.gradient} text-white border-transparent shadow-sm`
                                  : "bg-card border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <span className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                isSelected ? "bg-white" : `bg-gradient-to-r ${config.gradient}`
                              )} />
                              {config.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Subject Line */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Subject Line *</Label>
                        <span className="text-[10px] text-muted-foreground">
                          Use {'{{variables}}'} for dynamic content
                        </span>
                      </div>
                      <Input
                        placeholder="e.g. Your order {{order_number}} has been confirmed!"
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
                        className="font-mono text-sm"
                      />
                      {formSubject && (
                        <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-1.5">
                          Preview: <span className="text-foreground">{replaceVariables(formSubject)}</span>
                        </p>
                      )}
                    </div>

                    {/* Email Content */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Email Content *</Label>
                        <span className="text-[10px] text-muted-foreground">
                          Click variables to insert
                        </span>
                      </div>
                      <Textarea
                        ref={textareaRef}
                        placeholder="Write your email content here..."
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        className="min-h-[300px] font-mono text-sm resize-y"
                      />
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label className="text-sm font-medium">Active Status</Label>
                        <p className="text-xs text-muted-foreground">
                          {formActive ? 'Template will be sent automatically' : 'Template is paused'}
                        </p>
                      </div>
                      <Switch checked={formActive} onCheckedChange={setFormActive} />
                    </div>
                  </div>
                </ScrollArea>

                {/* Variable Sidebar */}
                <div className="hidden sm:flex flex-col border-l bg-muted/20">
                  <div className="p-4 border-b">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Variable className="h-4 w-4 text-emerald-500" />
                      Variables
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Click to insert at cursor
                    </p>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-1">
                      {categoryVariables.map((v) => (
                        <button
                          key={v}
                          onClick={() => insertVariable(v)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-left hover:bg-muted transition-colors group"
                        >
                          <span className="h-5 w-5 rounded flex items-center justify-center bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200 transition-colors">
                            <ChevronRight className="h-3 w-3" />
                          </span>
                          <span className="flex-1">{`{{${v}}}`}</span>
                          <span className="text-[10px] text-muted-foreground group-hover:hidden">
                            {sampleData[v] ? sampleData[v].substring(0, 15) + (sampleData[v].length > 15 ? '...' : '') : 'dynamic'}
                          </span>
                          <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Live Preview Mini */}
                  <div className="p-4 border-t">
                    <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      Quick Preview
                    </h4>
                    <div className="bg-white dark:bg-slate-900 rounded-lg border p-3 text-[10px] leading-relaxed max-h-40 overflow-y-auto">
                      <p className="font-semibold mb-1 text-[11px]">{replaceVariables(formSubject)}</p>
                      <p className="text-muted-foreground whitespace-pre-wrap">{replaceVariables(formContent).substring(0, 200)}...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor Footer */}
            <div className="p-4 border-t flex items-center justify-between bg-background">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendTest}
                disabled={sendingTest || !formSubject}
              >
                {sendingTest ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Send Test Email
                  </>
                )}
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setEditorOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !formName || !formSubject || !formContent}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white"
                >
                  {saving ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1.5" />
                      Save Template
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Template Preview Dialog ── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                <Eye className="h-4 w-4 text-white" />
              </div>
              Email Preview
              {previewTemplate && (
                <Badge variant="outline" className="ml-2 text-[10px]">
                  {categoryConfig[previewTemplate.category]?.label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Preview Mode Toggle */}
          <div className="px-6 py-2 flex items-center justify-between border-b bg-muted/20">
            <div className="flex items-center gap-1 p-1 bg-background rounded-lg border">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  previewMode === 'desktop'
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Monitor className="h-3.5 w-3.5" />
                Desktop
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  previewMode === 'mobile'
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Smartphone className="h-3.5 w-3.5" />
                Mobile
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendTest}
              disabled={sendingTest}
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Send Test
            </Button>
          </div>

          {/* Email Preview Frame */}
          <div className="p-6 flex justify-center bg-slate-50 dark:bg-slate-900/50">
            <div
              className={cn(
                "bg-white dark:bg-slate-900 rounded-xl border shadow-2xl overflow-hidden transition-all duration-300",
                previewMode === 'desktop' ? "w-full max-w-[600px]" : "w-[375px]"
              )}
            >
              {/* Email Header Bar */}
              <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 px-4 py-3 border-b">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">To:</span>
                  <span>sarah@example.com</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Subject:</span>
                  <span className="text-foreground">
                    {previewTemplate ? replaceVariables(previewTemplate.subject) : ''}
                  </span>
                </div>
              </div>

              {/* Email Body */}
              <div className="p-6">
                {previewTemplate && (
                  <div className="prose prose-sm max-w-none">
                    {/* Brand Header */}
                    <div className="flex items-center gap-3 pb-4 mb-4 border-b">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${categoryConfig[previewTemplate.category]?.gradient || 'from-emerald-500 to-cyan-600'} flex items-center justify-center text-white shadow-sm`}>
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{sampleData.store_name}</p>
                        <p className="text-[10px] text-muted-foreground">noreply@shopforge.store</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {replaceVariables(previewTemplate.content)}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t text-center">
                      <p className="text-[10px] text-muted-foreground">
                        Sent by {sampleData.store_name} • 123 Commerce St, San Francisco, CA 94102
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        <a href="#" className="text-primary hover:underline">Unsubscribe</a>
                        {' • '}
                        <a href="#" className="text-primary hover:underline">Manage preferences</a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dialog Footer */}
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {previewTemplate && (
                <span>Last modified: {formatDate(previewTemplate.lastModified)}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (previewTemplate) {
                    setPreviewOpen(false)
                    openEditor(previewTemplate)
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
