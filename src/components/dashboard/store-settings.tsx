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

function SeoScoreIndicator({ length, max }: { length: number; max: number }) {
  const ratio = length / max
  const score = ratio > 1 ? 0 : ratio < 0.3 ? 30 : ratio < 0.7 ? 65 : 95
  const color = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500'
  const bgColor = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
  const label = score >= 80 ? 'Good' : score >= 50 ? 'Fair' : 'Poor'

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(score, 100)}%` }}
          className={`h-full rounded-full ${bgColor}`}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className={`text-xs font-medium ${color}`}>{label}</span>
    </div>
  )
}

export function StoreSettings() {
  const { selectedStoreId, selectedMerchantId } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [savingTab, setSavingTab] = useState<string | null>(null)
  const [aiSeoLoading, setAiSeoLoading] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Store Settings</h2>
        <p className="text-sm text-muted-foreground">Configure your store preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="gap-2">
            <Store className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="h-4 w-4" /> SEO
          </TabsTrigger>
          <TabsTrigger value="legal" className="gap-2">
            <Scale className="h-4 w-4" /> Legal
          </TabsTrigger>
        </TabsList>

        {/* ====== GENERAL TAB ====== */}
        <TabsContent value="general">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-rose-500 to-pink-500" />
                <CardTitle>Store Information</CardTitle>
                <CardDescription>Basic store details and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Store Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Store" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="support@mystore.com" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input id="contactPhone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
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

            <Card>
              <CardHeader>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
                <CardTitle>Store Logo</CardTitle>
                <CardDescription>Upload your brand logo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

            <Card>
              <CardHeader>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>Currency and language preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

            <Card>
              <CardHeader>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                <CardTitle>Domain Settings</CardTitle>
                <CardDescription>Configure your store domain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Custom Domain</Label>
                  <Input
                    id="domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="www.mystore.com"
                  />
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
              <Button onClick={() => handleSaveTab('General')} disabled={savingTab === 'General'}>
                {savingTab === 'General' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save General Settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ====== APPEARANCE TAB ====== */}
        <TabsContent value="appearance">
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="h-1 w-16 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500" />
                    <CardTitle>Primary Color</CardTitle>
                    <CardDescription>Choose your store&apos;s brand color</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                              <div className="h-3 w-3 rounded-full bg-white shadow-sm" />
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

                <Card>
                  <CardHeader>
                    <div className="h-1 w-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                    <CardTitle>Typography & Layout</CardTitle>
                    <CardDescription>Customize fonts and layout options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                <Card className="sticky top-4">
                  <CardHeader>
                    <div className="h-1 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Live Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-xl overflow-hidden shadow-lg">
                      {/* Preview Header */}
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
                      {/* Preview Hero */}
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
                      {/* Preview Product Grid */}
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
              <Button onClick={() => handleSaveTab('Appearance')} disabled={savingTab === 'Appearance'}>
                {savingTab === 'Appearance' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Appearance Settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ====== NOTIFICATIONS TAB ====== */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            {/* Notification Channels */}
            <Card>
              <CardHeader>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
                <CardTitle>Notification Channels</CardTitle>
                <CardDescription>Choose how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-violet-50/50 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Email</p>
                        <p className="text-xs text-muted-foreground">Receive notifications via email</p>
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
                        <p className="text-xs text-muted-foreground">Receive notifications via text</p>
                      </div>
                    </div>
                    <Switch checked={channelSms} onCheckedChange={setChannelSms} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Notifications */}
            <Card>
              <CardHeader>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-emerald-500" />
                  Order Notifications
                </CardTitle>
                <CardDescription>Stay updated on order activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  { label: 'New Order', desc: 'Get notified when a customer places a new order', icon: ShoppingCart, state: notifyNewOrder, setter: setNotifyNewOrder },
                  { label: 'Order Shipped', desc: 'Get notified when an order is shipped', icon: Package, state: notifyOrderShipped, setter: setNotifyOrderShipped },
                  { label: 'Order Delivered', desc: 'Get notified when an order is delivered', icon: Package, state: notifyOrderDelivered, setter: setNotifyOrderDelivered },
                  { label: 'Low Stock', desc: 'Get alerted when product inventory is running low', icon: AlertTriangle, state: notifyLowStock, setter: setNotifyLowStock },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <item.icon className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <Switch checked={item.state} onCheckedChange={item.setter} />
                    </div>
                    {i < 3 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Customer Notifications */}
            <Card>
              <CardHeader>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-500" />
                  Customer Notifications
                </CardTitle>
                <CardDescription>Track customer engagement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  { label: 'New Signup', desc: 'Get notified when a new customer signs up', icon: Users, state: notifyNewSignup, setter: setNotifyNewSignup },
                  { label: 'Review Posted', desc: 'Get notified when a customer leaves a review', icon: Star, state: notifyReviewPosted, setter: setNotifyReviewPosted },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                          <item.icon className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <Switch checked={item.state} onCheckedChange={item.setter} />
                    </div>
                    {i < 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Marketing Notifications */}
            <Card>
              <CardHeader>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-rose-500 to-pink-500" />
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-rose-500" />
                  Marketing Notifications
                </CardTitle>
                <CardDescription>Marketing campaign and promotion alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  { label: 'Campaign Completed', desc: 'Get notified when a marketing campaign ends', icon: Megaphone, state: notifyCampaignCompleted, setter: setNotifyCampaignCompleted },
                  { label: 'Discount Expiring', desc: 'Get alerted when discounts are about to expire', icon: Tag, state: notifyDiscountExpiring, setter: setNotifyDiscountExpiring },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
                          <item.icon className="h-4 w-4 text-rose-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <Switch checked={item.state} onCheckedChange={item.setter} />
                    </div>
                    {i < 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => handleSaveTab('Notifications')} disabled={savingTab === 'Notifications'}>
                {savingTab === 'Notifications' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Notification Settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ====== SEO TAB ====== */}
        <TabsContent value="seo">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Meta Tags</CardTitle>
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
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <div className="flex items-center gap-2">
                      <SeoScoreIndicator length={metaTitle.length} max={60} />
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
                    className={metaTitle.length > 60 ? 'border-red-300' : metaTitle.length >= 30 ? 'border-emerald-300' : ''}
                  />
                  <div className="flex justify-between">
                    <p className="text-xs text-muted-foreground">
                      {metaTitle.length}/60 characters
                    </p>
                    <span className={`text-xs font-medium ${
                      metaTitle.length > 60 ? 'text-red-500' :
                      metaTitle.length >= 30 ? 'text-emerald-500' :
                      'text-amber-500'
                    }`}>
                      {metaTitle.length > 60 ? 'Too long' : metaTitle.length >= 30 ? 'Good length' : 'Too short'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <div className="flex items-center gap-2">
                      <SeoScoreIndicator length={metaDescription.length} max={160} />
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
                    className={metaDescription.length > 160 ? 'border-red-300' : metaDescription.length >= 120 ? 'border-emerald-300' : ''}
                  />
                  <div className="flex justify-between">
                    <p className="text-xs text-muted-foreground">
                      {metaDescription.length}/160 characters
                    </p>
                    <span className={`text-xs font-medium ${
                      metaDescription.length > 160 ? 'text-red-500' :
                      metaDescription.length >= 120 ? 'text-emerald-500' :
                      'text-amber-500'
                    }`}>
                      {metaDescription.length > 160 ? 'Too long' : metaDescription.length >= 120 ? 'Good length' : 'Too short'}
                    </span>
                  </div>
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
            <Card>
              <CardHeader>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                <CardTitle>Social Media Preview</CardTitle>
                <CardDescription>How your store appears when shared on social platforms (Open Graph)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                {/* Preview Card */}
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
            <Card>
              <CardHeader>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                <CardTitle>Robots.txt & Sitemap</CardTitle>
                <CardDescription>Control how search engines crawl your site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <Switch checked={sitemapEnabled} onCheckedChange={setSitemapEnabled} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => handleSaveTab('SEO')} disabled={savingTab === 'SEO'}>
                {savingTab === 'SEO' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save SEO Settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ====== LEGAL TAB ====== */}
        <TabsContent value="legal">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-slate-600 to-slate-800" />
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Legal Pages
                </CardTitle>
                <CardDescription>
                  Manage your store&apos;s legal documents. Supports Markdown formatting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <Label htmlFor="privacyPolicy" className="text-sm font-semibold">Privacy Policy</Label>
                  </div>
                  <Textarea
                    id="privacyPolicy"
                    value={privacyPolicy}
                    onChange={(e) => setPrivacyPolicy(e.target.value)}
                    placeholder="# Privacy Policy&#10;&#10;We are committed to protecting your privacy..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">{privacyPolicy.length} characters</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <Label htmlFor="termsOfService" className="text-sm font-semibold">Terms of Service</Label>
                  </div>
                  <Textarea
                    id="termsOfService"
                    value={termsOfService}
                    onChange={(e) => setTermsOfService(e.target.value)}
                    placeholder="# Terms of Service&#10;&#10;By using our website, you agree to these terms..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">{termsOfService.length} characters</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <Label htmlFor="refundPolicy" className="text-sm font-semibold">Refund Policy</Label>
                  </div>
                  <Textarea
                    id="refundPolicy"
                    value={refundPolicy}
                    onChange={(e) => setRefundPolicy(e.target.value)}
                    placeholder="# Refund Policy&#10;&#10;We offer a 30-day money-back guarantee..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">{refundPolicy.length} characters</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <Label htmlFor="cookiePolicy" className="text-sm font-semibold">Cookie Policy</Label>
                  </div>
                  <Textarea
                    id="cookiePolicy"
                    value={cookiePolicy}
                    onChange={(e) => setCookiePolicy(e.target.value)}
                    placeholder="# Cookie Policy&#10;&#10;Our website uses cookies to enhance your experience..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">{cookiePolicy.length} characters</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => handleSaveTab('Legal')} disabled={savingTab === 'Legal'}>
                {savingTab === 'Legal' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Legal Settings
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
