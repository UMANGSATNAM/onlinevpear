'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface WhatsAppButtonProps {
  storeName?: string
  phoneNumber?: string
}

// WhatsApp SVG icon (inline)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.132 6.742 3.054 9.378L1.054 31.29l6.118-1.962C9.712 31.072 12.76 32.14 16.004 32.14 24.83 32.14 32.008 24.962 32.008 16.136 32.008 7.312 24.83.14 16.004.14V0zm0 29.308c-2.932 0-5.668-.878-7.954-2.384l-.57-.34-3.756 1.204 1.21-3.634-.374-.594C2.848 21.39 1.892 18.78 1.892 16.004c0-7.788 6.324-14.112 14.112-14.112 7.788 0 14.112 6.324 14.112 14.112 0 7.788-6.324 13.304-14.112 13.304zm7.74-10.568c-.424-.214-2.512-1.24-2.9-1.382-.388-.14-.672-.214-.956.214-.284.424-1.094 1.382-1.342 1.666-.248.284-.494.318-.918.106-.424-.214-1.79-.66-3.414-2.108-1.26-1.124-2.112-2.514-2.36-2.938-.248-.424-.028-.654.186-.866.192-.19.424-.494.636-.742.214-.248.284-.424.424-.71.14-.284.072-.532-.036-.742-.106-.214-.956-2.304-1.31-3.154-.344-.828-.694-.716-.956-.728-.248-.012-.532-.014-.816-.014-.284 0-.742.106-1.132.532-.388.424-1.484 1.45-1.484 3.538s1.52 4.106 1.732 4.39c.214.284 2.994 4.572 7.254 6.41 1.014.438 1.806.7 2.42.896 1.018.324 1.944.278 2.674.168.816-.122 2.512-1.028 2.866-2.02.354-.992.354-1.842.248-2.02-.106-.178-.39-.284-.816-.498z" />
    </svg>
  )
}

export function WhatsAppButton({ storeName = 'Online Vepar', phoneNumber = '919876543210' }: WhatsAppButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const message = encodeURIComponent(`Hi, I have a question about ${storeName}`)
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
        <TooltipTrigger asChild>
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-20 right-6 z-50 h-14 w-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30"
            style={{ backgroundColor: '#25D366' }}
            aria-label="Chat with us on WhatsApp"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 15 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Pulse animation ring */}
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: '#25D366' }}
              animate={{
                scale: [1, 1.4, 1.4],
                opacity: [0.4, 0, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatDelay: 1,
              }}
            />
            <WhatsAppIcon className="h-7 w-7 text-white relative z-10" />
          </motion.a>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={8} className="text-xs font-medium">
          Chat with us on WhatsApp
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
