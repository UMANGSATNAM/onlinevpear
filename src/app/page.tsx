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
import { ReviewsManagement } from '@/components/dashboard/reviews'
import { DataImport } from '@/components/dashboard/data-import'
import { GiftCardsManagement } from '@/components/dashboard/gift-cards'
import { LoyaltyProgram } from '@/components/dashboard/loyalty'
import { EmailTemplates } from '@/components/dashboard/email-templates'
import { AbandonedCartRecovery } from '@/components/dashboard/abandoned-carts'
import { ShippingSettings } from '@/components/dashboard/shipping-settings'
import { CurrencySettings } from '@/components/dashboard/currency-settings'
import { CouponBuilder } from '@/components/dashboard/coupon-builder'
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
  { page: 'coupon-builder', label: 'Coupon Builder', icon: <Tags className="h-4 w-4" />, group: 'Insights' },
  { page: 'inventory', label: 'Inventory', icon: <Warehouse className="h-4 w-4" />, group: 'Insights' },
  { page: 'marketing', label: 'Marketing', icon: <Megaphone className="h-4 w-4" />, group: 'Insights' },
  { page: 'reviews', label: 'Reviews', icon: <Star className="h-4 w-4" />, group: 'Insights' },
  { page: 'loyalty', label: 'Loyalty', icon: <Trophy className="h-4 w-4" />, group: 'Insights' },
  { page: 'abandoned-carts', label: 'Abandoned Carts', icon: <ShoppingCart className="h-4 w-4" />, group: 'Insights' },
  { page: 'seo-dashboard', label: 'SEO', icon: <Search className="h-4 w-4" />, group: 'Insights' },
  { page: 'social-media', label: 'Social Media', icon: <Share2 className="h-4 w-4" />, group: 'Insights' },
  { page: 'themes', label: 'Themes', icon: <Palette className="h-4 w-4" />, group: 'Customize' },
  { page: 'ai-assistant', label: 'AI Assistant', icon: <Bot className="h-4 w-4" />, group: 'Tools' },
  { page: 'workflows', label: 'Workflows', icon: <GitBranch className="h-4 w-4" />, group: 'Tools' },
  { page: 'apps', label: 'Apps', icon: <Grid3X3 className="h-4 w-4" />, group: 'Tools' },
  { page: 'gift-cards', label: 'Gift Cards', icon: <Gift className="h-4 w-4" />, group: 'Tools' },
  { page: 'email-templates', label: 'Email Templates', icon: <Mail className="h-4 w-4" />, group: 'Tools' },
  { page: 'social-media', label: 'Social Media', icon: <Share2 className="h-4 w-4" />, group: 'Tools' },
  { page: 'data-import', label: 'Data Import', icon: <Import className="h-4 w-4" />, group: 'Settings' },
  { page: 'shipping-settings', label: 'Shipping', icon: <Truck className="h-4 w-4" />, group: 'Settings' },
  { page: 'currency-settings', label: 'Currency', icon: <DollarSign className="h-4 w-4" />, group: 'Settings' },
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
        // Mark as onboarded if merchant already has onboardedAt
        if (data.merchants[0].onboardedAt) {
          localStorage.setItem('shopforge_onboarded', 'true')
          sessionStorage.setItem('shopforge_onboarded', 'true')
        }
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
        // Mark as onboarded if merchant already has onboardedAt
        if (data.merchants[0].onboardedAt) {
          localStorage.setItem('shopforge_onboarded', 'true')
          sessionStorage.setItem('shopforge_onboarded', 'true')
        }
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
            ShopForge
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 mt-2"
          >
            AI-Powered Ecommerce Platform
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
                    <span className="text-[10px] text-muted-foreground">admin@shopforge.io</span>
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

  // Show onboarding wizard for new merchants on first login
  // Only show if merchant hasn't been onboarded yet (check both sessionStorage and localStorage)
  useEffect(() => {
    if (isAuthenticated && selectedMerchantId) {
      const alreadyOnboarded =
        sessionStorage.getItem('shopforge_onboarded') ||
        localStorage.getItem('shopforge_onboarded')
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

  // Group header color dots mapping
  const groupHeaderColors: Record<string, { dot: string; icon: React.ReactNode }> = {
    'Main': { dot: 'bg-primary', icon: <LayoutDashboard className="h-2.5 w-2.5" /> },
    'Insights': { dot: 'bg-amber-500', icon: <BarChart3 className="h-2.5 w-2.5" /> },
    'Customize': { dot: 'bg-violet-500', icon: <Palette className="h-2.5 w-2.5" /> },
    'Tools': { dot: 'bg-cyan-500', icon: <Zap className="h-2.5 w-2.5" /> },
    'Settings': { dot: 'bg-slate-400', icon: <Settings className="h-2.5 w-2.5" /> },
    'Platform': { dot: 'bg-rose-500', icon: <Shield className="h-2.5 w-2.5" /> },
    'Monitoring': { dot: 'bg-emerald-500', icon: <Server className="h-2.5 w-2.5" /> },
    'Control': { dot: 'bg-orange-500', icon: <Flag className="h-2.5 w-2.5" /> },
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-64 border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 flex flex-col',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          style={{
            background: 'linear-gradient(180deg, hsl(var(--muted)/0.3) 0%, hsl(var(--card)) 30%, hsl(var(--card)) 100%)',
          }}
        >
          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '128px 128px',
            }}
          />

          {/* Sidebar Header with gradient background */}
          <div className={cn(
            "relative flex items-center gap-3 px-5 py-4 border-b shrink-0 overflow-hidden",
            isAdmin
              ? 'bg-gradient-to-r from-rose-500/8 via-rose-500/4 to-transparent'
              : 'bg-gradient-to-r from-primary/8 via-primary/4 to-transparent'
          )}>
            {/* Subtle glow behind logo */}
            <div className={cn(
              "absolute -left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full blur-xl opacity-30",
              isAdmin ? 'bg-rose-500' : 'bg-primary'
            )} />
            <div className={cn(
              "relative h-9 w-9 rounded-xl flex items-center justify-center shadow-md",
              isAdmin
                ? 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/20'
                : 'bg-gradient-to-br from-primary to-primary/80 shadow-primary/20'
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

          {/* View Switcher - 3-way with glass-morphism indicator */}
          <div className="px-4 py-3 border-b shrink-0">
            <div className="relative flex gap-1 p-1 rounded-lg bg-muted/60">
              {/* Glass-morphism sliding indicator */}
              <motion.div
                layoutId="viewSwitcher"
                className={cn(
                  "absolute top-1 bottom-1 rounded-md",
                  currentView === 'storefront'
                    ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 border border-emerald-200/40 shadow-sm shadow-emerald-500/10'
                    : currentView === 'admin'
                      ? 'bg-gradient-to-r from-rose-500/15 to-rose-500/5 border border-rose-200/40 shadow-sm shadow-rose-500/10'
                      : 'bg-background/70 border border-primary/10 shadow-sm backdrop-blur-md'
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
                    currentView === item.view
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nav Items */}
          <ScrollArea className="flex-1">
            <nav className="p-3 space-y-0.5">
              {groupedNav.map((entry, i) => {
                // Check if next entry is a different group header (to add divider)
                const nextEntry = groupedNav[i + 1]
                const isLastInGroup = nextEntry && nextEntry.type === 'header'

                if (entry.type === 'header') {
                  const headerStyle = groupHeaderColors[entry.label]
                  return (
                    <div key={`header-${i}`} className="px-3 pt-3 pb-1.5 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {headerStyle && (
                          <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", headerStyle.dot)} />
                        )}
                        <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                          {entry.label}
                        </p>
                        {/* Colored underline below group name */}
                        {headerStyle && (
                          <div className={cn("flex-1 h-[2px] rounded-full opacity-30", headerStyle.dot.replace('bg-', 'bg-'))} />
                        )}
                      </div>
                      {/* Subtle underline accent */}
                      {headerStyle && (
                        <div className={cn("h-[2px] w-8 rounded-full ml-5 opacity-40", headerStyle.dot)} />
                      )}
                    </div>
                  )
                }
                const isActive = activePage === entry.page
                return (
                  <Tooltip key={entry.page}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          setActivePage(entry.page as never)
                          if (window.innerWidth < 1024) setSidebarOpen(false)
                        }}
                        className={cn(
                          'group relative flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm overflow-hidden',
                          isActive
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                        style={{ transition: 'color 200ms, font-weight 200ms' }}
                      >
                        {/* Gradient left border for active item */}
                        {isActive && (
                          <motion.div
                            layoutId="activeNavBorder"
                            className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gradient-to-b from-primary to-primary/60"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        )}
                        {/* Active dot indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="activeDot"
                            className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary"
                            initial={{ scale: 0 }}
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }, layout: { type: 'spring', stiffness: 500, damping: 35 } }}
                          />
                        )}
                        {/* Gradient background for active item */}
                        <div className={cn(
                          "absolute inset-0 rounded-lg",
                          isActive
                            ? 'bg-gradient-to-r from-primary/8 via-primary/4 to-transparent'
                            : 'origin-left scale-x-0 group-hover:scale-x-100 bg-muted/50'
                        )} style={{ transition: isActive ? 'none' : 'transform 200ms ease-out' }} />
                        {/* Hover left border indicator */}
                        {!isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-[3px] rounded-full bg-primary/40 transition-all duration-200 group-hover:h-4 group-hover:bg-primary/60" />
                        )}
                        <span className={cn(
                          'relative',
                          isActive ? 'text-primary' : ''
                        )} style={{ transition: 'transform 200ms, color 200ms', transform: isActive ? 'none' : undefined }}>
                          <span className="block group-hover:scale-110" style={{ transition: 'transform 200ms' }}>
                            {entry.icon}
                          </span>
                        </span>
                        <span className="relative">{entry.label}</span>
                        {entry.page === 'ai-assistant' && (
                          <Badge className="relative ml-auto bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[9px] px-1.5 py-0 h-4 border-0">
                            AI
                          </Badge>
                        )}
                        {/* Divider after group */}
                        {isLastInGroup && (
                          <div className="absolute -bottom-0 left-6 right-3 h-px bg-border/50" />
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

              {/* View Storefront - prominent emerald gradient */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setCurrentView('storefront')
                  setStorefrontPage('home')
                }}
                className="group relative flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm transition-all duration-300 font-medium overflow-hidden"
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent group-hover:from-emerald-500/15 group-hover:via-emerald-500/8 transition-all duration-300" />
                {/* Left accent bar */}
                <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gradient-to-b from-emerald-500 to-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative text-emerald-600 group-hover:scale-110 transition-transform duration-200">
                  <ExternalLink className="h-4 w-4" />
                </span>
                <span className="relative text-emerald-600">View Storefront</span>
                <ArrowRight className="relative ml-auto h-3.5 w-3.5 text-emerald-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </motion.button>
            </nav>
          </ScrollArea>

          {/* Sidebar Footer - User Profile Card with frosted glass */}
          <div className="shrink-0">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="p-3">
              <div className="relative rounded-lg bg-background/60 backdrop-blur-md border border-border/50 p-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  {/* Avatar with gradient background and initials */}
                  <div className="relative h-9 w-9 rounded-full shrink-0 bg-gradient-to-br from-primary via-primary/80 to-violet-500 flex items-center justify-center shadow-md shadow-primary/20">
                    <span className="text-xs font-bold text-primary-foreground">
                      {(currentUser?.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate">{currentUser?.name || 'User'}</p>
                      <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5 bg-primary/10 text-primary shrink-0">
                        {isAdmin ? 'Admin' : 'Merchant'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{currentUser?.email || ''}</p>
                  </div>
                </div>
                {/* Quick Actions Row */}
                <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-border/40">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/80" onClick={() => { setCurrentView('dashboard'); setDashboardPage('store-settings') }}>
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/80 relative" onClick={() => setNotificationsOpen(true)}>
                    <Bell className="h-3.5 w-3.5" />
                    <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-auto" onClick={handleLogout}>
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
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
          <div className="flex-1 p-4 sm:p-6">
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
              sessionStorage.setItem('shopforge_onboarded', 'true')
              localStorage.setItem('shopforge_onboarded', 'true')
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
