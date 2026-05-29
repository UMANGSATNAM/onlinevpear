'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck,
  Plus,
  Edit,
  Trash2,
  Clock,
  Globe,
  Package,
  MapPin,
  Shield,
  Zap,
  CheckCircle2,
  DollarSign,
  Weight,
  CalendarDays,
  ToggleLeft,
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
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

// Types
interface ShippingMethod {
  id: string
  name: string
  price: number
  freeAbove: number | null
  estimatedDays: string
  zones: string[]
  active: boolean
  weightBased: boolean
}

interface ShippingZone {
  id: string
  name: string
  countries: string[]
  activeMethods: string[]
}

interface DeliverySettings {
  sameDayDelivery: boolean
  sameDayCutoff: string
  saturdayDelivery: boolean
  signatureRequired: boolean
  insuranceEnabled: boolean
  insuranceThreshold: number
}

// Mock data
const mockShippingMethods: ShippingMethod[] = [
  {
    id: 'sm-1',
    name: 'Free Shipping',
    price: 0,
    freeAbove: null,
    estimatedDays: '5-7 days',
    zones: ['domestic', 'eu'],
    active: true,
    weightBased: false,
  },
  {
    id: 'sm-2',
    name: 'Standard Shipping',
    price: 5.99,
    freeAbove: 50,
    estimatedDays: '5-7 days',
    zones: ['domestic'],
    active: true,
    weightBased: false,
  },
  {
    id: 'sm-3',
    name: 'Express Shipping',
    price: 14.99,
    freeAbove: 150,
    estimatedDays: '2-3 days',
    zones: ['domestic', 'eu'],
    active: true,
    weightBased: false,
  },
  {
    id: 'sm-4',
    name: 'Overnight Shipping',
    price: 24.99,
    freeAbove: null,
    estimatedDays: '1 day',
    zones: ['domestic'],
    active: true,
    weightBased: true,
  },
]

const mockZones: ShippingZone[] = [
  {
    id: 'zone-1',
    name: 'Domestic',
    countries: ['United States', 'Puerto Rico', 'US Virgin Islands'],
    activeMethods: ['Free Shipping', 'Standard Shipping', 'Express Shipping', 'Overnight Shipping'],
  },
  {
    id: 'zone-2',
    name: 'European Union',
    countries: ['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium'],
    activeMethods: ['Free Shipping', 'Express Shipping'],
  },
  {
    id: 'zone-3',
    name: 'Asia Pacific',
    countries: ['Japan', 'South Korea', 'Singapore', 'Australia', 'New Zealand'],
    activeMethods: ['Express Shipping'],
  },
]

const initialDeliverySettings: DeliverySettings = {
  sameDayDelivery: false,
  sameDayCutoff: '14:00',
  saturdayDelivery: true,
  signatureRequired: false,
  insuranceEnabled: true,
  insuranceThreshold: 100,
}

