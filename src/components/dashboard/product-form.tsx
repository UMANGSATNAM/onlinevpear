'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  Save,
  Sparkles,
  Plus,
  Trash2,
  Loader2,
  ImagePlus,
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
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  shortDesc: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  comparePrice: z.coerce.number().optional(),
  costPrice: z.coerce.number().optional(),
  status: z.string().default('draft'),
  visibility: z.string().default('public'),
  type: z.string().default('physical'),
  vendor: z.string().optional(),
  tags: z.string().default(''),
  weight: z.coerce.number().optional(),
  categoryId: z.string().optional(),
  tracksInventory: z.boolean().default(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  variants: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Variant title is required'),
    sku: z.string().optional(),
    price: z.coerce.number().min(0),
    comparePrice: z.coerce.number().optional(),
    options: z.string().default('{}'),
  })).default([]),
})

type ProductForm = z.infer<typeof productSchema>

interface Category {
  id: string
  name: string
}

interface ProductData {
  id: string
  name: string
  slug: string
  description: string | null
  shortDesc: string | null
  sku: string | null
  barcode: string | null
  price: number
  comparePrice: number | null
  costPrice: number | null
  status: string
  visibility: string
  type: string
  vendor: string | null
  tags: string
  weight: number | null
  categoryId: string | null
  tracksInventory: boolean
  seo: string
  images: string
  variants: Array<{
    id: string
    title: string
    sku: string | null
    price: number
    comparePrice: number | null
    options: string
  }>
  inventory: Array<{ id: string; quantity: number; reserved: number; lowStockThreshold: number }>
}

