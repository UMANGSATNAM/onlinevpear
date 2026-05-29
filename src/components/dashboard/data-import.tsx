'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileSpreadsheet,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Database,
  Users,
  ShoppingCart,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

type ImportType = 'products' | 'customers' | 'orders'
type ImportStep = 'upload' | 'mapping' | 'importing' | 'results'

// Field definitions per import type
const fieldDefinitions: Record<ImportType, Array<{ key: string; label: string; required: boolean }>> = {
  products: [
    { key: 'name', label: 'Product Name', required: true },
    { key: 'price', label: 'Price', required: true },
    { key: 'sku', label: 'SKU', required: true },
    { key: 'description', label: 'Description', required: false },
    { key: 'category', label: 'Category', required: false },
    { key: 'stock', label: 'Stock Quantity', required: false },
    { key: 'weight', label: 'Weight', required: false },
    { key: 'imageUrl', label: 'Image URL', required: false },
  ],
  customers: [
    { key: 'firstName', label: 'First Name', required: true },
    { key: 'lastName', label: 'Last Name', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'address', label: 'Address', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'zip', label: 'Zip Code', required: false },
  ],
  orders: [
    { key: 'orderId', label: 'Order ID', required: true },
    { key: 'customerEmail', label: 'Customer Email', required: true },
    { key: 'total', label: 'Total Amount', required: true },
    { key: 'status', label: 'Status', required: false },
    { key: 'items', label: 'Items Count', required: false },
    { key: 'shippingMethod', label: 'Shipping Method', required: false },
    { key: 'date', label: 'Order Date', required: false },
  ],
}

// Mock CSV column headers
const mockCsvHeaders = [
  'product_title', 'unit_price', 'item_sku', 'product_desc',
  'category_name', 'qty_in_stock', 'item_weight', 'image_link',
  'extra_col_1', 'extra_col_2',
]

// Mock CSV preview data (5 rows)
const mockPreviewData = [
  ['Wireless Headphones', '79.99', 'WH-001', 'Premium wireless headphones with noise cancellation', 'Electronics', '150', '0.35', 'https://img.example.com/wh001.jpg', 'N/A', ''],
  ['USB-C Hub', '49.99', 'UH-002', '7-in-1 USB-C hub for laptops', 'Accessories', '200', '0.12', 'https://img.example.com/uh002.jpg', 'N/A', ''],
  ['Mechanical Keyboard', '129.99', 'MK-003', 'RGB mechanical keyboard with Cherry MX switches', 'Peripherals', '75', '0.85', 'https://img.example.com/mk003.jpg', 'N/A', ''],
  ['Mouse Pad XL', '24.99', 'MP-004', 'Extended gaming mouse pad', 'Accessories', '500', '0.45', 'https://img.example.com/mp004.jpg', 'N/A', ''],
  ['Webcam HD', '59.99', 'WC-005', '1080p HD webcam with built-in mic', 'Electronics', '120', '0.15', 'https://img.example.com/wc005.jpg', 'N/A', ''],
]