const zoneOptions = [
  { value: 'domestic', label: 'Domestic' },
  { value: 'eu', label: 'European Union' },
  { value: 'international', label: 'International' },
  { value: 'asia', label: 'Asia Pacific' },
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function ShippingSettings() {
  const { selectedStoreId } = useAppStore()
  const [methods, setMethods] = useState<ShippingMethod[]>(mockShippingMethods)
  const [zones] = useState<ShippingZone[]>(mockZones)
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(initialDeliverySettings)
  const [methodDialogOpen, setMethodDialogOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formFreeAbove, setFormFreeAbove] = useState('')
  const [formEstimatedDays, setFormEstimatedDays] = useState('')
  const [formZones, setFormZones] = useState<string[]>([])
  const [formWeightBased, setFormWeightBased] = useState(false)
  const [saving, setSaving] = useState(false)

  const openCreateMethod = () => {
    setEditingMethod(null)
    setFormName('')
    setFormPrice('')
    setFormFreeAbove('')
    setFormEstimatedDays('')
    setFormZones(['domestic'])
    setFormWeightBased(false)
    setMethodDialogOpen(true)
  }

  const openEditMethod = (method: ShippingMethod) => {
    setEditingMethod(method)
    setFormName(method.name)
    setFormPrice(method.price.toString())
    setFormFreeAbove(method.freeAbove?.toString() || '')
    setFormEstimatedDays(method.estimatedDays)
    setFormZones(method.zones)
    setFormWeightBased(method.weightBased)
    setMethodDialogOpen(true)
  }

  const handleSaveMethod = async () => {
    if (!formName || !formPrice || !formEstimatedDays) {
      toast.error('Please fill in all required fields')
      return
    }

    const price = parseFloat(formPrice)
    const freeAbove = formFreeAbove ? parseFloat(formFreeAbove) : null

    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid price')
      return
    }

    setSaving(true)
    try {
      if (editingMethod) {
        setMethods(prev => prev.map(m =>
          m.id === editingMethod.id
            ? { ...m, name: formName, price, freeAbove, estimatedDays: formEstimatedDays, zones: formZones, weightBased: formWeightBased }
            : m
        ))
        toast.success(`${formName} updated successfully`)
      } else {
        const newMethod: ShippingMethod = {
          id: `sm-${Date.now()}`,
          name: formName,
          price,
          freeAbove,
          estimatedDays: formEstimatedDays,
          zones: formZones,
          active: true,
          weightBased: formWeightBased,
        }
        setMethods(prev => [...prev, newMethod])
        toast.success(`${formName} added successfully`)
      }
      setMethodDialogOpen(false)
    } catch {
      toast.error('Failed to save shipping method')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = (methodId: string) => {
    setMethods(prev => prev.map(m =>
      m.id === methodId ? { ...m, active: !m.active } : m
    ))
    const method = methods.find(m => m.id === methodId)
    toast.success(`${method?.name} ${method?.active ? 'disabled' : 'enabled'}`)
  }

  const handleDelete = () => {
    if (!deleteId) return
    const method = methods.find(m => m.id === deleteId)
    setMethods(prev => prev.filter(m => m.id !== deleteId))
    toast.success(`${method?.name || 'Method'} deleted`)
    setDeleteId(null)
  }

  const toggleZone = (zone: string) => {
    setFormZones(prev =>
      prev.includes(zone)
        ? prev.filter(z => z !== zone)
        : [...prev, zone]
    )
  }

  const methodIconColors: Record<string, string> = {
    'Free Shipping': 'from-emerald-500 to-teal-600',
    'Standard Shipping': 'from-blue-500 to-cyan-600',
    'Express Shipping': 'from-amber-500 to-orange-600',
    'Overnight Shipping': 'from-rose-500 to-pink-600',
  }

  const methodIconBgColors: Record<string, string> = {
    'Free Shipping': 'bg-emerald-100 text-emerald-600',
    'Standard Shipping': 'bg-blue-100 text-blue-600',
    'Express Shipping': 'bg-amber-100 text-amber-600',
    'Overnight Shipping': 'bg-rose-100 text-rose-600',
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
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Shipping & Delivery</h2>
              <p className="text-sm text-muted-foreground">Configure shipping methods and delivery options</p>
            </div>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={openCreateMethod}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Method
          </Button>
        </motion.div>
      </motion.div>

      {/* Shipping Methods */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Shipping Methods</h3>
          <Badge variant="outline" className="text-xs">
            {methods.filter(m => m.active).length} active
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {methods.map((method, i) => {
            const iconBg = methodIconBgColors[method.name] || 'bg-gray-100 text-gray-600'
            const gradient = methodIconColors[method.name] || 'from-gray-500 to-gray-600'
            return (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 ${!method.active ? 'opacity-60' : ''}`}>
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient}`} />
                  <CardContent className="p-5 pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{method.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{method.estimatedDays}</span>
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={method.active}
                        onCheckedChange={() => handleToggleActive(method.id)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-2.5 rounded-lg bg-muted/40">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Price</p>
                        <p className="text-sm font-bold">
                          {method.price === 0 ? (
                            <span className="text-emerald-600">Free</span>
                          ) : (
                            <>${method.price.toFixed(2)}</>
                          )}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-muted/40">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Free Above</p>
                        <p className="text-sm font-bold">
                          {method.freeAbove ? `$${method.freeAbove.toFixed(2)}` : <span className="text-muted-foreground">—</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {method.zones.map(zone => (
                        <Badge key={zone} variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                          <Globe className="h-2.5 w-2.5 mr-1" />
                          {zone}
                        </Badge>
                      ))}
                      {method.weightBased && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200">
                          <Weight className="h-2.5 w-2.5 mr-1" />
                          Weight-based
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => openEditMethod(method)}
                      >
                        <Edit className="h-3 w-3 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(method.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Shipping Zones */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Shipping Zones</h3>
          <Badge variant="outline" className="text-xs">
            {zones.length} zones
          </Badge>
        </div>
        <Card>
          <CardContent className="p-0">
            {/* Visual Map Placeholder */}
            <div className="relative h-40 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-teal-950/30 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Globe className="h-12 w-12 text-blue-300 dark:text-blue-700 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Interactive map coming soon</p>
                </div>
              </div>
              {/* Decorative dots */}
              {[
                { top: '30%', left: '25%', color: 'bg-emerald-400', delay: 0 },
                { top: '35%', left: '50%', color: 'bg-amber-400', delay: 0.2 },
                { top: '55%', left: '75%', color: 'bg-rose-400', delay: 0.4 },
              ].map((dot, i) => (
                <motion.div
                  key={i}
                  className={`absolute h-3 w-3 rounded-full ${dot.color} shadow-lg`}
                  style={{ top: dot.top, left: dot.left }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 2, delay: dot.delay }}
                />
              ))}
            </div>

            <Separator />

            {/* Zone List */}
            <div className="p-4 space-y-3">
              {zones.map((zone, i) => {
                const zoneColor = ['bg-emerald-500', 'bg-amber-500', 'bg-rose-500'][i] || 'bg-gray-400'
                return (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-8 w-8 rounded-lg ${zoneColor} flex items-center justify-center shrink-0`}>
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{zone.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                          {zone.countries.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {zone.activeMethods.length} methods
                      </Badge>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delivery Settings */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Delivery Settings</h3>
        </div>
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Same-day delivery */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Zap className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Same-Day Delivery</p>
                  <p className="text-xs text-muted-foreground">Offer same-day delivery for orders placed before cutoff</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {deliverySettings.sameDayDelivery && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Cutoff:</Label>
                    <Input
                      type="time"
                      value={deliverySettings.sameDayCutoff}
                      onChange={(e) => setDeliverySettings(prev => ({ ...prev, sameDayCutoff: e.target.value }))}
                      className="w-28 h-8 text-xs"
                    />
                  </div>
                )}
                <Switch
                  checked={deliverySettings.sameDayDelivery}
                  onCheckedChange={(checked) => setDeliverySettings(prev => ({ ...prev, sameDayDelivery: checked }))}
                />
              </div>
            </div>

            <Separator />

            {/* Saturday delivery */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Saturday Delivery</p>
                  <p className="text-xs text-muted-foreground">Allow deliveries on Saturdays for express and overnight</p>
                </div>
              </div>
              <Switch
                checked={deliverySettings.saturdayDelivery}
                onCheckedChange={(checked) => setDeliverySettings(prev => ({ ...prev, saturdayDelivery: checked }))}
              />
            </div>

            <Separator />

            {/* Signature required */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-9 w-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Signature Required (Default)</p>
                  <p className="text-xs text-muted-foreground">Require signature confirmation for all shipments by default</p>
                </div>
              </div>
              <Switch
                checked={deliverySettings.signatureRequired}
                onCheckedChange={(checked) => {
                  setDeliverySettings(prev => ({ ...prev, signatureRequired: checked }))
                  toast.success(checked ? 'Signature requirement enabled' : 'Signature requirement disabled')
                }}
              />
            </div>

            <Separator />

            {/* Insurance */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Shipping Insurance</p>
                  <p className="text-xs text-muted-foreground">Automatically insure packages above a threshold value</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {deliverySettings.insuranceEnabled && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Above $</Label>
                    <Input
                      type="number"
                      value={deliverySettings.insuranceThreshold}
                      onChange={(e) => setDeliverySettings(prev => ({ ...prev, insuranceThreshold: parseFloat(e.target.value) || 0 }))}
                      className="w-24 h-8 text-xs"
                      min="0"
                    />
                  </div>
                )}
                <Switch
                  checked={deliverySettings.insuranceEnabled}
                  onCheckedChange={(checked) => {
                    setDeliverySettings(prev => ({ ...prev, insuranceEnabled: checked }))
                    toast.success(checked ? 'Shipping insurance enabled' : 'Shipping insurance disabled')
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add/Edit Method Dialog */}
      <Dialog open={methodDialogOpen} onOpenChange={setMethodDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-500" />
              {editingMethod ? 'Edit Shipping Method' : 'Add Shipping Method'}
            </DialogTitle>
            <DialogDescription>
              {editingMethod ? 'Update shipping method details' : 'Create a new shipping method for your store'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Method Name *</Label>
              <Input
                placeholder="e.g. Express Shipping"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Free Above</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Optional"
                    value={formFreeAbove}
                    onChange={(e) => setFormFreeAbove(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Leave blank for no free threshold</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estimated Delivery *</Label>
              <Input
                placeholder="e.g. 2-3 days"
                value={formEstimatedDays}
                onChange={(e) => setFormEstimatedDays(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Shipping Zones</Label>
              <div className="grid grid-cols-2 gap-2">
                {zoneOptions.map(zone => (
                  <label
                    key={zone.value}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                      formZones.includes(zone.value)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-muted hover:border-muted-foreground/30'
                    }`}
                  >
                    <Checkbox
                      checked={formZones.includes(zone.value)}
                      onCheckedChange={() => toggleZone(zone.value)}
                    />
                    <span className="text-sm">{zone.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <div>
                <Label className="text-sm font-medium">Weight-Based Pricing</Label>
                <p className="text-xs text-muted-foreground">Calculate shipping cost based on package weight</p>
              </div>
              <Switch
                checked={formWeightBased}
                onCheckedChange={setFormWeightBased}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMethodDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMethod} disabled={saving} className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
              {saving ? 'Saving...' : editingMethod ? 'Save Changes' : 'Add Method'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shipping Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shipping method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