export function ProductForm() {
  const { selectedStoreId, selectedProductId, setDashboardPage, selectedMerchantId } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      shortDesc: '',
      sku: '',
      barcode: '',
      price: 0,
      comparePrice: undefined,
      costPrice: undefined,
      status: 'draft',
      visibility: 'public',
      type: 'physical',
      vendor: '',
      tags: '',
      weight: undefined,
      categoryId: '',
      tracksInventory: true,
      metaTitle: '',
      metaDescription: '',
      variants: [],
    },
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: 'variants',
  })

  const watchName = form.watch('name')

  useEffect(() => {
    if (watchName && !selectedProductId) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      form.setValue('slug', slug)
    }
  }, [watchName, selectedProductId])

  useEffect(() => {
    if (!selectedStoreId) return
    api.get<{ categories: Category[] }>('/categories', { storeId: selectedStoreId })
      .then((data) => setCategories(data.categories))
      .catch(() => {})
  }, [selectedStoreId])

  useEffect(() => {
    if (!selectedProductId) return
    setLoading(true)
    api.get<{ product: ProductData }>(`/products/${selectedProductId}`)
      .then((data) => {
        const p = data.product
        let seoData: Record<string, string> = {}
        try { seoData = JSON.parse(p.seo || '{}') } catch {}
        form.reset({
          name: p.name,
          slug: p.slug,
          description: p.description || '',
          shortDesc: p.shortDesc || '',
          sku: p.sku || '',
          barcode: p.barcode || '',
          price: p.price,
          comparePrice: p.comparePrice || undefined,
          costPrice: p.costPrice || undefined,
          status: p.status,
          visibility: p.visibility,
          type: p.type,
          vendor: p.vendor || '',
          tags: Array.isArray(JSON.parse(p.tags || '[]')) ? JSON.parse(p.tags || '[]').join(', ') : '',
          weight: p.weight || undefined,
          categoryId: p.categoryId || '',
          tracksInventory: p.tracksInventory,
          metaTitle: seoData.title || '',
          metaDescription: seoData.description || '',
          variants: p.variants.map((v) => ({
            id: v.id,
            title: v.title,
            sku: v.sku || '',
            price: v.price,
            comparePrice: v.comparePrice || undefined,
            options: v.options,
          })),
        })
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false))
  }, [selectedProductId])

  const generateSlug = () => {
    const name = form.getValues('name')
    if (!name) return
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    form.setValue('slug', slug)
  }

  const handleAiGenerate = async (feature: string, field: string) => {
    setAiLoading(feature)
    try {
      const name = form.getValues('name')
      const desc = form.getValues('description')
      const res = await api.post<{ result: string }>('/ai', {
        feature,
        prompt: feature === 'product_desc'
          ? `Generate a compelling product description for: ${name}. ${desc ? `Current description: ${desc}` : ''}`
          : `Generate SEO meta title and description for product: ${name}. ${desc ? `Description: ${desc}` : ''}`,
        merchantId: selectedMerchantId,
      })
      if (feature === 'product_desc') {
        form.setValue('description', res.result)
      } else {
        // Try to parse the SEO result
        const lines = res.result.split('\n').filter(Boolean)
        const titleLine = lines.find((l) => l.toLowerCase().includes('title'))
        const descLine = lines.find((l) => l.toLowerCase().includes('description'))
        if (titleLine) form.setValue('metaTitle', titleLine.replace(/^.*?:\s*/, '').replace(/\*\*/g, '').trim())
        if (descLine) form.setValue('metaDescription', descLine.replace(/^.*?:\s*/, '').replace(/\*\*/g, '').trim())
      }
      toast.success('AI generation complete')
    } catch {
      toast.error('AI generation failed')
    } finally {
      setAiLoading(null)
    }
  }

  const onSubmit = async (values: ProductForm) => {
    if (!selectedStoreId) return
    setSaving(true)
    try {
      const tagsArray = values.tags ? values.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
      const body: Record<string, unknown> = {
        storeId: selectedStoreId,
        name: values.name,
        slug: values.slug,
        description: values.description || null,
        shortDesc: values.shortDesc || null,
        sku: values.sku || null,
        barcode: values.barcode || null,
        price: values.price,
        comparePrice: values.comparePrice || null,
        costPrice: values.costPrice || null,
        status: values.status,
        visibility: values.visibility,
        type: values.type,
        vendor: values.vendor || null,
        tags: tagsArray,
        weight: values.weight || null,
        categoryId: values.categoryId || null,
        tracksInventory: values.tracksInventory,
        seo: JSON.stringify({
          title: values.metaTitle,
          description: values.metaDescription,
        }),
      }

      if (selectedProductId) {
        await api.put(`/products/${selectedProductId}`, body)
        toast.success('Product updated')
      } else {
        await api.post('/products', body)
        toast.success('Product created')
      }
      setDashboardPage('products')
    } catch (err) {
      toast.error(selectedProductId ? 'Failed to update product' : 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setDashboardPage('products')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{selectedProductId ? 'Edit Product' : 'New Product'}</h2>
          <p className="text-sm text-muted-foreground">
            {selectedProductId ? 'Update product details' : 'Add a new product to your store'}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input id="name" {...form.register('name')} placeholder="e.g. Premium T-Shirt" />
                    {form.formState.errors.name && (
                      <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <div className="flex gap-2">
                      <Input id="slug" {...form.register('slug')} placeholder="premium-t-shirt" />
                      <Button type="button" variant="outline" size="sm" onClick={generateSlug}>
                        Generate
                      </Button>
                    </div>
                    {form.formState.errors.slug && (
                      <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Description</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAiGenerate('product_desc', 'description')}
                      disabled={aiLoading === 'product_desc'}
                    >
                      {aiLoading === 'product_desc' ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="mr-1 h-3 w-3" />
                      )}
                      AI Generate
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Write a compelling product description..."
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDesc">Short Description</Label>
                  <Textarea
                    id="shortDesc"
                    {...form.register('shortDesc')}
                    placeholder="Brief summary for product cards..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input id="price" type="number" step="0.01" {...form.register('price')} />
                    {form.formState.errors.price && (
                      <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">Compare Price</Label>
                    <Input id="comparePrice" type="number" step="0.01" {...form.register('comparePrice')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Cost Price</Label>
                    <Input id="costPrice" type="number" step="0.01" {...form.register('costPrice')} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAiGenerate('seo', 'seo')}
                    disabled={aiLoading === 'seo'}
                  >
                    {aiLoading === 'seo' ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="mr-1 h-3 w-3" />
                    )}
                    AI Generate SEO
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input id="metaTitle" {...form.register('metaTitle')} placeholder="SEO title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    {...form.register('metaDescription')}
                    placeholder="SEO description..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Variants</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendVariant({
                        title: '',
                        sku: '',
                        price: form.getValues('price'),
                        comparePrice: undefined,
                        options: '{}',
                      })
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Variant
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {variantFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No variants. Add variants for different sizes, colors, etc.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {variantFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Variant {index + 1}</span>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeVariant(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Title *</Label>
                            <Input {...form.register(`variants.${index}.title`)} placeholder="e.g. Large / Red" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">SKU</Label>
                            <Input {...form.register(`variants.${index}.sku`)} placeholder="SKU-LR" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Price *</Label>
                            <Input type="number" step="0.01" {...form.register(`variants.${index}.price`)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Status</Label>
                  <Select value={form.watch('status')} onValueChange={(v) => form.setValue('status', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select value={form.watch('visibility')} onValueChange={(v) => form.setValue('visibility', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Product Type</Label>
                  <Select value={form.watch('type')} onValueChange={(v) => form.setValue('type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical">Physical</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.watch('categoryId') || 'none'} onValueChange={(v) => form.setValue('categoryId', v === 'none' ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" {...form.register('sku')} placeholder="SKU-001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input id="barcode" {...form.register('barcode')} placeholder="ISBN, UPC, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input id="vendor" {...form.register('vendor')} placeholder="Supplier name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" {...form.register('tags')} placeholder="tag1, tag2, tag3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tracksInventory">Track Inventory</Label>
                  <Switch
                    id="tracksInventory"
                    checked={form.watch('tracksInventory')}
                    onCheckedChange={(v) => form.setValue('tracksInventory', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" step="0.01" {...form.register('weight')} />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {selectedProductId ? 'Update Product' : 'Create Product'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDashboardPage('products')}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  )
}
