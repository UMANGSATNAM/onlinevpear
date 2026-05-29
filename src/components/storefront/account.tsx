'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  CreditCard,
  Plus,
  Trash2,
  Edit3,
  Star,
  Bell,
  ShoppingBag,
  Gift,
  Share2,
  Home,
  Phone,
  Globe,
  Check,
  AlertCircle,
  Loader2,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useAppStore } from '@/lib/store'
import { formatPrice } from '@/components/storefront/product-grid'
import { toast } from 'sonner'

type AccountTab = 'profile' | 'orders' | 'addresses' | 'wishlist' | 'payments'

// --- Mock Data ---

const mockOrders = [
  { id: '1', number: 'SF-10001', date: '2025-01-15', total: 149.99, status: 'delivered', items: 3, thumbnail: 'from-rose-400 to-orange-300', itemName: 'Wireless Headphones' },
  { id: '2', number: 'SF-10002', date: '2025-02-20', total: 89.50, status: 'shipped', items: 1, thumbnail: 'from-emerald-400 to-teal-300', itemName: 'Smart Watch' },
  { id: '3', number: 'SF-10003', date: '2025-03-01', total: 234.00, status: 'processing', items: 4, thumbnail: 'from-violet-400 to-purple-300', itemName: 'Bluetooth Speaker' },
  { id: '4', number: 'SF-10004', date: '2025-03-10', total: 59.99, status: 'cancelled', items: 1, thumbnail: 'from-amber-400 to-yellow-300', itemName: 'Phone Case' },
  { id: '5', number: 'SF-10005', date: '2025-03-12', total: 319.00, status: 'processing', items: 2, thumbnail: 'from-sky-400 to-cyan-300', itemName: 'Mechanical Keyboard' },
]

const mockWishlist = [
  { id: '1', name: 'Premium Wireless Headphones', price: 129.99, gradient: 'from-rose-400 to-orange-300', rating: 4.5 },
  { id: '2', name: 'Organic Cotton T-Shirt', price: 39.99, gradient: 'from-emerald-400 to-teal-300', rating: 4.2 },
  { id: '3', name: 'Smart Fitness Tracker', price: 89.99, gradient: 'from-violet-400 to-purple-300', rating: 4.8 },
  { id: '4', name: 'Leather Messenger Bag', price: 149.00, gradient: 'from-amber-400 to-yellow-300', rating: 4.6 },
  { id: '5', name: 'Running Shoes Pro', price: 119.99, gradient: 'from-sky-400 to-cyan-300', rating: 4.3 },
  { id: '6', name: 'Ceramic Coffee Mug Set', price: 34.99, gradient: 'from-rose-300 to-pink-300', rating: 4.9 },
]

const mockAddresses = [
  { id: '1', name: 'John Doe', line1: '123 Main St', line2: 'Apt 4B', city: 'New York', state: 'NY', zip: '10001', country: 'United States', phone: '+1 (555) 123-4567', isDefaultShipping: true, isDefaultBilling: true },
  { id: '2', name: 'John Doe', line1: '456 Oak Ave', line2: '', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'United States', phone: '+1 (555) 987-6543', isDefaultShipping: false, isDefaultBilling: false },
]

const mockPaymentMethods = [
  { id: '1', brand: 'visa', last4: '4242', expiry: '12/26', isDefault: true },
  { id: '2', brand: 'mastercard', last4: '8888', expiry: '08/25', isDefault: false },
]

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode; step: number }> = {
  delivered: { label: 'Delivered', color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: <CheckCircle className="h-4 w-4 text-emerald-500" />, step: 4 },
  shipped: { label: 'Shipped', color: 'text-sky-700', bgColor: 'bg-sky-100', icon: <Truck className="h-4 w-4 text-sky-500" />, step: 3 },
  processing: { label: 'Processing', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: <Clock className="h-4 w-4 text-amber-500" />, step: 2 },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100', icon: <XCircle className="h-4 w-4 text-red-500" />, step: -1 },
  pending: { label: 'Pending', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: <Clock className="h-4 w-4 text-gray-400" />, step: 1 },
}

const trackingSteps = ['Order Placed', 'Processing', 'Shipped', 'Delivered']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

