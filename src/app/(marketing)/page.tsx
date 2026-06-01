'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
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
import { ReviewsManagement } from '@/components/dashboard/reviews'
import { DataImport } from '@/components/dashboard/data-import'
import { GiftCardsManagement } from '@/components/dashboard/gift-cards'
import { LoyaltyProgram } from '@/components/dashboard/loyalty'
import { EmailTemplates } from '@/components/dashboard/email-templates'
import { AbandonedCartRecovery } from '@/components/dashboard/abandoned-carts'
import { ShippingSettings } from '@/components/dashboard/shipping-settings'
import { CurrencySettings } from '@/components/dashboard/currency-settings'
import { CouponBuilder } from '@/components/dashboard/coupon-builder'
import { ThemeEditor } from '@/components/dashboard/theme-editor'
import { SeoDashboard } from '@/components/dashboard/seo-dashboard'
import { SocialMedia } from '@/components/dashboard/social-media'
import { CustomerDetail } from '@/components/dashboard/customer-detail'
import { NotificationsPanel } from '@/components/dashboard/notifications-panel'
import { OnboardingWizard } from '@/components/dashboard/onboarding-wizard'
import { CommandPalette } from '@/components/dashboard/command-palette'
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
import { WishlistPage } from '@/components/storefront/wishlist'
import { ProductGridPage } from '@/components/storefront/product-grid-page'
import { ProductComparison } from '@/components/storefront/product-comparison'
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
  ChevronLeft,
  ChevronRight,
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
  Star,
  Gift,
  Import,
  Mail,
  Truck,
  Trophy,
  Share2,
  Command,
  Paintbrush,
  Home as HomeIcon,
  Plus,
  Globe,
  Hexagon,
  Diamond,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

// Navigation config - Hierarchical with sub-items
interface NavSubItem {
  page: DashboardPage
  label: string
}

interface NavItem {
  page: DashboardPage
  label: string
  icon: React.ReactNode
  group: string
  subItems?: NavSubItem[]
}

