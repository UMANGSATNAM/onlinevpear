'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
import { useAppStore } from '@/lib/store'
import { formatPrice } from '@/components/storefront/product-grid'
import { toast } from 'sonner'

type AccountTab = 'orders' | 'wishlist' | 'addresses' | 'settings'

// Mock data for demonstration (will use real data in production)
const mockOrders = [
  { id: '1', number: 'SF-10001', date: '2024-01-15', total: 149.99, status: 'delivered', items: 3 },
  { id: '2', number: 'SF-10002', date: '2024-01-20', total: 89.50, status: 'shipped', items: 1 },
  { id: '3', number: 'SF-10003', date: '2024-02-01', total: 234.00, status: 'processing', items: 4 },
]

const mockWishlist = [
  { id: '1', name: 'Premium Wireless Headphones', price: 129.99, gradient: 'from-rose-400 to-orange-300' },
  { id: '2', name: 'Organic Cotton T-Shirt', price: 39.99, gradient: 'from-emerald-400 to-teal-300' },
  { id: '3', name: 'Smart Fitness Tracker', price: 89.99, gradient: 'from-violet-400 to-purple-300' },
]

const mockAddresses = [
  { id: '1', name: 'John Doe', address: '123 Main St, Apt 4B', city: 'New York, NY 10001', country: 'United States', isDefault: true },
  { id: '2', name: 'John Doe', address: '456 Oak Ave', city: 'Los Angeles, CA 90001', country: 'United States', isDefault: false },
]

const statusIcons: Record<string, React.ReactNode> = {
  delivered: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  shipped: <Truck className="h-4 w-4 text-sky-500" />,
  processing: <Clock className="h-4 w-4 text-amber-500" />,
  cancelled: <XCircle className="h-4 w-4 text-red-500" />,
  pending: <Clock className="h-4 w-4 text-gray-400" />,
}

const statusLabels: Record<string, string> = {
  delivered: 'Delivered',
  shipped: 'Shipped',
  processing: 'Processing',
  cancelled: 'Cancelled',
  pending: 'Pending',
}

export function AccountPage() {
  const { setStorefrontPage, setSelectedProductId } = useAppStore()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginTab, setLoginTab] = useState<'login' | 'register'>('login')
  const [activeTab, setActiveTab] = useState<AccountTab>('orders')
  const [showPassword, setShowPassword] = useState(false)

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  // Settings
  const [emailNotif, setEmailNotif] = useState(true)
  const [smsNotif, setSmsNotif] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields')
      return
    }
    // In a real app, this would call the auth API
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

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
            <User className="h-8 w-8 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your account or create a new one</p>
        </div>

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
                <Button variant="link" size="sm" className="text-xs p-0 h-auto">
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
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-rose-100 text-rose-600 text-xl font-bold">
            JD
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">John Doe</h1>
          <p className="text-muted-foreground text-sm">john@example.com</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => {
            setIsLoggedIn(false)
            toast.success('Logged out')
          }}
        >
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <nav className="lg:col-span-1">
          <div className="space-y-1">
            {[
              { id: 'orders' as AccountTab, label: 'Order History', icon: <Package className="h-4 w-4" /> },
              { id: 'wishlist' as AccountTab, label: 'Wishlist', icon: <Heart className="h-4 w-4" /> },
              { id: 'addresses' as AccountTab, label: 'Addresses', icon: <MapPin className="h-4 w-4" /> },
              { id: 'settings' as AccountTab, label: 'Settings', icon: <Settings className="h-4 w-4" /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                }`}
              >
                {item.icon}
                {item.label}
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Orders */}
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xl font-bold mb-6">Order History</h2>
              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <Card key={order.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold">{order.number}</span>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                              order.status === 'shipped' ? 'bg-sky-100 text-sky-700' :
                              order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              {statusIcons[order.status]}
                              {statusLabels[order.status]}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                          {' '} &middot; {order.items} {order.items === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{formatPrice(order.total)}</span>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Wishlist */}
          {activeTab === 'wishlist' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xl font-bold mb-6">My Wishlist</h2>
              {mockWishlist.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Your wishlist is empty</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setStorefrontPage('category')}
                  >
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockWishlist.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0`}>
                          <span className="text-white/40 text-sm font-bold">
                            {item.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-semibold text-sm cursor-pointer hover:text-rose-500 transition-colors line-clamp-1"
                            onClick={() => {
                              setSelectedProductId(item.id)
                              setStorefrontPage('product')
                            }}
                          >
                            {item.name}
                          </h3>
                          <p className="text-sm font-medium text-rose-500 mt-0.5">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
                            Add to Cart
                          </Button>
                          <Button variant="outline" size="icon" className="h-9 w-9">
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Addresses */}
          {activeTab === 'addresses' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Saved Addresses</h2>
                <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
                  <MapPin className="mr-2 h-4 w-4" />
                  Add Address
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockAddresses.map((addr) => (
                  <Card key={addr.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{addr.name}</h3>
                          {addr.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{addr.address}</p>
                        <p className="text-sm text-muted-foreground">{addr.city}</p>
                        <p className="text-sm text-muted-foreground">{addr.country}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xl font-bold mb-6">Account Settings</h2>
              <div className="space-y-6">
                {/* Profile */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="settingsName">Full Name</Label>
                      <Input id="settingsName" defaultValue="John Doe" />
                    </div>
                    <div>
                      <Label htmlFor="settingsEmail">Email</Label>
                      <Input id="settingsEmail" type="email" defaultValue="john@example.com" />
                    </div>
                    <div>
                      <Label htmlFor="settingsPhone">Phone</Label>
                      <Input id="settingsPhone" type="tel" placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                  <Button className="mt-4 bg-rose-500 hover:bg-rose-600" size="sm">
                    Save Changes
                  </Button>
                </Card>

                {/* Password */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Change Password</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                  </div>
                  <Button className="mt-4" variant="outline" size="sm">
                    Update Password
                  </Button>
                </Card>

                {/* Notifications */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Email Notifications</p>
                        <p className="text-xs text-muted-foreground">Receive order updates and promotions via email</p>
                      </div>
                      <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">SMS Notifications</p>
                        <p className="text-xs text-muted-foreground">Receive shipping updates via text message</p>
                      </div>
                      <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
                    </div>
                  </div>
                </Card>

                {/* Delete Account */}
                <Card className="p-6 border-red-200">
                  <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                    Delete Account
                  </Button>
                </Card>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
