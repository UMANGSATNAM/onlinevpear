'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, type DashboardPage, type AdminPage, type StorefrontPage } from '@/lib/store'
import { OverviewDashboard } from '@/components/dashboard/overview'
import { ProductsManagement } from '@/components/dashboard/products'
import { ProductForm } from '@/components/dashboard/product-form'
import { OrdersManagement } from '@/components/dashboard/orders'
import { OrderDetail } from '@/components/dashboard/order-detail'
import { CustomersManagement } from '@/components/dashboard/customers'
import { AnalyticsDashboard } from '@/components/dashboard/analytics'
import { DiscountsManagement } from '@/components/dashboard/discounts'
import { InventoryManagement } from '@/components/dashboard/inventory'
import { AiAssistant } from '@/components/dashboard/ai-assistant'
import { WorkflowsManagement } from '@/components/dashboard/workflows'
import { AppsMarketplace } from '@/components/dashboard/apps'
import { BillingSubscription } from '@/components/dashboard/billing'
import { StoreSettings } from '@/components/dashboard/store-settings'
import { CategoriesManagement } from '@/components/dashboard/categories'
import { MarketingAutomation } from '@/components/dashboard/marketing'
import { StaffManagement } from '@/components/dashboard/staff'
import { ThemeCustomization } from '@/components/dashboard/themes'
import { AdminOverview } from '@/components/admin/overview'
import { MerchantManagement } from '@/components/admin/merchants'
import { RevenueMonitoring } from '@/components/admin/revenue'
import { PlanControl } from '@/components/admin/plans'
import { InfrastructureMonitoring } from '@/components/admin/infrastructure'
import { AiMonitoring } from '@/components/admin/ai-monitoring'
import { FeatureFlags } from '@/components/admin/feature-flags'
import { AuditLogs } from '@/components/admin/audit-logs'
import { SecurityCenter } from '@/components/admin/security'
import { StoreLayout } from '@/components/storefront/store-layout'
import { StorefrontHome } from '@/components/storefront/home'
import { ProductDetail } from '@/components/storefront/product-detail'
import { ShoppingCartPage } from '@/components/storefront/cart'
import { CheckoutPage } from '@/components/storefront/checkout'
import { SearchPage } from '@/components/storefront/search'
import { CategoryPage } from '@/components/storefront/category'
import { BlogPage } from '@/components/storefront/blog'
import { AccountPage } from '@/components/storefront/account'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Tags,
  Warehouse,
  Bot,
  GitBranch,
  Grid3X3,
  CreditCard,
  Settings,
  Menu,
  X,
  Store,
  Shield,
  DollarSign,
  Crown,
  Server,
  Cpu,
  Flag,
  FileText,
  Lock,
  ExternalLink,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Zap,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  FolderTree,
  Megaphone,
  UsersRound,
  Palette,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/sonner'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// Navigation config