// Mock error data for results
const mockErrors = [
  { row: 3, field: 'sku', message: 'SKU "WH-001" already exists in database' },
  { row: 7, field: 'price', message: 'Invalid price value: "-10.00"' },
  { row: 12, field: 'name', message: 'Product name is required but cell is empty' },
  { row: 18, field: 'sku', message: 'SKU format invalid: must be alphanumeric with dashes' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export function DataImport() {
  const [importType, setImportType] = useState<ImportType>('products')
  const [step, setStep] = useState<ImportStep>('upload')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [importProgress, setImportProgress] = useState(0)
  const [importedCount, setImportedCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [skippedCount, setSkippedCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalRows = 42

  const autoMapFields = useCallback(() => {
    const fields = fieldDefinitions[importType]
    const mapping: Record<string, string> = {}
    fields.forEach((field) => {
      const match = mockCsvHeaders.find((h) =>
        h.toLowerCase().includes(field.key.toLowerCase()) ||
        h.toLowerCase().includes(field.label.toLowerCase().replace(/\s/g, '_'))
      )
      if (match) {
        mapping[field.key] = match
      }
    })
    setFieldMapping(mapping)
  }, [importType])

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) {
      setFileName(file.name)
      setFileSize((file.size / 1024).toFixed(1) + ' KB')
      autoMapFields()
    } else {
      toast.error('Please upload a .csv file')
    }
  }, [autoMapFields])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith('.csv')) {
      setFileName(file.name)
      setFileSize((file.size / 1024).toFixed(1) + ' KB')
      autoMapFields()
    } else if (file) {
      toast.error('Please upload a .csv file')
    }
  }, [autoMapFields])

  const handleRemoveFile = () => {
    setFileName('')
    setFileSize('')
    setFieldMapping({})
    setStep('upload')
  }

  const handleStartImport = () => {
    setStep('importing')
    setImportProgress(0)
    setImportedCount(0)
    setErrorCount(0)
    setSkippedCount(0)

    // Simulate import progress
    let processed = 0
    const interval = setInterval(() => {
      processed += Math.floor(Math.random() * 4) + 1
      if (processed >= totalRows) {
        processed = totalRows
        clearInterval(interval)
        setImportProgress(100)
        setImportedCount(36)
        setErrorCount(4)
        setSkippedCount(2)
        setTimeout(() => setStep('results'), 600)
      } else {
        const pct = Math.round((processed / totalRows) * 100)
        setImportProgress(pct)
        setImportedCount(Math.floor(processed * 0.86))
        setErrorCount(Math.floor(processed * 0.1))
        setSkippedCount(Math.floor(processed * 0.04))
      }
    }, 200)
  }

  const handleReset = () => {
    setStep('upload')
    setFileName('')
    setFileSize('')
    setFieldMapping({})
    setImportProgress(0)
    setImportedCount(0)
    setErrorCount(0)
    setSkippedCount(0)
  }

  const fields = fieldDefinitions[importType]
  const unmappedRequired = fields.filter((f) => f.required && !fieldMapping[f.key])

  const importTypeIcons: Record<ImportType, React.ReactNode> = {
    products: <Database className="h-4 w-4" />,
    customers: <Users className="h-4 w-4" />,
    orders: <ShoppingCart className="h-4 w-4" />,
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Data Import</h1>
            <p className="text-muted-foreground mt-1">
              Import your data from CSV files to quickly populate your store
            </p>
          </div>
          {step !== 'upload' && (
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          )}
        </div>
      </motion.div>

      {/* Step Indicator */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2">
          {(['upload', 'mapping', 'importing', 'results'] as ImportStep[]).map((s, i) => {
            const stepLabels = ['Upload', 'Map Fields', 'Import', 'Results']
            const isActive = step === s
            const isCompleted =
              (s === 'upload' && step !== 'upload') ||
              (s === 'mapping' && step !== 'upload' && step !== 'mapping') ||
              (s === 'importing' && step === 'results')
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? '✓' : i + 1}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:inline ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {stepLabels[i]}
                </span>
                {i < 3 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 mx-1" />
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Import Type Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs
          value={importType}
          onValueChange={(v) => {
            setImportType(v as ImportType)
            if (fileName) autoMapFields()
          }}
        >
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="products" className="gap-1.5">
              <Database className="h-3.5 w-3.5" />
              Products
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5">
              <ShoppingCart className="h-3.5 w-3.5" />
              Orders
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* UPLOAD STEP */}
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Upload Zone */}
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400" />
              <CardContent className="p-6">
                {!fileName ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                      isDragging
                        ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                        : 'border-muted-foreground/25 hover:border-rose-300 hover:bg-muted/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <motion.div
                      animate={isDragging ? { scale: 1.05, y: -4 } : { scale: 1, y: 0 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500/10 to-orange-500/10 flex items-center justify-center">
                        <FileSpreadsheet className="h-7 w-7 text-rose-500" />
                      </div>
                      <div>
                        <p className="text-base font-semibold">
                          {isDragging ? 'Drop your file here' : 'Drag & drop your CSV file'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          or click to browse • Only .csv files accepted
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </motion.div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* File Info */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{fileName}</p>
                          <p className="text-xs text-muted-foreground">{fileSize} • {totalRows} rows detected</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="h-8 w-8">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Preview Table */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Preview (first 5 rows)</h3>
                      <div className="rounded-lg border overflow-hidden">
                        <div className="max-h-64 overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                {mockCsvHeaders.slice(0, 6).map((h) => (
                                  <TableHead key={h} className="text-xs font-semibold whitespace-nowrap">
                                    {h}
                                  </TableHead>
                                ))}
                                <TableHead className="text-xs font-semibold">...</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {mockPreviewData.map((row, i) => (
                                <TableRow key={i}>
                                  {row.slice(0, 6).map((cell, j) => (
                                    <TableCell key={j} className="text-xs py-2 max-w-[160px] truncate">
                                      {cell}
                                    </TableCell>
                                  ))}
                                  <TableCell className="text-xs text-muted-foreground">...</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => setStep('mapping')}>
                        Continue to Field Mapping
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* MAPPING STEP */}
        {step === 'mapping' && (
          <motion.div
            key="mapping"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-400" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-violet-500" />
                  Field Mapping
                </CardTitle>
                <CardDescription>
                  Map your CSV columns to the corresponding database fields. Required fields are marked with an asterisk.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {unmappedRequired.length > 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-400">
                      {unmappedRequired.length} required field{unmappedRequired.length > 1 ? 's' : ''} unmapped:{' '}
                      {unmappedRequired.map((f) => f.label).join(', ')}
                    </p>
                  </div>
                )}

                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-semibold w-[200px]">Database Field</TableHead>
                        <TableHead className="text-xs font-semibold w-[200px]">CSV Column</TableHead>
                        <TableHead className="text-xs font-semibold w-[80px]">Required</TableHead>
                        <TableHead className="text-xs font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field) => {
                        const isMapped = !!fieldMapping[field.key]
                        const isRequiredUnmapped = field.required && !isMapped
                        return (
                          <TableRow key={field.key} className={isRequiredUnmapped ? 'bg-red-50/50 dark:bg-red-950/10' : ''}>
                            <TableCell className="text-sm font-medium py-3">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-0.5">*</span>}
                            </TableCell>
                            <TableCell className="py-3">
                              <Select
                                value={fieldMapping[field.key] || ''}
                                onValueChange={(val) =>
                                  setFieldMapping((prev) => ({ ...prev, [field.key]: val }))
                                }
                              >
                                <SelectTrigger className={`h-8 text-xs ${isRequiredUnmapped ? 'border-red-300' : ''}`}>
                                  <SelectValue placeholder="Select column..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">— Skip —</SelectItem>
                                  {mockCsvHeaders.map((h) => (
                                    <SelectItem key={h} value={h}>
                                      {h}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="py-3">
                              {field.required ? (
                                <Badge variant="secondary" className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                  Required
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                                  Optional
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-3">
                              {isMapped ? (
                                <span className="flex items-center gap-1 text-xs text-emerald-600">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Mapped
                                </span>
                              ) : isRequiredUnmapped ? (
                                <span className="flex items-center gap-1 text-xs text-red-500">
                                  <XCircle className="h-3.5 w-3.5" /> Unmapped
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">Skipped</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    {fields.filter((f) => fieldMapping[f.key]).length} of {fields.length} fields mapped
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep('upload')}>
                      Back
                    </Button>
                    <Button
                      onClick={handleStartImport}
                      disabled={unmappedRequired.length > 0}
                    >
                      Start Import
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* IMPORTING STEP */}
        {step === 'importing' && (
          <motion.div
            key="importing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-400 to-violet-400" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-cyan-500 animate-spin" />
                  Importing Data
                </CardTitle>
                <CardDescription>
                  Your {importType} data is being imported. Please don&apos;t close this page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{importProgress}% complete</span>
                    <span className="text-muted-foreground">
                      {Math.round((importProgress / 100) * totalRows)} / {totalRows} rows
                    </span>
                  </div>
                  <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${importProgress}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                    {/* Animated shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Imported</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{importedCount}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Errors</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{errorCount}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="h-4 w-4 text-slate-500" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Skipped</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">{skippedCount}</p>
                  </div>
                </div>

                {/* Cancel Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Import
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* RESULTS STEP */}
        {step === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total Rows',
                  value: totalRows,
                  icon: <FileSpreadsheet className="h-4 w-4" />,
                  gradient: 'from-slate-500 to-slate-600',
                  bg: 'bg-slate-50 dark:bg-slate-950/30',
                  border: 'border-slate-200 dark:border-slate-800',
                  text: 'text-slate-700 dark:text-slate-300',
                },
                {
                  label: 'Imported',
                  value: 36,
                  icon: <CheckCircle2 className="h-4 w-4" />,
                  gradient: 'from-emerald-500 to-emerald-600',
                  bg: 'bg-emerald-50 dark:bg-emerald-950/30',
                  border: 'border-emerald-200 dark:border-emerald-800',
                  text: 'text-emerald-700 dark:text-emerald-300',
                },
                {
                  label: 'Skipped',
                  value: 2,
                  icon: <XCircle className="h-4 w-4" />,
                  gradient: 'from-amber-500 to-amber-600',
                  bg: 'bg-amber-50 dark:bg-amber-950/30',
                  border: 'border-amber-200 dark:border-amber-800',
                  text: 'text-amber-700 dark:text-amber-300',
                },
                {
                  label: 'Errors',
                  value: 4,
                  icon: <AlertCircle className="h-4 w-4" />,
                  gradient: 'from-red-500 to-red-600',
                  bg: 'bg-red-50 dark:bg-red-950/30',
                  border: 'border-red-200 dark:border-red-800',
                  text: 'text-red-700 dark:text-red-300',
                },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`overflow-hidden ${card.bg} ${card.border}`}>
                    <div className={`h-1 bg-gradient-to-r ${card.gradient}`} />
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {card.icon}
                        <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
                      </div>
                      <p className={`text-3xl font-bold ${card.text}`}>{card.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Error Details */}
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-500 via-orange-400 to-amber-400" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      Error Details
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {mockErrors.length} rows had errors during import
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toast.success('Error report downloaded!')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-semibold w-[80px]">Row #</TableHead>
                        <TableHead className="text-xs font-semibold w-[150px]">Field</TableHead>
                        <TableHead className="text-xs font-semibold">Error Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockErrors.map((err, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="border-b last:border-0"
                        >
                          <TableCell className="text-sm font-mono py-3">
                            <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs">
                              Row {err.row}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-medium py-3">{err.field}</TableCell>
                          <TableCell className="text-sm text-muted-foreground py-3">{err.message}</TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Import Another File
              </Button>
              <Button onClick={() => toast.success('Navigating to ' + importType + '...')}>
                View Imported {importType.charAt(0).toUpperCase() + importType.slice(1)}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
