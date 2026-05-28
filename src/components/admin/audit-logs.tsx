'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Download,
  Clock,
  User,
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

interface AuditLog {
  id: string
  userId: string | null
  merchantId: string | null
  action: string
  resource: string
  resourceId: string | null
  details: string
  ip: string | null
  userAgent: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string; image: string | null } | null
}

interface AuditLogsResponse {
  logs: AuditLog[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

const actionColors: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  login: 'bg-violet-100 text-violet-800',
  logout: 'bg-gray-100 text-gray-800',
  feature_flag_updated: 'bg-amber-100 text-amber-800',
  merchant_suspended: 'bg-red-100 text-red-800',
  merchant_activated: 'bg-emerald-100 text-emerald-800',
}

function getActionCategory(action: string): string {
  if (action.includes('create')) return 'create'
  if (action.includes('update') || action.includes('edit')) return 'update'
  if (action.includes('delete') || action.includes('remove')) return 'delete'
  if (action.includes('login')) return 'login'
  if (action.includes('logout')) return 'logout'
  if (action.includes('suspend')) return 'merchant_suspended'
  if (action.includes('activate')) return 'merchant_activated'
  return action
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' }
      if (actionFilter !== 'all') params.action = actionFilter
      const result = await api.get<AuditLogsResponse>('/admin/audit-logs', params)
      setLogs(result.logs)
      setPagination(result.pagination)
    } catch {
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [page, actionFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Filter logs by search on client side
  const filteredLogs = search
    ? logs.filter(
        (log) =>
          log.action.toLowerCase().includes(search.toLowerCase()) ||
          log.resource.toLowerCase().includes(search.toLowerCase()) ||
          (log.user?.name && log.user.name.toLowerCase().includes(search.toLowerCase())) ||
          (log.user?.email && log.user.email.toLowerCase().includes(search.toLowerCase())) ||
          (log.resourceId && log.resourceId.toLowerCase().includes(search.toLowerCase()))
      )
    : logs

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Resource ID', 'IP', 'Details'].join(','),
      ...filteredLogs.map((log) =>
        [
          new Date(log.createdAt).toISOString(),
          log.user?.name || log.user?.email || 'System',
          log.action,
          log.resource,
          log.resourceId || '',
          log.ip || '',
          `"${log.details.replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Audit logs exported')
  }

  const openDetail = (log: AuditLog) => {
    setSelectedLog(log)
    setDetailOpen(true)
  }

  const parseDetailsSafe = (str: string): Record<string, unknown> => {
    try {
      return JSON.parse(str)
    } catch {
      return {}
    }
  }

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Audit Logs</h2>
            <p className="text-muted-foreground">Track all platform activity and changes</p>
          </div>
          <Button variant="outline" onClick={handleExport} disabled={filteredLogs.length === 0}>
            <Download className="h-4 w-4 mr-2" />Export CSV
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by action, user, resource..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="feature_flag">Feature Flags</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Logs Table */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No audit logs found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => {
                      const actionCat = getActionCategory(log.action)
                      return (
                        <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(log)}>
                          <TableCell className="text-sm whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {new Date(log.createdAt).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                {(log.user?.name || log.user?.email || 'S')[0].toUpperCase()}
                              </div>
                              <span className="text-sm">{log.user?.name || log.user?.email || 'System'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={actionColors[actionCat] || ''}>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{log.resource}</span>
                            {log.resourceId && (
                              <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{log.resourceId}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {log.details.length > 50 ? `${log.details.substring(0, 50)}...` : log.details}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openDetail(log) }}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, pagination.total)} of {pagination.total} logs
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Log Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Audit Log Detail</DialogTitle>
            <DialogDescription>Detailed information about this event</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                  <p className="text-sm font-medium">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">User</p>
                  <p className="text-sm font-medium">{selectedLog.user?.name || selectedLog.user?.email || 'System'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Action</p>
                  <Badge variant="secondary" className={actionColors[getActionCategory(selectedLog.action)] || ''}>
                    {selectedLog.action}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Resource</p>
                  <p className="text-sm font-medium">{selectedLog.resource}</p>
                </div>
              </div>

              {selectedLog.resourceId && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Resource ID</p>
                  <p className="text-sm font-mono">{selectedLog.resourceId}</p>
                </div>
              )}

              {selectedLog.ip && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">IP Address</p>
                  <p className="text-sm font-mono">{selectedLog.ip}</p>
                </div>
              )}

              {selectedLog.userAgent && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">User Agent</p>
                  <p className="text-sm break-all">{selectedLog.userAgent}</p>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-xs text-muted-foreground mb-2">Details</p>
                <div className="p-3 rounded-lg bg-muted/50">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                    {JSON.stringify(parseDetailsSafe(selectedLog.details), null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