// --- Component ---

export function AccountPage() {
  const { setStorefrontPage, setSelectedProductId } = useAppStore()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginTab, setLoginTab] = useState<'login' | 'register'>('login')
  const [activeTab, setActiveTab] = useState<AccountTab>('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  // Profile form
  const [profileName, setProfileName] = useState('John Doe')
  const [profileEmail, setProfileEmail] = useState('john@example.com')
  const [profilePhone, setProfilePhone] = useState('+1 (555) 123-4567')

  // Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Notifications
  const [notifOrderUpdates, setNotifOrderUpdates] = useState(true)
  const [notifPromotions, setNotifPromotions] = useState(false)
  const [notifNewsletter, setNotifNewsletter] = useState(true)

  // Orders filter
  const [orderFilter, setOrderFilter] = useState('all')

  // Address dialog
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<typeof mockAddresses[0] | null>(null)
  const [addressForm, setAddressForm] = useState({ name: '', line1: '', line2: '', city: '', state: '', zip: '', country: 'US', phone: '' })

  // Payment delete dialog
  const [deletePaymentOpen, setDeletePaymentOpen] = useState(false)
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields')
      return
    }
    setIsLoggedIn(true)
    toast.success('Welcome back!')
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName || !regEmail || !regPassword) {
      toast.error('Please fill in all fields')
      return
    }
    setIsLoggedIn(true)
    toast.success('Account created successfully!')
  }

  const handleSaveProfile = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Profile updated successfully')
    }, 800)
  }

  const handleChangePassword = () => {
    setPasswordError('')
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordError('')
      toast.success('Password updated successfully')
    }, 800)
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    setAddressForm({ name: '', line1: '', line2: '', city: '', state: '', zip: '', country: 'US', phone: '' })
    setAddressDialogOpen(true)
  }

  const handleEditAddress = (addr: typeof mockAddresses[0]) => {
    setEditingAddress(addr)
    setAddressForm({ name: addr.name, line1: addr.line1, line2: addr.line2, city: addr.city, state: addr.state, zip: addr.zip, country: 'US', phone: addr.phone })
    setAddressDialogOpen(true)
  }

  const handleSaveAddress = () => {
    if (!addressForm.name || !addressForm.line1 || !addressForm.city || !addressForm.zip) {
      toast.error('Please fill in all required fields')
      return
    }
    setAddressDialogOpen(false)
    toast.success(editingAddress ? 'Address updated' : 'Address added')
  }

  // Filtered orders
  const filteredOrders = orderFilter === 'all' ? mockOrders : mockOrders.filter(o => o.status === orderFilter)

  // --- Login / Register View ---
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-400 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg">
              <User className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Welcome</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your account or create a new one</p>
          </div>

          <Card className="p-6 shadow-md">
            <Tabs value={loginTab} onValueChange={(v) => setLoginTab(v as 'login' | 'register')}>
              <TabsList className="w-full mb-6">
                <TabsTrigger value="login" className="flex-1">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="flex-1">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="loginEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="loginEmail"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="loginPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="loginPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="remember" className="rounded" />
                      <Label htmlFor="remember" className="text-xs cursor-pointer">Remember me</Label>
                    </div>
                    <Button variant="link" size="sm" className="text-xs p-0 h-auto text-rose-500">
                      Forgot password?
                    </Button>
                  </div>
                  <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600">
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="regName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="regName"
                        type="text"
                        placeholder="John Doe"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="regEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="regEmail"
                        type="email"
                        placeholder="you@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="regPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="regPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600">
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    )
  }

  // --- Logged In Dashboard ---
  const tabItems: Array<{ id: AccountTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'orders', label: 'Orders', icon: <Package className="h-4 w-4" />, badge: mockOrders.length },
    { id: 'addresses', label: 'Addresses', icon: <MapPin className="h-4 w-4" /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart className="h-4 w-4" />, badge: mockWishlist.length },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Profile Header with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl mb-8"
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative px-6 py-8 sm:px-8 sm:py-10 flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white ring-4 ring-white/30 shrink-0">
            {profileName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-white">{profileName}</h1>
            <p className="text-white/80 text-sm mt-0.5">{profileEmail}</p>
            <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start">
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                <Star className="h-3 w-3 mr-1" /> Gold Member
              </Badge>
              <span className="text-white/60 text-xs">Member since Jan 2024</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
            onClick={() => {
              setIsLoggedIn(false)
              toast.success('Logged out')
            }}
          >
            Sign Out
          </Button>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide border-b">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-rose-600'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && (
                <span className={`h-5 min-w-5 flex items-center justify-center px-1.5 rounded-full text-[10px] font-semibold ${
                  activeTab === tab.id ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ============ PROFILE TAB ============ */}
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            variants={containerVariants}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Information */}
              <motion.div variants={itemVariants}>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-9 w-9 rounded-lg bg-rose-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Profile Information</h3>
                      <p className="text-xs text-muted-foreground">Update your personal details</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="profileName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="profileName" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="pl-10" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="profileEmail">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="profileEmail" type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="pl-10" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="profilePhone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="profilePhone" type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="pl-10" />
                      </div>
                    </div>
                  </div>
                  <Button className="mt-6 bg-rose-500 hover:bg-rose-600 w-full sm:w-auto" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </Card>
              </motion.div>

              {/* Change Password */}
              <motion.div variants={itemVariants}>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Change Password</h3>
                      <p className="text-xs text-muted-foreground">Ensure your account stays secure</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError('') }} className="pl-10" placeholder="Enter current password" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="newPassword" type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setPasswordError('') }} className="pl-10" placeholder="Enter new password" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError('') }} className="pl-10" placeholder="Confirm new password" />
                      </div>
                    </div>
                    {passwordError && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {passwordError}
                      </motion.div>
                    )}
                  </div>
                  <Button className="mt-6 w-full sm:w-auto" variant="outline" onClick={handleChangePassword} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Password
                  </Button>
                </Card>
              </motion.div>

              {/* Notification Preferences */}
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-9 w-9 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Email Notification Preferences</h3>
                      <p className="text-xs text-muted-foreground">Choose what emails you receive</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Package className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Order Updates</p>
                          <p className="text-xs text-muted-foreground">Shipping notifications, delivery updates, and order confirmations</p>
                        </div>
                      </div>
                      <Switch checked={notifOrderUpdates} onCheckedChange={setNotifOrderUpdates} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Gift className="h-4 w-4 text-rose-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Promotions & Deals</p>
                          <p className="text-xs text-muted-foreground">Sales, special offers, and limited-time discounts</p>
                        </div>
                      </div>
                      <Switch checked={notifPromotions} onCheckedChange={setNotifPromotions} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-sky-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Mail className="h-4 w-4 text-sky-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Newsletter</p>
                          <p className="text-xs text-muted-foreground">New arrivals, style guides, and product stories</p>
                        </div>
                      </div>
                      <Switch checked={notifNewsletter} onCheckedChange={setNotifNewsletter} />
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Danger Zone */}
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <Card className="p-6 border-red-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-600">Danger Zone</h3>
                      <p className="text-xs text-muted-foreground">Irreversible actions</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. All data will be permanently removed.
                  </p>
                  <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                    Delete Account
                  </Button>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ============ ORDERS TAB ============ */}
        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {/* Filter */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setOrderFilter(filter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                    orderFilter === filter
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
              <span className="text-xs text-muted-foreground ml-2">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
              </span>
            </div>

            {/* Order Cards */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No orders found</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {orderFilter !== 'all' ? `You don't have any ${orderFilter} orders` : "You haven't placed any orders yet"}
                </p>
                <Button onClick={() => setStorefrontPage('category')} className="bg-rose-500 hover:bg-rose-600">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Start Shopping
                </Button>
              </div>
            ) : (
              <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                {filteredOrders.map((order) => {
                  const config = statusConfig[order.status] || statusConfig.pending
                  const currentStep = config.step
                  return (
                    <motion.div key={order.id} variants={itemVariants}>
                      <Card className="overflow-hidden hover:shadow-md transition-shadow">
                        {/* Gradient accent bar */}
                        <div className={`h-1 ${
                          order.status === 'delivered' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                          order.status === 'shipped' ? 'bg-gradient-to-r from-sky-400 to-blue-500' :
                          order.status === 'processing' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                          order.status === 'cancelled' ? 'bg-gradient-to-r from-red-400 to-rose-500' :
                          'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`} />
                        <div className="p-5 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            {/* Thumbnail */}
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${order.thumbnail} flex items-center justify-center shrink-0`}>
                              <span className="text-white/40 text-xs font-bold">{order.itemName[0]}</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                                <span className="font-semibold">{order.number}</span>
                                <Badge className={`${config.bgColor} ${config.color} text-xs w-fit`}>
                                  <span className="flex items-center gap-1">{config.icon}{config.label}</span>
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                {' '} &middot; {order.items} {order.items === 1 ? 'item' : 'items'}
                              </p>

                              {/* Status Tracking Progress Bar (not for cancelled) */}
                              {order.status !== 'cancelled' && (
                                <div className="mt-4">
                                  <div className="flex items-center justify-between mb-2">
                                    {trackingSteps.map((step, i) => (
                                      <div key={step} className="flex items-center">
                                        <div className="flex flex-col items-center">
                                          <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                                            i < currentStep
                                              ? 'bg-emerald-500 text-white'
                                              : i === currentStep
                                              ? 'bg-amber-500 text-white ring-2 ring-amber-200'
                                              : 'bg-gray-200 text-gray-400'
                                          }`}>
                                            {i < currentStep ? <Check className="h-3 w-3" /> : i + 1}
                                          </div>
                                          <span className={`text-[10px] mt-1 hidden sm:block ${i <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                            {step}
                                          </span>
                                        </div>
                                        {i < trackingSteps.length - 1 && (
                                          <div className={`w-6 sm:w-12 h-0.5 mx-1 ${i < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Price & Actions */}
                            <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0">
                              <span className="text-lg font-bold">{formatPrice(order.total)}</span>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="text-xs">View Details</Button>
                                {order.status === 'shipped' && (
                                  <Button size="sm" className="text-xs bg-sky-500 hover:bg-sky-600">
                                    <Truck className="mr-1 h-3 w-3" /> Track
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ============ ADDRESSES TAB ============ */}
        {activeTab === 'addresses' && (
          <motion.div
            key="addresses"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Saved Addresses</h2>
              <Button size="sm" className="bg-rose-500 hover:bg-rose-600" onClick={handleAddAddress}>
                <Plus className="mr-2 h-4 w-4" /> Add Address
              </Button>
            </div>

            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={containerVariants} initial="hidden" animate="visible">
              {mockAddresses.map((addr) => (
                <motion.div key={addr.id} variants={itemVariants}>
                  <Card className="p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                    {/* Default indicator */}
                    {(addr.isDefaultShipping || addr.isDefaultBilling) && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-rose-500 text-white text-[9px] font-semibold px-2 py-0.5 rounded-bl-lg">
                          {addr.isDefaultShipping && addr.isDefaultBilling ? 'Default' : addr.isDefaultShipping ? 'Shipping' : 'Billing'}
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-9 w-9 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                        <Home className="h-5 w-5 text-rose-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{addr.name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{addr.line1}</p>
                        {addr.line2 && <p className="text-sm text-muted-foreground">{addr.line2}</p>}
                        <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zip}</p>
                        <p className="text-sm text-muted-foreground">{addr.country}</p>
                        {addr.phone && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {addr.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleEditAddress(addr)}>
                        <Edit3 className="mr-1 h-3 w-3" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {/* Add New Address Card */}
              <motion.div variants={itemVariants}>
                <Card
                  className="p-5 border-dashed border-2 hover:border-rose-300 hover:bg-rose-50/30 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
                  onClick={handleAddAddress}
                >
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Add New Address</span>
                </Card>
              </motion.div>
            </motion.div>

            {/* Address Dialog */}
            <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div>
                    <Label>Address Line 1 *</Label>
                    <Input value={addressForm.line1} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} placeholder="123 Main St" />
                  </div>
                  <div>
                    <Label>Address Line 2</Label>
                    <Input value={addressForm.line2} onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })} placeholder="Apt 4B" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>City *</Label>
                      <Input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="New York" />
                    </div>
                    <div>
                      <Label>State *</Label>
                      <Input value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} placeholder="NY" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>ZIP Code *</Label>
                      <Input value={addressForm.zip} onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })} placeholder="10001" />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Select value={addressForm.country} onValueChange={(v) => setAddressForm({ ...addressForm, country: v })}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button className="bg-rose-500 hover:bg-rose-600" onClick={handleSaveAddress}>
                    {editingAddress ? 'Save Changes' : 'Add Address'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}

        {/* ============ WISHLIST TAB ============ */}
        {activeTab === 'wishlist' && (
          <motion.div
            key="wishlist"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">My Wishlist</h2>
                <p className="text-sm text-muted-foreground">{mockWishlist.length} items saved</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStorefrontPage('wishlist')}>
                View Full Wishlist <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" variants={containerVariants} initial="hidden" animate="visible">
              {mockWishlist.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                    <div className={`aspect-square bg-gradient-to-br ${item.gradient} relative flex items-center justify-center`}>
                      <span className="text-white/30 text-3xl font-bold">{item.name[0]}</span>
                      {/* Wishlist heart */}
                      <button className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </button>
                      {/* Quick Add on Hover */}
                      <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" className="w-full bg-rose-500 hover:bg-rose-600 text-xs h-8">
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3
                        className="font-medium text-sm line-clamp-1 cursor-pointer hover:text-rose-500 transition-colors"
                        onClick={() => {
                          setSelectedProductId(item.id)
                          setStorefrontPage('product')
                        }}
                      >
                        {item.name}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-semibold text-rose-500">{formatPrice(item.price)}</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-muted-foreground">{item.rating}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* ============ PAYMENTS TAB ============ */}
        {activeTab === 'payments' && (
          <motion.div
            key="payments"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Payment Methods</h2>
              <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
                <Plus className="mr-2 h-4 w-4" /> Add Payment Method
              </Button>
            </div>

            <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
              {mockPaymentMethods.map((pm) => {
                const brandConfig: Record<string, { label: string; gradient: string; icon: React.ReactNode }> = {
                  visa: { label: 'VISA', gradient: 'from-blue-700 to-blue-900', icon: <CreditCard className="h-5 w-5 text-white" /> },
                  mastercard: { label: 'MC', gradient: 'from-red-500 to-orange-600', icon: <CreditCard className="h-5 w-5 text-white" /> },
                  amex: { label: 'AMEX', gradient: 'from-blue-400 to-blue-600', icon: <CreditCard className="h-5 w-5 text-white" /> },
                }
                const brand = brandConfig[pm.brand] || brandConfig.visa
                return (
                  <motion.div key={pm.id} variants={itemVariants}>
                    <Card className="p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        {/* Card Brand */}
                        <div className={`h-12 w-18 rounded-lg bg-gradient-to-br ${brand.gradient} flex items-center justify-center min-w-[4.5rem]`}>
                          <span className="text-white text-sm font-bold">{brand.label}</span>
                        </div>

                        {/* Card Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">•••• •••• •••• {pm.last4}</span>
                            {pm.isDefault && (
                              <Badge className="bg-rose-100 text-rose-600 text-[10px] border-0">Default</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Expires {pm.expiry}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!pm.isDefault && (
                            <Button variant="ghost" size="sm" className="text-xs">
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50"
                            onClick={() => {
                              setDeletingPaymentId(pm.id)
                              setDeletePaymentOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}

              {/* Add Payment Method Card */}
              <motion.div variants={itemVariants}>
                <Card className="p-5 border-dashed border-2 hover:border-rose-300 hover:bg-rose-50/30 transition-all cursor-pointer">
                  <div className="flex items-center justify-center gap-3 py-4">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Add a new payment method</span>
                  </div>
                </Card>
              </motion.div>
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deletePaymentOpen} onOpenChange={setDeletePaymentOpen}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    Remove Payment Method
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground py-2">
                  Are you sure you want to remove this payment method? This action cannot be undone.
                </p>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    variant="outline"
                    className="text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      setDeletePaymentOpen(false)
                      setDeletingPaymentId(null)
                      toast.success('Payment method removed')
                    }}
                  >
                    Remove
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