const dashboardNavItems: Array<{ page: DashboardPage; label: string; icon: React.ReactNode; group?: string }> = [
  { page: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" />, group: 'Main' },
  { page: 'products', label: 'Products', icon: <Package className="h-4 w-4" />, group: 'Main' },
  { page: 'orders', label: 'Orders', icon: <ShoppingCart className="h-4 w-4" />, group: 'Main' },
  { page: 'customers', label: 'Customers', icon: <Users className="h-4 w-4" />, group: 'Main' },
  { page: 'categories', label: 'Categories', icon: <FolderTree className="h-4 w-4" />, group: 'Main' },
  { page: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, group: 'Insights' },
  { page: 'discounts', label: 'Discounts', icon: <Tags className="h-4 w-4" />, group: 'Insights' },
  { page: 'inventory', label: 'Inventory', icon: <Warehouse className="h-4 w-4" />, group: 'Insights' },
  { page: 'marketing', label: 'Marketing', icon: <Megaphone className="h-4 w-4" />, group: 'Insights' },
  { page: 'themes', label: 'Themes', icon: <Palette className="h-4 w-4" />, group: 'Customize' },
  { page: 'ai-assistant', label: 'AI Assistant', icon: <Bot className="h-4 w-4" />, group: 'Tools' },
  { page: 'workflows', label: 'Workflows', icon: <GitBranch className="h-4 w-4" />, group: 'Tools' },
  { page: 'apps', label: 'Apps', icon: <Grid3X3 className="h-4 w-4" />, group: 'Tools' },
  { page: 'staff', label: 'Staff', icon: <UsersRound className="h-4 w-4" />, group: 'Settings' },
  { page: 'billing', label: 'Billing', icon: <CreditCard className="h-4 w-4" />, group: 'Settings' },
  { page: 'store-settings', label: 'Store Settings', icon: <Settings className="h-4 w-4" />, group: 'Settings' },
]

const adminNavItems: Array<{ page: AdminPage; label: string; icon: React.ReactNode; group?: string }> = [
  { page: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" />, group: 'Platform' },
  { page: 'merchants', label: 'Merchants', icon: <Store className="h-4 w-4" />, group: 'Platform' },
  { page: 'revenue', label: 'Revenue', icon: <DollarSign className="h-4 w-4" />, group: 'Platform' },
  { page: 'plans', label: 'Plans', icon: <Crown className="h-4 w-4" />, group: 'Platform' },
  { page: 'infrastructure', label: 'Infrastructure', icon: <Server className="h-4 w-4" />, group: 'Monitoring' },
  { page: 'ai-monitoring', label: 'AI Monitoring', icon: <Cpu className="h-4 w-4" />, group: 'Monitoring' },
  { page: 'feature-flags', label: 'Feature Flags', icon: <Flag className="h-4 w-4" />, group: 'Control' },
  { page: 'audit-logs', label: 'Audit Logs', icon: <FileText className="h-4 w-4" />, group: 'Control' },
  { page: 'security', label: 'Security', icon: <Lock className="h-4 w-4" />, group: 'Control' },
]

// Login Screen Component
function LoginScreen() {
  const { setIsAuthenticated, setCurrentUser, setSelectedMerchantId, setSelectedStoreId, setCurrentView } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginMode, setLoginMode] = useState<'merchant' | 'admin'>('merchant')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Invalid credentials')
        return
      }

      setIsAuthenticated(true)
      setCurrentUser(data.user)

      if (data.user.role === 'super_admin') {
        setCurrentView('admin')
      } else if (data.merchants?.length > 0) {
        setSelectedMerchantId(data.merchants[0].id)
        // Load store for merchant
        try {
          const storeRes = await fetch(`/api/merchants/${data.merchants[0].id}`)
          const storeData = await storeRes.json()
          if (storeData.merchant?.stores?.length > 0) {
            setSelectedStoreId(storeData.merchant.stores[0].id)
            sessionStorage.setItem('shopforge_store_id', storeData.merchant.stores[0].id)
          }
        } catch {
          // ignore
        }
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (mode: 'merchant' | 'admin') => {
    setLoading(true)
    setError('')
    try {
      const creds = mode === 'admin'
        ? { email: 'admin@shopforge.io', password: 'admin123' }
        : { email: 'merchant@example.com', password: 'merchant123' }

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Login failed')
        return
      }

      setIsAuthenticated(true)
      setCurrentUser(data.user)

      if (data.user.role === 'super_admin') {
        setCurrentView('admin')
      } else if (data.merchants?.length > 0) {
        setSelectedMerchantId(data.merchants[0].id)
        const storeRes = await fetch(`/api/merchants/${data.merchants[0].id}`)
        const storeData = await storeRes.json()
        if (storeData.merchant?.stores?.length > 0) {
          setSelectedStoreId(storeData.merchant.stores[0].id)
          sessionStorage.setItem('shopforge_store_id', storeData.merchant.stores[0].id)
        }
      }
    } catch {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rose-500/3 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary shadow-lg shadow-primary/25 mb-4"
          >
            <Store className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight">ShopForge</h1>
          <p className="text-muted-foreground mt-2">AI-Powered Ecommerce Platform</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl shadow-black/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
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

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.div>
              )}

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Quick Access</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-1.5"
                onClick={() => handleQuickLogin('merchant')}
                disabled={loading}
              >
                <Store className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">Merchant</span>
                <span className="text-[10px] text-muted-foreground">merchant@example.com</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-1.5"
                onClick={() => handleQuickLogin('admin')}
                disabled={loading}
              >
                <Shield className="h-5 w-5 text-rose-600" />
                <span className="text-xs font-medium">Super Admin</span>
                <span className="text-[10px] text-muted-foreground">admin@shopforge.io</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: <Sparkles className="h-4 w-4" />, label: 'AI-Powered' },
            { icon: <Layers className="h-4 w-4" />, label: 'Multi-tenant' },
            { icon: <Zap className="h-4 w-4" />, label: 'Enterprise Scale' },
          ].map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex flex-col items-center gap-1.5 text-muted-foreground"
            >
              {feature.icon}
              <span className="text-xs">{feature.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// Content Routers
function DashboardContent() {
  const { dashboardPage, selectedOrderId, selectedProductId } = useAppStore()

  if (dashboardPage === 'orders' && selectedOrderId) {
    return <OrderDetail />
  }

  if (dashboardPage === 'product-new' || (dashboardPage === 'products' && selectedProductId)) {
    return <ProductForm />
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={dashboardPage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {dashboardPage === 'overview' && <OverviewDashboard />}
        {dashboardPage === 'products' && <ProductsManagement />}
        {dashboardPage === 'orders' && <OrdersManagement />}
        {dashboardPage === 'customers' && <CustomersManagement />}
        {dashboardPage === 'categories' && <CategoriesManagement />}
        {dashboardPage === 'analytics' && <AnalyticsDashboard />}
        {dashboardPage === 'discounts' && <DiscountsManagement />}
        {dashboardPage === 'inventory' && <InventoryManagement />}
        {dashboardPage === 'marketing' && <MarketingAutomation />}
        {dashboardPage === 'themes' && <ThemeCustomization />}
        {dashboardPage === 'ai-assistant' && <AiAssistant />}
        {dashboardPage === 'workflows' && <WorkflowsManagement />}
        {dashboardPage === 'apps' && <AppsMarketplace />}
        {dashboardPage === 'staff' && <StaffManagement />}
        {dashboardPage === 'billing' && <BillingSubscription />}
        {dashboardPage === 'store-settings' && <StoreSettings />}
      </motion.div>
    </AnimatePresence>
  )
}

function AdminContent() {
  const { adminPage } = useAppStore()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={adminPage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {adminPage === 'overview' && <AdminOverview />}
        {adminPage === 'merchants' && <MerchantManagement />}
        {adminPage === 'revenue' && <RevenueMonitoring />}
        {adminPage === 'plans' && <PlanControl />}
        {adminPage === 'infrastructure' && <InfrastructureMonitoring />}
        {adminPage === 'ai-monitoring' && <AiMonitoring />}
        {adminPage === 'feature-flags' && <FeatureFlags />}
        {adminPage === 'audit-logs' && <AuditLogs />}
        {adminPage === 'security' && <SecurityCenter />}
      </motion.div>
    </AnimatePresence>
  )
}

function StorefrontContent() {
  const { storefrontPage } = useAppStore()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={storefrontPage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {storefrontPage === 'home' && <StorefrontHome />}
        {storefrontPage === 'product' && <ProductDetail />}
        {storefrontPage === 'category' && <CategoryPage />}
        {storefrontPage === 'cart' && <ShoppingCartPage />}
        {storefrontPage === 'checkout' && <CheckoutPage />}
        {storefrontPage === 'search' && <SearchPage />}
        {storefrontPage === 'blog' && <BlogPage />}
        {storefrontPage === 'account' && <AccountPage />}
      </motion.div>
    </AnimatePresence>
  )
}

// Main App
export default function Home() {
  const {
    currentView,
    setCurrentView,
    dashboardPage,
    setDashboardPage,
    adminPage,
    setAdminPage,
    storefrontPage,
    setStorefrontPage,
    sidebarOpen,
    setSidebarOpen,
    selectedMerchantId,
    setSelectedMerchantId,
    selectedStoreId,
    setSelectedStoreId,
    isAuthenticated,
    setIsAuthenticated,
    currentUser,
    setCurrentUser,
    globalSearchQuery,
    setGlobalSearchQuery,
  } = useAppStore()

  const [storeData, setStoreData] = useState<any>(null)
  const [cartItemCount, setCartItemCount] = useState(0)

  // Load store data when store changes
  useEffect(() => {
    if (!selectedStoreId) return
    let cancelled = false
    const loadStoreData = async () => {
      try {
        const res = await fetch(`/api/storefront?storeId=${selectedStoreId}`)
        if (res.ok && !cancelled) {
          const data = await res.json()
          setStoreData(data.store)
          sessionStorage.setItem('shopforge_store_id', selectedStoreId)
        }
      } catch {
        // ignore
      }
    }
    loadStoreData()
    return () => { cancelled = true }
  }, [selectedStoreId])

  // Cart count for storefront
  useEffect(() => {
    if (currentView !== 'storefront') return
    let mounted = true
    const loadCount = async () => {
      try {
        const sessionId = sessionStorage.getItem('shopforge_session_id')
        if (!sessionId) return
        const res = await fetch(`/api/storefront/cart?sessionId=${sessionId}`)
        if (res.ok && mounted) {
          const data = await res.json()
          if (data.items) {
            setCartItemCount(data.items.reduce((sum: number, item: any) => sum + item.quantity, 0))
          }
        }
      } catch {
        // ignore
      }
    }
    loadCount()
    const interval = setInterval(loadCount, 5000)
    return () => { mounted = false; clearInterval(interval) }
  }, [currentView])

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    setSelectedMerchantId(null)
    setSelectedStoreId(null)
    setStoreData(null)
    sessionStorage.clear()
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <Toaster />
      </>
    )
  }

  // Storefront View
  if (currentView === 'storefront') {
    return (
      <>
        <StoreLayout store={storeData} cartItemCount={cartItemCount}>
          <StorefrontContent />
        </StoreLayout>
        <Toaster />
      </>
    )
  }

  const isAdmin = currentView === 'admin'
  const activeNavItems = isAdmin ? adminNavItems : dashboardNavItems
  const activePage = isAdmin ? adminPage : dashboardPage
  const setActivePage = isAdmin ? setAdminPage : setDashboardPage

  const groupedNav = activeNavItems.reduce<Array<{ type: 'header'; label: string } | { type: 'item'; page: string; label: string; icon: React.ReactNode }>>((acc, item, i) => {
    const prevGroup = i > 0 ? activeNavItems[i - 1].group : null
    if (item.group !== prevGroup && item.group) {
      acc.push({ type: 'header', label: item.group })
    }
    acc.push({ type: 'item', page: item.page, label: item.label, icon: item.icon })
    return acc
  }, [])

  const currentNavLabel = activeNavItems.find((n) => n.page === activePage)?.label || (isAdmin ? 'Admin' : 'Dashboard')

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 flex flex-col',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Sidebar Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0">
            <div className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center shadow-sm",
              isAdmin ? 'bg-gradient-to-br from-rose-500 to-rose-600' : 'bg-gradient-to-br from-primary to-primary/80'
            )}>
              {isAdmin ? (
                <Shield className="h-4.5 w-4.5 text-white" />
              ) : (
                <Store className="h-4.5 w-4.5 text-primary-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight">ShopForge</span>
                {isAdmin && (
                  <Badge variant="secondary" className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0 h-4">Admin</Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {isAdmin ? 'Platform Control' : (currentUser?.name || 'Merchant Dashboard')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto lg:hidden h-8 w-8 shrink-0"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* View Switcher */}
          <div className="px-4 py-3 border-b shrink-0">
            <div className="flex gap-1 p-1 rounded-lg bg-muted/80">
              {[
                { view: 'dashboard' as const, label: 'Dashboard', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
                { view: 'admin' as const, label: 'Admin', icon: <Shield className="h-3.5 w-3.5" /> },
              ].map((item) => (
                <button
                  key={item.view}
                  onClick={() => setCurrentView(item.view)}
                  className={cn(
                    'flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1.5',
                    currentView === item.view
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nav Items */}
          <ScrollArea className="flex-1">
            <nav className="p-3 space-y-0.5">
              {groupedNav.map((entry, i) => {
                if (entry.type === 'header') {
                  return (
                    <p key={`header-${i}`} className="px-3 pt-3 pb-1.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                      {entry.label}
                    </p>
                  )
                }
                return (
                  <Tooltip key={entry.page}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          setActivePage(entry.page as never)
                          if (window.innerWidth < 1024) setSidebarOpen(false)
                        }}
                        className={cn(
                          'flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm transition-all duration-150',
                          activePage === entry.page
                            ? 'bg-primary/10 text-primary font-medium shadow-sm'
                            : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        )}
                      >
                        <span className={cn(
                          'transition-colors',
                          activePage === entry.page ? 'text-primary' : ''
                        )}>
                          {entry.icon}
                        </span>
                        {entry.label}
                        {entry.page === 'ai-assistant' && (
                          <Badge className="ml-auto bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[9px] px-1.5 py-0 h-4 border-0">
                            AI
                          </Badge>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="hidden lg:block">
                      {entry.label}
                    </TooltipContent>
                  </Tooltip>
                )
              })}

              <Separator className="my-3" />

              {/* View Storefront */}
              <button
                onClick={() => {
                  setCurrentView('storefront')
                  setStorefrontPage('home')
                }}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm transition-all text-emerald-600 hover:bg-emerald-50 font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                View Storefront
              </button>
            </nav>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="border-t p-3 shrink-0">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser?.name || 'User'}</p>
                <p className="text-[11px] text-muted-foreground truncate">{currentUser?.email || ''}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto flex flex-col">
          {/* Top Bar */}
          <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b shrink-0">
            <div className="flex items-center gap-3 px-4 sm:px-6 py-2.5">
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2 min-w-0">
                <h1 className="font-semibold text-lg truncate">{currentNavLabel}</h1>
                {!isAdmin && selectedStoreId && (
                  <Badge variant="outline" className="text-[10px] shrink-0 hidden sm:inline-flex">
                    Store Active
                  </Badge>
                )}
              </div>

              <div className="ml-auto flex items-center gap-2">
                {/* Search */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    className="pl-9 h-9 w-56 bg-muted/50 border-0 focus-visible:ring-1"
                  />
                </div>

                {/* Notifications */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                      <Bell className="h-4 w-4" />
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>

                {/* View Storefront */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentView('storefront')
                    setStorefrontPage('home')
                  }}
                  className="hidden sm:flex text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-9"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Storefront
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 gap-2 pl-2 pr-1.5">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{currentUser?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{currentUser?.email || ''}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setCurrentView('dashboard'); setDashboardPage('store-settings') }}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setCurrentView('storefront'); setStorefrontPage('home') }}>
                      <Store className="h-4 w-4 mr-2" />
                      View Storefront
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-4 sm:p-6">
            {isAdmin ? <AdminContent /> : <DashboardContent />}
          </div>
        </main>

        <Toaster />
      </div>
    </TooltipProvider>
  )
}
