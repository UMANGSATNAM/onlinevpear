'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  RefreshCw,
  Plus,
  Check,
  ChevronDown,
  ArrowUpDown,
  Globe,
  Calculator,
  Settings2,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface CurrencyData {
  code: string
  symbol: string
  name: string
  flag: string
  rate: number
  active: boolean
  autoUpdate: boolean
  manualOverride: boolean
  lastUpdated: string
}

const initialCurrencies: CurrencyData[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', rate: 1.0, active: true, autoUpdate: true, manualOverride: false, lastUpdated: '2 min ago' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', rate: 0.92, active: true, autoUpdate: true, manualOverride: false, lastUpdated: '2 min ago' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', rate: 0.79, active: true, autoUpdate: true, manualOverride: false, lastUpdated: '2 min ago' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', rate: 149.50, active: true, autoUpdate: true, manualOverride: false, lastUpdated: '2 min ago' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', rate: 1.36, active: true, autoUpdate: true, manualOverride: false, lastUpdated: '2 min ago' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', rate: 1.53, active: false, autoUpdate: true, manualOverride: false, lastUpdated: '5 min ago' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', rate: 83.12, active: true, autoUpdate: true, manualOverride: false, lastUpdated: '2 min ago' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', rate: 7.24, active: false, autoUpdate: true, manualOverride: false, lastUpdated: '5 min ago' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷', rate: 4.97, active: false, autoUpdate: true, manualOverride: false, lastUpdated: '5 min ago' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷', rate: 1320.50, active: false, autoUpdate: true, manualOverride: false, lastUpdated: '5 min ago' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', rate: 1.34, active: false, autoUpdate: true, manualOverride: false, lastUpdated: '5 min ago' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', flag: '🇲🇽', rate: 17.15, active: false, autoUpdate: true, manualOverride: false, lastUpdated: '5 min ago' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export function CurrencySettings() {
  const [currencies, setCurrencies] = useState<CurrencyData[]>(initialCurrencies)
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [updating, setUpdating] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newCurrency, setNewCurrency] = useState({ code: '', symbol: '', name: '', rate: '' })
  const [symbolPosition, setSymbolPosition] = useState<'before' | 'after'>('before')
  const [decimalPlaces, setDecimalPlaces] = useState('2')
  const [thousandSeparator, setThousandSeparator] = useState<'comma' | 'period' | 'space'>('comma')
  const [roundingStrategy, setRoundingStrategy] = useState<'nearest' | 'up' | 'down'>('nearest')
  const [roundingIncrement, setRoundingIncrement] = useState('0.01')

  const activeCurrencies = useMemo(
    () => currencies.filter((c) => c.active),
    [currencies]
  )

  const samplePrice = 99.99

  const formatPrice = (price: number, currency: CurrencyData) => {
    const rate = currency.rate
    const converted = price * rate

    // Apply rounding
    const inc = parseFloat(roundingIncrement)
    let rounded: number
    switch (roundingStrategy) {
      case 'up':
        rounded = Math.ceil(converted / inc) * inc
        break
      case 'down':
        rounded = Math.floor(converted / inc) * inc
        break
      default:
        rounded = Math.round(converted / inc) * inc
    }

    const decimals = parseInt(decimalPlaces)
    const sep = thousandSeparator === 'comma' ? ',' : thousandSeparator === 'period' ? '.' : ' '

    const parts = rounded.toFixed(decimals).split('.')
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep)
    const formatted = parts.length > 1 ? `${intPart}.${parts[1]}` : intPart

    return symbolPosition === 'before' ? `${currency.symbol}${formatted}` : `${formatted}${currency.symbol}`
  }

  const toggleCurrency = (code: string) => {
    setCurrencies((prev) =>
      prev.map((c) =>
        c.code === code ? { ...c, active: !c.active } : c
      )
    )
  }

  const toggleAutoUpdate = (code: string) => {
    setCurrencies((prev) =>
      prev.map((c) =>
        c.code === code ? { ...c, autoUpdate: !c.autoUpdate } : c
      )
    )
  }

  const setManualOverride = (code: string, rate: number) => {
    setCurrencies((prev) =>
      prev.map((c) =>
        c.code === code ? { ...c, rate, manualOverride: true, lastUpdated: 'Just now' } : c
      )
    )
  }

  const updateRates = async () => {
    setUpdating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simulate slight rate changes
    setCurrencies((prev) =>
      prev.map((c) => {
        if (c.code === baseCurrency) return { ...c, lastUpdated: 'Just now' }
        const variation = 1 + (Math.sin(Date.now() / 1000 + c.rate) * 0.005)
        return {
          ...c,
          rate: c.manualOverride ? c.rate : Math.round(c.rate * variation * 10000) / 10000,
          lastUpdated: 'Just now',
        }
      })
    )

    setUpdating(false)
    toast.success('Exchange rates updated successfully')
  }

  const handleAddCurrency = () => {
    if (!newCurrency.code || !newCurrency.symbol || !newCurrency.name || !newCurrency.rate) {
      toast.error('Please fill in all fields')
      return
    }

    const rate = parseFloat(newCurrency.rate)
    if (isNaN(rate) || rate <= 0) {
      toast.error('Please enter a valid exchange rate')
      return
    }

    if (currencies.some((c) => c.code === newCurrency.code.toUpperCase())) {
      toast.error('Currency code already exists')
      return
    }

    setCurrencies((prev) => [
      ...prev,
      {
        code: newCurrency.code.toUpperCase(),
        symbol: newCurrency.symbol,
        name: newCurrency.name,
        flag: '🌐',
        rate,
        active: true,
        autoUpdate: false,
        manualOverride: true,
        lastUpdated: 'Just now',
      },
    ])

    setNewCurrency({ code: '', symbol: '', name: '', rate: '' })
    setAddDialogOpen(false)
    toast.success(`${newCurrency.code.toUpperCase()} currency added`)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-xl">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
          <div className="relative flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <DollarSign className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold">Multi-Currency Support</h1>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 mr-1.5 animate-pulse" />
                  Active
                </Badge>
              </div>
              <p className="text-white/70 mt-1">Manage currencies, exchange rates, and formatting for your store</p>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="currencies" className="space-y-6">
        <motion.div variants={itemVariants}>
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="currencies" className="gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Currencies</span>
            </TabsTrigger>
            <TabsTrigger value="rates" className="gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Rates</span>
            </TabsTrigger>
            <TabsTrigger value="formatting" className="gap-1.5">
              <Calculator className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Formatting</span>
            </TabsTrigger>
            <TabsTrigger value="rounding" className="gap-1.5">
              <Settings2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Rounding</span>
            </TabsTrigger>
          </TabsList>
        </motion.div>

        {/* Currencies Tab */}
        <TabsContent value="currencies" className="space-y-6">
          {/* Base Currency Card */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                      Base Currency
                    </CardTitle>
                    <CardDescription>All prices are stored in this currency and converted to others</CardDescription>
                  </div>
                  <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.filter((c) => c.active).map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.flag} {c.code} — {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl shadow-lg">
                    {currencies.find((c) => c.code === baseCurrency)?.flag || '🇺🇸'}
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{baseCurrency}</div>
                    <div className="text-sm text-muted-foreground">{currencies.find((c) => c.code === baseCurrency)?.name}</div>
                    <div className="text-xs text-emerald-600 mt-0.5">Base rate: 1.0000</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Supported Currencies Grid */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Supported Currencies</h2>
                <p className="text-sm text-muted-foreground">{activeCurrencies.length} of {currencies.length} currencies active</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <RefreshCw className="h-3 w-3" />
                  <span>Auto-update on</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currencies.map((currency, idx) => (
                <motion.div
                  key={currency.code}
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card className={cn(
                    'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
                    currency.active ? 'border-emerald-200 bg-white' : 'border-muted opacity-60'
                  )}>
                    {/* Gradient accent at top */}
                    <div className={cn(
                      'absolute top-0 left-0 right-0 h-1',
                      currency.active
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                        : 'bg-muted'
                    )} />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="text-2xl">{currency.flag}</div>
                          <div>
                            <div className="font-bold text-sm">{currency.code}</div>
                            <div className="text-xs text-muted-foreground">{currency.name}</div>
                          </div>
                        </div>
                        <Switch
                          checked={currency.active}
                          onCheckedChange={() => toggleCurrency(currency.code)}
                          className="scale-75"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Symbol</span>
                          <span className="font-mono font-medium">{currency.symbol}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Rate</span>
                          <span className={cn(
                            'font-mono font-medium',
                            currency.code === baseCurrency ? 'text-emerald-600' : ''
                          )}>
                            {currency.rate.toFixed(currency.rate > 100 ? 2 : 4)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Updated</span>
                          <span className="text-muted-foreground">{currency.lastUpdated}</span>
                        </div>
                      </div>
                      {currency.code === baseCurrency && (
                        <Badge className="mt-2 bg-emerald-100 text-emerald-700 text-[10px]">Base Currency</Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* Rates Tab */}
        <TabsContent value="rates" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      Exchange Rate Management
                    </CardTitle>
                    <CardDescription>View and manage exchange rates for all supported currencies</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last sync: 2 min ago
                    </div>
                    <Button
                      onClick={updateRates}
                      disabled={updating}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      <RefreshCw className={cn('h-4 w-4 mr-2', updating && 'animate-spin')} />
                      {updating ? 'Updating...' : 'Update Rates'}
                    </Button>
                    <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-semibold">Currency</TableHead>
                        <TableHead className="font-semibold">Code</TableHead>
                        <TableHead className="font-semibold text-right">Rate</TableHead>
                        <TableHead className="font-semibold text-center">Auto-Update</TableHead>
                        <TableHead className="font-semibold text-center">Manual Override</TableHead>
                        <TableHead className="font-semibold text-right">Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currencies.map((currency) => (
                        <TableRow key={currency.code} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{currency.flag}</span>
                              <span className="font-medium text-sm">{currency.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {currency.symbol} {currency.code}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {currency.manualOverride ? (
                              <Input
                                type="number"
                                value={currency.rate}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value)
                                  if (!isNaN(val) && val > 0) {
                                    setManualOverride(currency.code, val)
                                  }
                                }}
                                className="w-28 ml-auto text-right h-8 text-sm font-mono"
                                step="0.0001"
                              />
                            ) : (
                              <span className={cn(
                                'font-mono font-medium',
                                currency.code === baseCurrency ? 'text-emerald-600' : ''
                              )}>
                                {currency.rate.toFixed(currency.rate > 100 ? 2 : 4)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={currency.autoUpdate}
                              onCheckedChange={() => toggleAutoUpdate(currency.code)}
                              className="mx-auto"
                              disabled={currency.code === baseCurrency}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            {currency.manualOverride ? (
                              <Badge className="bg-amber-100 text-amber-700 text-[10px]">
                                Manual
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">
                                Auto
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {currency.lastUpdated}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Formatting Tab */}
        <TabsContent value="formatting" className="space-y-6">
          {/* Format Options */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-emerald-600" />
                  Currency Formatting Options
                </CardTitle>
                <CardDescription>Configure how prices are displayed across your store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Symbol Position</label>
                    <Select value={symbolPosition} onValueChange={(v) => setSymbolPosition(v as 'before' | 'after')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Before amount ($99.99)</SelectItem>
                        <SelectItem value="after">After amount (99.99$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Decimal Places</label>
                    <Select value={decimalPlaces} onValueChange={setDecimalPlaces}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 (¥100)</SelectItem>
                        <SelectItem value="1">1 ($99.9)</SelectItem>
                        <SelectItem value="2">2 ($99.99)</SelectItem>
                        <SelectItem value="3">3 ($99.990)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Thousand Separator</label>
                    <Select value={thousandSeparator} onValueChange={(v) => setThousandSeparator(v as 'comma' | 'period' | 'space')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comma">Comma (1,000.00)</SelectItem>
                        <SelectItem value="period">Period (1.000,00)</SelectItem>
                        <SelectItem value="space">Space (1 000.00)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Format Preview */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Formatting Preview</CardTitle>
                <CardDescription>
                  Sample product price of <span className="font-mono font-bold">${samplePrice.toFixed(2)} {baseCurrency}</span> shown in all active currencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeCurrencies.map((currency, idx) => (
                    <motion.div
                      key={currency.code}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.04 }}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border transition-all',
                        currency.code === baseCurrency
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-card border-border hover:shadow-sm'
                      )}
                    >
                      <div className="text-xl">{currency.flag}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground">{currency.code} — {currency.name}</div>
                        <div className={cn(
                          'font-bold',
                          currency.code === baseCurrency ? 'text-emerald-700 text-xl' : 'text-lg'
                        )}>
                          {formatPrice(samplePrice, currency)}
                        </div>
                      </div>
                      {currency.code === baseCurrency && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px] shrink-0">Base</Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Rounding Tab */}
        <TabsContent value="rounding" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-emerald-600" />
                  Rounding Rules
                </CardTitle>
                <CardDescription>Configure how converted prices are rounded for display</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Rounding Strategy</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'nearest' as const, label: 'Nearest', desc: 'Standard rounding' },
                        { value: 'up' as const, label: 'Up', desc: 'Always round up' },
                        { value: 'down' as const, label: 'Down', desc: 'Always round down' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setRoundingStrategy(opt.value)}
                          className={cn(
                            'p-3 rounded-lg border-2 text-center transition-all',
                            roundingStrategy === opt.value
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-muted hover:border-muted-foreground/30'
                          )}
                        >
                          <div className="font-semibold text-sm">{opt.label}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Rounding Increment</label>
                    <Select value={roundingIncrement} onValueChange={setRoundingIncrement}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.01">0.01 — Cent precision</SelectItem>
                        <SelectItem value="0.05">0.05 — Nickel rounding</SelectItem>
                        <SelectItem value="0.10">0.10 — Dime rounding</SelectItem>
                        <SelectItem value="0.50">0.50 — Half-unit rounding</SelectItem>
                        <SelectItem value="1.00">1.00 — Whole unit rounding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Rounding Preview */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Rounded Price Preview</h3>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="font-semibold">Currency</TableHead>
                          <TableHead className="font-semibold text-right">Raw Converted</TableHead>
                          <TableHead className="font-semibold text-right">Rounded</TableHead>
                          <TableHead className="font-semibold text-right">Difference</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeCurrencies.filter((c) => c.code !== baseCurrency).map((currency) => {
                          const rawConverted = samplePrice * currency.rate
                          const inc = parseFloat(roundingIncrement)
                          let rounded: number
                          switch (roundingStrategy) {
                            case 'up':
                              rounded = Math.ceil(rawConverted / inc) * inc
                              break
                            case 'down':
                              rounded = Math.floor(rawConverted / inc) * inc
                              break
                            default:
                              rounded = Math.round(rawConverted / inc) * inc
                          }
                          const diff = rounded - rawConverted

                          return (
                            <TableRow key={currency.code} className="hover:bg-muted/30 transition-colors">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span>{currency.flag}</span>
                                  <span className="font-medium text-sm">{currency.code}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm text-muted-foreground">
                                {currency.symbol}{rawConverted.toFixed(4)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm font-bold">
                                {formatPrice(samplePrice, currency)}
                              </TableCell>
                              <TableCell className={cn(
                                'text-right font-mono text-sm',
                                diff > 0.001 ? 'text-amber-600' : diff < -0.001 ? 'text-emerald-600' : 'text-muted-foreground'
                              )}>
                                {diff > 0.001 ? '+' : ''}{diff.toFixed(4)}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Add Custom Currency Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Add Custom Currency
            </DialogTitle>
            <DialogDescription>Add a new currency with a manual exchange rate</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency Code</label>
                <Input
                  placeholder="e.g. CHF"
                  value={newCurrency.code}
                  onChange={(e) => setNewCurrency((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  maxLength={3}
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Symbol</label>
                <Input
                  placeholder="e.g. Fr"
                  value={newCurrency.symbol}
                  onChange={(e) => setNewCurrency((prev) => ({ ...prev, symbol: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency Name</label>
              <Input
                placeholder="e.g. Swiss Franc"
                value={newCurrency.name}
                onChange={(e) => setNewCurrency((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Exchange Rate (per 1 {baseCurrency})</label>
              <Input
                type="number"
                placeholder="e.g. 0.88"
                value={newCurrency.rate}
                onChange={(e) => setNewCurrency((prev) => ({ ...prev, rate: e.target.value }))}
                step="0.0001"
              />
              <p className="text-xs text-muted-foreground">
                How many units of this currency equal 1 {baseCurrency}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddCurrency}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Add Currency
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
