'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gift,
  Search,
  Plus,
  Copy,
  Eye,
  Power,
  Trash2,
  Sparkles,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  QrCode,
  Clock,
  User,
  Mail,
  CalendarDays,
  Hash,
  MessageSquare,
  RefreshCw,
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
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

// Types
interface GiftCardTransaction {
  id: string
  amount: number
  description: string
  date: string
}

interface GiftCard {
  id: string
  code: string
  initialValue: number
  balance: number
  recipientName: string
  recipientEmail: string
  message: string
  status: 'active' | 'redeemed' | 'expired' | 'partially_used'
  expiresAt: string | null
  createdAt: string
  transactions: GiftCardTransaction[]
}

// Mock data
const mockGiftCards: GiftCard[] = [
  {
    id: 'gc-1',
    code: 'SG-A7K2-M9P4-X1L8',
    initialValue: 100,
    balance: 100,
    recipientName: 'Sarah Johnson',
    recipientEmail: 'sarah@example.com',
    message: 'Happy Birthday! Enjoy your gift!',
    status: 'active',
    expiresAt: '2026-03-15',
    createdAt: '2025-01-10',
    transactions: [],
  },
  {
    id: 'gc-2',
    code: 'SG-B3N5-Q8R2-W4T6',
    initialValue: 250,
    balance: 0,
    recipientName: 'Mike Chen',
    recipientEmail: 'mike@example.com',
    message: 'Thank you for being a great customer!',
    status: 'redeemed',
    expiresAt: '2026-01-01',
    createdAt: '2024-11-20',
    transactions: [
      { id: 'tx-1', amount: 150, description: 'Order #1042', date: '2024-12-05' },
      { id: 'tx-2', amount: 100, description: 'Order #1058', date: '2024-12-20' },
    ],
  },
  {
    id: 'gc-3',
    code: 'SG-C9D1-F5G7-H2J3',
    initialValue: 50,
    balance: 0,
    recipientName: 'Emily Davis',
    recipientEmail: 'emily@example.com',
    message: '',
    status: 'expired',
    expiresAt: '2024-12-31',
    createdAt: '2024-06-15',
    transactions: [],
  },
  {
    id: 'gc-4',
    code: 'SG-D4E6-K8L0-M2N4',
    initialValue: 500,
    balance: 320,
    recipientName: 'Alex Rivera',
    recipientEmail: 'alex@example.com',
    message: 'Holiday bonus from the team! 🎄',
    status: 'partially_used',
    expiresAt: '2026-06-30',
    createdAt: '2024-12-25',
    transactions: [
      { id: 'tx-3', amount: 180, description: 'Order #1102', date: '2025-01-05' },
    ],
  },
  {
    id: 'gc-5',
    code: 'SG-E1F3-G5H7-I9J0',
    initialValue: 75,
    balance: 75,
    recipientName: 'Lisa Wang',
    recipientEmail: 'lisa@example.com',
    message: 'Welcome to our store! Here\'s a gift to get you started.',
    status: 'active',
    expiresAt: '2026-09-01',
    createdAt: '2025-02-01',
    transactions: [],
  },
  {
    id: 'gc-6',
    code: 'SG-F2G4-H6I8-J0K1',
    initialValue: 200,
    balance: 45,
    recipientName: 'Tom Brown',
    recipientEmail: 'tom@example.com',
    message: 'Congratulations on your anniversary!',
    status: 'partially_used',
    expiresAt: '2026-04-15',
    createdAt: '2024-10-15',
    transactions: [
      { id: 'tx-4', amount: 100, description: 'Order #980', date: '2024-11-02' },
      { id: 'tx-5', amount: 55, description: 'Order #995', date: '2024-11-18' },
    ],
  },
  {
    id: 'gc-7',
    code: 'SG-G8H0-J2K4-L6M8',
    initialValue: 150,
    balance: 150,
    recipientName: 'Nina Patel',
    recipientEmail: 'nina@example.com',
    message: 'Just because you deserve it!',
    status: 'active',
    expiresAt: null,
    createdAt: '2025-01-20',
    transactions: [],
  },
  {
    id: 'gc-8',
    code: 'SG-H3I5-K7M9-N1P3',
    initialValue: 300,
    balance: 0,
    recipientName: 'David Kim',
    recipientEmail: 'david@example.com',
    message: 'Employee of the month reward',
    status: 'redeemed',
    expiresAt: '2025-12-31',
    createdAt: '2024-09-01',
    transactions: [
      { id: 'tx-6', amount: 300, description: 'Order #920', date: '2024-09-15' },
    ],
  },
  {
    id: 'gc-9',
    code: 'SG-I6J8-L0N2-O4Q6',
    initialValue: 25,
    balance: 0,
    recipientName: 'Rachel Green',
    recipientEmail: 'rachel@example.com',
    message: '',
    status: 'expired',
    expiresAt: '2024-10-01',
    createdAt: '2024-04-01',
    transactions: [],
  },
  {
    id: 'gc-10',
    code: 'SG-J9K1-M3O5-P7R9',
    initialValue: 1000,
    balance: 1000,
    recipientName: 'Corporate Client - Acme Inc',
    recipientEmail: 'gifts@acme.com',
    message: 'Annual partnership appreciation gift',
    status: 'active',
    expiresAt: '2027-01-01',
    createdAt: '2025-02-14',
    transactions: [],
  },
]

