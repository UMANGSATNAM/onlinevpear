'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, type AppView, type DashboardPage, type AdminPage } from '@/lib/store'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
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
  Store,
  Shield,
  DollarSign,
  Crown,
  Server,
  Cpu,
  Flag,
  FileText,
  Lock,
  Plus,
  Download,
  Eye,
  ArrowRight,
  Sparkles,
  FolderTree,
  Megaphone,
  UsersRound,
  Palette,
  Star,
  Search,
  Clock,
  ExternalLink,
} from 'lucide-react'

interface CommandPaletteProps {
  onNavigate?: (view: AppView) => void
}

interface RecentPage {
  label: string
  page: string
  view: AppView
  icon: React.ReactNode
  timestamp: number
}

const MAX_RECENT = 8
const STORAGE_KEY = 'vepar_recent_pages'

// Navigation commands for dashboard pages
const dashboardPages: Array<{ page: DashboardPage; label: string; icon: React.ReactNode; group: string }> = [
  { page: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" />, group: 'Main' },
  { page: 'products', label: 'Products', icon: <Package className="h-4 w-4" />, group: 'Main' },
  { page: 'orders', label: 'Orders', icon: <ShoppingCart className="h-4 w-4" />, group: 'Main' },
  { page: 'customers', label: 'Customers', icon: <Users className="h-4 w-4" />, group: 'Main' },
  { page: 'categories', label: 'Categories', icon: <FolderTree className="h-4 w-4" />, group: 'Main' },
  { page: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, group: 'Insights' },
  { page: 'discounts', label: 'Discounts', icon: <Tags className="h-4 w-4" />, group: 'Insights' },
  { page: 'inventory', label: 'Inventory', icon: <Warehouse className="h-4 w-4" />, group: 'Insights' },
  { page: 'marketing', label: 'Marketing', icon: <Megaphone className="h-4 w-4" />, group: 'Insights' },
  { page: 'reviews', label: 'Reviews', icon: <Star className="h-4 w-4" />, group: 'Insights' },
  { page: 'themes', label: 'Themes', icon: <Palette className="h-4 w-4" />, group: 'Customize' },
  { page: 'ai-assistant', label: 'AI Assistant', icon: <Bot className="h-4 w-4" />, group: 'Tools' },
  { page: 'workflows', label: 'Workflows', icon: <GitBranch className="h-4 w-4" />, group: 'Tools' },
  { page: 'apps', label: 'Apps', icon: <Grid3X3 className="h-4 w-4" />, group: 'Tools' },
  { page: 'staff', label: 'Staff', icon: <UsersRound className="h-4 w-4" />, group: 'Settings' },
  { page: 'billing', label: 'Billing', icon: <CreditCard className="h-4 w-4" />, group: 'Settings' },
  { page: 'store-settings', label: 'Store Settings', icon: <Settings className="h-4 w-4" />, group: 'Settings' },
]

// Navigation commands for admin pages
const adminPages: Array<{ page: AdminPage; label: string; icon: React.ReactNode; group: string }> = [
  { page: 'overview', label: 'Admin Overview', icon: <LayoutDashboard className="h-4 w-4" />, group: 'Platform' },
  { page: 'merchants', label: 'Merchants', icon: <Store className="h-4 w-4" />, group: 'Platform' },
  { page: 'revenue', label: 'Revenue', icon: <DollarSign className="h-4 w-4" />, group: 'Platform' },
  { page: 'plans', label: 'Plans', icon: <Crown className="h-4 w-4" />, group: 'Platform' },
  { page: 'infrastructure', label: 'Infrastructure', icon: <Server className="h-4 w-4" />, group: 'Monitoring' },
  { page: 'ai-monitoring', label: 'AI Monitoring', icon: <Cpu className="h-4 w-4" />, group: 'Monitoring' },
  { page: 'feature-flags', label: 'Feature Flags', icon: <Flag className="h-4 w-4" />, group: 'Control' },
  { page: 'audit-logs', label: 'Audit Logs', icon: <FileText className="h-4 w-4" />, group: 'Control' },
  { page: 'security', label: 'Security', icon: <Lock className="h-4 w-4" />, group: 'Control' },
]

// Action commands
const actionCommands: Array<{ id: string; label: string; icon: React.ReactNode; shortcut?: string; action: string }> = [
  { id: 'add-product', label: 'Add Product', icon: <Plus className="h-4 w-4" />, shortcut: 'N', action: 'add-product' },
  { id: 'create-discount', label: 'Create Discount', icon: <Tags className="h-4 w-4" />, action: 'create-discount' },
  { id: 'export-data', label: 'Export Data', icon: <Download className="h-4 w-4" />, action: 'export-data' },
  { id: 'open-ai', label: 'Open AI Assistant', icon: <Sparkles className="h-4 w-4" />, action: 'open-ai' },
  { id: 'view-storefront', label: 'View Storefront', icon: <Eye className="h-4 w-4" />, action: 'view-storefront' },
  { id: 'switch-admin', label: 'Switch to Admin', icon: <Shield className="h-4 w-4" />, action: 'switch-admin' },
  { id: 'switch-dashboard', label: 'Switch to Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, action: 'switch-dashboard' },
]

function getRecentPages(): RecentPage[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecentPage(page: RecentPage) {
  if (typeof window === 'undefined') return
  try {
    const existing = getRecentPages().filter(
      (p) => !(p.page === page.page && p.view === page.view)
    )
    const updated = [page, ...existing].slice(0, MAX_RECENT)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Ignore storage errors
  }
}

export function CommandPalette({ onNavigate }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const {
    currentView,
    setCurrentView,
    dashboardPage,
    setDashboardPage,
    adminPage,
    setAdminPage,
    setSelectedProductId,
  } = useAppStore()

  const [recentPages, setRecentPages] = useState<RecentPage[]>(() => {
    if (typeof window === 'undefined') return []
    return getRecentPages()
  })

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Track page visits as recent
  useEffect(() => {
    if (currentView === 'storefront') return
    const currentPage = currentView === 'admin' ? adminPage : dashboardPage
    const pages = currentView === 'admin' ? adminPages : dashboardPages
    const pageInfo = pages.find((p) => p.page === currentPage)
    if (pageInfo) {
      const recent: RecentPage = {
        label: pageInfo.label,
        page: pageInfo.page,
        view: currentView,
        icon: pageInfo.icon,
        timestamp: Date.now(),
      }
      saveRecentPage(recent)
      // Defer state update to avoid synchronous setState in effect
      const timer = setTimeout(() => setRecentPages(getRecentPages()), 0)
      return () => clearTimeout(timer)
    }
  }, [currentView, dashboardPage, adminPage])

  const navigateToDashboardPage = useCallback((page: DashboardPage) => {
    if (page === 'product-new') {
      setSelectedProductId(null)
      setDashboardPage('product-new' as DashboardPage)
    } else {
      setDashboardPage(page)
    }
    setCurrentView('dashboard')
    setOpen(false)
  }, [setDashboardPage, setCurrentView, setSelectedProductId])

  const navigateToAdminPage = useCallback((page: AdminPage) => {
    setAdminPage(page)
    setCurrentView('admin')
    setOpen(false)
  }, [setAdminPage, setCurrentView])

  const handleAction = useCallback((action: string) => {
    switch (action) {
      case 'add-product':
        setCurrentView('dashboard')
        setSelectedProductId(null)
        setDashboardPage('product-new' as DashboardPage)
        break
      case 'create-discount':
        setCurrentView('dashboard')
        setDashboardPage('discounts')
        break
      case 'export-data':
        setCurrentView('dashboard')
        setDashboardPage('analytics')
        break
      case 'open-ai':
        setCurrentView('dashboard')
        setDashboardPage('ai-assistant')
        break
      case 'view-storefront':
        setCurrentView('storefront')
        break
      case 'switch-admin':
        setCurrentView('admin')
        break
      case 'switch-dashboard':
        setCurrentView('dashboard')
        break
    }
    setOpen(false)
  }, [setCurrentView, setDashboardPage, setSelectedProductId])

  const handleViewStorefront = useCallback(() => {
    setCurrentView('storefront')
    setOpen(false)
  }, [setCurrentView])

  // Filter action commands based on current view
  const visibleActions = actionCommands.filter((cmd) => {
    if (cmd.action === 'switch-admin' && currentView === 'admin') return false
    if (cmd.action === 'switch-dashboard' && currentView === 'dashboard') return false
    return true
  })

  return (
    <AnimatePresence>
      {open && (
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2 py-4"
              >
                <Search className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No results found</p>
                <p className="text-xs text-muted-foreground/60">Try a different search term</p>
              </motion.div>
            </CommandEmpty>

            {/* Recent Pages */}
            {recentPages.length > 0 && (
              <CommandGroup heading="Recent">
                {recentPages.slice(0, 5).map((page) => (
                  <CommandItem
                    key={`recent-${page.page}-${page.view}`}
                    onSelect={() => {
                      if (page.view === 'admin') {
                        navigateToAdminPage(page.page as AdminPage)
                      } else {
                        navigateToDashboardPage(page.page as DashboardPage)
                      }
                    }}
                  >
                    <span className="text-muted-foreground">{page.icon}</span>
                    <span>{page.label}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                      {page.view}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Navigation - Dashboard */}
            {currentView !== 'admin' && (
              <CommandGroup heading="Navigation">
                {dashboardPages.map((page) => (
                  <CommandItem
                    key={`dash-${page.page}`}
                    onSelect={() => navigateToDashboardPage(page.page)}
                  >
                    <span className="text-muted-foreground">{page.icon}</span>
                    <span>{page.label}</span>
                    {page.page === dashboardPage && (
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-primary">
                        <ArrowRight className="h-3 w-3" /> Current
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Navigation - Admin */}
            {currentView === 'admin' && (
              <CommandGroup heading="Navigation">
                {adminPages.map((page) => (
                  <CommandItem
                    key={`admin-${page.page}`}
                    onSelect={() => navigateToAdminPage(page.page)}
                  >
                    <span className="text-muted-foreground">{page.icon}</span>
                    <span>{page.label}</span>
                    {page.page === adminPage && (
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-primary">
                        <ArrowRight className="h-3 w-3" /> Current
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Actions */}
            <CommandGroup heading="Actions">
              {visibleActions.map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => handleAction(cmd.action)}
                >
                  <span className="text-muted-foreground">{cmd.icon}</span>
                  <span>{cmd.label}</span>
                  {cmd.shortcut && (
                    <span className="ml-auto text-[10px] text-muted-foreground/60 font-mono">
                      ⌘{cmd.shortcut}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            {/* Settings / Quick Links */}
            <CommandGroup heading="Quick Links">
              <CommandItem onSelect={handleViewStorefront}>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span>View Storefront</span>
              </CommandItem>
              <CommandItem onSelect={() => { setCurrentView('admin'); setOpen(false) }}>
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Admin Panel</span>
              </CommandItem>
              <CommandItem onSelect={() => { setCurrentView('dashboard'); setOpen(false) }}>
                <Store className="h-4 w-4 text-muted-foreground" />
                <span>Merchant Dashboard</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>

          {/* Footer hint */}
          <div className="flex items-center justify-between px-4 py-2 border-t text-[10px] text-muted-foreground/60">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[9px]">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[9px]">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[9px]">esc</kbd>
                Close
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {recentPages.length} recent
            </span>
          </div>
        </CommandDialog>
      )}
    </AnimatePresence>
  )
}
