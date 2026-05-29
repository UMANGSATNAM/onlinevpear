'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save,
  Store,
  Globe,
  Languages,
  Search,
  Bell,
  Loader2,
  Palette,
  FileText,
  Scale,
  Sparkles,
  Wand2,
  Upload,
  Monitor,
  Mail,
  MessageSquare,
  ShoppingCart,
  Package,
  AlertTriangle,
  Users,
  Star,
  Megaphone,
  Tag,
  Clock,
  RefreshCw,
  CreditCard,
  Shield,
  Database,
  Download,
  KeyRound,
  Trash2,
  Smartphone,
  Zap,
  DollarSign,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  ArrowDownToLine,
  ArrowUpFromLine,
  Settings2,
  Share2,
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
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

interface StoreData {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  domain: string | null
  subdomain: string | null
  currency: string
  language: string
  timezone: string
  seo: string
  settings: string
  status: string
}

const colorPalette = [
  { name: 'Rose', value: '#e11d48', gradient: 'from-rose-500 to-pink-600' },
  { name: 'Emerald', value: '#10b981', gradient: 'from-emerald-500 to-teal-600' },
  { name: 'Amber', value: '#f59e0b', gradient: 'from-amber-500 to-orange-500' },
  { name: 'Violet', value: '#8b5cf6', gradient: 'from-violet-500 to-purple-600' },
  { name: 'Cyan', value: '#06b6d4', gradient: 'from-cyan-500 to-blue-500' },
  { name: 'Fuchsia', value: '#d946ef', gradient: 'from-fuchsia-500 to-pink-500' },
  { name: 'Slate', value: '#64748b', gradient: 'from-slate-500 to-gray-600' },
  { name: 'Lime', value: '#84cc16', gradient: 'from-lime-500 to-green-500' },
]

const fontOptions = [
  { value: 'system', label: 'System Default' },
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'playfair', label: 'Playfair Display' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'lato', label: 'Lato' },
  { value: 'opensans', label: 'Open Sans' },
]

const paymentProviders = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept credit cards, Apple Pay, Google Pay',
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    fee: '2.9% + $0.30',
    configured: true,
    enabled: true,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Accept PayPal, Venmo, and debit cards',
    gradient: 'from-sky-500 to-blue-600',
    iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600',
    fee: '2.9% + $0.49',
    configured: false,
    enabled: false,
  },
  {
    id: 'square',
    name: 'Square',
    description: 'In-person and online payments',
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    fee: '2.6% + $0.10',
    configured: false,
    enabled: false,
  },
]

function SeoCircularScore({ title, description }: { title: string; description: string }) {
  const titleScore = title.length === 0 ? 0 : title.length < 30 ? 40 : title.length <= 60 ? 90 : 30
  const descScore = description.length === 0 ? 0 : description.length < 120 ? 40 : description.length <= 160 ? 90 : 30
  const overall = Math.round((titleScore + descScore) / 2)
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (overall / 100) * circumference
  const color = overall >= 70 ? '#10b981' : overall >= 40 ? '#f59e0b' : '#ef4444'
  const label = overall >= 70 ? 'Good' : overall >= 40 ? 'Fair' : 'Poor'

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <svg width="76" height="76" viewBox="0 0 76 76">
          <circle cx="38" cy="38" r={radius} fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/30" />
          <motion.circle
            cx="38" cy="38" r={radius} fill="none" stroke={color} strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            transform="rotate(-90 38 38)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>{overall}</span>
        </div>
      </div>
      <div>
        <p className="font-semibold text-sm">{label} SEO Score</p>
        <p className="text-xs text-muted-foreground">Title: {titleScore}/100 &middot; Desc: {descScore}/100</p>
      </div>
    </div>
  )
}

const tabContentVariants = {
  hidden: { opacity: 0, x: 10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.15 } },
}

