'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChevronRight,
  Mail,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

// TikTok SVG icon since lucide-react doesn't have it
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.7a8.16 8.16 0 0 0 4.76 1.52V6.79a4.84 4.84 0 0 1-1-.1z" />
    </svg>
  )
}

const shopLinks = [
  { label: 'All Products', href: '#' },
  { label: 'New Arrivals', href: '#' },
  { label: 'Best Sellers', href: '#' },
  { label: 'Sale', href: '#' },
  { label: 'Gift Cards', href: '#' },
]

const supportLinks = [
  { label: 'Contact Us', href: '#' },
  { label: 'FAQ', href: '#' },
  { label: 'Shipping & Returns', href: '#' },
  { label: 'Size Guide', href: '#' },
  { label: 'Track Order', href: '#' },
]

const socialIcons = [
  { icon: Twitter, label: 'Twitter', color: 'hover:text-sky-400' },
  { icon: Facebook, label: 'Facebook', color: 'hover:text-blue-500' },
  { icon: Instagram, label: 'Instagram', color: 'hover:text-pink-400' },
  { icon: Youtube, label: 'YouTube', color: 'hover:text-red-500' },
  { icon: TikTokIcon, label: 'TikTok', color: 'hover:text-white' },
]

const paymentMethods = ['VISA', 'MC', 'AMEX', 'PayPal', 'Apple Pay']

const footerLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Cookie Policy', href: '#' },
]

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function StoreFooter() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    toast.success('Thanks for subscribing!')
    setEmail('')
  }

  return (
    <footer className="sf-footer relative bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Gradient top border line */}
      <div className="sf-footer-top-line h-[2px] bg-gradient-to-r from-rose-500 via-orange-400 to-rose-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1 - Brand */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="sf-footer-logo-badge h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="font-bold text-xl tracking-tight">TechGear Pro</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Your premium destination for cutting-edge tech gear and accessories.
              Quality products, unbeatable prices, and exceptional service.
            </p>
            <div className="flex items-center gap-2">
              {socialIcons.map((social) => (
                <button
                  key={social.label}
                  aria-label={social.label}
                  className={`h-9 w-9 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-400 transition-all duration-300 hover:scale-110 hover:bg-slate-700/80 ${social.color}`}
                >
                  <social.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Column 2 - Shop */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white mb-5">
              Shop
            </h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3 - Support */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white mb-5">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4 - Newsletter */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white mb-2">
              Stay in the Loop
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Get exclusive deals, new arrivals, and tech insights delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9 h-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 backdrop-blur-sm focus:border-rose-500/50 focus:ring-rose-500/20 transition-all duration-200"
                />
              </div>
              <Button
                type="submit"
                className="sf-footer-subscribe-btn w-full h-10 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-lg shadow-rose-500/20 transition-all duration-300"
              >
                <Send className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
            </form>
            <p className="text-[11px] text-slate-500 mt-2">
              No spam, unsubscribe anytime
            </p>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-xs text-slate-500">
              &copy; 2026 TechGear Pro. All rights reserved.
            </p>

            {/* Payment Method Badges */}
            <div className="flex items-center gap-2">
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="inline-flex items-center justify-center h-7 px-2 rounded border border-slate-700/60 bg-slate-800/40 text-[10px] font-semibold text-slate-400 tracking-wide"
                >
                  {method}
                </span>
              ))}
            </div>

            {/* Footer Links */}
            <div className="flex items-center gap-4">
              {footerLinks.map((link, i) => (
                <span key={link.label} className="flex items-center gap-4">
                  <a
                    href={link.href}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {link.label}
                  </a>
                  {i < footerLinks.length - 1 && (
                    <span className="h-3 w-px bg-slate-700" />
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