const dashboardNavItems: NavItem[] = [
  { page: 'overview', label: 'Home', icon: <HomeIcon className="h-4 w-4" />, group: 'Main' },
  {
    page: 'products', label: 'Products', icon: <Package className="h-4 w-4" />, group: 'Main',
    subItems: [
      { page: 'products', label: 'All Products' },
      { page: 'product-new', label: 'Add Product' },
      { page: 'inventory', label: 'Inventory' },
      { page: 'reviews', label: 'Reviews' },
    ],
  },
  {
    page: 'orders', label: 'Orders', icon: <ShoppingCart className="h-4 w-4" />, group: 'Main',
    subItems: [
      { page: 'orders', label: 'All Orders' },
      { page: 'abandoned-carts', label: 'Abandoned Carts' },
      { page: 'coupon-builder', label: 'Coupon Builder' },
    ],
  },
  { page: 'customers', label: 'Customers', icon: <Users className="h-4 w-4" />, group: 'Main' },
  {
    page: 'marketing', label: 'Marketing', icon: <Megaphone className="h-4 w-4" />, group: 'Growth',
    subItems: [
      { page: 'marketing', label: 'Campaigns' },
      { page: 'discounts', label: 'Discounts' },
      { page: 'social-media', label: 'Social Media' },
    ],
  },
  {
    page: 'themes', label: 'Online Store', icon: <Store className="h-4 w-4" />, group: 'Growth',
    subItems: [
      { page: 'themes', label: 'Themes' },
      { page: 'theme-editor', label: 'Theme Editor' },
      { page: 'seo-dashboard', label: 'SEO' },
      { page: 'email-templates', label: 'Email Templates' },
    ],
  },
  { page: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, group: 'Growth' },
  { page: 'billing', label: 'Payments', icon: <CreditCard className="h-4 w-4" />, group: 'Growth' },
  { page: 'shipping-settings', label: 'Shipping', icon: <Truck className="h-4 w-4" />, group: 'Growth' },
  { page: 'apps', label: 'Apps', icon: <Grid3X3 className="h-4 w-4" />, group: 'Tools' },
  {
    page: 'store-settings', label: 'Settings', icon: <Settings className="h-4 w-4" />, group: 'Tools',
    subItems: [
      { page: 'store-settings', label: 'Store Settings' },
      { page: 'staff', label: 'Staff' },
      { page: 'billing', label: 'Billing' },
      { page: 'data-import', label: 'Data Import' },
    ],
  },
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
        // Mark as onboarded if merchant already has onboardedAt
        if (data.merchants[0].onboardedAt) {
          localStorage.setItem('vepar_onboarded', 'true')
          sessionStorage.setItem('vepar_onboarded', 'true')
        }
        // Load store for merchant
        try {
          const storeRes = await fetch(`/api/merchants/${data.merchants[0].id}`)
          const storeData = await storeRes.json()
          if (storeData.merchant?.stores?.length > 0) {
            setSelectedStoreId(storeData.merchant.stores[0].id)
            sessionStorage.setItem('vepar_store_id', storeData.merchant.stores[0].id)
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
        ? { email: 'admin@vepar.in', password: 'admin123' }
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
        // Mark as onboarded if merchant already has onboardedAt
        if (data.merchants[0].onboardedAt) {
          localStorage.setItem('vepar_onboarded', 'true')
          sessionStorage.setItem('vepar_onboarded', 'true')
        }
        const storeRes = await fetch(`/api/merchants/${data.merchants[0].id}`)
        const storeData = await storeRes.json()
        if (storeData.merchant?.stores?.length > 0) {
          setSelectedStoreId(storeData.merchant.stores[0].id)
          sessionStorage.setItem('vepar_store_id', storeData.merchant.stores[0].id)
        }
      }
    } catch {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated gradient background */}
      <style>{`
        @keyframes loginGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes loginFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes loginFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.08); }
          66% { transform: translate(25px, -30px) scale(0.92); }
        }
        @keyframes loginFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, 40px) scale(0.96); }
          66% { transform: translate(-30px, -20px) scale(1.04); }
        }
        @keyframes loginPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes logoGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(var(--primary-rgb, 59, 130, 246), 0.3); }
          50% { box-shadow: 0 0 40px rgba(var(--primary-rgb, 59, 130, 246), 0.5), 0 0 80px rgba(var(--primary-rgb, 59, 130, 246), 0.2); }
        }
        @keyframes borderGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .login-bg {
          background: linear-gradient(-45deg, #0f172a, #1e293b, #0f172a, #1a1a2e);
          background-size: 400% 400%;
          animation: loginGradient 15s ease infinite;
        }
        .login-blob-1 { animation: loginFloat1 8s ease-in-out infinite; }
        .login-blob-2 { animation: loginFloat2 10s ease-in-out infinite; }
        .login-blob-3 { animation: loginFloat3 12s ease-in-out infinite; }
        .login-logo-glow { animation: logoGlow 3s ease-in-out infinite; }
        .login-border-glow { animation: borderGlow 3s ease-in-out infinite; }
      `}</style>

      <div className="login-bg absolute inset-0" />

      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="login-blob-1 absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-3xl" />
        <div className="login-blob-2 absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-500/20 via-emerald-500/10 to-transparent blur-3xl" />
        <div className="login-blob-3 absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-rose-500/10 via-violet-500/5 to-transparent blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            className="relative inline-block mb-4"
          >
            {/* Glow ring behind logo */}
            <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl login-logo-glow" />
            <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Store className="h-8 w-8 text-primary-foreground" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold tracking-tight text-white"
          >
            Online Vepar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 mt-2"
          >
            India's Premier Ecommerce Platform
          </motion.p>
        </div>

        {/* Login Card with glass-morphism and animated glow border */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          {/* Animated glow border */}
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-primary/40 via-emerald-400/30 to-primary/40 login-border-glow" />

          <Card className="relative border-0 bg-white/80 backdrop-blur-xl shadow-2xl shadow-black/20">
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
                    className="h-11 bg-white/60 backdrop-blur-sm border-white/20 focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Password</label>
                    <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10 bg-white/60 backdrop-blur-sm border-white/20 focus:border-primary/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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

                <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30" disabled={loading}>
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
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/80 backdrop-blur-sm px-3 text-muted-foreground/70">Quick Access</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleQuickLogin('merchant')}
                  disabled={loading}
                  className="relative overflow-hidden rounded-xl p-4 text-left border border-white/20 bg-gradient-to-br from-primary/5 via-white/40 to-primary/10 backdrop-blur-md hover:border-primary/30 transition-all duration-300 group disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm shadow-primary/20 mb-2">
                      <Store className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-semibold block">Merchant</span>
                    <span className="text-[10px] text-muted-foreground">merchant@example.com</span>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={loading}
                  className="relative overflow-hidden rounded-xl p-4 text-left border border-white/20 bg-gradient-to-br from-rose-500/5 via-white/40 to-rose-500/10 backdrop-blur-md hover:border-rose-300/30 transition-all duration-300 group disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-sm shadow-rose-500/20 mb-2">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold block">Super Admin</span>
                    <span className="text-[10px] text-muted-foreground">admin@vepar.in</span>
                  </div>
                </motion.button>
              </div>

              {/* Don't have an account? link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <button type="button" className="text-primary font-semibold hover:underline underline-offset-2 transition-all">
                    Sign up for free
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features with gradient icon backgrounds */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: <Sparkles className="h-4 w-4 text-white" />, label: 'AI-Powered', gradient: 'from-violet-500 to-purple-600' },
            { icon: <Layers className="h-4 w-4 text-white" />, label: 'Multi-tenant', gradient: 'from-cyan-500 to-teal-600' },
            { icon: <Zap className="h-4 w-4 text-white" />, label: 'Enterprise Scale', gradient: 'from-amber-500 to-orange-600' },
          ].map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-sm` }>
                {feature.icon}
              </div>
              <span className="text-xs text-white/60">{feature.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// Content Routers
function DashboardContent() {
  const { dashboardPage, selectedOrderId, selectedProductId, selectedCustomerId } = useAppStore()

  if (dashboardPage === 'orders' && selectedOrderId) {
    return <OrderDetail />
  }

  if (dashboardPage === 'customers' && selectedCustomerId) {
    return <CustomerDetail />
  }

  if (dashboardPage === 'product-new' || (dashboardPage === 'products' && selectedProductId)) {
    return <ProductForm />
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={dashboardPage}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
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
        {dashboardPage === 'reviews' && <ReviewsManagement />}
        {dashboardPage === 'loyalty' && <LoyaltyProgram />}
        {dashboardPage === 'data-import' && <DataImport />}
        {dashboardPage === 'gift-cards' && <GiftCardsManagement />}
        {dashboardPage === 'email-templates' && <EmailTemplates />}
        {dashboardPage === 'abandoned-carts' && <AbandonedCartRecovery />}
        {dashboardPage === 'seo-dashboard' && <SeoDashboard />}
        {dashboardPage === 'social-media' && <SocialMedia />}
        {dashboardPage === 'shipping-settings' && <ShippingSettings />}
        {dashboardPage === 'currency-settings' && <CurrencySettings />}
        {dashboardPage === 'coupon-builder' && <CouponBuilder />}
        {dashboardPage === 'theme-editor' && <ThemeEditor />}
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
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
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
        {storefrontPage === 'wishlist' && <WishlistPage />}
        {storefrontPage === 'products' && <ProductGridPage />}
        {storefrontPage === 'compare' && <ProductComparison />}
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
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [isMobile, setIsMobile] = useState(false)

  // Load user preferences after mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem('merchant_sidebar_collapsed')
      if (saved === 'true') {
        setSidebarCollapsed(true)
      }
    } catch {
      // ignore
    }
  }, [])

  // Load Google Fonts for merchant portal
  useEffect(() => {
    if (currentView !== 'dashboard') return
    const existing = document.getElementById('merchant-fonts')
    if (existing) return
    const link = document.createElement('link')
    link.id = 'merchant-fonts'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap'
    document.head.appendChild(link)
  }, [currentView])

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev
      localStorage.setItem('merchant_sidebar_collapsed', String(next))
      return next
    })
  }, [])

  const toggleGroup = useCallback((label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }, [])

  // Show onboarding wizard for new merchants on first login
  // Only show if merchant hasn't been onboarded yet (check both sessionStorage and localStorage)
  useEffect(() => {
    if (isAuthenticated && selectedMerchantId) {
      const alreadyOnboarded =
        sessionStorage.getItem('vepar_onboarded') ||
        localStorage.getItem('vepar_onboarded')
      if (!alreadyOnboarded) {
        const timer = setTimeout(() => setOnboardingOpen(true), 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [isAuthenticated, selectedMerchantId])

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
          sessionStorage.setItem('vepar_store_id', selectedStoreId)
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
        const sessionId = sessionStorage.getItem('vepar_session_id')
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

  // Check if any sub-item of a nav item is active (defined before early returns)
  const isNavItemActiveForPage = useCallback((item: NavItem, page: DashboardPage | AdminPage) => {
    if (page === item.page) return true
    if (item.subItems) {
      return item.subItems.some(sub => page === sub.page)
    }
    return false
  }, [])

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

  // Build grouped nav for admin sidebar
  const groupedNav = activeNavItems.reduce<Array<{ type: 'header'; label: string } | { type: 'item'; page: string; label: string; icon: React.ReactNode }>>((acc, item, i) => {
    const prevGroup = i > 0 ? activeNavItems[i - 1].group : null
    if (item.group !== prevGroup && item.group) {
      acc.push({ type: 'header', label: item.group })
    }
    acc.push({ type: 'item', page: item.page, label: item.label, icon: item.icon })
    return acc
  }, [])

  const currentNavLabel = activeNavItems.find((n) => n.page === activePage)?.label || (isAdmin ? 'Admin' : 'Dashboard')

  // Group header color dots mapping
  const groupHeaderColors: Record<string, { dot: string; icon: React.ReactNode }> = {
    'Main': { dot: 'bg-indigo-500', icon: <LayoutDashboard className="h-2.5 w-2.5" /> },
    'Growth': { dot: 'bg-[#F5A623]', icon: <BarChart3 className="h-2.5 w-2.5" /> },
    'Tools': { dot: 'bg-[#FF6B6B]', icon: <Zap className="h-2.5 w-2.5" /> },
    'Platform': { dot: 'bg-[#00D4FF]', icon: <Shield className="h-2.5 w-2.5" /> },
    'Monitoring': { dot: 'bg-[#F59E0B]', icon: <Server className="h-2.5 w-2.5" /> },
    'Control': { dot: 'bg-[#A78BFA]', icon: <Flag className="h-2.5 w-2.5" /> },
  }

  // Check if any sub-item of a nav item is active
  const isNavItemActive = (item: NavItem) => isNavItemActiveForPage(item, activePage)

  return (
    <TooltipProvider>
      <div className={cn("flex h-screen", isAdmin ? "bg-[#0A0F1E] text-[#F9FAFB]" : "bg-[#FAFAFA]")} style={isAdmin ? { fontFamily: "'DM Sans', sans-serif" } : { fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* Admin Mission Control global styles */}
        {isAdmin && (
          <style>{`
            .admin-sidebar { background: linear-gradient(180deg, #0D1325 0%, #111827 30%, #0F172A 100%) !important; border-color: rgba(255,255,255,0.06) !important; }
            .admin-sidebar .font-bold, .admin-sidebar .font-semibold { font-family: 'Syne', sans-serif; }
            .admin-header { background: rgba(10,15,30,0.85) !important; border-color: rgba(255,255,255,0.06) !important; backdrop-filter: blur(20px); }
            .admin-sidebar button, .admin-sidebar span, .admin-sidebar p { color: rgba(249,250,251,0.7); }
            .admin-sidebar button:hover, .admin-sidebar span.font-bold, .admin-sidebar span.font-semibold { color: #F9FAFB; }
            .admin-sidebar .border-b { border-color: rgba(255,255,255,0.06) !important; }
            .admin-sidebar [data-active='true'] { background: rgba(0,212,255,0.1); color: #00D4FF !important; border-right: 2px solid #00D4FF; }
            .admin-sidebar [data-active='true'] svg { color: #00D4FF !important; }
            .admin-content-scroll::-webkit-scrollbar { width: 6px; }
            .admin-content-scroll::-webkit-scrollbar-track { background: transparent; }
            .admin-content-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
            .admin-content-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
          `}</style>
        )}
        {/* Sidebar */}
        {isAdmin ? (
          // Admin Sidebar (unchanged dark theme)
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-40 w-64 border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 flex flex-col admin-sidebar',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
            style={{
              background: 'linear-gradient(180deg, #0D1325 0%, #111827 30%, #0F172A 100%)',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.015]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '128px 128px',
              }}
            />
            <div className="relative flex items-center gap-3 px-5 py-4 border-b shrink-0 overflow-hidden bg-gradient-to-r from-[#00D4FF]/8 via-[#00D4FF]/4 to-transparent">
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full blur-xl opacity-30 bg-[#00D4FF]" />
              <div className="relative h-9 w-9 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br from-[#00D4FF] to-[#0891B2] shadow-[#00D4FF]/20">
                <Shield className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-[#F9FAFB]" style={{ fontFamily: "'Syne', sans-serif" }}>Online Vepar</span>
                  <Badge variant="secondary" className="bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/20 text-[10px] px-1.5 py-0 h-4">Admin</Badge>
                </div>
                <p className="text-[11px] truncate text-[#94A3B8]">Mission Control</p>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto lg:hidden h-8 w-8 shrink-0" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="px-4 py-3 border-b shrink-0">
              <div className="relative flex gap-1 p-1 rounded-lg bg-white/5">
                <motion.div
                  layoutId="viewSwitcher"
                  className={cn(
                    "absolute top-1 bottom-1 rounded-md",
                    currentView === 'storefront'
                      ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 border border-emerald-200/40 shadow-sm shadow-emerald-500/10'
                      : currentView === 'admin'
                        ? 'bg-gradient-to-r from-[#00D4FF]/15 to-[#00D4FF]/5 border border-[#00D4FF]/30 shadow-sm shadow-[#00D4FF]/10'
                        : 'bg-white/10 border border-white/10 shadow-sm backdrop-blur-md'
                  )}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{
                    left: currentView === 'dashboard' ? '4px' : currentView === 'storefront' ? 'calc(33.33% + 1px)' : 'calc(66.66% + 2px)',
                    width: 'calc(33.33% - 4px)',
                  }}
                />
                {[
                  { view: 'dashboard' as const, label: 'Dashboard', icon: <LayoutDashboard className="h-3 w-3" /> },
                  { view: 'storefront' as const, label: 'Storefront', icon: <Store className="h-3 w-3" /> },
                  { view: 'admin' as const, label: 'Admin', icon: <Shield className="h-3 w-3" /> },
                ].map((item) => (
                  <button
                    key={item.view}
                    onClick={() => {
                      setCurrentView(item.view)
                      if (item.view === 'storefront') setStorefrontPage('home')
                    }}
                    className={cn(
                      'relative z-10 flex-1 text-[11px] font-medium py-1.5 px-1 rounded-md transition-colors duration-200 flex items-center justify-center gap-1',
                      currentView === item.view ? 'text-[#F9FAFB]' : 'text-[#94A3B8] hover:text-[#F9FAFB]'
                    )}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <ScrollArea className="flex-1">
              <nav className="p-3 space-y-0.5">
                {groupedNav.map((entry, i) => {
                  const nextEntry = groupedNav[i + 1]
                  if (entry.type === 'header') {
                    const headerStyle = groupHeaderColors[entry.label]
                    return (
                      <div key={`header-${i}`} className="px-3 pt-3 pb-1.5 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {headerStyle && <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", headerStyle.dot)} />}
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#475569]">{entry.label}</p>
                        </div>
                      </div>
                    )
                  }
                  const isActive = activePage === entry.page
                  return (
                    <button
                      key={entry.page}
                      onClick={() => {
                        setActivePage(entry.page as never)
                        if (window.innerWidth < 1024) setSidebarOpen(false)
                      }}
                      className={cn(
                        'group relative flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm overflow-hidden',
                        isActive ? 'text-[#00D4FF] font-medium' : 'text-[#94A3B8] hover:text-[#F9FAFB]'
                      )}
                    >
                      {isActive && (
                        <motion.div layoutId="activeNavBorder" className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gradient-to-b from-[#00D4FF] to-[#0891B2]" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                      )}
                      <div className={cn("absolute inset-0 rounded-lg", isActive ? 'bg-gradient-to-r from-[#00D4FF]/10 via-[#00D4FF]/5 to-transparent' : 'origin-left scale-x-0 group-hover:scale-x-100 bg-white/5')} style={{ transition: isActive ? 'none' : 'transform 200ms ease-out' }} />
                      {!isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-[3px] rounded-full transition-all duration-200 group-hover:h-4 bg-[#00D4FF]/30 group-hover:bg-[#00D4FF]/50" />}
                      <span className="relative block group-hover:scale-110 transition-transform duration-200">{entry.icon}</span>
                      <span className="relative">{entry.label}</span>
                    </button>
                  )
                })}
                <Separator className="my-3" />
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => { setCurrentView('storefront'); setStorefrontPage('home') }}
                  className="group relative flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm transition-all duration-300 font-medium overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent group-hover:from-emerald-500/15 group-hover:via-emerald-500/8 transition-all duration-300" />
                  <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gradient-to-b from-emerald-500 to-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative text-emerald-400 group-hover:scale-110 transition-transform duration-200"><ExternalLink className="h-4 w-4" /></span>
                  <span className="relative text-emerald-400">View Storefront</span>
                  <ArrowRight className="relative ml-auto h-3.5 w-3.5 text-emerald-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </motion.button>
              </nav>
            </ScrollArea>
            <div className="shrink-0">
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="p-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-9 w-9 rounded-full shrink-0 bg-gradient-to-br from-[#00D4FF] to-[#0891B2] flex items-center justify-center shadow-md">
                    <span className="text-xs font-bold text-white">{(currentUser?.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F9FAFB] truncate">{currentUser?.name || 'User'}</p>
                    <p className="text-[11px] text-[#94A3B8] truncate">{currentUser?.email || ''}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-[#94A3B8] hover:text-red-400 hover:bg-red-400/10" onClick={handleLogout}>
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        ) : (
          // Merchant Sidebar - Premium SaaS Design with collapsible behavior
          <>
            {/* Desktop Sidebar */}
            <aside
              className={cn(
                'hidden md:flex flex-col border-r transition-all duration-300 ease-in-out relative shrink-0',
                sidebarCollapsed ? 'w-16' : 'w-64',
              )}
              style={{
                background: '#FAFAFA',
                borderColor: '#E5E7EB',
              }}
            >
              {/* Sidebar Header */}
              <div className={cn(
                "relative flex items-center border-b shrink-0 transition-all duration-300",
                sidebarCollapsed ? "px-3 py-4 justify-center" : "px-5 py-4 gap-3"
              )}>
                <div className="relative h-9 w-9 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-[#4338CA] to-[#3730A3] shrink-0">
                  <Store className="h-4.5 w-4.5 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg tracking-tight text-[#1F2937]">Online Vepar</span>
                    </div>
                    <p className="text-[11px] text-[#9CA3AF] truncate">
                      {currentUser?.name || 'Merchant Dashboard'}
                    </p>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-7 w-7 text-[#9CA3AF] hover:text-[#4338CA] hover:bg-[#4338CA]/5 shrink-0", sidebarCollapsed && "absolute -right-3 top-4 z-50 h-6 w-6 rounded-full bg-white border shadow-sm")}
                  onClick={toggleSidebarCollapse}
                >
                  {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                </Button>
              </div>

              {/* View Switcher */}
              {!sidebarCollapsed && (
                <div className="px-4 py-3 border-b shrink-0">
                  <div className="relative flex gap-1 p-1 rounded-lg bg-[#F3F4F6]">
                    <motion.div
                      layoutId="viewSwitcherMerchant"
                      className="absolute top-1 bottom-1 rounded-md bg-white border border-[#4338CA]/10 shadow-sm"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      style={{
                        left: currentView === 'dashboard' ? '4px' : currentView === 'storefront' ? 'calc(33.33% + 1px)' : 'calc(66.66% + 2px)',
                        width: 'calc(33.33% - 4px)',
                      }}
                    />
                    {[
                      { view: 'dashboard' as const, label: 'Dashboard', icon: <LayoutDashboard className="h-3 w-3" /> },
                      { view: 'storefront' as const, label: 'Store', icon: <Store className="h-3 w-3" /> },
                      { view: 'admin' as const, label: 'Admin', icon: <Shield className="h-3 w-3" /> },
                    ].map((item) => (
                      <button
                        key={item.view}
                        onClick={() => {
                          setCurrentView(item.view)
                          if (item.view === 'storefront') setStorefrontPage('home')
                        }}
                        className={cn(
                          'relative z-10 flex-1 text-[11px] font-medium py-1.5 px-1 rounded-md transition-colors duration-200 flex items-center justify-center gap-1',
                          currentView === item.view ? 'text-[#4338CA]' : 'text-[#9CA3AF] hover:text-[#374151]'
                        )}
                      >
                        {item.icon}
                        <span className="hidden sm:inline">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nav Items */}
              <ScrollArea className="flex-1">
                <nav className={cn("py-2", sidebarCollapsed ? "px-2" : "px-3")}>
                  {(() => {
                    let lastGroup = ''
                    return dashboardNavItems.map((item, i) => {
                      const showGroupHeader = item.group !== lastGroup && !sidebarCollapsed
                      lastGroup = item.group
                      const isActive = isNavItemActive(item)
                      const hasSubItems = item.subItems && item.subItems.length > 0
                      const isExpanded = expandedGroups[item.label] ?? false
                      const headerStyle = groupHeaderColors[item.group]

                      return (
                        <div key={item.label}>
                          {/* Group header */}
                          {showGroupHeader && (
                            <div className="px-3 pt-4 pb-2 flex items-center gap-2">
                              {headerStyle && <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", headerStyle.dot)} />}
                              <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.15em]">{item.group}</p>
                              {headerStyle && <div className={cn("flex-1 h-px opacity-20", headerStyle.dot.replace('bg-', 'bg-'))} />}
                            </div>
                          )}

                          {/* Nav Item */}
                          {sidebarCollapsed ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => {
                                    setActivePage(item.page)
                                    if (hasSubItems) {
                                      toggleGroup(item.label)
                                    }
                                  }}
                                  className={cn(
                                    'group relative flex items-center justify-center w-full rounded-lg py-2.5 my-0.5 transition-all duration-200',
                                    isActive
                                      ? 'bg-[#4338CA]/8 text-[#4338CA]'
                                      : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151]'
                                  )}
                                >
                                  {isActive && (
                                    <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-[#4338CA]" />
                                  )}
                                  <span className="block group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="font-medium">
                                {item.label}
                              </TooltipContent>
                            </Tooltip>
                          ) : hasSubItems ? (
                            <Collapsible
                              open={isExpanded}
                              onOpenChange={() => toggleGroup(item.label)}
                              className="my-0.5"
                            >
                              <CollapsibleTrigger asChild>
                                <button
                                  className={cn(
                                    'group relative flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm transition-all duration-200',
                                    isActive
                                      ? 'text-[#4338CA] font-medium'
                                      : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151]'
                                  )}
                                >
                                  {isActive && (
                                    <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-[#4338CA]" />
                                  )}
                                  {isActive && (
                                    <div className="absolute inset-0 rounded-lg bg-[#4338CA]/5" />
                                  )}
                                  <span className="relative block group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                                  <span className="relative flex-1 text-left">{item.label}</span>
                                  <ChevronDown className={cn(
                                    "relative h-3.5 w-3.5 text-[#9CA3AF] transition-transform duration-200",
                                    isExpanded && "rotate-180"
                                  )} />
                                </button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="ml-4 pl-3 border-l border-[#E5E7EB] space-y-0.5 py-1">
                                  {item.subItems!.map((sub) => {
                                    const isSubActive = activePage === sub.page
                                    return (
                                      <button
                                        key={sub.page + sub.label}
                                        onClick={() => {
                                          setActivePage(sub.page)
                                          if (window.innerWidth < 1024) setSidebarOpen(false)
                                        }}
                                        className={cn(
                                          'group/sub flex items-center gap-2 w-full rounded-md px-3 py-1.5 text-[13px] transition-all duration-200',
                                          isSubActive
                                            ? 'text-[#4338CA] font-medium bg-[#4338CA]/5'
                                            : 'text-[#6B7280] hover:text-[#374151] hover:bg-[#F3F4F6]'
                                        )}
                                      >
                                        <div className={cn(
                                          "h-1 w-1 rounded-full transition-colors duration-200",
                                          isSubActive ? "bg-[#4338CA]" : "bg-[#D1D5DB] group-hover/sub:bg-[#9CA3AF]"
                                        )} />
                                        <span>{sub.label}</span>
                                        {sub.page === 'product-new' && (
                                          <Plus className="h-3 w-3 ml-auto text-[#FF6B6B]" />
                                        )}
                                      </button>
                                    )
                                  })}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => {
                                    setActivePage(item.page)
                                    if (window.innerWidth < 1024) setSidebarOpen(false)
                                  }}
                                  className={cn(
                                    'group relative flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm transition-all duration-200 my-0.5',
                                    isActive
                                      ? 'text-[#4338CA] font-medium'
                                      : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151]'
                                  )}
                                >
                                  {isActive && (
                                    <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-[#4338CA]" />
                                  )}
                                  {isActive && (
                                    <div className="absolute inset-0 rounded-lg bg-[#4338CA]/5" />
                                  )}
                                  <span className="relative block group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                                  <span className="relative">{item.label}</span>
                                  {item.page === 'analytics' && (
                                    <BarChart3 className="relative ml-auto h-3.5 w-3.5 text-[#F5A623]" />
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right">{item.label}</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      )
                    })
                  })()}

                  {!sidebarCollapsed && (
                    <>
                      <Separator className="my-3" />

                      {/* View Storefront */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => { setCurrentView('storefront'); setStorefrontPage('home') }}
                        className="group relative flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm transition-all duration-300 font-medium overflow-hidden"
                      >
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/8 via-emerald-500/4 to-transparent group-hover:from-emerald-500/12 group-hover:via-emerald-500/6 transition-all duration-300" />
                        <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gradient-to-b from-emerald-500 to-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative text-emerald-600 group-hover:scale-110 transition-transform duration-200"><ExternalLink className="h-4 w-4" /></span>
                        <span className="relative text-emerald-600">View Storefront</span>
                        <ArrowRight className="relative ml-auto h-3.5 w-3.5 text-emerald-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </motion.button>
                    </>
                  )}
                </nav>
              </ScrollArea>

              {/* Sidebar Footer */}
              <div className="shrink-0 border-t border-[#E5E7EB]">
                <div className={cn("p-3", sidebarCollapsed ? "px-2" : "")}>
                  {sidebarCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setNotificationsOpen(true)}
                          className="flex items-center justify-center w-full rounded-lg py-2 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#4338CA] transition-colors duration-200 relative"
                        >
                          <Bell className="h-4 w-4" />
                          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#FF6B6B]" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Notifications</TooltipContent>
                    </Tooltip>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-9 w-9 rounded-full shrink-0 bg-gradient-to-br from-[#4338CA] to-[#3730A3] flex items-center justify-center shadow-sm">
                        <span className="text-xs font-bold text-white">
                          {(currentUser?.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-[#1F2937] truncate">{currentUser?.name || 'User'}</p>
                          <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5 bg-[#4338CA]/10 text-[#4338CA] shrink-0">Merchant</Badge>
                        </div>
                        <p className="text-[11px] text-[#9CA3AF] truncate">{currentUser?.email || ''}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 shrink-0" onClick={handleLogout}>
                        <LogOut className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Mobile Sidebar (sheet overlay) */}
            {sidebarOpen && (
              <aside
                className="fixed inset-y-0 left-0 z-40 w-72 border-r flex flex-col md:hidden"
                style={{ background: '#FAFAFA', borderColor: '#E5E7EB' }}
              >
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E7EB]">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-[#4338CA] to-[#3730A3]">
                    <Store className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-lg tracking-tight text-[#1F2937]">Online Vepar</span>
                    <p className="text-[11px] text-[#9CA3AF] truncate">{currentUser?.name || 'Merchant Dashboard'}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSidebarOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <nav className="p-3 space-y-0.5">
                    {(() => {
                      let lastGroup = ''
                      return dashboardNavItems.map((item) => {
                        const showGroupHeader = item.group !== lastGroup
                        lastGroup = item.group
                        const isActive = isNavItemActive(item)
                        const hasSubItems = item.subItems && item.subItems.length > 0
                        const isExpanded = expandedGroups[item.label] ?? false
                        const headerStyle = groupHeaderColors[item.group]

                        return (
                          <div key={item.label}>
                            {showGroupHeader && (
                              <div className="px-3 pt-4 pb-2 flex items-center gap-2">
                                {headerStyle && <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", headerStyle.dot)} />}
                                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.15em]">{item.group}</p>
                              </div>
                            )}
                            {hasSubItems ? (
                              <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(item.label)} className="my-0.5">
                                <CollapsibleTrigger asChild>
                                  <button className={cn(
                                    'group relative flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm transition-all duration-200',
                                    isActive ? 'text-[#4338CA] font-medium' : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151]'
                                  )}>
                                    {isActive && <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-[#4338CA]" />}
                                    {isActive && <div className="absolute inset-0 rounded-lg bg-[#4338CA]/5" />}
                                    <span className="relative block group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                                    <span className="relative flex-1 text-left">{item.label}</span>
                                    <ChevronDown className={cn("relative h-3.5 w-3.5 text-[#9CA3AF] transition-transform duration-200", isExpanded && "rotate-180")} />
                                  </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="ml-4 pl-3 border-l border-[#E5E7EB] space-y-0.5 py-1">
                                    {item.subItems!.map((sub) => {
                                      const isSubActive = activePage === sub.page
                                      return (
                                        <button
                                          key={sub.page + sub.label}
                                          onClick={() => { setActivePage(sub.page); setSidebarOpen(false) }}
                                          className={cn(
                                            'flex items-center gap-2 w-full rounded-md px-3 py-1.5 text-[13px] transition-all duration-200',
                                            isSubActive ? 'text-[#4338CA] font-medium bg-[#4338CA]/5' : 'text-[#6B7280] hover:text-[#374151] hover:bg-[#F3F4F6]'
                                          )}
                                        >
                                          <div className={cn("h-1 w-1 rounded-full", isSubActive ? "bg-[#4338CA]" : "bg-[#D1D5DB]")} />
                                          <span>{sub.label}</span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            ) : (
                              <button
                                onClick={() => { setActivePage(item.page); setSidebarOpen(false) }}
                                className={cn(
                                  'group relative flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm transition-all duration-200 my-0.5',
                                  isActive ? 'text-[#4338CA] font-medium' : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151]'
                                )}
                              >
                                {isActive && <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-[#4338CA]" />}
                                {isActive && <div className="absolute inset-0 rounded-lg bg-[#4338CA]/5" />}
                                <span className="relative block group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                                <span className="relative">{item.label}</span>
                              </button>
                            )}
                          </div>
                        )
                      })
                    })()}
                    <Separator className="my-3" />
                    <button
                      onClick={() => { setCurrentView('storefront'); setStorefrontPage('home'); setSidebarOpen(false) }}
                      className="group relative flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm transition-all duration-300 font-medium overflow-hidden"
                    >
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/8 via-emerald-500/4 to-transparent" />
                      <span className="relative text-emerald-600"><ExternalLink className="h-4 w-4" /></span>
                      <span className="relative text-emerald-600">View Storefront</span>
                    </button>
                  </nav>
                </ScrollArea>
                <div className="shrink-0 border-t border-[#E5E7EB] p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#4338CA] to-[#3730A3] flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-white">{(currentUser?.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1F2937] truncate">{currentUser?.name || 'User'}</p>
                      <p className="text-[11px] text-[#9CA3AF] truncate">{currentUser?.email || ''}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50" onClick={handleLogout}>
                      <LogOut className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </aside>
            )}

            {/* Mobile Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-30 bg-black/30 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E7EB] md:hidden safe-area-bottom">
              <div className="flex items-center justify-around py-1.5 px-2">
                {[
                  { page: 'overview' as DashboardPage, label: 'Home', icon: <HomeIcon className="h-5 w-5" /> },
                  { page: 'orders' as DashboardPage, label: 'Orders', icon: <ShoppingCart className="h-5 w-5" /> },
                  { page: 'products' as DashboardPage, label: 'Products', icon: <Package className="h-5 w-5" /> },
                  { page: 'themes' as DashboardPage, label: 'Store', icon: <Store className="h-5 w-5" /> },
                  { page: 'overview' as DashboardPage, label: 'Menu', icon: <Menu className="h-5 w-5" />, isMenu: true },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      if ('isMenu' in item && item.isMenu) {
                        setSidebarOpen(true)
                      } else {
                        setActivePage(item.page)
                      }
                    }}
                    className={cn(
                      'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors duration-200 min-w-[56px]',
                      (activePage === item.page && !('isMenu' in item))
                        ? 'text-[#4338CA]'
                        : 'text-[#9CA3AF] active:text-[#4338CA]'
                    )}
                  >
                    {item.icon}
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto flex flex-col">
          {/* Top Bar */}
          <header className={cn("sticky top-0 z-20 backdrop-blur-xl border-b shrink-0", isAdmin ? "admin-header" : "bg-background/80")}>
            <div className="flex items-center gap-3 px-4 sm:px-6 py-2.5">
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2 min-w-0">
                <h1 className={cn("font-semibold text-lg truncate", isAdmin && "text-[#F9FAFB]")} style={isAdmin ? { fontFamily: "'Syne', sans-serif" } : undefined}>{currentNavLabel}</h1>
                {!isAdmin && selectedStoreId && (
                  <Badge variant="outline" className="text-[10px] shrink-0 hidden sm:inline-flex">
                    Store Active
                  </Badge>
                )}
              </div>

              <div className="ml-auto flex items-center gap-2">
                {/* Search with gradient border on focus + ⌘K hint */}
                <div className={cn(
                  "relative hidden md:block rounded-lg transition-all duration-300",
                  searchFocused
                    ? 'ring-2 ring-primary/30 shadow-sm shadow-primary/10'
                    : ''
                )}
                  style={searchFocused ? {
                    background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.5), hsl(var(--primary))) border-box',
                    border: '1.5px solid transparent',
                  } : {}}
                >
                  <Search className={cn(
                    "absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-all duration-300",
                    searchFocused && 'text-primary scale-110'
                  )} />
                  <Input
                    placeholder="Search..."
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="pl-9 h-9 w-56 bg-muted/50 border-0 focus-visible:ring-0 focus-visible:outline-none"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
                    <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/50 bg-muted/60 rounded border border-border/50">
                      <Command className="h-2.5 w-2.5" />K
                    </kbd>
                  </div>
                </div>

                {/* Notifications with pulse badge */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 relative transition-all duration-200 hover:scale-105 hover:shadow-sm"
                      onClick={() => setNotificationsOpen(true)}
                    >
                      <Bell className="h-4 w-4" />
                      <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                      </span>
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
                  className="hidden sm:flex text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-sm h-9 transition-all duration-200 hover:scale-[1.02]"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Storefront
                </Button>

                {/* User Dropdown with gradient avatar border */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 gap-2 pl-1.5 pr-2 hover:scale-[1.02] transition-all duration-200">
                      <div className="h-7 w-7 rounded-full p-[1.5px] bg-gradient-to-br from-primary via-primary/60 to-violet-500">
                        <div className="h-full w-full rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-primary">
                            {(currentUser?.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
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
          <div className={cn("flex-1 p-4 sm:p-6", isAdmin && "admin-content-scroll overflow-y-auto")} style={isAdmin ? { background: '#0A0F1E', backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' } : undefined}>
            {isAdmin ? <AdminContent /> : <DashboardContent />}
          </div>
        </main>

        <NotificationsPanel
          open={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          merchantId={selectedMerchantId || ''}
        />
        {!isAdmin && (
          <OnboardingWizard
            open={onboardingOpen}
            onClose={() => {
              setOnboardingOpen(false)
              sessionStorage.setItem('vepar_onboarded', 'true')
              localStorage.setItem('vepar_onboarded', 'true')
            }}
            merchantId={selectedMerchantId || ''}
          />
        )}
        <Toaster />
      </div>
      <CommandPalette onNavigate={(view) => setCurrentView(view)} />
    </TooltipProvider>
  )
}
