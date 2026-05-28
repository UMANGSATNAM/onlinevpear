'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Palette,
  Eye,
  Check,
  Sparkles,
  Paintbrush,
  Type,
  Layout,
  MoreVertical,
  Pencil,
  Trash2,
  Sun,
  Moon,
  Monitor,
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

interface Theme {
  id: string
  name: string
  description: string | null
  preview: string | null
  thumbnail: string | null
  config: string
  styles: string
  layout: string
  isSystem: boolean
  isActive: boolean
  createdAt: string
}

interface ThemesResponse {
  themes: Theme[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

// Theme color palettes based on theme name
const themePalettes: Record<string, string[]> = {
  'Modern Minimal': ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#f5f5f5'],
  'Bold Commerce': ['#ff6b35', '#f7c59f', '#efefd0', '#004e89', '#1a659e'],
  'Elegant Luxe': ['#2c003e', '#512b58', '#8f3985', '#c874b2', '#f5d5e0'],
  'default': ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ede9fe'],
}

function getThemeColors(name: string): string[] {
  // Try to match by partial name
  for (const [key, colors] of Object.entries(themePalettes)) {
    if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
      return colors
    }
  }
  // Generate from name hash
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return [
    `hsl(${hue}, 70%, 30%)`,
    `hsl(${hue}, 60%, 45%)`,
    `hsl(${hue}, 50%, 60%)`,
    `hsl(${hue}, 40%, 75%)`,
    `hsl(${hue}, 30%, 92%)`,
  ]
}

function parseThemeConfig(configStr: string): Record<string, any> {
  try {
    return JSON.parse(configStr || '{}')
  } catch {
    return {}
  }
}

export function ThemeCustomization() {
  const { selectedStoreId, selectedMerchantId } = useAppStore()
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('gallery')
  const [createOpen, setCreateOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [saving, setSaving] = useState(false)
  const [activating, setActivating] = useState<string | null>(null)
  const [aiGenerating, setAiGenerating] = useState(false)

  // Customization panel
  const [customTheme, setCustomTheme] = useState<Theme | null>(null)
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [accentColor, setAccentColor] = useState('#f59e0b')
  const [fontFamily, setFontFamily] = useState('inter')
  const [layoutStyle, setLayoutStyle] = useState('modern')

  // Form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')

  const fetchThemes = async () => {
    setLoading(true)
    try {
      const data = await api.get<ThemesResponse>('/themes', { limit: '50' })
      setThemes(data.themes)
    } catch {
      toast.error('Failed to load themes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchThemes()
  }, [])

  const activeTheme = useMemo(() => themes.find(t => t.isActive), [themes])

  const handleActivate = async (theme: Theme) => {
    setActivating(theme.id)
    try {
      // Deactivate current active theme
      if (activeTheme && activeTheme.id !== theme.id) {
        await api.put(`/themes/${activeTheme.id}`, { isActive: false })
      }
      await api.put(`/themes/${theme.id}`, { isActive: true })
      toast.success(`"${theme.name}" theme activated`)
      fetchThemes()
    } catch {
      toast.error('Failed to activate theme')
    } finally {
      setActivating(null)
    }
  }

  const handleCreate = async () => {
    if (!formName) {
      toast.error('Please enter a theme name')
      return
    }
    setSaving(true)
    try {
      await api.post('/themes', {
        name: formName,
        description: formDescription || null,
        config: JSON.stringify({
          primaryColor,
          accentColor,
          fontFamily,
          layoutStyle,
        }),
        styles: JSON.stringify({}),
        layout: JSON.stringify({}),
        isSystem: false,
        isActive: false,
      })
      toast.success('Theme created')
      setCreateOpen(false)
      resetForm()
      fetchThemes()
    } catch {
      toast.error('Failed to create theme')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedTheme || selectedTheme.isSystem) return
    setSaving(true)
    try {
      await api.delete(`/themes/${selectedTheme.id}`)
      toast.success('Theme deleted')
      setDeleteOpen(false)
      setSelectedTheme(null)
      fetchThemes()
    } catch {
      toast.error('Failed to delete theme')
    } finally {
      setSaving(false)
    }
  }

  const handleAiGenerate = async () => {
    if (!selectedMerchantId) {
      toast.error('No merchant selected')
      return
    }
    setAiGenerating(true)
    try {
      const data = await api.post<{ result: string }>('/ai', {
        feature: 'theme_gen',
        prompt: 'Generate a unique ecommerce theme configuration with a creative name, color palette (5 colors as hex codes), typography choice, and layout style. Make it visually striking and modern. Return as a JSON object.',
        merchantId: selectedMerchantId,
      })
      toast.success('AI theme generated!', {
        description: 'Check the theme gallery for your new theme',
        duration: 6000,
      })
      fetchThemes()
    } catch {
      toast.error('Failed to generate AI theme')
    } finally {
      setAiGenerating(false)
    }
  }

  const openCustomize = (theme: Theme) => {
    setCustomTheme(theme)
    const config = parseThemeConfig(theme.config)
    setPrimaryColor(config.primaryColor || '#6366f1')
    setAccentColor(config.accentColor || '#f59e0b')
    setFontFamily(config.fontFamily || 'inter')
    setLayoutStyle(config.layoutStyle || 'modern')
    setTab('customize')
  }

  const openPreview = (theme: Theme) => {
    setPreviewTheme(theme)
    setPreviewOpen(true)
  }

  const resetForm = () => {
    setFormName('')
    setFormDescription('')
    setPrimaryColor('#6366f1')
    setAccentColor('#f59e0b')
    setFontFamily('inter')
    setLayoutStyle('modern')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Themes</h2>
          <p className="text-sm text-muted-foreground">Customize your store&apos;s look and feel</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAiGenerate} disabled={aiGenerating}>
            <Sparkles className="mr-2 h-4 w-4" />
            {aiGenerating ? 'Generating...' : 'AI Theme'}
          </Button>
          <Button onClick={() => { resetForm(); setCreateOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" /> Create Theme
          </Button>
        </div>
      </div>

      {/* Active theme indicator */}
      {activeTheme && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {getThemeColors(activeTheme.name).map((color, i) => (
                    <div key={i} className="h-6 w-6 rounded-full border border-white/50 shadow-sm" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium">Active Theme: {activeTheme.name}</p>
                  <p className="text-xs text-muted-foreground">{activeTheme.description || 'No description'}</p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="customize">Customize</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="h-32 w-full rounded-t-lg" />
                <div className="p-4">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tab === 'gallery' ? (
        themes.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Palette className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">No themes available</p>
            <p className="text-sm text-muted-foreground mb-4">Create a custom theme or generate one with AI</p>
            <Button onClick={() => { resetForm(); setCreateOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Create Theme
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {themes.map((theme, index) => {
              const colors = getThemeColors(theme.name)
              const isActive = theme.isActive

              return (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className={`group overflow-hidden hover:shadow-md transition-shadow ${isActive ? 'ring-2 ring-primary' : ''}`}>
                    {/* Theme Preview Gradient */}
                    <div
                      className="h-32 relative"
                      style={{
                        background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 25%, ${colors[2]} 50%, ${colors[3]} 75%, ${colors[4]} 100%)`,
                      }}
                    >
                      {/* Overlay with theme name */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
                          <p className="text-sm font-bold text-gray-800">{theme.name}</p>
                        </div>
                      </div>
                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-emerald-500 text-white shadow-sm">
                            <Check className="h-3 w-3 mr-1" /> Active
                          </Badge>
                        </div>
                      )}
                      {theme.isSystem && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="bg-white/90 text-gray-700 shadow-sm text-[10px]">
                            System
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      {/* Color Palette Preview */}
                      <div className="flex items-center gap-1.5 mb-3">
                        {colors.map((color, i) => (
                          <div
                            key={i}
                            className="h-5 w-5 rounded-full border border-gray-200 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>

                      <h3 className="font-semibold">{theme.name}</h3>
                      {theme.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{theme.description}</p>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        {isActive ? (
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openCustomize(theme)}>
                            <Paintbrush className="mr-1.5 h-3.5 w-3.5" /> Customize
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleActivate(theme)}
                            disabled={activating === theme.id}
                          >
                            {activating === theme.id ? 'Activating...' : 'Activate'}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => openPreview(theme)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {!theme.isSystem && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openCustomize(theme)}>
                                <Pencil className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedTheme(theme); setDeleteOpen(true) }} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )
      ) : tab === 'customize' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Customization Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                {customTheme ? `Customizing "${customTheme.name}"` : 'Select a theme from the gallery to customize'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Colors */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Paintbrush className="h-4 w-4" /> Colors
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-9 w-9 rounded border cursor-pointer"
                      />
                      <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="h-9 w-9 rounded border cursor-pointer"
                      />
                      <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="flex-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Type className="h-4 w-4" /> Typography
                </h4>
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                      <SelectItem value="playfair">Playfair Display</SelectItem>
                      <SelectItem value="montserrat">Montserrat</SelectItem>
                      <SelectItem value="lora">Lora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Layout */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Layout className="h-4 w-4" /> Layout
                </h4>
                <div className="space-y-2">
                  <Label>Layout Style</Label>
                  <Select value={layoutStyle} onValueChange={setLayoutStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {customTheme && (
                <Button
                  onClick={async () => {
                    try {
                      await api.put(`/themes/${customTheme.id}`, {
                        config: JSON.stringify({ primaryColor, accentColor, fontFamily, layoutStyle }),
                      })
                      toast.success('Theme customization saved')
                      fetchThemes()
                    } catch {
                      toast.error('Failed to save customization')
                    }
                  }}
                >
                  Save Customization
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>See how your store will look</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                {/* Fake browser chrome */}
                <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-white rounded px-3 py-0.5 text-xs text-gray-500">
                    yourstore.shopforge.io
                  </div>
                </div>
                {/* Fake store preview */}
                <div className="h-80 overflow-hidden" style={{ fontFamily: fontFamily !== 'inter' ? fontFamily : 'sans-serif' }}>
                  {/* Header */}
                  <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: primaryColor }}>
                    <span className="font-bold text-white text-lg">My Store</span>
                    <div className="flex gap-4 text-white/80 text-xs">
                      <span>Home</span>
                      <span>Products</span>
                      <span>About</span>
                    </div>
                  </div>
                  {/* Hero */}
                  <div className="p-6" style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${accentColor}15)` }}>
                    <h2 className="text-xl font-bold mb-2" style={{ color: primaryColor }}>Welcome to Our Store</h2>
                    <p className="text-sm text-muted-foreground mb-3">Discover amazing products</p>
                    <button className="text-xs px-4 py-1.5 rounded-md text-white" style={{ backgroundColor: accentColor }}>
                      Shop Now
                    </button>
                  </div>
                  {/* Products grid */}
                  <div className="p-4 grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="rounded-lg overflow-hidden border">
                        <div className="h-16" style={{ background: `linear-gradient(135deg, ${primaryColor}${20 + i * 10}, ${accentColor}${20 + i * 10})` }} />
                        <div className="p-2">
                          <p className="text-[10px] font-medium">Product {i}</p>
                          <p className="text-[9px]" style={{ color: accentColor }}>${29.99 + i * 10}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Create Theme Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Custom Theme</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Theme Name *</Label>
              <Input
                placeholder="e.g. Ocean Breeze"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of the theme"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 w-9 rounded border cursor-pointer"
                  />
                  <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-9 w-9 rounded border cursor-pointer"
                  />
                  <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="roboto">Roboto</SelectItem>
                  <SelectItem value="poppins">Poppins</SelectItem>
                  <SelectItem value="playfair">Playfair Display</SelectItem>
                  <SelectItem value="montserrat">Montserrat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Layout Style</Label>
              <Select value={layoutStyle} onValueChange={setLayoutStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create Theme'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Theme Preview: {previewTheme?.name}</DialogTitle>
          </DialogHeader>
          {previewTheme && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white rounded px-3 py-0.5 text-xs text-gray-500">
                  yourstore.shopforge.io
                </div>
              </div>
              <div className="h-96 overflow-auto">
                {(() => {
                  const colors = getThemeColors(previewTheme.name)
                  const config = parseThemeConfig(previewTheme.config)
                  const primary = config.primaryColor || colors[1]
                  const accent = config.accentColor || colors[3]
                  return (
                    <>
                      <div className="px-8 py-5 flex items-center justify-between" style={{ backgroundColor: primary }}>
                        <span className="font-bold text-white text-xl">My Store</span>
                        <div className="flex gap-6 text-white/80 text-sm">
                          <span>Home</span>
                          <span>Products</span>
                          <span>About</span>
                          <span>Contact</span>
                        </div>
                      </div>
                      <div className="p-8" style={{ background: `linear-gradient(135deg, ${primary}15, ${accent}15)` }}>
                        <h2 className="text-3xl font-bold mb-3" style={{ color: primary }}>Welcome to Our Store</h2>
                        <p className="text-muted-foreground mb-4">Discover our curated collection of amazing products designed just for you.</p>
                        <button className="px-6 py-2.5 rounded-lg text-white font-medium" style={{ backgroundColor: accent }}>
                          Shop Now
                        </button>
                      </div>
                      <div className="p-8 grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <div key={i} className="rounded-xl overflow-hidden border shadow-sm">
                            <div className="h-24" style={{ background: `linear-gradient(135deg, ${colors[(i - 1) % colors.length]}, ${colors[i % colors.length]})` }} />
                            <div className="p-3">
                              <p className="font-medium text-sm">Product {i}</p>
                              <p className="text-sm font-semibold" style={{ color: accent }}>${29.99 + i * 15}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            {previewTheme && !previewTheme.isActive && (
              <Button onClick={() => { handleActivate(previewTheme); setPreviewOpen(false) }}>
                Activate Theme
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Theme</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedTheme?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={saving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {saving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
