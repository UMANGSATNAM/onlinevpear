'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store,
  Palette,
  Package,
  Globe,
  PartyPopper,
  ArrowRight,
  ArrowLeft,
  SkipForward,
  X,
  Upload,
  Check,
  Sparkles,
  Rocket,
  ShoppingBag,
  LayoutDashboard,
  BarChart3,
  Settings,
  ChevronRight,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  open: boolean
  onClose: () => void
  merchantId: string
}

interface FormData {
  // Step 1
  storeName: string
  industry: string
  // Step 2
  colorPalette: string
  tagline: string
  logoFile: string | null
  // Step 3
  productName: string
  productPrice: string
  productCategory: string
  productDescription: string
  // Step 4
  domainOption: string
  customDomain: string
  subdomain: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5

const INDUSTRIES = [
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'electronics', label: 'Electronics & Gadgets' },
  { value: 'home-garden', label: 'Home & Garden' },
  { value: 'beauty', label: 'Beauty & Cosmetics' },
  { value: 'food-beverage', label: 'Food & Beverage' },
  { value: 'sports', label: 'Sports & Outdoors' },
  { value: 'toys', label: 'Toys & Games' },
  { value: 'books', label: 'Books & Media' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'jewelry', label: 'Jewelry & Accessories' },
  { value: 'art', label: 'Art & Crafts' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'pets', label: 'Pet Supplies' },
  { value: 'other', label: 'Other' },
]

const COLOR_PALETTES = [
  {
    id: 'sunset',
    name: 'Sunset Glow',
    colors: ['#FF6B6B', '#FFA07A', '#FFD93D', '#FF8C42', '#C44536'],
    gradient: 'from-red-400 via-orange-400 to-yellow-400',
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    colors: ['#0EA5E9', '#38BDF8', '#7DD3FC', '#06B6D4', '#0284C7'],
    gradient: 'from-cyan-400 via-sky-400 to-blue-500',
  },
  {
    id: 'forest',
    name: 'Forest Garden',
    colors: ['#22C55E', '#4ADE80', '#86EFAC', '#16A34A', '#15803D'],
    gradient: 'from-green-400 via-emerald-400 to-teal-500',
  },
  {
    id: 'lavender',
    name: 'Lavender Dream',
    colors: ['#A78BFA', '#C4B5FD', '#DDD6FE', '#8B5CF6', '#7C3AED'],
    gradient: 'from-violet-400 via-purple-400 to-fuchsia-400',
  },
  {
    id: 'midnight',
    name: 'Midnight Elite',
    colors: ['#1E293B', '#334155', '#64748B', '#94A3B8', '#F8FAFC'],
    gradient: 'from-slate-600 via-slate-500 to-slate-400',
  },
  {
    id: 'coral',
    name: 'Coral Reef',
    colors: ['#F472B6', '#FB7185', '#FDA4AF', '#E11D48', '#BE123C'],
    gradient: 'from-pink-400 via-rose-400 to-red-400',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#D97706', '#B45309'],
    gradient: 'from-amber-400 via-yellow-400 to-orange-400',
  },
  {
    id: 'arctic',
    name: 'Arctic Frost',
    colors: ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9'],
    gradient: 'from-sky-200 via-blue-200 to-indigo-300',
  },
]

const PRODUCT_CATEGORIES = [
  { value: 'clothing', label: 'Clothing' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'home-decor', label: 'Home Decor' },
  { value: 'beauty', label: 'Beauty Products' },
  { value: 'food', label: 'Food & Drinks' },
  { value: 'digital', label: 'Digital Products' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
]

// ─── Step header configurations ──────────────────────────────────────────────

const STEP_HEADERS: Record<number, { title: string; subtitle: string; icon: typeof Store; gradient: string }> = {
  1: {
    title: 'Welcome to Online Vepar!',
    subtitle: "Let's set up your new store. What should we call it?",
    icon: Store,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  2: {
    title: 'Make It Yours',
    subtitle: 'Choose a look that represents your brand',
    icon: Palette,
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
  },
  3: {
    title: 'Add Your First Product',
    subtitle: "Let's get something on your shelves!",
    icon: Package,
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
  },
  4: {
    title: 'Connect Your Domain',
    subtitle: 'Where will customers find you online?',
    icon: Globe,
    gradient: 'from-sky-500 via-blue-500 to-indigo-500',
  },
  5: {
    title: "You're All Set!",
    subtitle: 'Your store is ready to go. Time to make some sales!',
    icon: PartyPopper,
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
  },
}

// ─── Animation variants ─────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95,
  }),
}