export function StoreSettings() {
  const { selectedStoreId, selectedMerchantId } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [savingTab, setSavingTab] = useState<string | null>(null)
  const [aiSeoLoading, setAiSeoLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('general')

  // General
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [logo, setLogo] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  // Domain
  const [domain, setDomain] = useState('')
  const [subdomain, setSubdomain] = useState('')

  // Currency & Language
  const [currency, setCurrency] = useState('USD')
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('UTC')

  // Appearance
  const [primaryColor, setPrimaryColor] = useState('#e11d48')
  const [fontFamily, setFontFamily] = useState('system')
  const [logoPosition, setLogoPosition] = useState('left')
  const [homepageLayout, setHomepageLayout] = useState('default')

  // SEO
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [metaKeywords, setMetaKeywords] = useState('')
  const [robotsTxt, setRobotsTxt] = useState('User-agent: *\nAllow: /')
  const [sitemapEnabled, setSitemapEnabled] = useState(true)
  const [ogTitle, setOgTitle] = useState('')
  const [ogDescription, setOgDescription] = useState('')

  // Notifications - Order
  const [notifyNewOrder, setNotifyNewOrder] = useState(true)
  const [notifyOrderShipped, setNotifyOrderShipped] = useState(true)
  const [notifyOrderDelivered, setNotifyOrderDelivered] = useState(true)
  const [notifyLowStock, setNotifyLowStock] = useState(true)

  // Notifications - Customer
  const [notifyNewSignup, setNotifyNewSignup] = useState(true)
  const [notifyReviewPosted, setNotifyReviewPosted] = useState(false)

  // Notifications - Marketing
  const [notifyCampaignCompleted, setNotifyCampaignCompleted] = useState(false)
  const [notifyDiscountExpiring, setNotifyDiscountExpiring] = useState(true)

  // Notification channels
  const [channelEmail, setChannelEmail] = useState(true)
  const [channelSms, setChannelSms] = useState(false)
  const [channelPush, setChannelPush] = useState(true)

  // Payment providers
  const [paymentEnabled, setPaymentEnabled] = useState<Record<string, boolean>>({
    stripe: true,
    paypal: false,
    square: false,
  })

  // Advanced
  const [apiKey, setApiKey] = useState('sk_live_••••••••••••••••••3f8a')
  const [showApiKey, setShowApiKey] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [analyticsTracking, setAnalyticsTracking] = useState(true)
  const [cookieConsent, setCookieConsent] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)

  // Legal
  const [privacyPolicy, setPrivacyPolicy] = useState('')
  const [termsOfService, setTermsOfService] = useState('')
  const [refundPolicy, setRefundPolicy] = useState('')
  const [cookiePolicy, setCookiePolicy] = useState('')

  useEffect(() => {
    if (!selectedStoreId) {
      setLoading(false)
      return
    }
    setLoading(true)
    api.get<{ store: StoreData }>(`/stores/${selectedStoreId}`)
      .then((data) => {
        const store = data.store
        if (store) {
          setName(store.name || '')
          setDescription(store.description || '')
          setLogo(store.logo || '')
          setDomain(store.domain || '')
          setSubdomain(store.subdomain || '')
          setCurrency(store.currency || 'USD')
          setLanguage(store.language || 'en')
          setTimezone(store.timezone || 'UTC')

          try {
            const seo = JSON.parse(store.seo || '{}')
            setMetaTitle(seo.title || '')
            setMetaDescription(seo.description || '')
            setMetaKeywords(seo.keywords || '')
            setOgTitle(seo.ogTitle || '')
            setOgDescription(seo.ogDescription || '')
            setRobotsTxt(seo.robotsTxt || 'User-agent: *\nAllow: /')
            setSitemapEnabled(seo.sitemapEnabled !== false)
          } catch {}

          try {
            const settings = JSON.parse(store.settings || '{}')
            setNotifyNewOrder(settings.notifyNewOrder !== false)
            setNotifyOrderShipped(settings.notifyOrderShipped !== false)
            setNotifyOrderDelivered(settings.notifyOrderDelivered !== false)
            setNotifyLowStock(settings.notifyLowStock !== false)
            setNotifyNewSignup(settings.notifyNewSignup !== false)
            setNotifyReviewPosted(settings.notifyReviewPosted === true)
            setNotifyCampaignCompleted(settings.notifyCampaignCompleted === true)
            setNotifyDiscountExpiring(settings.notifyDiscountExpiring !== false)
            setChannelEmail(settings.channelEmail !== false)
            setChannelSms(settings.channelSms === true)
            setPrimaryColor(settings.primaryColor || '#e11d48')
            setFontFamily(settings.fontFamily || 'system')
            setLogoPosition(settings.logoPosition || 'left')
            setHomepageLayout(settings.homepageLayout || 'default')
            setContactEmail(settings.contactEmail || '')
            setContactPhone(settings.contactPhone || '')
            setPrivacyPolicy(settings.privacyPolicy || '')
            setTermsOfService(settings.termsOfService || '')
            setRefundPolicy(settings.refundPolicy || '')
            setCookiePolicy(settings.cookiePolicy || '')
          } catch {}
        }
      })
      .catch(() => {
        toast.error('Failed to load store settings')
      })
      .finally(() => setLoading(false))
  }, [selectedStoreId])

  const handleSaveTab = async (tab: string) => {
    if (!selectedStoreId) return
    setSavingTab(tab)
    try {
      await api.put(`/stores/${selectedStoreId}`, {
        name,
        description: description || null,
        logo: logo || null,
        domain: domain || null,
        subdomain: subdomain || null,
        currency,
        language,
        timezone,
        seo: JSON.stringify({
          title: metaTitle,
          description: metaDescription,
          keywords: metaKeywords,
          ogTitle,
          ogDescription,
          robotsTxt,
          sitemapEnabled,
        }),
        settings: JSON.stringify({
          notifyNewOrder,
          notifyOrderShipped,
          notifyOrderDelivered,
          notifyLowStock,
          notifyNewSignup,
          notifyReviewPosted,
          notifyCampaignCompleted,
          notifyDiscountExpiring,
          channelEmail,
          channelSms,
          primaryColor,
          fontFamily,
          logoPosition,
          homepageLayout,
          contactEmail,
          contactPhone,
          privacyPolicy,
          termsOfService,
          refundPolicy,
          cookiePolicy,
        }),
      })
      toast.success(`${tab} settings saved successfully`)
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSavingTab(null)
    }
  }

  const handleAiSeoOptimize = async (type: string) => {
    if (!name) {
      toast.error('Please enter a store name first')
      return
    }
    setAiSeoLoading(type)
    try {
      const res = await api.post<{ metaTitle: string; metaDescription: string }>('/ai/seo-optimize', {
        storeName: name,
        storeDescription: description,
        type,
      })
      if (type === 'title' || type === 'both') {
        setMetaTitle(res.metaTitle)
      }
      if (type === 'description' || type === 'both') {
        setMetaDescription(res.metaDescription)
      }
      toast.success('AI optimized SEO content')
    } catch {
      toast.error('AI SEO optimization failed')
    } finally {
      setAiSeoLoading(null)
    }
  }

  const handleRegenerateApiKey = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let key = 'sk_live_'
    for (let i = 0; i < 24; i++) key += chars[Math.floor(Math.random() * chars.length)]
    setApiKey(key)
    toast.success('API key regenerated! Make sure to update your integrations.')
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    toast.success('API key copied to clipboard')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-md" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Gradient Header Card */}
      <Card className="relative overflow-hidden border-0">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
        <CardContent className="relative p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Store className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{name || 'Store Settings'}</h2>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Published
                </Badge>
              </div>
              <p className="text-white/80 text-sm mt-0.5">Configure your store preferences and integrations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Store className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Palette className="h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <CreditCard className="h-4 w-4" /> Payments
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Search className="h-4 w-4" /> SEO
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Settings2 className="h-4 w-4" /> Advanced
          </TabsTrigger>
          <TabsTrigger value="legal" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Scale className="h-4 w-4" /> Legal
          </TabsTrigger>
        </TabsList>

        {/* ====== GENERAL TAB ====== */}
        <TabsContent value="general" forceMount={activeTab !== 'general' ? undefined : undefined}>
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div key="general" variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
                {/* Store Information */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rose-500 to-pink-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-rose-500" />
                      <CardTitle>Store Information</CardTitle>
                    </div>
                    <CardDescription>Basic store details and branding</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pl-7">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Store Name</Label>
                        <div className="relative">
                          <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Store" className="pl-9" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="support@mystore.com" className="pl-9" />
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="contactPhone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="pl-9" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Timezone</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Select value={timezone} onValueChange={setTimezone}>
                            <SelectTrigger className="pl-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                              <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                              <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                              <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                              <SelectItem value="Europe/London">London (GMT)</SelectItem>
                              <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                              <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                              <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Store Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your store..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Store Logo */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-purple-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-violet-500" />
                      <CardTitle>Store Logo</CardTitle>
                    </div>
                    <CardDescription>Upload your brand logo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pl-7">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        {logo ? (
                          <div className="h-24 w-24 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted flex items-center justify-center overflow-hidden">
                            <img src={logo} alt="Store logo" className="h-full w-full object-contain" />
                          </div>
                        ) : (
                          <div className="h-24 w-24 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-rose-50 to-violet-50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 transition-colors">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">Upload</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="logo">Logo URL</Label>
                        <Input id="logo" value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://example.com/logo.png" />
                        <p className="text-xs text-muted-foreground">Recommended: 200×200px, PNG or SVG format</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Regional Settings */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-cyan-500" />
                      <CardTitle>Regional Settings</CardTitle>
                    </div>
                    <CardDescription>Currency and language preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pl-7">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (&euro;)</SelectItem>
                            <SelectItem value="GBP">GBP (&pound;)</SelectItem>
                            <SelectItem value="CAD">CAD (C$)</SelectItem>
                            <SelectItem value="AUD">AUD (A$)</SelectItem>
                            <SelectItem value="JPY">JPY (&yen;)</SelectItem>
                            <SelectItem value="CNY">CNY (&yen;)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="zh">Chinese</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Domain Settings */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-emerald-500" />
                      <CardTitle>Domain Settings</CardTitle>
                    </div>
                    <CardDescription>Configure your store domain</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pl-7">
                    <div className="space-y-2">
                      <Label htmlFor="domain">Custom Domain</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="domain"
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          placeholder="www.mystore.com"
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Point your domain&apos;s CNAME record to shopforge.com to connect it
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subdomain">Subdomain</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="subdomain"
                          value={subdomain}
                          onChange={(e) => setSubdomain(e.target.value)}
                          placeholder="mystore"
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">.shopforge.com</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleSaveTab('General')}
                      disabled={savingTab === 'General'}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-shadow min-w-[180px]"
                    >
                      {savingTab === 'General' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save General Settings
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ====== APPEARANCE TAB ====== */}
        <TabsContent value="appearance" forceMount={activeTab !== 'appearance' ? undefined : undefined}>
          <AnimatePresence mode="wait">
            {activeTab === 'appearance' && (
              <motion.div key="appearance" variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-5">
                  <div className="lg:col-span-3 space-y-6">
                    <Card className="relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-fuchsia-500 to-pink-500" />
                      <CardHeader className="pl-7">
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-fuchsia-500" />
                          <CardTitle>Primary Color</CardTitle>
                        </div>
                        <CardDescription>Choose your store&apos;s brand color</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 pl-7">
                        <div className="grid grid-cols-4 gap-3">
                          {colorPalette.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => setPrimaryColor(color.value)}
                              className={`relative h-12 rounded-xl bg-gradient-to-r ${color.gradient} transition-all hover:scale-105 ${
                                primaryColor === color.value ? 'ring-2 ring-offset-2 ring-primary scale-105' : ''
                              }`}
                            >
                              {primaryColor === color.value && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute inset-0 flex items-center justify-center"
                                >
                                  <CheckCircle2 className="h-5 w-5 text-white drop-shadow-sm" />
                                </motion.div>
                              )}
                              <span className="sr-only">{color.name}</span>
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="customColor" className="text-sm whitespace-nowrap">Custom:</Label>
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="color"
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="h-9 w-9 rounded-md border cursor-pointer"
                            />
                            <Input
                              id="customColor"
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-orange-500" />
                      <CardHeader className="pl-7">
                        <div className="flex items-center gap-2">
                          <Languages className="h-4 w-4 text-amber-500" />
                          <CardTitle>Typography & Layout</CardTitle>
                        </div>
                        <CardDescription>Customize fonts and layout options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 pl-7">
                        <div className="space-y-2">
                          <Label>Font Family</Label>
                          <Select value={fontFamily} onValueChange={setFontFamily}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fontOptions.map((font) => (
                                <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Logo Position</Label>
                          <Select value={logoPosition} onValueChange={setLogoPosition}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Homepage Layout</Label>
                          <Select value={homepageLayout} onValueChange={setHomepageLayout}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Default</SelectItem>
                              <SelectItem value="fullwidth">Full-width</SelectItem>
                              <SelectItem value="compact">Compact</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Live Preview */}
                  <div className="lg:col-span-2">
                    <Card className="sticky top-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-500" />
                      <CardHeader className="pl-7">
                        <CardTitle className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          Live Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-xl overflow-hidden shadow-lg">
                          <div
                            className="p-3 flex items-center gap-2"
                            style={{ backgroundColor: primaryColor + '15' }}
                          >
                            <div
                              className={`h-6 w-6 rounded-md flex items-center justify-center ${logoPosition === 'center' ? 'mx-auto' : logoPosition === 'right' ? 'ml-auto' : ''}`}
                              style={{ backgroundColor: primaryColor }}
                            >
                              <span className="text-white text-[8px] font-bold">S</span>
                            </div>
                            <span className={`text-xs font-semibold ${logoPosition === 'center' ? 'text-center flex-1' : logoPosition === 'right' ? 'order-first mr-auto' : ''}`} style={{ color: primaryColor }}>
                              {name || 'My Store'}
                            </span>
                          </div>
                          <div
                            className="p-4 text-center"
                            style={{ background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}05)` }}
                          >
                            <h3 className="text-sm font-bold mb-1" style={{ fontFamily: fontFamily === 'system' ? 'inherit' : fontFamily }}>
                              {name || 'My Store'}
                            </h3>
                            <p className="text-[10px] text-muted-foreground mb-2">
                              {description ? description.slice(0, 60) + '...' : 'Your store description here'}
                            </p>
                            <div
                              className="inline-block px-3 py-1 rounded-full text-white text-[9px] font-medium"
                              style={{ backgroundColor: primaryColor }}
                            >
                              Shop Now
                            </div>
                          </div>
                          <div className="p-3 bg-muted/30">
                            <div className={`grid gap-2 ${homepageLayout === 'compact' ? 'grid-cols-3' : homepageLayout === 'fullwidth' ? 'grid-cols-2' : 'grid-cols-2'}`}>
                              {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="rounded-lg bg-background p-2">
                                  <div
                                    className="h-12 rounded-md mb-1"
                                    style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)` }}
                                  />
                                  <div className="h-1.5 w-3/4 rounded bg-muted mb-1" />
                                  <div className="h-1.5 w-1/2 rounded" style={{ backgroundColor: primaryColor + '40' }} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-end">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleSaveTab('Appearance')}
                      disabled={savingTab === 'Appearance'}
                      className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-shadow min-w-[200px]"
                    >
                      {savingTab === 'Appearance' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Appearance Settings
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ====== PAYMENTS TAB ====== */}
        <TabsContent value="payments" forceMount={activeTab !== 'payments' ? undefined : undefined}>
          <AnimatePresence mode="wait">
            {activeTab === 'payments' && (
              <motion.div key="payments" variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
                {/* Payment Providers */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-purple-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-violet-500" />
                      <CardTitle>Payment Providers</CardTitle>
                    </div>
                    <CardDescription>Connect and manage payment methods for your store</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pl-7">
                    <div className="grid gap-4">
                      {paymentProviders.map((provider) => (
                        <motion.div
                          key={provider.id}
                          whileHover={{ scale: 1.005 }}
                          className={`relative p-5 rounded-xl border transition-all ${
                            paymentEnabled[provider.id]
                              ? 'border-violet-200 bg-gradient-to-r from-violet-50/50 to-transparent shadow-sm'
                              : 'border-border bg-background hover:border-muted-foreground/20'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`h-12 w-12 rounded-xl ${provider.iconBg} flex items-center justify-center shadow-lg shrink-0`}>
                                <CreditCard className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{provider.name}</h4>
                                  {provider.configured && (
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px]">
                                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Connected
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">{provider.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-[10px] gap-1">
                                    <DollarSign className="h-2.5 w-2.5" />
                                    {provider.fee} per transaction
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                variant={provider.configured ? 'outline' : 'default'}
                                size="sm"
                                className={provider.configured ? 'hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200' : `bg-gradient-to-r ${provider.gradient} text-white hover:opacity-90`}
                              >
                                {provider.configured ? 'Configure' : 'Connect'}
                              </Button>
                              <Switch
                                checked={paymentEnabled[provider.id]}
                                onCheckedChange={(checked) => setPaymentEnabled(prev => ({ ...prev, [provider.id]: checked }))}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction Fees Summary */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-orange-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-amber-500" />
                      <CardTitle>Transaction Fees</CardTitle>
                    </div>
                    <CardDescription>Estimated processing fees per sale</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-7">
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        { amount: 50, label: '$50 order', stripe: '$1.75', paypal: '$1.94', square: '$1.40' },
                        { amount: 100, label: '$100 order', stripe: '$3.20', paypal: '$3.39', square: '$2.70' },
                        { amount: 500, label: '$500 order', stripe: '$14.80', paypal: '$14.99', square: '$13.10' },
                      ].map((row) => (
                        <div key={row.amount} className="p-4 rounded-xl border bg-gradient-to-br from-amber-50/30 to-orange-50/30">
                          <p className="font-semibold text-sm mb-2">{row.label}</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Stripe</span>
                              <span className="font-medium">{row.stripe}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">PayPal</span>
                              <span className="font-medium">{row.paypal}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Square</span>
                              <span className="font-medium text-emerald-600">{row.square}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleSaveTab('Payments')}
                      disabled={savingTab === 'Payments'}
                      className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow min-w-[180px]"
                    >
                      {savingTab === 'Payments' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Payment Settings
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ====== NOTIFICATIONS TAB ====== */}
        <TabsContent value="notifications" forceMount={activeTab !== 'notifications' ? undefined : undefined}>
          <AnimatePresence mode="wait">
            {activeTab === 'notifications' && (
              <motion.div key="notifications" variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
                {/* Notification Channels */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-indigo-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-violet-500" />
                      <CardTitle>Notification Channels</CardTitle>
                    </div>
                    <CardDescription>Choose how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pl-7">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-violet-50/50 to-transparent">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Email</p>
                            <p className="text-xs text-muted-foreground">Via email</p>
                          </div>
                        </div>
                        <Switch checked={channelEmail} onCheckedChange={setChannelEmail} />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-emerald-50/50 to-transparent">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">SMS</p>
                            <p className="text-xs text-muted-foreground">Via text</p>
                          </div>
                        </div>
                        <Switch checked={channelSms} onCheckedChange={setChannelSms} />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-rose-50/50 to-transparent">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Push</p>
                            <p className="text-xs text-muted-foreground">Browser push</p>
                          </div>
                        </div>
                        <Switch checked={channelPush} onCheckedChange={setChannelPush} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Notifications */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-emerald-500" />
                          <CardTitle>Order Notifications</CardTitle>
                        </div>
                        <CardDescription>Stay updated on order activity</CardDescription>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700">4 alerts</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pl-7">
                    <div className="rounded-xl border overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left text-xs font-semibold uppercase tracking-wider p-3">Notification</th>
                            <th className="text-center text-xs font-semibold uppercase tracking-wider p-3 w-20">Email</th>
                            <th className="text-center text-xs font-semibold uppercase tracking-wider p-3 w-20">Push</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { label: 'New Order', desc: 'When a customer places an order', icon: ShoppingCart, state: notifyNewOrder, setter: setNotifyNewOrder },
                            { label: 'Order Shipped', desc: 'When an order is shipped', icon: Package, state: notifyOrderShipped, setter: setNotifyOrderShipped },
                            { label: 'Order Delivered', desc: 'When an order is delivered', icon: Package, state: notifyOrderDelivered, setter: setNotifyOrderDelivered },
                            { label: 'Low Stock', desc: 'When inventory is running low', icon: AlertTriangle, state: notifyLowStock, setter: setNotifyLowStock },
                          ].map((item, i) => (
                            <tr key={i} className={i < 3 ? 'border-b' : ''}>
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <item.icon className="h-4 w-4 text-emerald-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{item.label}</p>
                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <Switch checked={channelEmail && item.state} onCheckedChange={item.setter} className="data-[state=checked]:bg-emerald-500" />
                              </td>
                              <td className="p-3 text-center">
                                <Switch checked={channelPush && item.state} onCheckedChange={item.setter} className="data-[state=checked]:bg-emerald-500" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Notifications */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-orange-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-amber-500" />
                          <CardTitle>Customer Notifications</CardTitle>
                        </div>
                        <CardDescription>Track customer engagement</CardDescription>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700">2 alerts</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pl-7">
                    <div className="rounded-xl border overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left text-xs font-semibold uppercase tracking-wider p-3">Notification</th>
                            <th className="text-center text-xs font-semibold uppercase tracking-wider p-3 w-20">Email</th>
                            <th className="text-center text-xs font-semibold uppercase tracking-wider p-3 w-20">Push</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { label: 'New Signup', desc: 'When a new customer signs up', icon: Users, state: notifyNewSignup, setter: setNotifyNewSignup },
                            { label: 'Review Posted', desc: 'When a customer leaves a review', icon: Star, state: notifyReviewPosted, setter: setNotifyReviewPosted },
                          ].map((item, i) => (
                            <tr key={i} className={i < 1 ? 'border-b' : ''}>
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <item.icon className="h-4 w-4 text-amber-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{item.label}</p>
                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <Switch checked={channelEmail && item.state} onCheckedChange={item.setter} className="data-[state=checked]:bg-amber-500" />
                              </td>
                              <td className="p-3 text-center">
                                <Switch checked={channelPush && item.state} onCheckedChange={item.setter} className="data-[state=checked]:bg-amber-500" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Marketing Notifications */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rose-500 to-pink-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Megaphone className="h-4 w-4 text-rose-500" />
                          <CardTitle>Marketing Notifications</CardTitle>
                        </div>
                        <CardDescription>Marketing campaign and promotion alerts</CardDescription>
                      </div>
                      <Badge className="bg-rose-100 text-rose-700">2 alerts</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pl-7">
                    <div className="rounded-xl border overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left text-xs font-semibold uppercase tracking-wider p-3">Notification</th>
                            <th className="text-center text-xs font-semibold uppercase tracking-wider p-3 w-20">Email</th>
                            <th className="text-center text-xs font-semibold uppercase tracking-wider p-3 w-20">Push</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { label: 'Campaign Completed', desc: 'When a marketing campaign ends', icon: Megaphone, state: notifyCampaignCompleted, setter: setNotifyCampaignCompleted },
                            { label: 'Discount Expiring', desc: 'When discounts are about to expire', icon: Tag, state: notifyDiscountExpiring, setter: setNotifyDiscountExpiring },
                          ].map((item, i) => (
                            <tr key={i} className={i < 1 ? 'border-b' : ''}>
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
                                    <item.icon className="h-4 w-4 text-rose-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{item.label}</p>
                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <Switch checked={channelEmail && item.state} onCheckedChange={item.setter} className="data-[state=checked]:bg-rose-500" />
                              </td>
                              <td className="p-3 text-center">
                                <Switch checked={channelPush && item.state} onCheckedChange={item.setter} className="data-[state=checked]:bg-rose-500" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleSaveTab('Notifications')}
                      disabled={savingTab === 'Notifications'}
                      className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow min-w-[210px]"
                    >
                      {savingTab === 'Notifications' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Notification Settings
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ====== SEO TAB ====== */}
        <TabsContent value="seo" forceMount={activeTab !== 'seo' ? undefined : undefined}>
          <AnimatePresence mode="wait">
            {activeTab === 'seo' && (
              <motion.div key="seo" variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
                {/* SEO Score Overview */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-orange-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-amber-500" />
                          <CardTitle>SEO Overview</CardTitle>
                        </div>
                        <CardDescription>Search engine optimization score and recommendations</CardDescription>
                      </div>
                      <SeoCircularScore title={metaTitle} description={metaDescription} />
                    </div>
                  </CardHeader>
                </Card>

                {/* Google Search Preview */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-sky-500 to-blue-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-sky-500" />
                      <CardTitle>Google Search Preview</CardTitle>
                    </div>
                    <CardDescription>How your store appears in Google search results</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-7">
                    <div className="p-5 rounded-xl border bg-white max-w-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-400 to-red-400 flex items-center justify-center shrink-0">
                          <span className="text-[6px] text-white font-bold">S</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {domain || subdomain ? `${subdomain || 'www'}.shopforge.com` : 'www.shopforge.com'}
                        </p>
                      </div>
                      <h3 className="text-xl text-blue-700 hover:underline cursor-pointer line-clamp-1 font-normal">
                        {metaTitle || name || 'My Store - Online Shop'}
                      </h3>
                      <p className="text-sm text-green-700 line-clamp-1 mt-0.5">
                        {domain ? `https://${domain}` : `https://${subdomain || 'mystore'}.shopforge.com`}
                      </p>
                      <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                        {metaDescription || description || 'Shop amazing products at our online store. Free shipping on orders over $50.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Meta Tags */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-orange-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-amber-500" />
                          <CardTitle>Meta Tags</CardTitle>
                        </div>
                        <CardDescription>Optimize your store for search engines</CardDescription>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAiSeoOptimize('both')}
                            disabled={aiSeoLoading !== null}
                            className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-200 hover:from-amber-500/20 hover:to-orange-500/20"
                          >
                            {aiSeoLoading === 'both' ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                              <Wand2 className="mr-1 h-3 w-3 text-amber-500" />
                            )}
                            AI Optimize All
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Let AI generate optimized SEO meta tags
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pl-7">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="metaTitle">Meta Title</Label>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((metaTitle.length / 60) * 100, 100)}%` }}
                              className={`h-full rounded-full ${metaTitle.length > 60 ? 'bg-red-500' : metaTitle.length >= 30 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            metaTitle.length > 60 ? 'text-red-500' :
                            metaTitle.length >= 30 ? 'text-emerald-500' :
                            'text-amber-500'
                          }`}>
                            {metaTitle.length}/60
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAiSeoOptimize('title')}
                                disabled={aiSeoLoading !== null}
                                className="h-7 px-2"
                              >
                                {aiSeoLoading === 'title' ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Sparkles className="h-3 w-3 text-amber-500" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>AI optimize title</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <Input
                        id="metaTitle"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder="My Store - Online Shop"
                        className={metaTitle.length > 60 ? 'border-red-300 focus-visible:ring-red-300' : metaTitle.length >= 30 ? 'border-emerald-300' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="metaDescription">Meta Description</Label>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((metaDescription.length / 160) * 100, 100)}%` }}
                              className={`h-full rounded-full ${metaDescription.length > 160 ? 'bg-red-500' : metaDescription.length >= 120 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            metaDescription.length > 160 ? 'text-red-500' :
                            metaDescription.length >= 120 ? 'text-emerald-500' :
                            'text-amber-500'
                          }`}>
                            {metaDescription.length}/160
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAiSeoOptimize('description')}
                                disabled={aiSeoLoading !== null}
                                className="h-7 px-2"
                              >
                                {aiSeoLoading === 'description' ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Sparkles className="h-3 w-3 text-amber-500" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>AI optimize description</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <Textarea
                        id="metaDescription"
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="A brief description of your store for search engines..."
                        rows={3}
                        className={metaDescription.length > 160 ? 'border-red-300 focus-visible:ring-red-300' : metaDescription.length >= 120 ? 'border-emerald-300' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="metaKeywords">Keywords</Label>
                      <Input
                        id="metaKeywords"
                        value={metaKeywords}
                        onChange={(e) => setMetaKeywords(e.target.value)}
                        placeholder="ecommerce, online shop, products"
                      />
                      <p className="text-xs text-muted-foreground">Comma-separated keywords</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Media Preview */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-cyan-500" />
                      <CardTitle>Social Media Preview</CardTitle>
                    </div>
                    <CardDescription>How your store appears when shared on social platforms (Open Graph)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pl-7">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="ogTitle">OG Title</Label>
                        <Input
                          id="ogTitle"
                          value={ogTitle}
                          onChange={(e) => setOgTitle(e.target.value)}
                          placeholder={metaTitle || 'My Store - Online Shop'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ogDescription">OG Description</Label>
                        <Input
                          id="ogDescription"
                          value={ogDescription}
                          onChange={(e) => setOgDescription(e.target.value)}
                          placeholder={metaDescription || 'Shop amazing products'}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>OG Image</Label>
                      <div className="h-32 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Click to upload social sharing image (1200×630px recommended)</span>
                      </div>
                    </div>
                    <div className="border rounded-xl overflow-hidden max-w-sm">
                      <div className="h-28 bg-gradient-to-br from-muted to-muted/50" />
                      <div className="p-3 bg-background">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">shopforge.com</p>
                        <p className="text-sm font-semibold truncate">{ogTitle || metaTitle || name || 'My Store'}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{ogDescription || metaDescription || 'Store description'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Robots & Sitemap */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-emerald-500" />
                      <CardTitle>Robots.txt & Sitemap</CardTitle>
                    </div>
                    <CardDescription>Control how search engines crawl your site</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pl-7">
                    <div className="space-y-2">
                      <Label htmlFor="robotsTxt">robots.txt</Label>
                      <Textarea
                        id="robotsTxt"
                        value={robotsTxt}
                        onChange={(e) => setRobotsTxt(e.target.value)}
                        rows={5}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Globe className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Auto-generate Sitemap</p>
                          <p className="text-xs text-muted-foreground">Automatically create and update your sitemap.xml</p>
                        </div>
                      </div>
                      <Switch checked={sitemapEnabled} onCheckedChange={setSitemapEnabled} className="data-[state=checked]:bg-emerald-500" />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleSaveTab('SEO')}
                      disabled={savingTab === 'SEO'}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-shadow min-w-[170px]"
                    >
                      {savingTab === 'SEO' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save SEO Settings
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ====== ADVANCED TAB ====== */}
        <TabsContent value="advanced" forceMount={activeTab !== 'advanced' ? undefined : undefined}>
          <AnimatePresence mode="wait">
            {activeTab === 'advanced' && (
              <motion.div key="advanced" variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
                {/* API Key */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-slate-600 to-slate-800" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-slate-600" />
                      <CardTitle>API Access</CardTitle>
                    </div>
                    <CardDescription>Manage your store API key for external integrations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pl-7">
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Input
                            value={showApiKey ? apiKey : apiKey.replace(/./g, '•').slice(0, 20) + '...'}
                            readOnly
                            className="font-mono text-sm pr-10"
                          />
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handleCopyApiKey}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy API key</TooltipContent>
                        </Tooltip>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700">
                              <RefreshCw className="h-3.5 w-3.5" />
                              Regenerate
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Regenerate API Key?
                              </DialogTitle>
                              <DialogDescription>
                                This will invalidate your current API key. Any integrations using this key will stop working until you update them with the new key. This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2">
                              <Button variant="outline" onClick={() => {}}>Cancel</Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleRegenerateApiKey()}
                              >
                                Yes, Regenerate Key
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Feature Toggles */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-cyan-500" />
                      <CardTitle>Feature Settings</CardTitle>
                    </div>
                    <CardDescription>Toggle advanced features on or off</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1 pl-7">
                    {[
                      { label: 'Analytics Tracking', desc: 'Track visitor behavior and store performance', icon: Search, state: analyticsTracking, setter: setAnalyticsTracking, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
                      { label: 'Cookie Consent Banner', desc: 'Show GDPR/CCPA compliant cookie consent to visitors', icon: Shield, state: cookieConsent, setter: setCookieConsent, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
                      { label: 'Auto Backup', desc: 'Automatically backup store data daily', icon: Database, state: autoBackup, setter: setAutoBackup, color: 'text-violet-600', bgColor: 'bg-violet-100' },
                    ].map((item, i) => (
                      <div key={i} className={i < 2 ? 'border-b pb-3 mb-3' : ''}>
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                              <item.icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                          <Switch checked={item.state} onCheckedChange={item.setter} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Data Management */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-500" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-emerald-500" />
                      <CardTitle>Data Management</CardTitle>
                    </div>
                    <CardDescription>Export and import your store data</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-7">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => toast.success('Data export started. You will receive a download link via email.')}
                        className="flex items-center gap-4 p-4 rounded-xl border bg-gradient-to-r from-emerald-50/50 to-transparent hover:border-emerald-200 transition-all text-left"
                      >
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                          <ArrowDownToLine className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Export Data</p>
                          <p className="text-xs text-muted-foreground">Download all store data as JSON</p>
                        </div>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => toast.info('Import functionality coming soon!')}
                        className="flex items-center gap-4 p-4 rounded-xl border bg-gradient-to-r from-cyan-50/50 to-transparent hover:border-cyan-200 transition-all text-left"
                      >
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                          <ArrowUpFromLine className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Import Data</p>
                          <p className="text-xs text-muted-foreground">Import data from CSV or JSON file</p>
                        </div>
                      </motion.button>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="relative overflow-hidden border-red-200">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-700" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    </div>
                    <CardDescription>Irreversible actions that affect your store</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pl-7">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/30">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                          <Shield className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Maintenance Mode</p>
                          <p className="text-xs text-muted-foreground">Temporarily disable your storefront for visitors</p>
                        </div>
                      </div>
                      <Switch
                        checked={maintenanceMode}
                        onCheckedChange={setMaintenanceMode}
                        className="data-[state=checked]:bg-red-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/30">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Delete Store</p>
                          <p className="text-xs text-muted-foreground">Permanently delete this store and all its data</p>
                        </div>
                      </div>
                      <Button variant="destructive" size="sm" className="gap-1.5">
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Store
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleSaveTab('Advanced')}
                      disabled={savingTab === 'Advanced'}
                      className="bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white shadow-lg hover:shadow-xl transition-shadow min-w-[190px]"
                    >
                      {savingTab === 'Advanced' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Advanced Settings
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ====== LEGAL TAB ====== */}
        <TabsContent value="legal" forceMount={activeTab !== 'legal' ? undefined : undefined}>
          <AnimatePresence mode="wait">
            {activeTab === 'legal' && (
              <motion.div key="legal" variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-slate-600 to-slate-800" />
                  <CardHeader className="pl-7">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-slate-600" />
                      <CardTitle>Legal Pages</CardTitle>
                    </div>
                    <CardDescription>
                      Manage your store&apos;s legal documents. Supports Markdown formatting.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pl-7">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <Label htmlFor="privacyPolicy" className="text-sm font-semibold">Privacy Policy</Label>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{privacyPolicy.length} chars</Badge>
                      </div>
                      <Textarea
                        id="privacyPolicy"
                        value={privacyPolicy}
                        onChange={(e) => setPrivacyPolicy(e.target.value)}
                        placeholder="# Privacy Policy&#10;&#10;We are committed to protecting your privacy..."
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <Label htmlFor="termsOfService" className="text-sm font-semibold">Terms of Service</Label>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{termsOfService.length} chars</Badge>
                      </div>
                      <Textarea
                        id="termsOfService"
                        value={termsOfService}
                        onChange={(e) => setTermsOfService(e.target.value)}
                        placeholder="# Terms of Service&#10;&#10;By using our website, you agree to these terms..."
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <Label htmlFor="refundPolicy" className="text-sm font-semibold">Refund Policy</Label>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{refundPolicy.length} chars</Badge>
                      </div>
                      <Textarea
                        id="refundPolicy"
                        value={refundPolicy}
                        onChange={(e) => setRefundPolicy(e.target.value)}
                        placeholder="# Refund Policy&#10;&#10;We offer a 30-day money-back guarantee..."
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <Label htmlFor="cookiePolicy" className="text-sm font-semibold">Cookie Policy</Label>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{cookiePolicy.length} chars</Badge>
                      </div>
                      <Textarea
                        id="cookiePolicy"
                        value={cookiePolicy}
                        onChange={(e) => setCookiePolicy(e.target.value)}
                        placeholder="# Cookie Policy&#10;&#10;Our website uses cookies to enhance your experience..."
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleSaveTab('Legal')}
                      disabled={savingTab === 'Legal'}
                      className="bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white shadow-lg hover:shadow-xl transition-shadow min-w-[170px]"
                    >
                      {savingTab === 'Legal' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Legal Settings
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