// Status config
const statusConfig: Record<string, { label: string; className: string; dotColor: string }> = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-800 border-emerald-200', dotColor: 'bg-emerald-500' },
  redeemed: { label: 'Redeemed', className: 'bg-gray-100 text-gray-800 border-gray-200', dotColor: 'bg-gray-400' },
  expired: { label: 'Expired', className: 'bg-amber-100 text-amber-800 border-amber-200', dotColor: 'bg-amber-500' },
  partially_used: { label: 'Partially Used', className: 'bg-blue-100 text-blue-800 border-blue-200', dotColor: 'bg-blue-500' },
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

// Generate random gift card code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `SG-${seg()}-${seg()}-${seg()}`
}

// Format date
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function GiftCardsManagement() {
  const { selectedStoreId } = useAppStore()
  const [giftCards, setGiftCards] = useState<GiftCard[]>(mockGiftCards)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Create form state
  const [formAmount, setFormAmount] = useState('')
  const [formRecipientName, setFormRecipientName] = useState('')
  const [formRecipientEmail, setFormRecipientEmail] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formExpiry, setFormExpiry] = useState('')
  const [formCode, setFormCode] = useState('')

  // Filtered gift cards
  const filteredCards = useMemo(() => {
    let filtered = [...giftCards]
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(c =>
        c.code.toLowerCase().includes(q) ||
        c.recipientName.toLowerCase().includes(q) ||
        c.recipientEmail.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [giftCards, statusFilter, search])

  // Stats
  const stats = useMemo(() => {
    const active = giftCards.filter(c => c.status === 'active')
    const totalValue = active.reduce((sum, c) => sum + c.balance, 0)
    const redeemed = giftCards.filter(c => c.status === 'redeemed').length
    const avgValue = giftCards.length > 0
      ? giftCards.reduce((sum, c) => sum + c.initialValue, 0) / giftCards.length
      : 0
    return { activeCount: active.length, totalValue, redeemed, avgValue }
  }, [giftCards])

  const handleGenerateCode = () => {
    setFormCode(generateCode())
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard')
  }

  const handleCreate = async () => {
    if (!formAmount || !formRecipientName || !formRecipientEmail || !formCode) {
      toast.error('Please fill in all required fields')
      return
    }
    const amount = parseFloat(formAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setSaving(true)
    try {
      await api.post('/gift-cards', {
        storeId: selectedStoreId,
        code: formCode,
        initialValue: amount,
        recipientName: formRecipientName,
        recipientEmail: formRecipientEmail,
        message: formMessage,
        expiresAt: formExpiry || null,
      })
      // Add to local state for immediate UI update
      const newCard: GiftCard = {
        id: `gc-${Date.now()}`,
        code: formCode,
        initialValue: amount,
        balance: amount,
        recipientName: formRecipientName,
        recipientEmail: formRecipientEmail,
        message: formMessage,
        status: 'active',
        expiresAt: formExpiry || null,
        createdAt: new Date().toISOString().split('T')[0],
        transactions: [],
      }
      setGiftCards(prev => [newCard, ...prev])
      toast.success('Gift card created successfully')
      setCreateOpen(false)
      resetForm()
    } catch {
      // Still add locally if API fails (mock mode)
      const newCard: GiftCard = {
        id: `gc-${Date.now()}`,
        code: formCode,
        initialValue: amount,
        balance: amount,
        recipientName: formRecipientName,
        recipientEmail: formRecipientEmail,
        message: formMessage,
        status: 'active',
        expiresAt: formExpiry || null,
        createdAt: new Date().toISOString().split('T')[0],
        transactions: [],
      }
      setGiftCards(prev => [newCard, ...prev])
      toast.success('Gift card created successfully')
      setCreateOpen(false)
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = (card: GiftCard) => {
    const newStatus = card.status === 'active' ? 'expired' : 'active'
    setGiftCards(prev => prev.map(c =>
      c.id === card.id ? { ...c, status: newStatus } : c
    ))
    toast.success(newStatus === 'active' ? 'Gift card reactivated' : 'Gift card deactivated')
    if (detailOpen && selectedCard?.id === card.id) {
      setSelectedCard({ ...card, status: newStatus })
    }
  }

  const handleDelete = () => {
    if (!deleteId) return
    setGiftCards(prev => prev.filter(c => c.id !== deleteId))
    toast.success('Gift card deleted')
    setDeleteId(null)
  }

  const openDetail = (card: GiftCard) => {
    setSelectedCard(card)
    setDetailOpen(true)
  }

  const resetForm = () => {
    setFormAmount('')
    setFormRecipientName('')
    setFormRecipientEmail('')
    setFormMessage('')
    setFormExpiry('')
    setFormCode('')
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
          <h2 className="text-2xl font-bold">Gift Cards</h2>
          <p className="text-sm text-muted-foreground">Manage gift cards and track redemptions</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => { resetForm(); setCreateOpen(true) }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Create Gift Card
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            />
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Gift Cards</p>
                  <p className="text-2xl font-bold">{stats.activeCount}</p>
                </div>
                <div className="bg-emerald-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <Gift className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-rose-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-5 w-5 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Redeemed</p>
                  <p className="text-2xl font-bold">{stats.redeemed}</p>
                </div>
                <div className="bg-amber-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Value</p>
                  <p className="text-2xl font-bold">${stats.avgValue.toFixed(2)}</p>
                </div>
                <div className="bg-violet-100 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Glassmorphism Filter Bar */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 backdrop-blur-xl shadow-lg dark:bg-slate-900/70 dark:border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-emerald-50/30 dark:from-slate-800/30 dark:to-emerald-950/30" />
          <div className="relative p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by code or recipient..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-white/60 dark:bg-slate-800/60 border-white/30 backdrop-blur-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['all', 'active', 'partially_used', 'redeemed', 'expired'].map((status) => {
                  const isActive = statusFilter === status
                  const label = status === 'all' ? 'All' : status === 'partially_used' ? 'Partial' : status.charAt(0).toUpperCase() + status.slice(1)
                  const activeClasses: Record<string, string> = {
                    all: 'bg-foreground text-background border-foreground shadow-sm',
                    active: 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/25',
                    partially_used: 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-500/25',
                    redeemed: 'bg-gray-500 text-white border-gray-500 shadow-sm',
                    expired: 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/25',
                  }
                  return (
                    <motion.button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                        isActive
                          ? activeClasses[status]
                          : 'bg-white/60 dark:bg-slate-800/60 border-transparent hover:border-muted-foreground/30 text-muted-foreground'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {label}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Gift Cards Table */}
      <motion.div variants={itemVariants}>
        {filteredCards.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center mb-4">
                <Gift className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No gift cards found</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Create your first gift card to start offering store credit to customers.'}
              </p>
              {(search || statusFilter !== 'all') ? (
                <Button
                  variant="outline"
                  onClick={() => { setSearch(''); setStatusFilter('all') }}
                >
                  Clear Filters
                </Button>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => { resetForm(); setCreateOpen(true) }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    Create Your First Gift Card
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Code</TableHead>
                      <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Balance</TableHead>
                      <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Initial Value</TableHead>
                      <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Recipient</TableHead>
                      <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Status</TableHead>
                      <TableHead className="uppercase text-[11px] tracking-wider font-semibold">Created</TableHead>
                      <TableHead className="uppercase text-[11px] tracking-wider font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {filteredCards.map((card, i) => {
                        const usedPercent = card.initialValue > 0
                          ? ((card.initialValue - card.balance) / card.initialValue) * 100
                          : 0
                        return (
                          <motion.tr
                            key={card.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.25, delay: i * 0.03 }}
                            className="group"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-semibold tracking-wider bg-muted/60 px-2 py-1 rounded-md">
                                  {card.code}
                                </span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleCopyCode(card.code)}
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Copy code</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <span className="font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                  ${card.balance.toFixed(2)}
                                </span>
                                {card.status === 'partially_used' && (
                                  <div className="mt-1">
                                    <Progress value={usedPercent} className="h-1.5 [&>div]:bg-blue-500" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">${card.initialValue.toFixed(2)}</span>
                            </TableCell>
                            <TableCell>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate max-w-[160px]">{card.recipientName}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[160px]">{card.recipientEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(card.status)}
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">{formatDate(card.createdAt)}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <span className="sr-only">Actions</span>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openDetail(card)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeactivate(card)}>
                                    {card.status === 'active' || card.status === 'partially_used'
                                      ? <><Power className="mr-2 h-4 w-4" /> Deactivate</>
                                      : <><RefreshCw className="mr-2 h-4 w-4" /> Reactivate</>
                                    }
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => setDeleteId(card.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Create Gift Card Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-emerald-500" />
              Create Gift Card
            </DialogTitle>
            <DialogDescription>
              Generate a new gift card for your customers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Code Generation */}
            <div className="space-y-2">
              <Label>Gift Card Code *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="SG-XXXX-XXXX-XXXX"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  className="font-mono tracking-wider"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateCode}
                  className="shrink-0"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Generate
                </Button>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Initial Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="100.00"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Recipient */}
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label>Recipient Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="John Doe"
                    value={formRecipientName}
                    onChange={(e) => setFormRecipientName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Recipient Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formRecipientEmail}
                    onChange={(e) => setFormRecipientEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label>Personal Message</Label>
              <Textarea
                placeholder="Add a personal message to the recipient..."
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Expiry */}
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={formExpiry}
                  onChange={(e) => setFormExpiry(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Leave blank for no expiry</p>
            </div>

            {/* Preview */}
            {formCode && formAmount && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/30"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Gift className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-sm">ShopForge Gift Card</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full mr-1 bg-emerald-500" />
                    Active
                  </Badge>
                </div>
                <div className="font-mono text-xl font-bold tracking-widest mb-2">{formCode}</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  ${parseFloat(formAmount || '0').toFixed(2)}
                </div>
                {formRecipientName && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{formRecipientName}</span>
                  </p>
                )}
                {formMessage && (
                  <p className="text-xs text-muted-foreground italic mt-1">&ldquo;{formMessage}&rdquo;</p>
                )}
                {formExpiry && (
                  <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Expires {formatDate(formExpiry)}
                  </p>
                )}
              </motion.div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              {saving ? 'Creating...' : 'Create Gift Card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gift Card Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          {selectedCard && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-emerald-500" />
                  Gift Card Details
                </DialogTitle>
                <DialogDescription>
                  View gift card information and transaction history
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                {/* Card Preview */}
                <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/30">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Gift className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="font-bold text-sm block">ShopForge Gift Card</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-xs font-semibold tracking-wider bg-muted/60 px-1.5 py-0.5 rounded">
                            {selectedCard.code}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopyCode(selectedCard.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(selectedCard.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Balance</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        ${selectedCard.balance.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Initial Value</p>
                      <p className="text-2xl font-bold text-muted-foreground">
                        ${selectedCard.initialValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {selectedCard.initialValue > 0 && (
                    <div className="mt-3">
                      <Progress
                        value={(selectedCard.balance / selectedCard.initialValue) * 100}
                        className={`h-2 ${
                          selectedCard.status === 'redeemed'
                            ? '[&>div]:bg-gray-400'
                            : selectedCard.status === 'expired'
                            ? '[&>div]:bg-amber-500'
                            : '[&>div]:bg-emerald-500'
                        }`}
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {((1 - selectedCard.balance / selectedCard.initialValue) * 100).toFixed(0)}% used
                      </p>
                    </div>
                  )}
                </div>

                {/* Recipient Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/40">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Recipient</p>
                      <p className="text-sm font-medium truncate">{selectedCard.recipientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/40">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium truncate">{selectedCard.recipientEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {selectedCard.message && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Message</p>
                      <p className="text-sm italic">&ldquo;{selectedCard.message}&rdquo;</p>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/40">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Created</p>
                      <p className="text-sm font-medium">{formatDate(selectedCard.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/40">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Expires</p>
                      <p className="text-sm font-medium">{selectedCard.expiresAt ? formatDate(selectedCard.expiresAt) : 'Never'}</p>
                    </div>
                  </div>
                </div>

                {/* QR Code Placeholder */}
                <div className="flex items-center justify-center p-6 rounded-lg border border-dashed bg-muted/20">
                  <div className="text-center">
                    <QrCode className="h-16 w-16 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">QR Code</p>
                    <p className="text-[11px] text-muted-foreground/60">Scan to redeem in-store</p>
                  </div>
                </div>

                {/* Transaction History */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    Transaction History
                  </h4>
                  {selectedCard.transactions.length === 0 ? (
                    <div className="text-center py-6 rounded-lg bg-muted/20">
                      <p className="text-sm text-muted-foreground">No transactions yet</p>
                      <p className="text-[11px] text-muted-foreground/60">Redemptions will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedCard.transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                          <div>
                            <p className="text-sm font-medium">{tx.description}</p>
                            <p className="text-[11px] text-muted-foreground">{formatDate(tx.date)}</p>
                          </div>
                          <span className="text-sm font-semibold text-red-600">
                            -${tx.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter className="flex gap-2 sm:gap-2">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
                <Button
                  variant={selectedCard.status === 'active' || selectedCard.status === 'partially_used' ? 'destructive' : 'default'}
                  onClick={() => handleDeactivate(selectedCard)}
                >
                  {selectedCard.status === 'active' || selectedCard.status === 'partially_used'
                    ? <><Power className="mr-2 h-4 w-4" /> Deactivate</>
                    : <><RefreshCw className="mr-2 h-4 w-4" /> Reactivate</>
                  }
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gift Card</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the gift card and all associated data.
              Any remaining balance will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