const confettiParticles = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.8,
  duration: 1.5 + Math.random() * 1.5,
  color: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6B9D', '#C084FC', '#22D3EE'][i % 7],
  size: 4 + Math.random() * 8,
  rotation: Math.random() * 360,
}))

// ─── Confetti animation component ────────────────────────────────────────────

function ConfettiAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {confettiParticles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: '-5%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            rotate: p.rotation,
          }}
          animate={{
            y: ['0vh', '110vh'],
            rotate: [p.rotation, p.rotation + 720],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      ))}
    </div>
  )
}

// ─── Step indicator component ────────────────────────────────────────────────

function StepIndicator({ step, currentStep, onClick }: { step: number; currentStep: number; onClick: () => void }) {
  const isCompleted = step < currentStep
  const isCurrent = step === currentStep
  const isFuture = step > currentStep

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 group"
      type="button"
    >
      <motion.div
        className={`
          relative flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300
          ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : ''}
          ${isCurrent ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/20' : ''}
          ${isFuture ? 'bg-muted text-muted-foreground border border-border' : ''}
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Check className="h-4 w-4" />
          </motion.div>
        ) : (
          step
        )}
      </motion.div>
      <span className={`hidden sm:inline text-xs font-medium transition-colors ${
        isCurrent ? 'text-foreground' : isCompleted ? 'text-emerald-600' : 'text-muted-foreground'
      }`}>
        {step === 1 ? 'Store' : step === 2 ? 'Customize' : step === 3 ? 'Product' : step === 4 ? 'Domain' : 'Done'}
      </span>
    </button>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function OnboardingWizard({ open, onClose, merchantId }: OnboardingWizardProps) {
  const { setDashboardPage } = useAppStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    storeName: '',
    industry: '',
    colorPalette: 'sunset',
    tagline: '',
    logoFile: null,
    productName: '',
    productPrice: '',
    productCategory: '',
    productDescription: '',
    domainOption: 'subdomain',
    customDomain: '',
    subdomain: '',
  })

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setDirection(step > currentStep ? 1 : -1)
      setCurrentStep(step)
    }
  }, [currentStep])

  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setDirection(1)
      setCurrentStep((s) => s + 1)
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  const handleComplete = useCallback(async () => {
    if (submitted) return
    setSaving(true)

    try {
      // Update merchant store settings
      const selectedPalette = COLOR_PALETTES.find((p) => p.id === formData.colorPalette)

      await api.put(`/merchants/${merchantId}`, {
        storeName: formData.storeName || undefined,
        industry: formData.industry || undefined,
        settings: JSON.stringify({
          colorPalette: formData.colorPalette,
          tagline: formData.tagline,
          primaryColor: selectedPalette?.colors[0],
          accentColor: selectedPalette?.colors[2],
          domainOption: formData.domainOption,
          subdomain: formData.subdomain || formData.storeName?.toLowerCase().replace(/\s+/g, '-'),
          customDomain: formData.customDomain,
        }),
      })

      // Create first product if provided
      if (formData.productName && formData.productPrice) {
        await api.post('/products', {
          name: formData.productName,
          price: parseFloat(formData.productPrice),
          category: formData.productCategory || 'other',
          description: formData.productDescription || '',
          merchantId,
        })
      }

      setSubmitted(true)
      toast.success('Store setup complete!', {
        description: 'Your store is ready. Welcome to Online Vepar!',
        duration: 5000,
      })
    } catch {
      toast.error('Something went wrong', {
        description: 'Your settings were saved locally. You can update them later in Settings.',
      })
    } finally {
      setSaving(false)
    }
  }, [submitted, formData, merchantId])

  const progressValue = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100

  const currentHeader = STEP_HEADERS[currentStep]
  const CurrentIcon = currentHeader.icon

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh] sm:max-h-[85vh]"
        showCloseButton={false}
      >
        {/* Hidden accessible title/description */}
        <DialogTitle className="sr-only">Store Onboarding Wizard - Step {currentStep}</DialogTitle>
        <DialogDescription className="sr-only">
          {currentHeader.subtitle}
        </DialogDescription>

        {/* ── Progress Bar ── */}
        <div className="relative">
          <Progress value={progressValue} className="h-1.5 rounded-none" />
        </div>

        {/* ── Step Header with Gradient ── */}
        <div className={`relative bg-gradient-to-r ${currentHeader.gradient} px-6 py-6 sm:px-8 sm:py-8`}>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-1/3 -translate-x-1/4" />

          <div className="relative flex items-start justify-between">
            <div className="flex items-start gap-4">
              <motion.div
                key={`icon-${currentStep}`}
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white"
              >
                <CurrentIcon className="h-6 w-6" />
              </motion.div>
              <div>
                <motion.h2
                  key={`title-${currentStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl sm:text-2xl font-bold text-white"
                >
                  {currentHeader.title}
                </motion.h2>
                <motion.p
                  key={`sub-${currentStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm sm:text-base text-white/80 mt-1"
                >
                  {currentHeader.subtitle}
                </motion.p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step Indicators */}
          <div className="relative flex items-center justify-between mt-6">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-white -translate-y-1/2 transition-all duration-500"
              style={{ width: `${progressValue}%` }}
            />
            <div className="relative flex items-center justify-between w-full">
              {[1, 2, 3, 4, 5].map((step) => (
                <StepIndicator
                  key={step}
                  step={step}
                  currentStep={currentStep}
                  onClick={() => step < currentStep && goToStep(step)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Step Content ── */}
        <div className="overflow-y-auto max-h-[calc(90vh-280px)] sm:max-h-[calc(85vh-280px)]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="px-6 py-6 sm:px-8 sm:py-8"
            >
              {currentStep === 1 && (
                <StepOne formData={formData} updateField={updateField} />
              )}
              {currentStep === 2 && (
                <StepTwo formData={formData} updateField={updateField} />
              )}
              {currentStep === 3 && (
                <StepThree formData={formData} updateField={updateField} />
              )}
              {currentStep === 4 && (
                <StepFour formData={formData} updateField={updateField} />
              )}
              {currentStep === 5 && (
                <StepFive
                  formData={formData}
                  saving={saving}
                  submitted={submitted}
                  onComplete={handleComplete}
                  onClose={onClose}
                  onNavigate={setDashboardPage}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer Navigation ── */}
        {currentStep < 5 && (
          <div className="border-t bg-muted/30 px-6 py-4 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep} className="gap-1.5">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={nextStep}
                className="text-muted-foreground hover:text-foreground gap-1.5"
              >
                <SkipForward className="h-4 w-4" />
                <span className="hidden sm:inline">Skip for now</span>
              </Button>
            </div>

            <Button onClick={nextStep} className="gap-1.5 min-w-[100px]">
              {currentStep === 4 ? 'Finish' : 'Continue'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Back to Dashboard option */}
        {currentStep < 5 && (
          <div className="px-6 pb-4 sm:px-8 text-center">
            <button
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              type="button"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Step 1: Welcome & Store Name ────────────────────────────────────────────

function StepOne({ formData, updateField }: { formData: FormData; updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void }) {
  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <Sparkles className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-900">We&apos;re excited to have you!</p>
          <p className="text-xs text-emerald-700">This takes about 2 minutes. You can always change these later.</p>
        </div>
      </motion.div>

      {/* Store Name */}
      <div className="space-y-2">
        <Label htmlFor="storeName" className="text-sm font-medium">
          Store Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="storeName"
          placeholder="e.g. Bella&apos;s Boutique"
          value={formData.storeName}
          onChange={(e) => updateField('storeName', e.target.value)}
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">This will appear on your storefront and in search results</p>
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <Label htmlFor="industry" className="text-sm font-medium">
          Industry / Category
        </Label>
        <Select value={formData.industry} onValueChange={(v) => updateField('industry', v)}>
          <SelectTrigger className="h-11 w-full">
            <SelectValue placeholder="Select your industry..." />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind.value} value={ind.value}>
                {ind.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">We&apos;ll customize recommendations based on your industry</p>
      </div>

      {/* Store URL Preview */}
      {formData.storeName && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-xl bg-muted/50 border"
        >
          <p className="text-xs text-muted-foreground mb-1">Your store URL will be:</p>
          <p className="text-sm font-medium">
            <span className="text-muted-foreground">https://</span>
            <span className="text-primary">
              {formData.storeName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}
            </span>
            <span className="text-muted-foreground">.vepar.in</span>
          </p>
        </motion.div>
      )}
    </div>
  )
}

// ─── Step 2: Store Customization ─────────────────────────────────────────────

function StepTwo({ formData, updateField }: { formData: FormData; updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void }) {
  const selectedPalette = COLOR_PALETTES.find((p) => p.id === formData.colorPalette)

  return (
    <div className="space-y-6">
      {/* Color Palette Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Choose a Color Theme</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COLOR_PALETTES.map((palette) => {
            const isSelected = formData.colorPalette === palette.id
            return (
              <motion.button
                key={palette.id}
                onClick={() => updateField('colorPalette', palette.id)}
                className={`relative flex flex-col items-center gap-2 rounded-xl p-3 border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-transparent bg-muted/30 hover:border-muted-foreground/30 hover:bg-muted/50'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  >
                    <Check className="h-3 w-3" />
                  </motion.div>
                )}
                {/* Color circles */}
                <div className="flex gap-0.5">
                  {palette.colors.slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded-full border border-white/50 shadow-sm"
                      style={{ backgroundColor: color, marginLeft: i > 0 ? '-2px' : 0, zIndex: 5 - i }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-center leading-tight">{palette.name}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Logo Upload Area */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Store Logo</Label>
        <div className="flex items-center gap-4">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group">
            {formData.logoFile ? (
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Store className="h-8 w-8 text-primary" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[10px] text-muted-foreground">Upload</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Drag & drop or click to upload your logo
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              SVG, PNG, or JPG (max 2MB). Recommended: 512x512px
            </p>
            <Button variant="outline" size="sm" className="mt-2" type="button">
              Choose File
            </Button>
          </div>
        </div>
      </div>

      {/* Store Tagline */}
      <div className="space-y-2">
        <Label htmlFor="tagline" className="text-sm font-medium">Store Tagline</Label>
        <Input
          id="tagline"
          placeholder="e.g. Handcrafted with love"
          value={formData.tagline}
          onChange={(e) => updateField('tagline', e.target.value)}
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">A short phrase that captures your brand&apos;s essence</p>
      </div>

      {/* Live Preview */}
      {selectedPalette && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border overflow-hidden"
        >
          <div className="bg-muted/50 px-3 py-2 flex items-center gap-2 border-b">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-background rounded px-3 py-0.5 text-xs text-muted-foreground">
              {(formData.subdomain || formData.storeName || 'yourstore').toLowerCase().replace(/\s+/g, '-')}.vepar.in
            </div>
          </div>
          <div className="h-40 overflow-hidden">
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ backgroundColor: selectedPalette.colors[0] }}
            >
              <span className="font-bold text-white text-lg">
                {formData.storeName || 'Your Store'}
              </span>
              <div className="flex gap-4 text-white/80 text-xs">
                <span>Home</span>
                <span>Shop</span>
                <span>About</span>
              </div>
            </div>
            <div
              className="px-6 py-4"
              style={{ background: `linear-gradient(135deg, ${selectedPalette.colors[0]}15, ${selectedPalette.colors[2]}15)` }}
            >
              <p className="text-sm font-semibold" style={{ color: selectedPalette.colors[3] }}>
                {formData.tagline || 'Your tagline here'}
              </p>
              <button
                className="mt-2 text-xs px-3 py-1 rounded text-white"
                style={{ backgroundColor: selectedPalette.colors[2] }}
              >
                Shop Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── Step 3: Add First Product ───────────────────────────────────────────────

function StepThree({ formData, updateField }: { formData: FormData; updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void }) {
  return (
    <div className="space-y-6">
      {/* Encouragement */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <Rocket className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-amber-900">Get your first product listed!</p>
          <p className="text-xs text-amber-700">Stores with products get 3x more engagement. You can add more later.</p>
        </div>
      </motion.div>

      {/* Product Name */}
      <div className="space-y-2">
        <Label htmlFor="productName" className="text-sm font-medium">Product Name</Label>
        <Input
          id="productName"
          placeholder="e.g. Handmade Leather Wallet"
          value={formData.productName}
          onChange={(e) => updateField('productName', e.target.value)}
          className="h-11"
        />
      </div>

      {/* Price + Category Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="productPrice" className="text-sm font-medium">Price ($)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              id="productPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="29.99"
              value={formData.productPrice}
              onChange={(e) => updateField('productPrice', e.target.value)}
              className="h-11 pl-7"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Category</Label>
          <Select value={formData.productCategory} onValueChange={(v) => updateField('productCategory', v)}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Description */}
      <div className="space-y-2">
        <Label htmlFor="productDescription" className="text-sm font-medium">Description</Label>
        <Textarea
          id="productDescription"
          placeholder="Tell customers what makes this product special..."
          value={formData.productDescription}
          onChange={(e) => updateField('productDescription', e.target.value)}
          rows={3}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          A good description helps customers decide to buy
        </p>
      </div>

      {/* Product Preview Card */}
      {formData.productName && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-4"
        >
          <p className="text-xs text-muted-foreground mb-2">Preview:</p>
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{formData.productName}</p>
              {formData.productPrice && (
                <p className="text-lg font-bold text-primary mt-0.5">${parseFloat(formData.productPrice).toFixed(2)}</p>
              )}
              {formData.productDescription && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{formData.productDescription}</p>
              )}
              {formData.productCategory && (
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                  {formData.productCategory.replace('-', ' ')}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── Step 4: Connect Domain ──────────────────────────────────────────────────

function StepFour({ formData, updateField }: { formData: FormData; updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void }) {
  const autoSubdomain = formData.storeName
    ? formData.storeName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : 'your-store'

  return (
    <div className="space-y-6">
      {/* Domain Option Cards */}
      <div className="grid gap-3">
        {/* Subdomain Option */}
        <motion.button
          onClick={() => updateField('domainOption', 'subdomain')}
          className={`relative text-left rounded-xl p-5 border-2 transition-all duration-200 ${
            formData.domainOption === 'subdomain'
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-border hover:border-muted-foreground/30'
          }`}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
        >
          {formData.domainOption === 'subdomain' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Check className="h-3 w-3" />
            </motion.div>
          )}
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              formData.domainOption === 'subdomain' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Use a Online Vepar Subdomain</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quick and free &mdash; get online instantly with yourstore.vepar.in
              </p>
            </div>
          </div>
        </motion.button>

        {/* Custom Domain Option */}
        <motion.button
          onClick={() => updateField('domainOption', 'custom')}
          className={`relative text-left rounded-xl p-5 border-2 transition-all duration-200 ${
            formData.domainOption === 'custom'
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-border hover:border-muted-foreground/30'
          }`}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
        >
          {formData.domainOption === 'custom' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Check className="h-3 w-3" />
            </motion.div>
          )}
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              formData.domainOption === 'custom' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Use a Custom Domain</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Use your own domain like www.yourstore.com (requires DNS setup)
              </p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Domain Input */}
      {formData.domainOption === 'subdomain' ? (
        <div className="space-y-2">
          <Label htmlFor="subdomain" className="text-sm font-medium">Subdomain</Label>
          <div className="flex items-center">
            <Input
              id="subdomain"
              placeholder={autoSubdomain}
              value={formData.subdomain}
              onChange={(e) => updateField('subdomain', e.target.value.replace(/[^a-z0-9-]/g, ''))}
              className="h-11 rounded-r-none focus:z-10"
            />
            <div className="flex h-11 items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
              .vepar.in
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Only lowercase letters, numbers, and hyphens</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customDomain" className="text-sm font-medium">Your Custom Domain</Label>
            <Input
              id="customDomain"
              placeholder="www.yourstore.com"
              value={formData.customDomain}
              onChange={(e) => updateField('customDomain', e.target.value)}
              className="h-11"
            />
          </div>

          {/* DNS Instructions */}
          <div className="p-4 rounded-xl bg-muted/50 border">
            <p className="text-sm font-medium mb-2">DNS Setup Instructions</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>1. Go to your domain registrar&apos;s DNS settings</p>
              <p>2. Add a CNAME record pointing to <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">cname.vepar.in</code></p>
              <p>3. Wait for DNS propagation (usually 1-48 hours)</p>
            </div>
          </div>
        </div>
      )}

      {/* URL Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-muted/50 border"
      >
        <p className="text-xs text-muted-foreground mb-1">Your store will be accessible at:</p>
        <p className="text-sm font-medium text-primary">
          {formData.domainOption === 'subdomain'
            ? `https://${formData.subdomain || autoSubdomain}.vepar.in`
            : `https://${formData.customDomain || 'www.yourstore.com'}`
          }
        </p>
      </motion.div>
    </div>
  )
}

// ─── Step 5: Complete ────────────────────────────────────────────────────────

function StepFive({
  formData,
  saving,
  submitted,
  onComplete,
  onClose,
  onNavigate,
}: {
  formData: FormData
  saving: boolean
  submitted: boolean
  onComplete: () => void
  onClose: () => void
  onNavigate: (page: string) => void
}) {
  const selectedPalette = COLOR_PALETTES.find((p) => p.id === formData.colorPalette)

  return (
    <div className="relative space-y-6">
      {/* Confetti */}
      {submitted && <ConfettiAnimation />}

      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="flex flex-col items-center text-center py-4"
      >
        <motion.div
          className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${selectedPalette?.gradient || 'from-emerald-400 to-teal-500'} shadow-lg`}
          animate={submitted ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <PartyPopper className="h-10 w-10 text-white" />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold mt-4"
        >
          {submitted ? 'Your Store is Live!' : 'Ready to Launch?'}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mt-2 max-w-md"
        >
          {submitted
            ? `"${formData.storeName || 'Your store'}" is all set up and ready for customers. Here's what you can do next:`
            : "We'll save all your settings and get your store ready. Click the button below to launch!"
          }
        </motion.p>
      </motion.div>

      {/* Launch / Setup Summary */}
      {!submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border p-4 space-y-3"
        >
          <p className="text-sm font-medium">Setup Summary</p>
          <div className="space-y-2">
            {formData.storeName && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Store Name</span>
                <span className="font-medium">{formData.storeName}</span>
              </div>
            )}
            {selectedPalette && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Theme</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {selectedPalette.colors.slice(0, 3).map((c, i) => (
                      <div key={i} className="h-3.5 w-3.5 rounded-full border border-white/50" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="font-medium">{selectedPalette.name}</span>
                </div>
              </div>
            )}
            {formData.productName && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">First Product</span>
                <span className="font-medium">{formData.productName}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Domain</span>
              <span className="font-medium">
                {formData.domainOption === 'subdomain'
                  ? `${formData.subdomain || formData.storeName?.toLowerCase().replace(/\s+/g, '-') || 'store'}.vepar.in`
                  : formData.customDomain || 'Custom domain'}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Next Steps (after submission) */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid gap-3 sm:grid-cols-2"
        >
          {[
            { icon: Package, label: 'Add More Products', desc: 'Build out your catalog', page: 'products' },
            { icon: Palette, label: 'Customize Theme', desc: 'Fine-tune your look', page: 'themes' },
            { icon: BarChart3, label: 'View Analytics', desc: 'Track your performance', page: 'analytics' },
            { icon: Settings, label: 'Store Settings', desc: 'Configure payments & shipping', page: 'store-settings' },
          ].map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              onClick={() => {
                onClose()
                onNavigate(item.page)
              }}
              className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all text-left group"
              type="button"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col gap-3"
      >
        {!submitted ? (
          <Button
            onClick={onComplete}
            disabled={saving}
            className="w-full h-12 text-base gap-2"
            size="lg"
          >
            {saving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                />
                Setting up your store...
              </>
            ) : (
              <>
                <Rocket className="h-5 w-5" />
                Launch My Store
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={onClose}
            className="w-full h-12 text-base gap-2"
            size="lg"
          >
            <LayoutDashboard className="h-5 w-5" />
            Go to Dashboard
          </Button>
        )}
      </motion.div>
    </div>
  )
}
