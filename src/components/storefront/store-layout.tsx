'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  Heart,
  ChevronRight,
  Truck,
  ArrowLeft,
  LayoutDashboard,
  ArrowUp,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type StorefrontPage } from '@/lib/store'
import { StoreFooter } from './footer'

interface StoreData {
  id: string
  name: string
  slug: string
  description?: string | null
  logo?: string | null
  currency: string
  settings?: string
}

interface StoreLayoutProps {
  store: StoreData | null
  cartItemCount: number
  children: React.ReactNode
}

const navLinks: Array<{ page: StorefrontPage; label: string; icon?: React.ReactNode }> = [
  { page: 'home', label: 'Home' },
  { page: 'products', label: 'Products' },
  { page: 'search', label: 'Search' },
  { page: 'blog', label: 'Blog' },
  { page: 'wishlist', label: 'Wishlist', icon: <Heart className="h-4 w-4" /> },
  { page: 'account', label: 'Account' },
]

export function StoreLayout({ store, cartItemCount, children }: StoreLayoutProps) {
  const { storefrontPage, setStorefrontPage, setGlobalSearchQuery, setCurrentView } = useAppStore()
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsScrolled(scrollY > 10)
      setShowBackToTop(scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setGlobalSearchQuery(searchInput.trim())
      setStorefrontPage('search')
      setSearchOpen(false)
    }
  }, [searchInput, setGlobalSearchQuery, setStorefrontPage])

  const handleNavClick = (page: StorefrontPage) => {
    setStorefrontPage(page)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Announcement Bar - Scrolling Marquee */}
      <div className="relative bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 text-white overflow-hidden">
        <div className="flex items-center h-9">
          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap text-sm font-medium">
            <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 shrink-0" /> Free Shipping on Orders Over $100</span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 shrink-0" /> New Arrivals This Week</span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1.5"><ArrowLeft className="h-3.5 w-3.5 shrink-0 rotate-180" /> 30-Day Easy Returns</span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 shrink-0" /> Free Shipping on Orders Over $100</span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 shrink-0" /> New Arrivals This Week</span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1.5"><ArrowLeft className="h-3.5 w-3.5 shrink-0 rotate-180" /> 30-Day Easy Returns</span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 shrink-0" /> Free Shipping on Orders Over $100</span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 shrink-0" /> New Arrivals This Week</span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1.5"><ArrowLeft className="h-3.5 w-3.5 shrink-0 rotate-180" /> 30-Day Easy Returns</span>
          </div>
        </div>
        {/* Gradient fade edges */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-rose-600 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-amber-500 to-transparent pointer-events-none" />
      </div>

      {/* Header - Frosted Glass on Scroll */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-lg shadow-lg shadow-black/[0.04] border-transparent'
            : 'bg-white border-neutral-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex flex-col h-full relative"
                >
                  {/* Gradient Overlay at top */}
                  <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-rose-50/80 to-transparent pointer-events-none z-0" />

                  {/* Mobile Header */}
                  <div className="relative z-10 flex items-center justify-between p-4 border-b bg-white/60 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{store?.name?.substring(0, 1) || 'S'}</span>
                      </div>
                      <span className="font-bold text-lg">{store?.name || 'ShopForge'}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="rounded-full hover:bg-neutral-100">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Mobile Nav Links */}
                  <nav className="relative z-10 flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-1">
                      {navLinks.map((link, i) => (
                        <motion.li
                          key={link.page}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.2, delay: i * 0.05 }}
                        >
                          <button
                            onClick={() => handleNavClick(link.page)}
                            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                              storefrontPage === link.page
                                ? 'bg-rose-50 text-rose-600 shadow-sm'
                                : 'text-foreground hover:bg-neutral-50 hover:translate-x-1'
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              {link.icon}
                              {link.label}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </motion.li>
                      ))}
                    </ul>

                    <Separator className="my-4" />

                    <ul className="space-y-1">
                      <motion.li
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.2, delay: navLinks.length * 0.05 }}
                      >
                        <button
                          onClick={() => setCurrentView('dashboard')}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all duration-200"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Back to Dashboard
                        </button>
                      </motion.li>
                      <motion.li
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.2, delay: (navLinks.length + 1) * 0.05 }}
                      >
                        <button
                          onClick={() => handleNavClick('wishlist')}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-all duration-200"
                        >
                          <Heart className="h-4 w-4" />
                          Wishlist
                        </button>
                      </motion.li>
                      <motion.li
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.2, delay: (navLinks.length + 2) * 0.05 }}
                      >
                        <button
                          onClick={() => handleNavClick('account')}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-neutral-50 transition-all duration-200"
                        >
                          <User className="h-4 w-4" />
                          My Account
                        </button>
                      </motion.li>
                      <motion.li
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.2, delay: (navLinks.length + 3) * 0.05 }}
                      >
                        <button
                          onClick={() => handleNavClick('cart')}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-neutral-50 transition-all duration-200"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Cart ({cartItemCount})
                        </button>
                      </motion.li>
                    </ul>
                  </nav>
                </motion.div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 shrink-0"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {store?.name?.substring(0, 1) || 'S'}
                </span>
              </div>
              <span className="font-bold text-lg hidden sm:inline">{store?.name || 'ShopForge'}</span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 mx-8">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => handleNavClick(link.page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    storefrontPage === link.page
                      ? 'text-primary bg-primary/5'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Back to Dashboard - Desktop */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('dashboard')}
                className="hidden lg:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium border-neutral-200 text-neutral-600 hover:text-foreground hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Dashboard
              </Button>
              {/* Back to Dashboard - Mobile text */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('dashboard')}
                className="lg:hidden inline-flex items-center gap-1 h-9 px-2 text-xs font-medium text-neutral-500 hover:text-foreground"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>

              {/* Search Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="h-9 w-9"
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavClick('wishlist')}
                className="hidden sm:flex h-9 w-9"
              >
                <Heart className="h-4 w-4" />
              </Button>

              {/* Account */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavClick('account')}
                className="hidden sm:flex h-9 w-9"
              >
                <User className="h-4 w-4" />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavClick('cart')}
                className="relative h-9 w-9"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-rose-500 text-white border-0">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar (Expandable) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
                  <Input
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button type="submit" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={storefrontPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 hover:scale-110 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <StoreFooter />
    </div>
  )
}
