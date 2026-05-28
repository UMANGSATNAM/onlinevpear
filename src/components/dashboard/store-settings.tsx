'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Save,
  Store,
  Globe,
  Languages,
  Search,
  Bell,
  Loader2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

export function StoreSettings() {
  const { selectedStoreId } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // General
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [logo, setLogo] = useState('')

  // Domain
  const [domain, setDomain] = useState('')
  const [subdomain, setSubdomain] = useState('')

  // Currency & Language
  const [currency, setCurrency] = useState('USD')
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('UTC')

  // SEO
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [metaKeywords, setMetaKeywords] = useState('')

  // Notifications
  const [notifyOrders, setNotifyOrders] = useState(true)
  const [notifyCustomers, setNotifyCustomers] = useState(true)
  const [notifyLowStock, setNotifyLowStock] = useState(true)
  const [notifyMarketing, setNotifyMarketing] = useState(false)

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
          } catch {}

          try {
            const settings = JSON.parse(store.settings || '{}')
            setNotifyOrders(settings.notifyOrders !== false)
            setNotifyCustomers(settings.notifyCustomers !== false)
            setNotifyLowStock(settings.notifyLowStock !== false)
            setNotifyMarketing(settings.notifyMarketing === true)
          } catch {}
        }
      })
      .catch(() => {
        toast.error('Failed to load store settings')
      })
      .finally(() => setLoading(false))
  }, [selectedStoreId])

  const handleSave = async () => {
    if (!selectedStoreId) return
    setSaving(true)
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
        }),
        settings: JSON.stringify({
          notifyOrders,
          notifyCustomers,
          notifyLowStock,
          notifyMarketing,
        }),
      })
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Store Settings</h2>
          <p className="text-sm text-muted-foreground">Configure your store preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="gap-2">
            <Store className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="domain" className="gap-2">
            <Globe className="h-4 w-4" /> Domain
          </TabsTrigger>
          <TabsTrigger value="regional" className="gap-2">
            <Languages className="h-4 w-4" /> Regional
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="h-4 w-4" /> SEO
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic store information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Store Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Store" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input id="logo" value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://example.com/logo.png" />
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
              {logo && (
                <div className="mt-4">
                  <Label>Logo Preview</Label>
                  <div className="mt-2 h-16 w-16 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                    <img src={logo} alt="Store logo" className="h-full w-full object-contain" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain">
          <Card>
            <CardHeader>
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
        </TabsContent>

        <TabsContent value="regional">
          <Card>
            <CardHeader>
              <CardTitle>Currency & Language</CardTitle>
              <CardDescription>Regional settings for your store</CardDescription>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize your store for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="My Store - Online Shop"
                />
                <p className="text-xs text-muted-foreground">
                  {metaTitle.length}/60 characters recommended
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="A brief description of your store for search engines..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {metaDescription.length}/160 characters recommended
                </p>
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
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Order Notifications</p>
                  <p className="text-xs text-muted-foreground">Get notified about new orders and updates</p>
                </div>
                <Switch checked={notifyOrders} onCheckedChange={setNotifyOrders} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Customer Notifications</p>
                  <p className="text-xs text-muted-foreground">Get notified about new customers and activity</p>
                </div>
                <Switch checked={notifyCustomers} onCheckedChange={setNotifyCustomers} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Low Stock Alerts</p>
                  <p className="text-xs text-muted-foreground">Get notified when products are running low</p>
                </div>
                <Switch checked={notifyLowStock} onCheckedChange={setNotifyLowStock} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Marketing Updates</p>
                  <p className="text-xs text-muted-foreground">Get tips and product updates from ShopForge</p>
                </div>
                <Switch checked={notifyMarketing} onCheckedChange={setNotifyMarketing} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
