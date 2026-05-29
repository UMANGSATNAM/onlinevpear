'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  FolderOpen,
  MoreVertical,
  Pencil,
  Trash2,
  Package,
  FolderTree,
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

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parentId: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  parent: { id: string; name: string } | null
  _count: { products: number; children: number }
}

interface CategoriesResponse {
  categories: Category[]
}

// Generate a gradient based on category name
function getCategoryGradient(name: string): string {
  const gradients = [
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-sky-600',
    'from-fuchsia-500 to-pink-600',
    'from-lime-500 to-green-600',
    'from-red-500 to-rose-600',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

export function CategoriesManagement() {
  const { selectedStoreId } = useAppStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formParentId, setFormParentId] = useState<string>('none')

  const fetchCategories = async () => {
    if (!selectedStoreId) return
    setLoading(true)
    try {
      const data = await api.get<CategoriesResponse>('/categories', { storeId: selectedStoreId })
      setCategories(data.categories)
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [selectedStoreId])

  const filteredCategories = useMemo(() => {
    let result = categories
    if (statusFilter === 'active') result = result.filter(c => c.isActive)
    if (statusFilter === 'inactive') result = result.filter(c => !c.isActive)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
    }
    return result
  }, [categories, statusFilter, searchQuery])

  const parentCategories = useMemo(() => {
    return categories.filter(c => !c.parentId)
  }, [categories])

  const handleCreate = async () => {
    if (!selectedStoreId || !formName) {
      toast.error('Please fill in the category name')
      return
    }
    setSaving(true)
    try {
      const slug = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      await api.post('/categories', {
        storeId: selectedStoreId,
        name: formName,
        slug,
        description: formDescription || null,
        parentId: formParentId === 'none' ? null : formParentId,
        isActive: true,
      })
      toast.success('Category created')
      setCreateOpen(false)
      resetForm()
      fetchCategories()
    } catch {
      toast.error('Failed to create category')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedCategory || !formName) {
      toast.error('Please fill in the category name')
      return
    }
    setSaving(true)
    try {
      const slug = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      await api.put(`/categories/${selectedCategory.id}`, {
        name: formName,
        slug,
        description: formDescription || null,
        parentId: formParentId === 'none' ? null : formParentId,
      })
      toast.success('Category updated')
      setEditOpen(false)
      resetForm()
      fetchCategories()
    } catch {
      toast.error('Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCategory) return
    setSaving(true)
    try {
      await api.delete(`/categories/${selectedCategory.id}`)
      toast.success('Category deleted')
      setDeleteOpen(false)
      setSelectedCategory(null)
      fetchCategories()
    } catch {
      toast.error('Failed to delete category')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (category: Category) => {
    try {
      await api.put(`/categories/${category.id}`, { isActive: !category.isActive })
      toast.success(category.isActive ? 'Category deactivated' : 'Category activated')
      fetchCategories()
    } catch {
      toast.error('Failed to toggle category status')
    }
  }

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category)
    setFormName(category.name)
    setFormDescription(category.description || '')
    setFormParentId(category.parentId || 'none')
    setEditOpen(true)
  }

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category)
    setDeleteOpen(true)
  }

  const resetForm = () => {
    setFormName('')
    setFormDescription('')
    setFormParentId('none')
    setSelectedCategory(null)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="text-sm text-muted-foreground">Organize your products into categories</p>
        </div>
        <Button onClick={() => { resetForm(); setCreateOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" /> Create Category
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive')}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{categories.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-emerald-600">{categories.filter(c => c.isActive).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-muted-foreground">{categories.filter(c => !c.isActive).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Top-level</p>
            <p className="text-2xl font-bold">{parentCategories.length}</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-32 mb-3" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FolderTree className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No categories match your filters' : 'No categories yet'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">Create categories to organize your products</p>
          <Button onClick={() => { resetForm(); setCreateOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" /> Create your first category
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className={`group relative overflow-hidden hover:shadow-md transition-shadow ${!category.isActive ? 'opacity-60' : ''}`}>
                {/* Gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getCategoryGradient(category.name)}`} />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${getCategoryGradient(category.name)} flex items-center justify-center shrink-0`}>
                        <FolderOpen className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(category)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(category)}>
                          {category.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(category)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5" />
                      <span>{category._count.products} products</span>
                    </div>
                    {category.parent && (
                      <div className="flex items-center gap-1.5">
                        <FolderTree className="h-3.5 w-3.5" />
                        <span className="truncate">{category.parent.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <Badge variant={category.isActive ? 'secondary' : 'outline'} className={
                      category.isActive ? 'bg-emerald-100 text-emerald-800' : ''
                    }>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="e.g. Electronics"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this category"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Parent Category</Label>
              <Select value={formParentId} onValueChange={setFormParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (top-level)</SelectItem>
                  {parentCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="Category name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Parent Category</Label>
              <Select value={formParentId} onValueChange={setFormParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (top-level)</SelectItem>
                  {parentCategories
                    .filter(cat => cat.id !== selectedCategory?.id)
                    .map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedCategory?.name}&quot;? This action cannot be undone.
              {selectedCategory && selectedCategory._count.products > 0 && (
                <span className="block mt-2 text-amber-600 font-medium">
                  This category has {selectedCategory._count.products} product(s). Products will become uncategorized.
                </span>
              )}
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
