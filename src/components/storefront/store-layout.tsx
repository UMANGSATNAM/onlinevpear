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
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChevronRight,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type StorefrontPage } from '@/lib/store'
import { toast } from 'sonner'

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

const navLinks: Array<{ page: StorefrontPage; label: string }> = [
  { page: 'home', label: 'Home' },
  { page: 'category', label: 'Products' },
  { page: 'search', label: 'Search' },
  { page: 'blog', label: 'Blog' },
  { page: 'account', label: 'Account' },
]

export function StoreLayout({ store, cartItemCount, children }: StoreLayoutProps) {
  const { storefrontPage, setStorefrontPage, setGlobalSearchQuery } = useAppStore()
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
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
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center py-2 px-4">
        <div className="flex items-center justify-center gap-2 text-sm font-medium">
          <Truck className="h-4 w-4" />
          <span>Free shipping on orders over $100</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">Limited time offer - Shop now!</span>
        </div>
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-white'
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
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <span className="font-bold text-lg">{store?.name || 'ShopForge'}</span>
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Mobile Nav Links */}
                  <nav className="flex-1 p-4">
                    <ul className="space-y-1">
                      {navLinks.map((link) => (
                        <li key={link.page}>
                          <button
                            onClick={() => handleNavClick(link.page)}
                            className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                              storefrontPage === link.page
                                ? 'bg-primary/10 text-primary'
                                : 'text-foreground hover:bg-muted'
                            }`}
                          >
                            {link.label}
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </li>
                      ))}
                    </ul>

                    <Separator className="my-4" />

                    <ul className="space-y-1">
                      <li>
                        <button
                          onClick={() => handleNavClick('account')}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          <User className="h-4 w-4" />
                          My Account
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleNavClick('cart')}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Cart ({cartItemCount})
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
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
                onClick={() => handleNavClick('account')}
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

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300">
        {/* Newsletter Section */}
        <div className="border-b border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-2">Subscribe to our newsletter</h3>
                <p className="text-neutral-400 text-sm">Get the latest updates on new products and upcoming sales.</p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  toast?.success?.('Thank you for subscribing!')
                }}
                className="flex gap-2 w-full max-w-md"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 flex-1"
                  required
                />
                <Button type="submit" className="bg-rose-500 hover:bg-rose-600 shrink-0">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Links & Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* About */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {store?.name?.substring(0, 1) || 'S'}
                  </span>
                </div>
                <span className="font-bold text-white">{store?.name || 'ShopForge'}</span>
              </div>
              <p className="text-sm text-neutral-400 mb-4 line-clamp-3">
                {store?.description || 'Your one-stop shop for amazing products. Quality guaranteed.'}
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800">
                  <Youtube className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Quick Links</h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.page}>
                    <button
                      onClick={() => handleNavClick(link.page)}
                      className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Customer Service</h4>
              <ul className="space-y-2">
                {['Contact Us', 'Shipping Policy', 'Returns & Exchanges', 'FAQ', 'Size Guide'].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 shrink-0 text-neutral-500" />
                  <span className="text-sm text-neutral-400">support@shopforge.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 shrink-0 text-neutral-500" />
                  <span className="text-sm text-neutral-400">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-neutral-500" />
                  <span className="text-sm text-neutral-400">123 Commerce St, New York, NY 10001</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-neutral-500">
                &copy; {new Date().getFullYear()} {store?.name || 'ShopForge'}. All rights reserved.
              </p>
              <div className="flex gap-4">
                <span className="text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer">Privacy Policy</span>
                <span className="text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer">Terms of Service</span>
                <span className="text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer">Cookie Policy</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

